import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  Image as ImageIcon,
  Sparkles,
  User,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Activity,
  ArrowRight,
  ShieldCheck,
  Zap,
  Cloud,
} from 'lucide-react';
import { PatientInfo, PresetSample } from '../types/dr';
import { SAMPLE_PRESETS } from '../data/sampleImages';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useGoogleAuth } from '../context/GoogleAuthContext';

interface UploadSectionProps {
  onSelectPreset: (preset: PresetSample) => void;
  onCustomImageUpload: (dataUrl: string, patientInfo: PatientInfo) => void;
  isAnalyzing: boolean;
  onOpenGoogleDrive?: () => void;
}

export const UploadSection: React.FC<UploadSectionProps> = ({
  onSelectPreset,
  onCustomImageUpload,
  isAnalyzing,
  onOpenGoogleDrive,
}) => {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const { isAuthenticated } = useGoogleAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [dragActive, setDragActive] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Patient Info Form State
  const [patientInfo, setPatientInfo] = useState<PatientInfo>({
    id: `PHC-IN-${Math.floor(1000 + Math.random() * 9000)}`,
    name: 'Kamla Bai',
    age: 52,
    gender: 'Female',
    villageOrPHC: 'PHC Kolar Rural, Sub-district Hospital',
    bloodSugarFasting: '180 mg/dL',
    diabetesDurationYears: '6 years',
    eyeTested: 'Right Eye (OD)',
    ashaWorkerName: 'Rekha Devi (ASHA #14)',
    screenDate: new Date().toISOString().split('T')[0],
  });

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPG, PNG, or TIFF).');
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setPreviewUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleStartAnalysis = () => {
    if (!previewUrl) return;
    onCustomImageUpload(previewUrl, patientInfo);
  };

  return (
    <div className="space-y-6">
      {/* Interactive Clinical Preset Bar */}
      <div className="bg-theme-card p-5 sm:p-6 rounded-3xl border border-theme shadow-xs transition-colors duration-200">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-theme-primary-subtle text-theme-primary-accent border border-theme">
                <Sparkles className="w-3.5 h-3.5" /> Instant Clinical Benchmarks
              </span>
              <span className="text-[11px] text-theme-muted font-medium">
                ICDR Standard 5-Grade Spectrum
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-extrabold text-theme-primary mt-1">
              Select a Validated Fundus Case for Instant Explainability Demo
            </h3>
            <p className="text-xs text-theme-muted">
              Click any clinical case below to trigger edge inference and interactive Grad-CAM++ neural activation map:
            </p>
          </div>
          <span className="text-[11px] text-theme-primary-accent font-bold bg-theme-subtle px-3 py-1.5 rounded-xl border border-theme shrink-0 self-start md:self-auto flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" />
            1-Click Tele-Diagnosis
          </span>
        </div>

        {/* Preset Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {SAMPLE_PRESETS.map((preset) => {
            const riskColors = {
              Low: 'hover:border-emerald-500 hover:shadow-emerald-500/10',
              Medium: 'hover:border-amber-500 hover:shadow-amber-500/10',
              High: 'hover:border-orange-500 hover:shadow-orange-500/10',
              Critical: 'hover:border-rose-500 hover:shadow-rose-500/10',
            };

            const badgeBg = {
              Low: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
              Medium: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
              High: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30',
              Critical: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
            };

            return (
              <button
                key={preset.id}
                id={`preset-btn-${preset.id}`}
                onClick={() => onSelectPreset(preset)}
                className={`group flex flex-col p-2.5 rounded-2xl border border-theme bg-theme-subtle hover:bg-theme-card hover:shadow-lg transition-all duration-200 text-left cursor-pointer ${
                  riskColors[preset.riskLevel]
                }`}
              >
                <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-black mb-2.5 shadow-inner">
                  <img
                    src={preset.imageUrl}
                    alt={preset.name}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                  />
                  <span
                    className={`absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase tracking-wider border backdrop-blur-xs ${
                      badgeBg[preset.riskLevel]
                    }`}
                  >
                    {preset.riskLevel}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-theme-primary group-hover:text-theme-primary-accent transition-colors line-clamp-1">
                  {preset.name}
                </h4>
                <p className="text-[10px] text-theme-muted line-clamp-1 mt-0.5">
                  {preset.tag}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Upload Grid: File Input & Patient Demographic Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Fundus Drag & Drop Box */}
        <div className="lg:col-span-7 bg-theme-card p-5 sm:p-6 rounded-3xl border border-theme shadow-xs transition-colors duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <h3 className="text-sm sm:text-base font-bold text-theme-primary flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-theme-primary-accent" />
                {t('uploadTitle')}
              </h3>
              <div className="flex items-center space-x-2">
                {onOpenGoogleDrive && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenGoogleDrive();
                    }}
                    id="upload-drive-browse-btn"
                    className="flex items-center space-x-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/20 transition-colors cursor-pointer"
                    title="Select and import fundus exam image from Google Drive"
                  >
                    <Cloud className="w-3.5 h-3.5 text-blue-500" />
                    <span>Drive Photos</span>
                  </button>
                )}
                <span className="text-[11px] text-theme-muted font-mono bg-theme-subtle px-2 py-0.5 rounded-md border border-theme">
                  512×512 RGB
                </span>
              </div>
            </div>

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center p-6 sm:p-8 rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer min-h-[220px] ${
                dragActive
                  ? 'border-blue-500 bg-blue-500/10 scale-[0.99]'
                  : previewUrl
                  ? 'border-emerald-500/60 bg-emerald-500/5'
                  : 'border-theme-strong hover:border-blue-500 bg-theme-subtle/50 hover:bg-theme-subtle'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
              />

              {previewUrl ? (
                <div className="flex flex-col items-center">
                  <div className="relative w-44 h-44 rounded-2xl overflow-hidden bg-black shadow-lg border-2 border-emerald-500">
                    <img
                      src={previewUrl}
                      alt="Uploaded Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-emerald-500 text-white rounded-full p-1 shadow-sm">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                  </div>
                  <p className="text-xs font-bold text-theme-primary mt-3">
                    {selectedFile?.name || 'Uploaded Fundus Image'}
                  </p>
                  <p className="text-[11px] text-theme-muted">Click or drag a new image to replace</p>
                </div>
              ) : (
                <div className="flex flex-col items-center text-center">
                  <div className="p-4 bg-theme-primary-subtle text-theme-primary-accent rounded-2xl mb-3 shadow-xs border border-theme">
                    <ImageIcon className="w-7 h-7" />
                  </div>
                  <p className="text-sm font-bold text-theme-primary mb-1">
                    {t('dragDropText')}
                  </p>
                  <p className="text-xs text-theme-muted mb-3.5 max-w-sm">{t('supportedFormats')}</p>
                  <span className="px-4 py-2 bg-theme-primary-btn text-white text-xs font-bold rounded-xl shadow-sm transition-all hover:shadow-md">
                    Browse Retinal Photos
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-5 flex items-center justify-between gap-3 pt-3 border-t border-theme">
            <div className="flex items-center space-x-1.5 text-xs text-theme-muted">
              <Activity className="w-3.5 h-3.5 text-theme-primary-accent" />
              <span>Automated Laplacian Clarity & Grad-CAM pipeline</span>
            </div>

            <button
              id="run-analysis-btn"
              disabled={!previewUrl || isAnalyzing}
              onClick={handleStartAnalysis}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer ${
                previewUrl && !isAnalyzing
                  ? 'bg-theme-primary-btn text-white shadow-blue-500/20 hover:scale-[1.02]'
                  : 'bg-theme-subtle text-theme-muted cursor-not-allowed opacity-60'
              }`}
            >
              {isAnalyzing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{t('analyzingText')}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{t('analyzeBtn')}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right 5 Cols: Rural Patient & PHC Metadata Form */}
        <div className="lg:col-span-5 bg-theme-card p-5 sm:p-6 rounded-3xl border border-theme shadow-xs transition-colors duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-theme mb-4">
            <h3 className="text-sm sm:text-base font-bold text-theme-primary flex items-center gap-2">
              <User className="w-4 h-4 text-theme-primary-accent" />
              {t('patientDetails')}
            </h3>
            <span className="text-[11px] text-theme-primary-accent bg-theme-primary-subtle px-2.5 py-0.5 rounded-lg font-mono font-bold border border-theme">
              UHID: {patientInfo.id}
            </span>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block font-bold text-theme-secondary mb-1">{t('patientName')}</label>
              <input
                type="text"
                value={patientInfo.name}
                onChange={(e) => setPatientInfo({ ...patientInfo, name: e.target.value })}
                className="w-full px-3 py-2 bg-theme-subtle border border-theme rounded-xl text-theme-primary focus:outline-hidden focus:border-blue-500 focus:bg-theme-card transition-colors"
                placeholder="e.g. Kamla Bai"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-theme-secondary mb-1">{t('patientAge')}</label>
                <input
                  type="number"
                  value={patientInfo.age}
                  onChange={(e) =>
                    setPatientInfo({ ...patientInfo, age: e.target.value === '' ? '' : Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 bg-theme-subtle border border-theme rounded-xl text-theme-primary focus:outline-hidden focus:border-blue-500 focus:bg-theme-card transition-colors"
                  placeholder="52"
                />
              </div>
              <div>
                <label className="block font-bold text-theme-secondary mb-1">{t('gender')}</label>
                <select
                  value={patientInfo.gender}
                  onChange={(e) =>
                    setPatientInfo({ ...patientInfo, gender: e.target.value as any })
                  }
                  className="w-full px-3 py-2 bg-theme-subtle border border-theme rounded-xl text-theme-primary focus:outline-hidden focus:border-blue-500 focus:bg-theme-card transition-colors cursor-pointer"
                >
                  <option value="Female">Female (महिला)</option>
                  <option value="Male">Male (पुरुष)</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-theme-secondary mb-1">Fasting Blood Sugar</label>
                <input
                  type="text"
                  value={patientInfo.bloodSugarFasting || ''}
                  onChange={(e) => setPatientInfo({ ...patientInfo, bloodSugarFasting: e.target.value })}
                  className="w-full px-3 py-2 bg-theme-subtle border border-theme rounded-xl text-theme-primary focus:outline-hidden focus:border-blue-500 focus:bg-theme-card transition-colors"
                  placeholder="180 mg/dL"
                />
              </div>
              <div>
                <label className="block font-bold text-theme-secondary mb-1">Diabetes History</label>
                <input
                  type="text"
                  value={patientInfo.diabetesDurationYears || ''}
                  onChange={(e) => setPatientInfo({ ...patientInfo, diabetesDurationYears: e.target.value })}
                  className="w-full px-3 py-2 bg-theme-subtle border border-theme rounded-xl text-theme-primary focus:outline-hidden focus:border-blue-500 focus:bg-theme-card transition-colors"
                  placeholder="6 years"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-theme-secondary mb-1">{t('village')}</label>
              <input
                type="text"
                value={patientInfo.villageOrPHC}
                onChange={(e) => setPatientInfo({ ...patientInfo, villageOrPHC: e.target.value })}
                className="w-full px-3 py-2 bg-theme-subtle border border-theme rounded-xl text-theme-primary focus:outline-hidden focus:border-blue-500 focus:bg-theme-card transition-colors"
                placeholder="PHC Kolar Rural, Sub-district Hospital"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-theme-secondary mb-1">{t('eyeTested')}</label>
                <select
                  value={patientInfo.eyeTested}
                  onChange={(e) =>
                    setPatientInfo({ ...patientInfo, eyeTested: e.target.value as any })
                  }
                  className="w-full px-3 py-2 bg-theme-subtle border border-theme rounded-xl text-theme-primary focus:outline-hidden focus:border-blue-500 focus:bg-theme-card transition-colors cursor-pointer"
                >
                  <option value="Right Eye (OD)">Right Eye (OD - दायां)</option>
                  <option value="Left Eye (OS)">Left Eye (OS - बायां)</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-theme-secondary mb-1">ASHA Officer</label>
                <input
                  type="text"
                  value={patientInfo.ashaWorkerName}
                  onChange={(e) => setPatientInfo({ ...patientInfo, ashaWorkerName: e.target.value })}
                  className="w-full px-3 py-2 bg-theme-subtle border border-theme rounded-xl text-theme-primary focus:outline-hidden focus:border-blue-500 focus:bg-theme-card transition-colors"
                  placeholder="Rekha Devi (ASHA #14)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
