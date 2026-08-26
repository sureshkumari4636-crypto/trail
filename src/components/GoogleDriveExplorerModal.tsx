import React, { useState, useEffect } from 'react';
import {
  X,
  Cloud,
  HardDrive,
  UploadCloud,
  Download,
  Trash2,
  ExternalLink,
  RefreshCw,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  FolderOpen,
  FolderSync,
  LogOut,
  Sparkles,
  ShieldCheck,
  Eye,
  Database,
  Layers,
} from 'lucide-react';
import { useGoogleAuth } from '../context/GoogleAuthContext';
import {
  listDriveFiles,
  uploadJsonToDrive,
  uploadImageToDrive,
  deleteDriveFile,
  downloadDriveFile,
  getDriveStorageQuota,
  DriveFileItem,
  DriveQuotaInfo,
} from '../services/googleDriveService';
import { PatientScreeningRecord } from '../types/screening';
import { DRClassificationResult, PatientInfo } from '../types/dr';
import { useTheme } from '../context/ThemeContext';

interface GoogleDriveExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  queueRecords: PatientScreeningRecord[];
  onRestoreQueue: (records: PatientScreeningRecord[]) => void;
  currentPatient?: PatientInfo | null;
  currentResult?: DRClassificationResult | null;
  currentImage?: string | null;
  onLoadImageToScreening?: (dataUrl: string, patientName?: string) => void;
}

export const GoogleDriveExplorerModal: React.FC<GoogleDriveExplorerModalProps> = ({
  isOpen,
  onClose,
  queueRecords,
  onRestoreQueue,
  currentPatient,
  currentResult,
  currentImage,
  onLoadImageToScreening,
}) => {
  const { user, isAuthenticated, login, logout, isLoading: isAuthLoading } = useGoogleAuth();
  const { isDark } = useTheme();

  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [quota, setQuota] = useState<DriveQuotaInfo | null>(null);
  const [isLoadingFiles, setIsLoadingFiles] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'vault' | 'backup' | 'restore'>('vault');
  const [filterType, setFilterType] = useState<'all' | 'registers' | 'images' | 'reports'>('all');

  // Status feedback message
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isActionInProgress, setIsActionInProgress] = useState<boolean>(false);

  // Destructive Delete Confirmation State (Mandatory User Confirmation dialog)
  const [fileToDelete, setFileToDelete] = useState<DriveFileItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Fetch files when modal opens and user is authenticated
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadDriveData();
    }
  }, [isOpen, isAuthenticated]);

  const loadDriveData = async () => {
    setIsLoadingFiles(true);
    setStatusMessage(null);
    try {
      const [driveFiles, driveQuota] = await Promise.all([
        listDriveFiles(),
        getDriveStorageQuota(),
      ]);
      setFiles(driveFiles);
      setQuota(driveQuota);
    } catch (err: any) {
      console.error('Failed to load drive data:', err);
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Failed to connect to Google Drive. Please check permissions.',
      });
    } finally {
      setIsLoadingFiles(false);
    }
  };

  if (!isOpen) return null;

  // Handle Google Sign-in
  const handleSignIn = async () => {
    setStatusMessage(null);
    try {
      await login();
      await loadDriveData();
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Sign in failed. Please try again.',
      });
    }
  };

  // 1. Backup active Camp Register to Drive
  const handleBackupQueueToDrive = async () => {
    if (!isAuthenticated) return;
    if (queueRecords.length === 0) {
      setStatusMessage({
        type: 'error',
        text: 'The camp register is currently empty. Run screenings before backing up.',
      });
      return;
    }

    setIsActionInProgress(true);
    setStatusMessage(null);
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const fileName = `NetraRakshak_Camp_Register_${timestamp}.json`;

      const backupPayload = {
        app: 'NetraRakshak AI Tele-Ophthalmology',
        version: '2.0.0',
        exportedAt: new Date().toISOString(),
        totalPatients: queueRecords.length,
        phcCenter: queueRecords[0]?.village || 'Rural Primary Health Centre',
        records: queueRecords,
      };

      const result = await uploadJsonToDrive(
        fileName,
        backupPayload,
        `Rural Camp Register Backup containing ${queueRecords.length} patient screenings.`
      );

      setStatusMessage({
        type: 'success',
        text: `Successfully backed up ${queueRecords.length} screening records to Google Drive (${result.name})!`,
      });
      await loadDriveData();
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Failed to backup camp register to Google Drive.',
      });
    } finally {
      setIsActionInProgress(false);
    }
  };

  // 2. Upload Current Active Patient Screening to Drive
  const handleUploadCurrentScreeningToDrive = async () => {
    if (!isAuthenticated || !currentResult || !currentPatient || !currentImage) {
      setStatusMessage({
        type: 'error',
        text: 'No active patient screening result to upload. Perform an AI screening first.',
      });
      return;
    }

    setIsActionInProgress(true);
    setStatusMessage(null);
    try {
      const timestamp = new Date().toISOString().slice(0, 10);
      const safePatientName = currentPatient.name.replace(/[^a-zA-Z0-9]/g, '_');
      const jsonFileName = `DR_Report_${safePatientName}_Grade${currentResult.stage}_${timestamp}.json`;

      const reportPayload = {
        uhid: currentPatient.id,
        patient: currentPatient,
        clinicalResult: currentResult,
        screenedAt: new Date().toISOString(),
        xaiGradCamSummary: currentResult.xaiExplanation,
      };

      // 1. Upload JSON summary
      await uploadJsonToDrive(
        jsonFileName,
        reportPayload,
        `Diabetic Retinopathy clinical screening report for ${currentPatient.name} (ICDR Grade ${currentResult.stage})`
      );

      // 2. Upload fundus retinal image
      const imgFileName = `Fundus_${safePatientName}_${currentPatient.eyeTested.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.jpg`;
      await uploadImageToDrive(
        imgFileName,
        currentImage,
        `Retinal fundus image for ${currentPatient.name} (${currentPatient.eyeTested})`
      );

      setStatusMessage({
        type: 'success',
        text: `Clinical case and retinal photo for ${currentPatient.name} successfully saved to Google Drive!`,
      });
      await loadDriveData();
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Failed to upload patient case to Google Drive.',
      });
    } finally {
      setIsActionInProgress(false);
    }
  };

  // 3. Restore / Import file from Drive
  const handleImportFileFromDrive = async (file: DriveFileItem) => {
    setIsActionInProgress(true);
    setStatusMessage(null);
    try {
      const rawContent = await downloadDriveFile(file.id);

      if (file.mimeType === 'application/json' || file.name.endsWith('.json')) {
        const parsed = JSON.parse(rawContent);

        // Check if it's a camp register backup
        if (parsed.records && Array.isArray(parsed.records)) {
          onRestoreQueue(parsed.records);
          setStatusMessage({
            type: 'success',
            text: `Restored ${parsed.records.length} patient records from ${file.name} into the active camp register!`,
          });
          return;
        }

        // Check if it's a single patient screening
        if (parsed.patient && parsed.clinicalResult) {
          const newRecord: PatientScreeningRecord = {
            id: parsed.patient.id || `DR-${Date.now()}`,
            patientName: parsed.patient.name,
            age: Number(parsed.patient.age) || 50,
            gender: parsed.patient.gender || 'Female',
            village: parsed.patient.villageOrPHC || 'Rural PHC',
            phcCenter: parsed.patient.villageOrPHC || 'Rural PHC',
            ashaWorkerName: parsed.patient.ashaWorkerName || 'ASHA Officer',
            eye: parsed.patient.eyeTested || 'Right Eye (OD)',
            diabetesDurationYears: parseInt(parsed.patient.diabetesDurationYears || '5'),
            randomBloodSugar: parseInt(parsed.patient.bloodSugarFasting || '160'),
            screeningTimestamp: parsed.screenedAt || new Date().toISOString().slice(0, 10),
            imageUrl: '',
            heatmapUrl: '',
            prediction: {
              grade: parsed.clinicalResult.stage,
              stageName: parsed.clinicalResult.stageName,
              hindiStageName: parsed.clinicalResult.stageHindi,
              icdrClassification: `ICDR Grade ${parsed.clinicalResult.stage}`,
              confidence: parsed.clinicalResult.confidence / 100,
              isReferable: parsed.clinicalResult.stage >= 2,
              riskLevel: parsed.clinicalResult.riskLevel,
              riskColor: parsed.clinicalResult.riskColor,
              referral: parsed.clinicalResult.referral?.actionRequired || 'Consult Ophthalmologist',
              urgencyDays: parsed.clinicalResult.referral?.timeframe || '30 days',
              classProbabilities: parsed.clinicalResult.classProbabilities?.map((cp: any) => ({
                grade: cp.stage,
                name: cp.label,
                probability: cp.probability / 100,
              })) || [],
              detectedLesions: parsed.clinicalResult.lesionsDetected?.map((l: any) => `${l.name} (${l.presence})`) || [],
              gradCamHotspots: [],
              clinicalSummary: parsed.clinicalResult.xaiExplanation?.clinicalRationale || '',
              hindiSummary: parsed.clinicalResult.referral?.ruralCareAdvice || '',
              quality: {
                isGradable: true,
                blurScore: 85,
                brightnessScore: 70,
                contrastScore: 75,
                issues: [],
              },
              inferenceTimeMs: 400,
            },
            status: parsed.clinicalResult.stage >= 2 ? 'Referred' : 'Screened',
          };

          onRestoreQueue([newRecord, ...queueRecords.filter((r) => r.id !== newRecord.id)]);
          setStatusMessage({
            type: 'success',
            text: `Imported patient record for "${parsed.patient.name}" into the active register!`,
          });
          return;
        }

        setStatusMessage({
          type: 'info',
          text: `JSON file downloaded successfully: ${file.name}`,
        });
      } else if (file.mimeType.startsWith('image/')) {
        // Load image into screening studio
        if (onLoadImageToScreening && file.thumbnailLink) {
          // Use thumbnail or web link
          onLoadImageToScreening(file.thumbnailLink.replace(/=s\d+/, '=s1024'), file.name);
          setStatusMessage({
            type: 'success',
            text: `Loaded retinal image "${file.name}" into the Screening Studio!`,
          });
          onClose();
        } else {
          window.open(file.webViewLink, '_blank');
        }
      }
    } catch (err: any) {
      console.error('Import failed:', err);
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Failed to import file from Google Drive.',
      });
    } finally {
      setIsActionInProgress(false);
    }
  };

  // 4. Delete file with Mandatory Explicit User Confirmation Dialog
  const handleConfirmDelete = async () => {
    if (!fileToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDriveFile(fileToDelete.id);
      setFiles((prev) => prev.filter((f) => f.id !== fileToDelete.id));
      setStatusMessage({
        type: 'success',
        text: `Permanently deleted "${fileToDelete.name}" from Google Drive.`,
      });
      setFileToDelete(null);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Failed to delete file from Google Drive.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered files
  const filteredFiles = files.filter((f) => {
    if (filterType === 'all') return true;
    if (filterType === 'registers') return f.name.includes('Register') || f.name.includes('Camp');
    if (filterType === 'reports') return f.name.includes('Report') || f.name.includes('DR_');
    if (filterType === 'images') return f.mimeType.startsWith('image/') || f.name.endsWith('.jpg') || f.name.endsWith('.png');
    return true;
  });

  const formatBytes = (bytesStr?: string) => {
    if (!bytesStr) return '0 B';
    const bytes = parseInt(bytesStr, 10);
    if (isNaN(bytes)) return bytesStr;
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-theme-card text-theme-primary w-full max-w-4xl rounded-3xl shadow-2xl border border-theme overflow-hidden flex flex-col max-h-[92vh] transition-colors duration-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-blue-800/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-inner">
              <Cloud className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-black text-base tracking-tight text-white">
                  Google Drive Cloud Vault & Tele-Sync
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  Workspace API
                </span>
              </div>
              <p className="text-xs text-blue-200/80">
                Securely store and sync rural diabetic retinopathy screening logs, Grad-CAM overlays & clinical referral slips
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Status Message Banner */}
          {statusMessage && (
            <div
              className={`p-3.5 rounded-2xl border text-xs font-semibold flex items-center justify-between gap-3 animate-in fade-in duration-150 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                  : statusMessage.type === 'error'
                  ? 'bg-rose-500/15 border-rose-500/30 text-rose-700 dark:text-rose-300'
                  : 'bg-blue-500/15 border-blue-500/30 text-blue-700 dark:text-blue-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : statusMessage.type === 'error' ? (
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                ) : (
                  <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />
                )}
                <span>{statusMessage.text}</span>
              </div>
              <button
                onClick={() => setStatusMessage(null)}
                className="text-xs opacity-70 hover:opacity-100 cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Authentication State Box */}
          {!isAuthenticated ? (
            <div className="p-8 rounded-3xl bg-theme-subtle border-2 border-dashed border-theme text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center border border-blue-500/20 shadow-xs">
                <HardDrive className="w-7 h-7" />
              </div>

              <div className="max-w-md mx-auto">
                <h4 className="text-base font-extrabold text-theme-primary">
                  Connect Google Drive to NetraRakshak AI
                </h4>
                <p className="text-xs text-theme-muted mt-1 leading-relaxed">
                  Sign in with your Google account to automatically store patient fundus exams, sync village screening registers across PHCs, and safely access clinical records anywhere with permission.
                </p>
              </div>

              {/* Official Google Sign In Button */}
              <div className="pt-2 flex justify-center">
                <button
                  onClick={handleSignIn}
                  disabled={isAuthLoading}
                  className="gsi-material-button"
                  id="google-signin-modal-btn"
                >
                  <div className="gsi-material-button-state"></div>
                  <div className="gsi-material-button-content-wrapper">
                    <div className="gsi-material-button-icon">
                      <svg
                        version="1.1"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 48 48"
                        style={{ display: 'block' }}
                      >
                        <path
                          fill="#EA4335"
                          d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                        ></path>
                        <path
                          fill="#4285F4"
                          d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                        ></path>
                        <path
                          fill="#FBBC05"
                          d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                        ></path>
                        <path
                          fill="#34A853"
                          d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                        ></path>
                        <path fill="none" d="M0 0h48v48H0z"></path>
                      </svg>
                    </div>
                    <span className="gsi-material-button-contents">
                      {isAuthLoading ? 'Connecting to Google...' : 'Sign in with Google'}
                    </span>
                  </div>
                </button>
              </div>

              <div className="text-[11px] text-theme-muted flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Encrypted client-side OAuth • Least Privilege Access</span>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Authenticated User Status Bar */}
              <div className="p-4 rounded-2xl bg-theme-subtle border border-theme flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Google User'}
                      className="w-10 h-10 rounded-full border-2 border-blue-500 shadow-xs"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                      {user?.displayName ? user.displayName[0] : 'G'}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-sm text-theme-primary">
                        {user?.displayName || 'Google Account Connected'}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" /> Drive Connected
                      </span>
                    </div>
                    <p className="text-[11px] text-theme-muted font-mono">{user?.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={loadDriveData}
                    disabled={isLoadingFiles}
                    className="p-2 rounded-xl bg-theme-card hover:bg-theme-subtle text-theme-primary border border-theme transition-colors cursor-pointer"
                    title="Refresh Google Drive files"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                  </button>
                  <button
                    onClick={logout}
                    className="px-3 py-1.5 rounded-xl bg-theme-card hover:bg-rose-500/10 text-theme-secondary hover:text-rose-600 border border-theme text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>

              {/* Quick Drive Actions Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Action 1: Backup Camp Register */}
                <div className="p-4 rounded-2xl bg-theme-subtle border border-theme flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-theme-muted uppercase tracking-wider">
                        Camp Register Sync
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-mono">
                        {queueRecords.length} patients in queue
                      </span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-theme-primary mt-1">
                      Backup Camp Screening Register
                    </h4>
                    <p className="text-[11px] text-theme-muted mt-0.5">
                      Uploads current local camp session as a timestamped JSON register to your Google Drive folder.
                    </p>
                  </div>

                  <button
                    onClick={handleBackupQueueToDrive}
                    disabled={isActionInProgress || queueRecords.length === 0}
                    id="drive-backup-camp-btn"
                    className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Backup {queueRecords.length} Patients to Drive</span>
                  </button>
                </div>

                {/* Action 2: Save Current Active Case */}
                <div className="p-4 rounded-2xl bg-theme-subtle border border-theme flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-theme-muted uppercase tracking-wider">
                        Active Screening
                      </span>
                      {currentResult ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                          {currentPatient?.name} (Grade {currentResult.stage})
                        </span>
                      ) : (
                        <span className="text-[10px] text-theme-muted">No active exam</span>
                      )}
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-theme-primary mt-1">
                      Save Current Patient & Retinal Exam
                    </h4>
                    <p className="text-[11px] text-theme-muted mt-0.5">
                      Uploads patient demographics, ICDR classification, Grad-CAM rationale, and retinal fundus image.
                    </p>
                  </div>

                  <button
                    onClick={handleUploadCurrentScreeningToDrive}
                    disabled={isActionInProgress || !currentResult || !currentPatient}
                    id="drive-save-current-case-btn"
                    className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <FolderSync className="w-3.5 h-3.5" />
                    <span>Upload Patient Case & Photo</span>
                  </button>
                </div>
              </div>

              {/* Drive File Explorer Section */}
              <div className="space-y-3 pt-2">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-theme pb-2">
                  <div className="flex items-center space-x-2">
                    <FolderOpen className="w-4 h-4 text-theme-primary-accent" />
                    <h4 className="text-xs sm:text-sm font-bold text-theme-primary">
                      NetraRakshak Drive Vault ({files.length} items)
                    </h4>
                  </div>

                  {/* Filter tabs */}
                  <div className="flex items-center space-x-1 text-[11px] bg-theme-subtle p-1 rounded-xl border border-theme">
                    <button
                      onClick={() => setFilterType('all')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                        filterType === 'all'
                          ? 'bg-theme-card text-theme-primary shadow-xs'
                          : 'text-theme-muted'
                      }`}
                    >
                      All ({files.length})
                    </button>
                    <button
                      onClick={() => setFilterType('registers')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                        filterType === 'registers'
                          ? 'bg-theme-card text-theme-primary shadow-xs'
                          : 'text-theme-muted'
                      }`}
                    >
                      Camp Registers
                    </button>
                    <button
                      onClick={() => setFilterType('reports')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                        filterType === 'reports'
                          ? 'bg-theme-card text-theme-primary shadow-xs'
                          : 'text-theme-muted'
                      }`}
                    >
                      Patient Reports
                    </button>
                    <button
                      onClick={() => setFilterType('images')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                        filterType === 'images'
                          ? 'bg-theme-card text-theme-primary shadow-xs'
                          : 'text-theme-muted'
                      }`}
                    >
                      Retinal Photos
                    </button>
                  </div>
                </div>

                {/* File List Table */}
                {isLoadingFiles ? (
                  <div className="py-12 text-center text-xs text-theme-muted space-y-2">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p>Loading files from Google Drive...</p>
                  </div>
                ) : filteredFiles.length === 0 ? (
                  <div className="py-10 text-center border-2 border-dashed border-theme rounded-2xl bg-theme-subtle/30 space-y-2">
                    <FolderOpen className="w-8 h-8 text-theme-muted mx-auto opacity-60" />
                    <h5 className="text-xs font-bold text-theme-primary">No files found in Google Drive folder</h5>
                    <p className="text-[11px] text-theme-muted max-w-sm mx-auto">
                      Use the backup buttons above to upload camp registers, patient referral slips, and fundus images to Google Drive.
                    </p>
                  </div>
                ) : (
                  <div className="border border-theme rounded-2xl overflow-hidden divide-y divide-theme">
                    {filteredFiles.map((file) => {
                      const isJson = file.mimeType === 'application/json' || file.name.endsWith('.json');
                      const isImg = file.mimeType.startsWith('image/') || file.name.endsWith('.jpg') || file.name.endsWith('.png');

                      return (
                        <div
                          key={file.id}
                          className="p-3 bg-theme-card hover:bg-theme-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs transition-colors"
                        >
                          <div className="flex items-center space-x-3 min-w-0">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                              isJson
                                ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400'
                                : isImg
                                ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400'
                                : 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                            }`}>
                              {isJson ? (
                                <FileText className="w-4 h-4" />
                              ) : isImg ? (
                                <ImageIcon className="w-4 h-4" />
                              ) : (
                                <Database className="w-4 h-4" />
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="font-bold text-theme-primary truncate max-w-xs sm:max-w-md">
                                {file.name}
                              </div>
                              <div className="text-[10px] text-theme-muted flex items-center space-x-2 mt-0.5">
                                <span>{formatBytes(file.size)}</span>
                                <span>•</span>
                                <span>{file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString() : 'Recent'}</span>
                                {file.description && (
                                  <>
                                    <span>•</span>
                                    <span className="truncate max-w-[150px]">{file.description}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-1.5 self-end sm:self-auto shrink-0">
                            {/* Open in Google Drive */}
                            {file.webViewLink && (
                              <a
                                href={file.webViewLink}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-lg bg-theme-subtle hover:bg-theme-card text-theme-secondary hover:text-blue-500 border border-theme transition-colors"
                                title="Open in Google Drive"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}

                            {/* Restore / Import */}
                            <button
                              onClick={() => handleImportFileFromDrive(file)}
                              disabled={isActionInProgress}
                              className="px-2.5 py-1.5 rounded-lg bg-theme-primary-subtle text-theme-primary-accent hover:opacity-90 font-bold text-[11px] border border-theme flex items-center gap-1 transition-colors cursor-pointer"
                              title={isJson ? 'Restore into Camp Register' : 'Load image into Screening Studio'}
                            >
                              <Download className="w-3 h-3" />
                              <span>{isJson ? 'Restore' : 'Load Exam'}</span>
                            </button>

                            {/* Safe Delete with Confirmation Modal */}
                            <button
                              onClick={() => setFileToDelete(file)}
                              className="p-1.5 rounded-lg text-theme-muted hover:text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer"
                              title="Delete from Google Drive"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-theme-subtle px-6 py-3.5 border-t border-theme flex items-center justify-between text-xs text-theme-muted">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Folder: /NetraRakshak_DR_Screening_Records in Google Drive</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-theme-card hover:bg-theme-card-subtle text-theme-primary font-bold border border-theme transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {/* Mandatory User Confirmation Dialog for Destructive Operations */}
      {fileToDelete && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-theme-card text-theme-primary w-full max-w-md rounded-3xl p-6 shadow-2xl border-2 border-rose-500/40 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h4 className="text-base font-extrabold text-theme-primary">
                Delete File from Google Drive?
              </h4>
              <p className="text-xs text-theme-muted">
                Are you sure you want to permanently delete{' '}
                <strong className="text-theme-primary">"{fileToDelete.name}"</strong> from your Google Drive? This action cannot be undone.
              </p>
            </div>

            <div className="p-3 bg-theme-subtle rounded-xl text-[11px] text-theme-secondary space-y-1 border border-theme">
              <div className="flex justify-between">
                <span>File Type:</span>
                <span className="font-mono font-bold">{fileToDelete.mimeType}</span>
              </div>
              <div className="flex justify-between">
                <span>Size:</span>
                <span className="font-mono font-bold">{formatBytes(fileToDelete.size)}</span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setFileToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-theme-subtle hover:bg-theme-card text-theme-primary text-xs font-bold border border-theme cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete File</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
