import React, { useState } from 'react';
import { Header, MainAppTab } from './components/Header';
import { UploadSection } from './components/UploadSection';
import { ResultDashboard } from './components/ResultDashboard';
import { ClinicalReportModal } from './components/ClinicalReportModal';
import { ArchitectureModal } from './components/ArchitectureModal';
import { ImpactStats } from './components/ImpactStats';
import { ThemeModal } from './components/ThemeModal';
import { PatientQueue } from './components/PatientQueue';
import { ClinicalGuide } from './components/ClinicalGuide';
import { GoogleDriveExplorerModal } from './components/GoogleDriveExplorerModal';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { GoogleAuthProvider } from './context/GoogleAuthContext';
import {
  DRClassificationResult,
  PatientInfo,
  PresetSample,
} from './types/dr';
import { PatientScreeningRecord } from './types/screening';
import { Hotspot } from './utils/fundusCanvas';
import { analyzeUploadedImage } from './utils/imageQualityChecker';
import { SAMPLE_PRESETS } from './data/sampleImages';
import {
  ShieldCheck,
  Zap,
  Activity,
  Sparkles,
  Palette,
  Eye,
  HeartPulse,
} from 'lucide-react';

function MainApp() {
  const { t, lang } = useLanguage();
  const { theme, currentThemeConfig, isDark } = useTheme();

  // Navigation Tab
  const [activeTab, setActiveTab] = useState<MainAppTab>('screening');

  // Screening State
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [currentResult, setCurrentResult] = useState<DRClassificationResult | null>(null);
  const [currentHotspots, setCurrentHotspots] = useState<Hotspot[]>([]);
  const [currentPatient, setCurrentPatient] = useState<PatientInfo | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isSavedToQueue, setIsSavedToQueue] = useState<boolean>(false);

  // Camp Register Queue Records (Pre-seeded with realistic cases)
  const [queueRecords, setQueueRecords] = useState<PatientScreeningRecord[]>(() => {
    return SAMPLE_PRESETS.slice(0, 4).map((p, idx) => ({
      id: p.patientDemo.id,
      patientName: p.patientDemo.name,
      age: Number(p.patientDemo.age),
      gender: p.patientDemo.gender as 'Female' | 'Male',
      abhaId: `ABHA-91-${Math.floor(100000000000 + idx * 12345678)}`,
      village: p.patientDemo.villageOrPHC,
      phcCenter: p.patientDemo.villageOrPHC,
      ashaWorkerName: p.patientDemo.ashaWorkerName,
      eye: p.patientDemo.eyeTested as any,
      diabetesDurationYears: parseInt(p.patientDemo.diabetesDurationYears || '5'),
      randomBloodSugar: parseInt(p.patientDemo.bloodSugarFasting || '160'),
      screeningTimestamp: p.patientDemo.screenDate,
      imageUrl: p.imageUrl,
      heatmapUrl: p.imageUrl,
      prediction: {
        grade: p.stage as any,
        stageName: p.stageName as any,
        hindiStageName: p.result.stageHindi,
        icdrClassification: `ICDR Grade ${p.stage}`,
        confidence: p.result.confidence / 100,
        isReferable: p.stage >= 2,
        riskLevel: p.result.riskLevel as any,
        riskColor: p.result.riskColor,
        referral: p.result.referral.actionRequired as any,
        urgencyDays: p.result.referral.timeframe,
        classProbabilities: p.result.classProbabilities.map((cp) => ({
          grade: cp.stage as any,
          name: cp.label as any,
          probability: cp.probability / 100,
        })),
        detectedLesions: p.result.lesionsDetected.map((l) => `${l.name} (${l.presence})`),
        gradCamHotspots: [],
        clinicalSummary: p.result.xaiExplanation.clinicalRationale,
        hindiSummary: p.result.referral.ruralCareAdvice,
        quality: {
          isGradable: p.result.qualityAssessment.isAcceptable,
          blurScore: p.result.qualityAssessment.clarityScore,
          brightnessScore: 60,
          contrastScore: 70,
          issues: [],
        },
        inferenceTimeMs: 420,
      },
      status: p.stage >= 2 ? 'Referred' : 'Screened',
    }));
  });

  // Modals
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [isArchOpen, setIsArchOpen] = useState<boolean>(false);
  const [isImpactOpen, setIsImpactOpen] = useState<boolean>(false);
  const [isThemeStudioOpen, setIsThemeStudioOpen] = useState<boolean>(false);
  const [isGoogleDriveOpen, setIsGoogleDriveOpen] = useState<boolean>(false);

  // 1. Handle Clinical Preset Selection
  const handleSelectPreset = (preset: PresetSample) => {
    setIsAnalyzing(true);
    setCurrentImage(preset.imageUrl);
    setCurrentPatient(preset.patientDemo);
    setIsSavedToQueue(false);

    setTimeout(() => {
      setCurrentResult(preset.result);
      setCurrentHotspots(preset.hotspots);
      setIsAnalyzing(false);
      window.scrollTo({ top: 320, behavior: 'smooth' });
    }, 400);
  };

  // 2. Handle Custom Image Upload & Edge Inference
  const handleCustomImageUpload = async (dataUrl: string, patientInfo: PatientInfo) => {
    setIsAnalyzing(true);
    setCurrentImage(dataUrl);
    setCurrentPatient(patientInfo);
    setIsSavedToQueue(false);

    try {
      const img = new Image();
      img.src = dataUrl;
      img.onload = async () => {
        const { quality, hotspots, prediction } = await analyzeUploadedImage(img);

        setCurrentResult(prediction);
        setCurrentHotspots(hotspots);
        setIsAnalyzing(false);
        window.scrollTo({ top: 320, behavior: 'smooth' });
      };
      img.onerror = () => {
        setIsAnalyzing(false);
        alert('Failed to process image format.');
      };
    } catch (err) {
      console.error(err);
      setIsAnalyzing(false);
    }
  };

  // 3. Save to Camp Register Queue
  const handleSaveToQueue = () => {
    if (!currentResult || !currentPatient || !currentImage) return;

    const newRecord: PatientScreeningRecord = {
      id: currentPatient.id,
      patientName: currentPatient.name,
      age: typeof currentPatient.age === 'number' ? currentPatient.age : 50,
      gender: (currentPatient.gender as any) || 'Female',
      abhaId: `ABHA-91-${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      village: currentPatient.villageOrPHC,
      phcCenter: currentPatient.villageOrPHC,
      ashaWorkerName: currentPatient.ashaWorkerName,
      eye: currentPatient.eyeTested as any,
      diabetesDurationYears: parseInt(currentPatient.diabetesDurationYears || '5'),
      randomBloodSugar: parseInt(currentPatient.bloodSugarFasting || '160'),
      screeningTimestamp: currentPatient.screenDate,
      imageUrl: currentImage,
      heatmapUrl: currentImage,
      prediction: {
        grade: currentResult.stage as any,
        stageName: currentResult.stageName as any,
        hindiStageName: currentResult.stageHindi,
        icdrClassification: `ICDR Grade ${currentResult.stage}`,
        confidence: currentResult.confidence / 100,
        isReferable: currentResult.stage >= 2,
        riskLevel: currentResult.riskLevel as any,
        riskColor: currentResult.riskColor,
        referral: currentResult.referral.actionRequired as any,
        urgencyDays: currentResult.referral.timeframe,
        classProbabilities: currentResult.classProbabilities.map((cp) => ({
          grade: cp.stage as any,
          name: cp.label as any,
          probability: cp.probability / 100,
        })),
        detectedLesions: currentResult.lesionsDetected.map((l) => `${l.name} (${l.presence})`),
        gradCamHotspots: [],
        clinicalSummary: currentResult.xaiExplanation.clinicalRationale,
        hindiSummary: currentResult.referral.ruralCareAdvice,
        quality: {
          isGradable: currentResult.qualityAssessment.isAcceptable,
          blurScore: currentResult.qualityAssessment.clarityScore,
          brightnessScore: 60,
          contrastScore: 70,
          issues: [],
        },
        inferenceTimeMs: 450,
      },
      status: currentResult.stage >= 2 ? 'Referred' : 'Screened',
    };

    setQueueRecords((prev) => [newRecord, ...prev.filter((r) => r.id !== newRecord.id)]);
    setIsSavedToQueue(true);
  };

  // 4. Select a record from the queue to view its XAI result
  const handleSelectRecordFromQueue = (record: PatientScreeningRecord) => {
    const matchedPreset = SAMPLE_PRESETS.find((p) => p.stage === record.prediction.grade);
    if (matchedPreset) {
      setCurrentImage(matchedPreset.imageUrl);
      setCurrentResult({
        ...matchedPreset.result,
        stageName: record.prediction.stageName,
        confidence: Math.round(record.prediction.confidence * 100),
      });
      setCurrentHotspots(matchedPreset.hotspots);
    } else {
      setCurrentImage(record.imageUrl);
    }

    setCurrentPatient({
      id: record.id,
      name: record.patientName,
      age: record.age,
      gender: record.gender,
      villageOrPHC: record.village,
      bloodSugarFasting: record.randomBloodSugar ? `${record.randomBloodSugar} mg/dL` : undefined,
      diabetesDurationYears: `${record.diabetesDurationYears} years`,
      eyeTested: record.eye as any,
      ashaWorkerName: record.ashaWorkerName,
      screenDate: record.screeningTimestamp,
    });

    setIsSavedToQueue(true);
    setActiveTab('screening');
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  // 5. Delete queue record
  const handleDeleteQueueRecord = (id: string) => {
    setQueueRecords((prev) => prev.filter((r) => r.id !== id));
  };

  // 6. Reset current screening
  const handleReset = () => {
    setCurrentImage(null);
    setCurrentResult(null);
    setCurrentHotspots([]);
    setCurrentPatient(null);
    setIsSavedToQueue(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-theme-main text-theme-primary flex flex-col selection:bg-blue-600 selection:text-white transition-colors duration-200">
      {/* Header Navigation */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        queueCount={queueRecords.length}
        onOpenArchitecture={() => setIsArchOpen(true)}
        onOpenImpact={() => setIsImpactOpen(true)}
        onOpenThemeStudio={() => setIsThemeStudioOpen(true)}
        onOpenGoogleDrive={() => setIsGoogleDriveOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Dynamic Hero Banner reflecting current theme atmosphere */}
        <section
          className={`rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden transition-all duration-300 text-white ${
            theme === 'sapphire'
              ? 'bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900'
              : theme === 'midnight'
              ? 'bg-gradient-to-r from-slate-950 via-sky-950 to-slate-900 border border-sky-500/20'
              : theme === 'emerald'
              ? 'bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900'
              : theme === 'terracotta'
              ? 'bg-gradient-to-r from-amber-950 via-orange-950 to-stone-900'
              : theme === 'obsidian-rose'
              ? 'bg-gradient-to-r from-purple-950 via-fuchsia-950 to-slate-950 border border-purple-500/20'
              : 'bg-black text-white border-2 border-white'
          }`}
        >
          {/* Subtle decorative glow */}
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-white/5 blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/15 text-white border border-white/20">
                SIH Problem Statement: AI Tele-Ophthalmology
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/25 text-emerald-200 border border-emerald-400/30">
                Primary Health Centre (PHC) Edge Ready
              </span>
              <button
                onClick={() => setIsThemeStudioOpen(true)}
                className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Palette className="w-3 metallic-icon" />
                <span>Theme: {currentThemeConfig.name}</span>
              </button>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Explainable AI for Diabetic Retinopathy Screening in Rural India
            </h2>

            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-2xl opacity-95">
              An intelligent, offline-capable tele-screening assistant for rural ASHA and ANM healthcare workers. Features automated image quality verification, 5-stage ICDR clinical grading, and <strong>Grad-CAM visual heatmap overlays</strong> to eliminate preventable blindness.
            </p>

            <div className="flex items-center space-x-4 pt-2 text-xs text-slate-200 flex-wrap gap-y-2">
              <div className="flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Grad-CAM++ Explainability</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>&lt;0.5s Edge Inference</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <Activity className="w-4 h-4 text-sky-400" />
                <span>Automated Triage Routing</span>
              </div>
            </div>
          </div>
        </section>

        {/* Tab 1: AI Screening Studio */}
        {activeTab === 'screening' && (
          <div className="space-y-6">
            {currentImage && currentResult && currentPatient ? (
              <ResultDashboard
                imageUrl={currentImage}
                result={currentResult}
                hotspots={currentHotspots}
                patientInfo={currentPatient}
                onReset={handleReset}
                onOpenReport={() => setIsReportOpen(true)}
                onSaveToQueue={handleSaveToQueue}
                isSavedToQueue={isSavedToQueue}
                onOpenGoogleDrive={() => setIsGoogleDriveOpen(true)}
              />
            ) : (
              <UploadSection
                onSelectPreset={handleSelectPreset}
                onCustomImageUpload={handleCustomImageUpload}
                isAnalyzing={isAnalyzing}
                onOpenGoogleDrive={() => setIsGoogleDriveOpen(true)}
              />
            )}
          </div>
        )}

        {/* Tab 2: Camp Patient Register */}
        {activeTab === 'queue' && (
          <PatientQueue
            records={queueRecords}
            onSelectRecord={handleSelectRecordFromQueue}
            onDeleteRecord={handleDeleteQueueRecord}
            onClearAll={() => setQueueRecords([])}
            language={lang === 'hi' ? 'hi' : 'en'}
            onOpenGoogleDrive={() => setIsGoogleDriveOpen(true)}
          />
        )}

        {/* Tab 3: Clinical Guide & ICDR Anatomy */}
        {activeTab === 'guide' && (
          <ClinicalGuide language={lang === 'hi' ? 'hi' : 'en'} />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-theme bg-theme-card py-6 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-theme-muted">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-theme-primary">NetraRakshak AI</span>
            <span>•</span>
            <span>SIH 2024–25 Project Prototype</span>
            <span>•</span>
            <button
              onClick={() => setIsThemeStudioOpen(true)}
              className="text-theme-primary-accent hover:underline font-bold"
            >
              Theme Studio
            </button>
            <span>•</span>
            <button
              onClick={() => setIsGoogleDriveOpen(true)}
              className="text-blue-600 dark:text-blue-400 hover:underline font-bold"
            >
              Google Drive Cloud Sync
            </button>
          </div>
          <p className="text-center sm:text-right">
            Designed for rural Primary Health Centres (PHCs) & Community Health Centres (CHCs) across India.
          </p>
        </div>
      </footer>

      {/* Modals */}
      {currentResult && currentPatient && currentImage && (
        <ClinicalReportModal
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
          patientInfo={currentPatient}
          result={currentResult}
          imageUrl={currentImage}
        />
      )}

      <GoogleDriveExplorerModal
        isOpen={isGoogleDriveOpen}
        onClose={() => setIsGoogleDriveOpen(false)}
        queueRecords={queueRecords}
        onRestoreQueue={(records) => setQueueRecords(records)}
        currentPatient={currentPatient}
        currentResult={currentResult}
        currentImage={currentImage}
        onLoadImageToScreening={(imageUrl, name) => {
          handleCustomImageUpload(imageUrl, {
            id: `DR-${Math.floor(1000 + Math.random() * 9000)}`,
            name: name || 'Google Drive Patient',
            age: 54,
            gender: 'Female',
            villageOrPHC: 'Sub-centre Health Post',
            eyeTested: 'Right Eye (OD)',
            ashaWorkerName: 'ASHA Field Officer',
            screenDate: new Date().toISOString().slice(0, 10),
          });
          setActiveTab('screening');
        }}
      />

      <ArchitectureModal
        isOpen={isArchOpen}
        onClose={() => setIsArchOpen(false)}
      />

      <ImpactStats
        isOpen={isImpactOpen}
        onClose={() => setIsImpactOpen(false)}
      />

      <ThemeModal
        isOpen={isThemeStudioOpen}
        onClose={() => setIsThemeStudioOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <GoogleAuthProvider>
          <MainApp />
        </GoogleAuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
