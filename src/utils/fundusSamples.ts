import { SampleFundusCase } from '../types/screening';

/**
 * Creates high-detail procedural canvas fundus images that realistically represent
 * clinical stages of Diabetic Retinopathy for instant offline hackathon demonstration.
 */
export function generateProceduralFundusImage(caseType: 'normal' | 'mild' | 'moderate' | 'severe' | 'pdr' | 'blurry'): string {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.46;

  // 1. Black outer background (fundus camera aperture)
  ctx.fillStyle = '#05070a';
  ctx.fillRect(0, 0, size, size);

  // 2. Circular Retinal Mask
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.clip();

  // 3. Fundus Base Gradient (deep orange-red with choroidal texture)
  const bgGrad = ctx.createRadialGradient(cx * 0.9, cy * 0.95, r * 0.1, cx, cy, r);
  if (caseType === 'blurry') {
    bgGrad.addColorStop(0, '#5a2d1d');
    bgGrad.addColorStop(0.7, '#3c180e');
    bgGrad.addColorStop(1, '#180804');
  } else {
    bgGrad.addColorStop(0, '#cc4e27');
    bgGrad.addColorStop(0.35, '#b83b1a');
    bgGrad.addColorStop(0.75, '#8c240d');
    bgGrad.addColorStop(1, '#420d04');
  }
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, size, size);

  // 4. Subtle retinal choroidal background noise / vascular pattern
  ctx.fillStyle = 'rgba(255, 200, 150, 0.03)';
  for (let i = 0; i < 300; i++) {
    const rx = cx + (Math.random() - 0.5) * r * 1.8;
    const ry = cy + (Math.random() - 0.5) * r * 1.8;
    const rw = 2 + Math.random() * 8;
    ctx.fillRect(rx, ry, rw, rw);
  }

  // 5. Optic Disc (Nasal side, slightly offset right for Left Eye OS or left for Right Eye OD)
  // Let's place optic disc at x = 160, y = 250 (OD perspective)
  const odX = 165;
  const odY = 245;
  const odR = 34;

  const odGrad = ctx.createRadialGradient(odX, odY, 4, odX, odY, odR);
  odGrad.addColorStop(0, '#fff4cc');
  odGrad.addColorStop(0.4, '#fed89a');
  odGrad.addColorStop(0.85, '#f5a458');
  odGrad.addColorStop(1, '#a63e14');

  ctx.beginPath();
  ctx.ellipse(odX, odY, odR, odR * 1.15, 0.1, 0, Math.PI * 2);
  ctx.fillStyle = odGrad;
  ctx.fill();

  // Physiological cup inside Optic Disc
  ctx.beginPath();
  ctx.ellipse(odX - 2, odY, odR * 0.45, odR * 0.55, 0.05, 0, Math.PI * 2);
  ctx.fillStyle = '#fffdf0';
  ctx.fill();

  // 6. Macula & Fovea Centralis (Temporal side, x = 325, y = 265)
  const macX = 325;
  const macY = 265;
  const macGrad = ctx.createRadialGradient(macX, macY, 2, macX, macY, 45);
  macGrad.addColorStop(0, 'rgba(65, 12, 4, 0.85)');
  macGrad.addColorStop(0.5, 'rgba(110, 25, 10, 0.5)');
  macGrad.addColorStop(1, 'rgba(184, 59, 26, 0)');

  ctx.beginPath();
  ctx.arc(macX, macY, 45, 0, Math.PI * 2);
  ctx.fillStyle = macGrad;
  ctx.fill();

  // Foveal light reflex (tiny bright pinpoint in normal, absent in edema)
  if (caseType === 'normal' || caseType === 'mild') {
    ctx.beginPath();
    ctx.arc(macX, macY, 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 240, 200, 0.7)';
    ctx.fill();
  }

  // 7. Retinal Blood Vessels (Superior & Inferior Arcades)
  const drawVesselArcade = (startX: number, startY: number, controlPoints: number[][], strokeWidth: number, isArtery = false) => {
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    for (let i = 0; i < controlPoints.length; i += 2) {
      const cpX = controlPoints[i][0];
      const cpY = controlPoints[i][1];
      const endX = controlPoints[i + 1][0];
      const endY = controlPoints[i + 1][1];
      ctx.quadraticCurveTo(cpX, cpY, endX, endY);
    }
    ctx.strokeStyle = isArtery ? '#801309' : '#520803';
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  // Superior temporal arcade
  drawVesselArcade(odX, odY, [[190, 160], [240, 135], [300, 130], [370, 150], [420, 200], [440, 250]], 4.5, false);
  drawVesselArcade(odX + 2, odY - 4, [[190, 168], [240, 142], [300, 138], [370, 158], [420, 208], [440, 258]], 3.0, true);

  // Inferior temporal arcade
  drawVesselArcade(odX, odY, [[190, 310], [240, 355], [310, 365], [380, 345], [425, 305], [445, 270]], 4.5, false);
  drawVesselArcade(odX + 2, odY + 4, [[190, 304], [240, 348], [310, 358], [380, 338], [425, 298], [445, 263]], 3.0, true);

  // Nasal vessels
  drawVesselArcade(odX, odY, [[130, 200], [90, 180], [60, 190], [40, 230]], 3.2, false);
  drawVesselArcade(odX, odY, [[130, 280], [90, 310], [60, 300], [40, 270]], 3.2, true);

  // Small macular branches
  drawVesselArcade(260, 160, [[280, 200], [295, 230]], 1.6, true);
  drawVesselArcade(280, 330, [[300, 290], [310, 280]], 1.6, false);

  // 8. Pathological Lesions according to DR Grade
  if (caseType === 'mild') {
    // Isolated microaneurysms (Grade 1)
    const maPoints = [
      [315, 235], [345, 245], [290, 260], [335, 285], [360, 230]
    ];
    for (const [mx, my] of maPoints) {
      ctx.beginPath();
      ctx.arc(mx, my, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#3a0200';
      ctx.fill();
      // tiny glow
      ctx.beginPath();
      ctx.arc(mx, my, 1.2, 0, Math.PI * 2);
      ctx.fillStyle = '#9b0c03';
      ctx.fill();
    }
  } else if (caseType === 'moderate') {
    // Hard Exudates (bright yellow lipid deposits) + Dot & Blot Hemorrhages (Grade 2)
    // Hard exudate ring near macula
    const exudates = [
      [350, 220], [358, 225], [365, 235], [368, 248], [363, 260], [355, 270],
      [380, 220], [386, 230], [275, 230], [270, 240], [310, 315], [320, 320]
    ];
    for (const [ex, ey] of exudates) {
      ctx.beginPath();
      ctx.ellipse(ex, ey, 3 + Math.random() * 2, 2.5 + Math.random() * 2, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fillStyle = '#fff48f';
      ctx.shadowColor = '#ffe042';
      ctx.shadowBlur = 3;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Dot & blot hemorrhages
    const hemorrhages = [
      [285, 210, 5], [305, 185, 6], [360, 290, 7], [330, 330, 6],
      [260, 275, 4], [390, 250, 5], [230, 230, 4]
    ];
    for (const [hx, hy, hr] of hemorrhages) {
      ctx.beginPath();
      ctx.arc(hx, hy, hr, 0, Math.PI * 2);
      ctx.fillStyle = '#3d0200';
      ctx.fill();
    }
  } else if (caseType === 'severe') {
    // Severe NPDR: 4-quadrant extensive blot hemorrhages + cotton wool spots + venous beading
    // Cotton wool spots (fluffy white/grey ischemic patches)
    const cottonWool = [
      [250, 180], [380, 190], [260, 310], [340, 340]
    ];
    for (const [cwx, cwy] of cottonWool) {
      const cwGrad = ctx.createRadialGradient(cwx, cwy, 2, cwx, cwy, 14);
      cwGrad.addColorStop(0, 'rgba(255, 250, 230, 0.85)');
      cwGrad.addColorStop(0.5, 'rgba(235, 225, 200, 0.5)');
      cwGrad.addColorStop(1, 'rgba(200, 180, 160, 0)');
      ctx.beginPath();
      ctx.arc(cwx, cwy, 14, 0, Math.PI * 2);
      ctx.fillStyle = cwGrad;
      ctx.fill();
    }

    // Extensive blot hemorrhages across quadrants
    const severeHemorrhages = [
      [220, 160, 11], [270, 140, 9], [340, 160, 12], [410, 180, 10],
      [200, 310, 10], [270, 350, 12], [350, 360, 14], [400, 320, 11],
      [290, 220, 7], [360, 240, 8], [310, 280, 8], [150, 200, 7]
    ];
    for (const [shx, shy, shr] of severeHemorrhages) {
      ctx.beginPath();
      ctx.ellipse(shx, shy, shr, shr * 0.8, Math.random() * 2, 0, Math.PI * 2);
      ctx.fillStyle = '#2f0100';
      ctx.fill();
    }

    // Hard exudates clusters
    const exudates = [
      [360, 215], [370, 225], [378, 235], [372, 250], [360, 260]
    ];
    for (const [ex, ey] of exudates) {
      ctx.beginPath();
      ctx.arc(ex, ey, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#fff478';
      ctx.fill();
    }
  } else if (caseType === 'pdr') {
    // Proliferative DR (Grade 4): Neovascularization at Disc (NVD) + Fibrous fronds + Preretinal hemorrhage
    // Neovascular network around optic disc (chaotic fragile tangled vessels)
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = '#c41d10';
    for (let i = 0; i < 16; i++) {
      ctx.beginPath();
      ctx.moveTo(odX, odY);
      const angle = (i / 16) * Math.PI * 2;
      const dist = 30 + Math.random() * 25;
      const endX = odX + Math.cos(angle) * dist;
      const endY = odY + Math.sin(angle) * dist;
      ctx.quadraticCurveTo(odX + (Math.random() - 0.5) * 20, odY + (Math.random() - 0.5) * 20, endX, endY);
      ctx.stroke();
    }

    // Boat-shaped Pre-retinal Hemorrhage (sub-hyaloid pool)
    ctx.beginPath();
    ctx.moveTo(300, 210);
    ctx.lineTo(370, 210);
    ctx.quadraticCurveTo(380, 250, 335, 255);
    ctx.quadraticCurveTo(290, 250, 300, 210);
    ctx.fillStyle = '#250000';
    ctx.fill();
    ctx.strokeStyle = '#4a0400';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Extensive scattered hemorrhages & exudates
    const pdrHemorrhages = [
      [240, 160, 10], [390, 170, 12], [260, 340, 14], [380, 340, 13],
      [420, 240, 10], [210, 270, 8]
    ];
    for (const [hx, hy, hr] of pdrHemorrhages) {
      ctx.beginPath();
      ctx.arc(hx, hy, hr, 0, Math.PI * 2);
      ctx.fillStyle = '#290000';
      ctx.fill();
    }
  } else if (caseType === 'blurry') {
    // Simulate severe lens haze / motion blur
    ctx.filter = 'blur(12px)';
    ctx.drawImage(canvas, 0, 0);
    ctx.filter = 'none';
    // Dark vignetting
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(0, 0, size, size);
  }

  // Restore clip
  ctx.restore();

  // Subtle circular border frame for medical presentation
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 3;
  ctx.stroke();

  return canvas.toDataURL('image/jpeg', 0.92);
}

export const SAMPLE_CASES: SampleFundusCase[] = [
  {
    id: 'sample-grade-0',
    title: 'Grade 0 — Normal Retina',
    subtitle: 'Healthy Rural Patient (Annual Checkup)',
    grade: 0,
    stageName: 'Normal',
    isReferable: false,
    description: 'Crisp optic disc margins, intact foveal avascular zone (FAZ), healthy arterial-venous ratio without microvascular lesions.',
    patientPreview: {
      age: 48,
      gender: 'Male',
      duration: '3 Years (Type 2)',
      village: 'Gram Rampur, Ayodhya',
    },
    sampleImageUrl: '',
    groundTruthFindings: ['Optic Disc: Sharp margins', 'Macula: Distinct foveal reflex', 'Vessels: Normal caliber (2:3 ratio)', 'Lesions: None detected'],
  },
  {
    id: 'sample-grade-1',
    title: 'Grade 1 — Mild NPDR',
    subtitle: 'Early Detection at Village Sub-Centre',
    grade: 1,
    stageName: 'Mild NPDR',
    isReferable: false,
    description: 'Presence of isolated microaneurysms only. Early disease onset detectable prior to vision loss.',
    patientPreview: {
      age: 54,
      gender: 'Female',
      duration: '7 Years (Type 2)',
      village: 'Dhanbad Basti, Varanasi',
    },
    sampleImageUrl: '',
    groundTruthFindings: ['Microaneurysms: Isolated dots in temporal arcade', 'Hard Exudates: None', 'Hemorrhages: None', 'Referral: 6-12 Month Follow-up'],
  },
  {
    id: 'sample-grade-2',
    title: 'Grade 2 — Moderate NPDR',
    subtitle: 'Referable DR with Hard Exudates',
    grade: 2,
    stageName: 'Moderate NPDR',
    isReferable: true,
    description: 'Circinate clusters of hard lipid exudates and dot-blot hemorrhages near macular zone, indicating capillary leakage.',
    patientPreview: {
      age: 61,
      gender: 'Male',
      duration: '11 Years (Type 2)',
      village: 'Kalyanpur, Kanpur Rural',
    },
    sampleImageUrl: '',
    groundTruthFindings: ['Exudates: Lipid circinate rings near macula', 'Hemorrhages: Dot & blot hemorrhages in 2 quadrants', 'Action: CHC Ophthalmologist Referral in 1-2 Months'],
  },
  {
    id: 'sample-grade-3',
    title: 'Grade 3 — Severe NPDR',
    subtitle: 'High-Risk NPDR (4-2-1 Rule)',
    grade: 3,
    stageName: 'Severe NPDR',
    isReferable: true,
    description: 'Significant ischemic signs: cotton wool spots, extensive multi-quadrant blot hemorrhages, and venous beading.',
    patientPreview: {
      age: 67,
      gender: 'Female',
      duration: '16 Years (Type 2)',
      village: 'Bilaspur, Chandauli',
    },
    sampleImageUrl: '',
    groundTruthFindings: ['Hemorrhages: Multi-quadrant severe blot lesions', 'Cotton Wool Spots: Nerve fiber ischemia', 'Venous Beading: Marked vessel tortuosity', 'Referral: Urgent Hospital Evaluation within 2 Weeks'],
  },
  {
    id: 'sample-grade-4',
    title: 'Grade 4 — Proliferative DR',
    subtitle: 'Critical Vision-Threatening Disease',
    grade: 4,
    stageName: 'Proliferative DR',
    isReferable: true,
    description: 'Neovascularization at the optic disc (NVD), boat-shaped sub-hyaloid preretinal hemorrhage. High immediate risk of vitreous hemorrhage and retinal detachment.',
    patientPreview: {
      age: 72,
      gender: 'Male',
      duration: '22 Years (Type 2)',
      village: 'Mandi Road, Mirzapur',
    },
    sampleImageUrl: '',
    groundTruthFindings: ['Neovascularization: Fragile vessel fronds at optic disc', 'Preretinal Hemorrhage: Sub-hyaloid blood pool', 'Referral: Emergency Vitreoretinal Surgery / Anti-VEGF / Pan-retinal Laser'],
  },
  {
    id: 'sample-quality-fail',
    title: 'Quality Test — Underexposed / Blur',
    subtitle: 'Ungradable Image Alert Demonstration',
    grade: 0,
    stageName: 'Normal',
    isReferable: false,
    description: 'Demonstrates automated image quality rejection when a rural camera has optical motion blur or inadequate flash.',
    patientPreview: {
      age: 50,
      gender: 'Female',
      duration: '5 Years',
      village: 'Demo Sub-Center',
    },
    sampleImageUrl: '',
    groundTruthFindings: ['Sharpness: Blur score < 25 (Fail)', 'Contrast: Insufficient vessel edge resolution', 'Action: Recapture with chin rest support'],
  },
];
