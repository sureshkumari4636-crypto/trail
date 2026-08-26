export type DRStage = 0 | 1 | 2 | 3 | 4;

export interface DRClassificationResult {
  stage: DRStage;
  stageName: string;
  stageHindi: string;
  stageTamil: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  riskColor: string;
  confidence: number;
  classProbabilities: {
    stage: DRStage;
    label: string;
    probability: number;
  }[];
  referral: {
    status: 'Routine Monitor' | 'Early Review' | 'Refer to Eye Specialist' | 'Urgent Tertiary Referral';
    timeframe: string;
    actionRequired: string;
    ruralCareAdvice: string;
  };
  lesionsDetected: {
    name: string;
    presence: 'None' | 'Mild' | 'Moderate' | 'Extensive';
    description: string;
    countEstimate?: number;
  }[];
  qualityAssessment: {
    isAcceptable: boolean;
    clarityScore: number; // 0-100
    illumination: 'Optimal' | 'Under-exposed' | 'Over-exposed' | 'Uneven';
    blurLevel: 'Sharp' | 'Slight Motion' | 'Severe Blur';
    recommendation: string;
  };
  xaiExplanation: {
    primaryFocusRegion: string;
    anatomicalStructures: string[];
    gradCamInterpretation: string;
    clinicalRationale: string;
  };
}

export interface PatientInfo {
  id: string;
  name: string;
  age: number | '';
  gender: 'Female' | 'Male' | 'Other' | '';
  villageOrPHC: string;
  bloodSugarFasting?: string;
  diabetesDurationYears?: string;
  eyeTested: 'Right Eye (OD)' | 'Left Eye (OS)';
  ashaWorkerName: string;
  screenDate: string;
}

export interface PresetSample {
  id: string;
  name: string;
  tag: string;
  stage: DRStage;
  stageName: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  description: string;
  imageUrl: string;
  patientDemo: PatientInfo;
  result: DRClassificationResult;
  hotspots: { x: number; y: number; radius: number; intensity: number }[];
}

export type SupportedLanguage = 'en' | 'hi' | 'ta' | 'te' | 'bn';
