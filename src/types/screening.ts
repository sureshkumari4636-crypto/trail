export type DRGrade = 0 | 1 | 2 | 3 | 4;

export type DRStageName =
  | 'Normal'
  | 'Mild NPDR'
  | 'Moderate NPDR'
  | 'Severe NPDR'
  | 'Proliferative DR';

export type RiskLevel = 'Low risk' | 'Medium risk' | 'High risk' | 'Critical risk';

export type ReferralRecommendation =
  | 'Routine annual screening (No immediate referral)'
  | 'Schedule follow-up eye exam in 6-12 months'
  | 'Refer to Ophthalmologist at CHC within 1-3 months'
  | 'Urgent referral to District Eye Hospital (within 2-4 weeks)'
  | 'Emergency referral to Tertiary Vitreoretinal Unit (within 48-72 hours)';

export interface LesionHotspot {
  id: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  radius: number; // percentage
  name: string;
  hindiName?: string;
  severity: 'low' | 'medium' | 'high';
  clinicalSignificance: string;
  featureAttributionScore: number; // 0.00 to 1.00
}

export interface ImageQualityReport {
  isGradable: boolean;
  blurScore: number; // 0 - 100 (higher is sharper)
  brightnessScore: number; // 0 - 100 (40-70 is optimal)
  contrastScore: number; // 0 - 100
  issues: string[];
  recommendation?: string;
}

export interface PredictionResult {
  grade: DRGrade;
  stageName: DRStageName;
  hindiStageName: string;
  icdrClassification: string; // International Clinical Diabetic Retinopathy scale
  confidence: number; // e.g. 0.942 (94.2%)
  isReferable: boolean; // Grades 2, 3, 4 are considered referable DR
  riskLevel: RiskLevel;
  riskColor: string;
  referral: ReferralRecommendation;
  urgencyDays: string;
  classProbabilities: {
    grade: DRGrade;
    name: DRStageName;
    probability: number;
  }[];
  detectedLesions: string[];
  gradCamHotspots: LesionHotspot[];
  clinicalSummary: string;
  hindiSummary: string;
  quality: ImageQualityReport;
  inferenceTimeMs: number;
}

export interface PatientScreeningRecord {
  id: string;
  patientName: string;
  age: number;
  gender: 'Female' | 'Male' | 'Other';
  abhaId?: string;
  village: string;
  phcCenter: string;
  ashaWorkerName: string;
  eye: 'Right Eye (OD)' | 'Left Eye (OS)';
  diabetesDurationYears: number;
  randomBloodSugar?: number;
  screeningTimestamp: string;
  imageUrl: string;
  heatmapUrl: string;
  prediction: PredictionResult;
  status: 'Screened' | 'Referred' | 'Follow-up Booked' | 'Attended Camp';
  notes?: string;
}

export interface SampleFundusCase {
  id: string;
  title: string;
  subtitle: string;
  grade: DRGrade;
  stageName: DRStageName;
  isReferable: boolean;
  description: string;
  patientPreview: {
    age: number;
    gender: 'Female' | 'Male';
    duration: string;
    village: string;
  };
  sampleImageUrl: string;
  groundTruthFindings: string[];
}
