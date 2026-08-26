import React, { useState } from 'react';
import {
  DRClassificationResult,
  PatientInfo,
} from '../types/dr';
import { Hotspot } from '../utils/fundusCanvas';
import { GradCamViewer } from './GradCamViewer';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useGoogleAuth } from '../context/GoogleAuthContext';
import { uploadJsonToDrive, uploadImageToDrive } from '../services/googleDriveService';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Printer,
  Volume2,
  RotateCcw,
  ShieldCheck,
  Activity,
  Award,
  Sparkles,
  UserCheck,
  Cloud,
  UploadCloud,
} from 'lucide-react';

interface ResultDashboardProps {
  imageUrl: string;
  result: DRClassificationResult;
  hotspots: Hotspot[];
  patientInfo: PatientInfo;
  onReset: () => void;
  onOpenReport: () => void;
  onSaveToQueue?: () => void;
  isSavedToQueue?: boolean;
  onOpenGoogleDrive?: () => void;
}

export const ResultDashboard: React.FC<ResultDashboardProps> = ({
  imageUrl,
  result,
  hotspots,
  patientInfo,
  onReset,
  onOpenReport,
  onSaveToQueue,
  isSavedToQueue,
  onOpenGoogleDrive,
}) => {
  const { lang, t } = useLanguage();
  const { isDark } = useTheme();
  const { isAuthenticated, requireAuth } = useGoogleAuth();
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isSavingToDrive, setIsSavingToDrive] = useState(false);
  const [driveSavedSuccess, setDriveSavedSuccess] = useState(false);

  const handleSaveToDrive = async () => {
    try {
      setIsSavingToDrive(true);
      await requireAuth();

      const timestamp = new Date().toISOString().slice(0, 10);
      const safeName = patientInfo.name.replace(/[^a-zA-Z0-9]/g, '_');
      const jsonFileName = `DR_Report_${safeName}_Grade${result.stage}_${timestamp}.json`;

      const reportPayload = {
        uhid: patientInfo.id,
        patient: patientInfo,
        clinicalResult: result,
        screenedAt: new Date().toISOString(),
        xaiGradCamSummary: result.xaiExplanation,
      };

      await uploadJsonToDrive(
        jsonFileName,
        reportPayload,
        `Diabetic Retinopathy screening for ${patientInfo.name}`
      );

      if (imageUrl) {
        const imgFileName = `Fundus_${safeName}_${patientInfo.eyeTested.replace(/[^a-zA-Z0-9]/g, '_')}_${timestamp}.jpg`;
        await uploadImageToDrive(imgFileName, imageUrl);
      }

      setDriveSavedSuccess(true);
      setTimeout(() => setDriveSavedSuccess(false), 5000);
    } catch (err: any) {
      console.error('Drive save error:', err);
      alert(err?.message || 'Failed to save to Google Drive.');
    } finally {
      setIsSavingToDrive(false);
    }
  };

  // Play voice guidance for ASHA / PHC worker in the selected language using Web Speech API
  const handlePlayVoiceGuidance = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    window.speechSynthesis.cancel();

    let textToSpeak = '';
    let voiceLang = 'en-IN';

    if (lang === 'hi') {
      voiceLang = 'hi-IN';
      textToSpeak = `मरीज ${patientInfo.name} की जांच पूरी हुई। निदान है ${result.stageHindi}। ${result.referral.ruralCareAdvice}`;
    } else {
      voiceLang = 'en-US';
      textToSpeak = `Screening complete for patient ${patientInfo.name}. Diagnostic outcome: ${result.stageName} with ${result.confidence}% confidence. Risk level is ${result.riskLevel}. Action: ${result.referral.actionRequired}`;
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = voiceLang;
    utterance.rate = 0.95;

    utterance.onstart = () => setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'Low':
        return {
          bg: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
          dot: 'bg-emerald-500',
          title: t('riskLow'),
        };
      case 'Medium':
        return {
          bg: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
          dot: 'bg-amber-500',
          title: t('riskMedium'),
        };
      case 'High':
        return {
          bg: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30',
          dot: 'bg-orange-500',
          title: t('riskHigh'),
        };
      case 'Critical':
        return {
          bg: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
          dot: 'bg-rose-500',
          title: t('riskCritical'),
        };
      default:
        return {
          bg: 'bg-theme-subtle text-theme-primary border-theme',
          dot: 'bg-slate-500',
          title: risk,
        };
    }
  };

  const riskBadge = getRiskBadge(result.riskLevel);

  return (
    <div className="space-y-6">
      {/* Top Patient & Action Ribbon */}
      <div className="bg-theme-card p-5 sm:p-6 rounded-3xl border border-theme shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors duration-200">
        <div className="flex items-center space-x-4">
          <div className="w-13 h-13 rounded-2xl bg-theme-primary-subtle border border-theme flex items-center justify-center text-theme-primary-accent font-bold text-2xl shrink-0 shadow-xs">
            {patientInfo.gender === 'Female' ? '👩' : '👨'}
          </div>
          <div>
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <h2 className="text-base sm:text-lg font-black text-theme-primary tracking-tight">
                {patientInfo.name}
              </h2>
              <span className="text-xs text-theme-muted font-medium">
                ({patientInfo.age}y, {patientInfo.gender})
              </span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-lg bg-theme-primary-subtle text-theme-primary-text font-mono font-bold border border-theme">
                {patientInfo.eyeTested}
              </span>
            </div>
            <p className="text-xs text-theme-muted mt-0.5">
              📍 {patientInfo.villageOrPHC} • ASHA: {patientInfo.ashaWorkerName} • Date:{' '}
              {patientInfo.screenDate}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          {/* Save to Google Drive Button */}
          <button
            onClick={handleSaveToDrive}
            disabled={isSavingToDrive}
            id="result-save-drive-btn"
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
              driveSavedSuccess
                ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/40'
                : 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/20'
            }`}
            title="Upload clinical screening report & retinal fundus photo to Google Drive"
          >
            {isSavingToDrive ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span>Uploading to Drive...</span>
              </>
            ) : driveSavedSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Saved to Drive!</span>
              </>
            ) : (
              <>
                <Cloud className="w-4 h-4 text-blue-500" />
                <span>Save to Google Drive</span>
              </>
            )}
          </button>

          {onSaveToQueue && (
            <button
              onClick={onSaveToQueue}
              id="save-to-queue-btn"
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                isSavedToQueue
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/40'
                  : 'bg-theme-subtle hover:bg-theme-card text-theme-secondary border-theme'
              }`}
            >
              <UserCheck className="w-4 h-4 text-emerald-500" />
              <span>{isSavedToQueue ? 'Saved to Register' : 'Save in Camp Register'}</span>
            </button>
          )}

          <button
            onClick={handlePlayVoiceGuidance}
            id="voice-guidance-btn"
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isPlayingAudio
                ? 'bg-purple-600 text-white animate-pulse shadow-md shadow-purple-500/20'
                : 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/20'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>{isPlayingAudio ? 'Speaking...' : t('audioAdvice')}</span>
          </button>

          <button
            onClick={onOpenReport}
            id="print-report-btn"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-theme-primary-btn text-white flex items-center gap-1.5 shadow-sm transition-all hover:shadow-md cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{t('printReport')}</span>
          </button>

          <button
            onClick={onReset}
            id="reset-screen-btn"
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-theme-subtle hover:bg-theme-card text-theme-secondary border border-theme transition-colors cursor-pointer"
            title="Screen Another Patient"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Primary Triage Outcome & Clinical Grading Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Primary Classification Card */}
        <div className="lg:col-span-7 bg-theme-card p-5 sm:p-6 rounded-3xl border border-theme shadow-xs flex flex-col justify-between transition-colors duration-200">
          <div>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <span className="text-[11px] font-bold tracking-wider text-theme-muted uppercase">
                  ICDR Clinical Stage Grading
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-theme-primary mt-0.5 tracking-tight">
                  {result.stageName}
                </h3>
                {lang !== 'en' && (
                  <p className="text-sm font-bold text-theme-primary-accent mt-0.5">
                    {result.stageHindi}
                  </p>
                )}
              </div>

              {/* Risk Level Badge */}
              <div
                className={`px-3.5 py-1.5 rounded-xl border flex items-center gap-2 font-black text-xs shrink-0 ${riskBadge.bg}`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${riskBadge.dot}`}></span>
                <span>{riskBadge.title}</span>
              </div>
            </div>

            {/* Confidence Score Bar & Probability Distribution */}
            <div className="bg-theme-subtle p-4 rounded-2xl border border-theme mb-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-theme-primary flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-theme-primary-accent" />
                  Model Confidence Score
                </span>
                <span className="text-sm font-black font-mono text-theme-primary-accent">
                  {result.confidence}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-3 bg-theme-card rounded-full overflow-hidden mb-3 border border-theme">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${result.confidence}%`,
                    backgroundColor: result.riskColor,
                  }}
                ></div>
              </div>

              {/* Probabilities across all 5 classes */}
              <div className="space-y-1.5 pt-2 border-t border-theme">
                <span className="text-[10px] font-bold text-theme-muted uppercase tracking-wider block mb-1">
                  Multi-Class Softmax Probabilities:
                </span>
                {result.classProbabilities.map((prob) => (
                  <div key={prob.stage} className="flex items-center justify-between text-xs">
                    <span className={`font-medium ${prob.stage === result.stage ? 'text-theme-primary font-bold' : 'text-theme-muted'}`}>
                      Grade {prob.stage}: {prob.label}
                    </span>
                    <div className="flex items-center space-x-2 w-36">
                      <div className="w-24 h-1.5 bg-theme-card rounded-full overflow-hidden border border-theme">
                        <div
                          className={`h-full ${prob.stage === result.stage ? 'bg-blue-600' : 'bg-slate-400 dark:bg-slate-600'}`}
                          style={{ width: `${prob.probability}%` }}
                        ></div>
                      </div>
                      <span className="font-mono text-[11px] text-theme-muted w-10 text-right">
                        {prob.probability}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Lesions Breakdown List */}
          <div>
            <h4 className="text-xs font-bold text-theme-muted uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-theme-primary-accent" />
              Retinal Pathology Findings
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {result.lesionsDetected.map((lesion, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-theme-subtle border border-theme text-xs"
                >
                  <div className="flex items-center justify-between font-bold text-theme-primary">
                    <span>{lesion.name}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                        lesion.presence === 'None'
                          ? 'bg-theme-card text-theme-muted border border-theme'
                          : lesion.presence === 'Mild'
                          ? 'bg-blue-500/20 text-blue-700 dark:text-blue-300'
                          : 'bg-rose-500/20 text-rose-700 dark:text-rose-300'
                      }`}
                    >
                      {lesion.presence}
                    </span>
                  </div>
                  <p className="text-[11px] text-theme-muted mt-1 leading-snug">
                    {lesion.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Rural Care & Triage Guidance Card */}
        <div className="lg:col-span-5 bg-theme-card p-5 sm:p-6 rounded-3xl border border-theme shadow-xs flex flex-col justify-between transition-colors duration-200">
          <div>
            <div className="flex items-center space-x-2 pb-3 border-b border-theme mb-4">
              <ShieldCheck className="w-5 h-5 text-theme-primary-accent" />
              <h3 className="text-sm sm:text-base font-bold text-theme-primary">
                {t('referralAction')}
              </h3>
            </div>

            {/* Timeframe Callout Box */}
            <div
              className={`p-4 rounded-2xl border mb-4 ${
                result.stage === 0
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-100'
                  : result.stage === 1
                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-950 dark:text-blue-100'
                  : result.stage <= 3
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-100'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-950 dark:text-rose-100'
              }`}
            >
              <div className="flex items-center space-x-2 mb-1">
                <Clock className="w-4 h-4 text-theme-primary-accent" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  {t('timeframe')}
                </span>
              </div>
              <p className="text-base font-black">{result.referral.timeframe}</p>
              <p className="text-xs mt-1.5 leading-relaxed opacity-90">
                {result.referral.actionRequired}
              </p>
            </div>

            {/* Regional Language ASHA Guidance Note */}
            <div className="bg-theme-subtle p-3.5 rounded-2xl border border-theme text-xs mb-4">
              <span className="font-bold text-theme-primary block mb-1">
                🗣️ परामर्श एवं ग्रामीण स्वास्थ्य कार्यकर्ता निर्देश:
              </span>
              <p className="text-theme-secondary italic leading-relaxed">
                "{result.referral.ruralCareAdvice}"
              </p>
            </div>
          </div>

          {/* Quality Assessment Warning / Status */}
          <div
            className={`p-3.5 rounded-2xl border text-xs ${
              result.qualityAssessment.isAcceptable
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-200'
            }`}
          >
            <div className="flex items-center justify-between font-bold mb-1">
              <span className="flex items-center gap-1.5">
                {result.qualityAssessment.isAcceptable ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                )}
                {t('qualityCheck')}
              </span>
              <span className="font-mono text-[11px]">
                Clarity: {result.qualityAssessment.clarityScore}/100 ({result.qualityAssessment.blurLevel})
              </span>
            </div>
            <p className="text-[11px] opacity-90">
              {result.qualityAssessment.recommendation}
            </p>
          </div>
        </div>
      </div>

      {/* Core Explainability (XAI) Grad-CAM Viewer Component */}
      <GradCamViewer
        imageUrl={imageUrl}
        hotspots={hotspots}
        stageName={result.stageName}
        stageNum={result.stage}
        xaiExplanation={result.xaiExplanation}
      />
    </div>
  );
};
