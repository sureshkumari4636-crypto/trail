import { getAccessToken } from './googleAuth';

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime?: string;
  modifiedTime?: string;
  webViewLink?: string;
  thumbnailLink?: string;
  description?: string;
  iconLink?: string;
}

export interface DriveQuotaInfo {
  limit?: string;
  usage?: string;
  usageInDrive?: string;
  usageInDriveTrash?: string;
}

const APP_FOLDER_NAME = 'NetraRakshak_DR_Screening_Records';

/**
 * Get headers with bearer authorization
 */
async function getAuthHeaders(): Promise<HeadersInit> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('NOT_AUTHENTICATED: Please sign in with Google to access Google Drive.');
  }
  return {
    Authorization: `Bearer ${token}`,
  };
}

/**
 * Find or create the dedicated NetraRakshak folder in Google Drive
 */
export async function getOrCreateAppFolder(): Promise<string> {
  const headers = await getAuthHeaders();

  // Search for existing folder
  const query = encodeURIComponent(
    `name = '${APP_FOLDER_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`
  );
  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`,
    { headers }
  );

  if (!searchRes.ok) {
    const err = await searchRes.json();
    throw new Error(err?.error?.message || 'Failed to search Google Drive folders');
  }

  const searchData = await searchRes.json();
  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id;
  }

  // Create folder if not found
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: APP_FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
      description: 'Diabetic Retinopathy clinical screening records, Grad-CAM overlays, and camp registers from NetraRakshak AI',
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.json();
    throw new Error(err?.error?.message || 'Failed to create NetraRakshak folder in Google Drive');
  }

  const newFolder = await createRes.json();
  return newFolder.id;
}

/**
 * List files inside the NetraRakshak folder or all accessible files
 */
export async function listDriveFiles(folderId?: string): Promise<DriveFileItem[]> {
  const headers = await getAuthHeaders();
  let query = 'trashed = false';

  if (folderId) {
    query += ` and '${folderId}' in parents`;
  } else {
    // If no folder specified, look inside app folder or search files with our prefix
    try {
      const appFolderId = await getOrCreateAppFolder();
      query += ` and ('${appFolderId}' in parents or name contains 'NetraRakshak' or name contains 'DR_Screening')`;
    } catch {
      query += ` and (name contains 'NetraRakshak' or name contains 'DR_Screening' or mimeType contains 'image' or mimeType contains 'json')`;
    }
  }

  const fields = encodeURIComponent(
    'files(id,name,mimeType,size,createdTime,modifiedTime,webViewLink,thumbnailLink,description,iconLink)'
  );
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=${fields}&orderBy=modifiedTime desc&pageSize=50`,
    { headers }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.error?.message || 'Failed to list files from Google Drive');
  }

  const data = await res.json();
  return data.files || [];
}

/**
 * Upload JSON data (Patient Record, Camp Register, Clinical Summary) to Google Drive
 */
export async function uploadJsonToDrive(
  fileName: string,
  jsonData: any,
  description?: string
): Promise<DriveFileItem> {
  const headers = await getAuthHeaders();
  const folderId = await getOrCreateAppFolder();

  const metadata = {
    name: fileName.endsWith('.json') ? fileName : `${fileName}.json`,
    mimeType: 'application/json',
    parents: [folderId],
    description: description || 'NetraRakshak AI Clinical Screening Record',
  };

  const fileContent = JSON.stringify(jsonData, null, 2);
  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    fileContent +
    closeDelimiter;

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,createdTime,modifiedTime,webViewLink',
    {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.error?.message || 'Failed to upload JSON file to Google Drive');
  }

  return await res.json();
}

/**
 * Upload an image (DataURL / Base64 / Blob) to Google Drive
 */
export async function uploadImageToDrive(
  fileName: string,
  dataUrlOrBase64: string,
  description?: string
): Promise<DriveFileItem> {
  const headers = await getAuthHeaders();
  const folderId = await getOrCreateAppFolder();

  // Parse data URL
  let mimeType = 'image/jpeg';
  let base64Data = dataUrlOrBase64;

  if (dataUrlOrBase64.startsWith('data:')) {
    const parts = dataUrlOrBase64.split(',');
    const match = parts[0].match(/:(.*?);/);
    if (match) mimeType = match[1];
    base64Data = parts[1];
  }

  // Convert base64 to binary byte array
  const byteCharacters = atob(base64Data);
  const byteArrays: Uint8Array[] = [];
  const sliceSize = 512;

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    byteArrays.push(new Uint8Array(byteNumbers));
  }

  const blob = new Blob(byteArrays, { type: mimeType });

  const metadata = {
    name: fileName,
    mimeType: mimeType,
    parents: [folderId],
    description: description || 'Fundus retinal image / Grad-CAM heatmap from NetraRakshak screening',
  };

  const formData = new FormData();
  formData.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json' })
  );
  formData.append('file', blob);

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,size,createdTime,modifiedTime,webViewLink,thumbnailLink',
    {
      method: 'POST',
      headers: {
        Authorization: (headers as any).Authorization,
      },
      body: formData,
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.error?.message || 'Failed to upload image to Google Drive');
  }

  return await res.json();
}

/**
 * Download or read a file's content from Google Drive
 */
export async function downloadDriveFile(fileId: string): Promise<string> {
  const headers = await getAuthHeaders();
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    { headers }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.error?.message || 'Failed to download file from Google Drive');
  }

  return await res.text();
}

/**
 * Delete a file from Google Drive (Mandatory user confirmation must precede this call!)
 */
export async function deleteDriveFile(fileId: string): Promise<boolean> {
  const headers = await getAuthHeaders();
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}`,
    {
      method: 'DELETE',
      headers,
    }
  );

  if (!res.ok && res.status !== 204) {
    const err = await res.json();
    throw new Error(err?.error?.message || 'Failed to delete file from Google Drive');
  }

  return true;
}

/**
 * Get Google Drive storage quota info
 */
export async function getDriveStorageQuota(): Promise<DriveQuotaInfo | null> {
  try {
    const headers = await getAuthHeaders();
    const res = await fetch(
      'https://www.googleapis.com/drive/v3/about?fields=storageQuota,user',
      { headers }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.storageQuota || null;
  } catch (err) {
    console.error('Failed to get Drive quota:', err);
    return null;
  }
}
