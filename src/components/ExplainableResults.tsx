import React, { useState, useEffect, useRef } from 'react';
import {
  Eye,
  Sliders,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Share2,
  Printer,
  ArrowLeft,
  Info,
  Maximize2,
  Activity,
  Calendar,
  Layers,
  ChevronRight,
  Stethoscope,
  Clock,
  ShieldAlert,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';
import { PredictionResult, LesionHotspot } from '../types/screening';
import { ColormapType, generateGradCamHeatmap } from '../utils/drInference';

interface ExplainableResultsProps {
  originalImage: string;
  prediction: PredictionResult;
  patientInfo: {
    name: string;
    age: number;
    gender: 'Female' | 'Male';
    village: string;
    diabetesYears: number;
    eye: 'Right Eye (OD)' | 'Left Eye (OS)';
    abhaId?: string;
  };
  onReset: () => void;
  onOpenReport: () => void;
  onSaveToQueue: () => void;
  isSavedInQueue: boolean;
  language: 'en' | 'hi';
}

export const ExplainableResults: React.FC<ExplainableResultsProps> = ({
  originalImage,
  prediction,
  patientInfo,
  onReset,
  onOpenReport,
  onSaveToQueue,
  isSavedInQueue,
  language,
}) => {
  // Explainability View Modes: 'overlay' | 'split' | 'side-by-side'
  const [viewMode, setViewMode] = useState<'overlay' | 'split' | 'side-by-side'>('overlay');
  const [heatmapOpacity, setHeatmapOpacity] = useState(0.75);
  const [selectedColormap, setSelectedColormap] = useState<ColormapType>('jet');
  const [splitPosition, setSplitPosition] = useState(50); // percentage 0 - 100
  const [heatmapDataUrl, setHeatmapDataUrl] = useState<string>('');
  const [selectedHotspot, setSelectedHotspot] = useState<LesionHotspot | null>(
    prediction.gradCamHotspots.length > 0 ? prediction.gradCamHotspots[0] : null
  );
  const [showHotspotPins, setShowHotspotPins] = useState(true);

  // Generate heatmap when colormap changes
  useEffect(() => {
    let isMounted = true;
    generateGradCamHeatmap(
      originalImage,
      prediction.gradCamHotspots,
      prediction.grade,
      selectedColormap
    ).then((url) => {
      if (isMounted) {
        setHeatmapDataUrl(url);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [originalImage, prediction, selectedColormap]);

  // Risk styling helpers
  const getRiskBadgeStyles = () => {
    if (prediction.grade === 0) {
      return {
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        dot: 'bg-emerald-500',
        label: language === 'en' ? 'Low Risk (Healthy Retina)' : 'कम जोखिम (स्वस्थ परदा)',
      };
    }
    if (prediction.grade === 1) {
      return {
        bg: 'bg-sky-50 text-sky-800 border-sky-300',
        dot: 'bg-sky-500',
        label: language === 'en' ? 'Low Risk (Mild Stage)' : 'कम जोखिम (शुरुआती स्तर)',
      };
    }
    if (prediction.grade === 2) {
      return {
        bg: 'bg-amber-50 text-amber-800 border-amber-300',
        dot: 'bg-amber-500',
        label: language === 'en' ? 'Medium Risk (Referable)' : 'मध्यम जोखिम (रेफरल आवश्यक)',
      };
    }
    if (prediction.grade === 3) {
      return {
        bg: 'bg-orange-50 text-orange-800 border-orange-300',
        dot: 'bg-orange-500',
        label: language === 'en' ? 'High Risk (Severe NPDR)' : 'उच्च जोखिम (गंभीर स्थिति)',
      };
    }
    return {
      bg: 'bg-rose-50 text-rose-800 border-rose-300',
      dot: 'bg-rose-600',
      label: language === 'en' ? 'Critical Risk (Emergency)' : 'अति-गंभीर (आपातकालीन उपचार)',
    };
  };

  const riskBadge = getRiskBadgeStyles();

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            onClick={onReset}
            className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{language === 'en' ? 'Back to Screening' : 'नई जांच'}</span>
          </button>
          <div className="h-4 w-px bg-slate-200"></div>
          <div>
            <div className="text-xs text-slate-500 font-medium">
              Patient: <span className="font-bold text-slate-900">{patientInfo.name}</span> ({patientInfo.age}y, {patientInfo.gender})
            </div>
            <div className="text-[11px] text-slate-400 font-mono">{patientInfo.abhaId} • {patientInfo.eye}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onSaveToQueue}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              isSavedInQueue
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isSavedInQueue ? 'Saved to Register' : 'Save to Camp Register'}</span>
          </button>

          <button
            onClick={onOpenReport}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'Official ABDM Referral Slip' : 'रेफरल पर्ची प्रिंट करें'}</span>
          </button>
        </div>
      </div>

      {/* Image Quality Banner if degraded */}
      {!prediction.quality.isGradable && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-xl shadow-xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-amber-900">
                Image Quality Warning: Re-capture Recommended
              </h4>
              <p className="text-xs text-amber-800 leading-relaxed">
                {prediction.quality.recommendation ||
                  'The uploaded retinal image shows sub-optimal focus or illumination. AI confidence may be reduced.'}
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {prediction.quality.issues.map((issue, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] bg-amber-100/80 text-amber-900 px-2 py-0.5 rounded border border-amber-300 font-medium"
                  >
                    • {issue}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Analysis Layout: Interactive Grad-CAM Viewer (7 cols) + Clinical Diagnosis Card (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Grad-CAM Explainability Canvas (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            {/* Viewer Header with View Mode switch */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    {language === 'en' ? 'Grad-CAM++ Explainability Map' : 'ग्रेड-कैम व्याख्यात्मक हीटमैप'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {language === 'en'
                      ? 'Highlights neural network attention weights responsible for DR diagnosis'
                      : 'एआई द्वारा रोग पहचानने के लिए देखे गए मुख्य बिंदु'}
                  </p>
                </div>
              </div>

              {/* View mode toggle */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                <button
                  onClick={() => setViewMode('overlay')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    viewMode === 'overlay'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Blend Overlay
                </button>
                <button
                  onClick={() => setViewMode('split')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    viewMode === 'split'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Curtain Split
                </button>
                <button
                  onClick={() => setViewMode('side-by-side')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    viewMode === 'side-by-side'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Side-by-Side
                </button>
              </div>
            </div>

            {/* Interactive Image Frame */}
            <div className="relative rounded-2xl bg-slate-950 p-3 overflow-hidden flex items-center justify-center min-h-[380px] shadow-inner select-none">
              {viewMode === 'overlay' && (
                <div className="relative max-w-[420px] aspect-square w-full rounded-xl overflow-hidden shadow-2xl bg-black">
                  {/* Base Original Fundus Photo */}
                  <img
                    src={originalImage}
                    alt="Original Fundus"
                    className="w-full h-full object-contain"
                  />

                  {/* Grad-CAM Heatmap Layer */}
                  {heatmapDataUrl && (
                    <img
                      src={heatmapDataUrl}
                      alt="Grad-CAM Heatmap"
                      style={{ opacity: heatmapOpacity }}
                      className="absolute inset-0 w-full h-full object-contain pointer-events-none transition-opacity duration-150"
                    />
                  )}

                  {/* Interactive Hotspot Pins */}
                  {showHotspotPins &&
                    prediction.gradCamHotspots.map((spot, idx) => {
                      const isSelected = selectedHotspot?.id === spot.id;
                      return (
                        <button
                          key={spot.id}
                          onClick={() => setSelectedHotspot(spot)}
                          style={{
                            left: `${spot.x}%`,
                            top: `${spot.y}%`,
                          }}
                          className={`absolute -translate-x-1/2 -translate-y-1/2 transition-transform cursor-pointer group z-20 ${
                            isSelected ? 'scale-125 z-30' : 'hover:scale-110'
                          }`}
                        >
                          <span className="relative flex h-7 w-7 items-center justify-center">
                            <span
                              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                                spot.severity === 'high'
                                  ? 'bg-rose-400'
                                  : spot.severity === 'medium'
                                  ? 'bg-amber-400'
                                  : 'bg-emerald-400'
                              }`}
                            ></span>
                            <span
                              className={`relative inline-flex rounded-full h-6 w-6 items-center justify-center text-white text-[11px] font-extrabold shadow-md border-2 border-white ${
                                spot.severity === 'high'
                                  ? 'bg-rose-600'
                                  : spot.severity === 'medium'
                                  ? 'bg-amber-600'
                                  : 'bg-emerald-600'
                              }`}
                            >
                              {idx + 1}
                            </span>
                          </span>
                        </button>
                      );
                    })}

                  <div className="absolute bottom-2 left-2 bg-black/75 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-md font-mono">
                    Opacity: {Math.round(heatmapOpacity * 100)}% • Colormap: {selectedColormap.toUpperCase()}
                  </div>
                </div>
              )}

              {viewMode === 'split' && (
                <div className="relative max-w-[420px] aspect-square w-full rounded-xl overflow-hidden shadow-2xl bg-black">
                  {/* Background: Original Fundus */}
                  <img
                    src={originalImage}
                    alt="Original Fundus"
                    className="w-full h-full object-contain"
                  />

                  {/* Foreground clipped: Heatmap Blend */}
                  <div
                    style={{ clipPath: `polygon(0 0, ${splitPosition}% 0, ${splitPosition}% 100%, 0 100%)` }}
                    className="absolute inset-0 w-full h-full pointer-events-none"
                  >
                    <img
                      src={originalImage}
                      alt="Base"
                      className="w-full h-full object-contain"
                    />
                    {heatmapDataUrl && (
                      <img
                        src={heatmapDataUrl}
                        alt="Heatmap"
                        style={{ opacity: 0.85 }}
                        className="absolute inset-0 w-full h-full object-contain"
                      />
                    )}
                  </div>

                  {/* Split Divider Line */}
                  <div
                    style={{ left: `${splitPosition}%` }}
                    className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg pointer-events-none z-10"
                  >
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shadow-md border border-white">
                      ↔
                    </div>
                  </div>

                  {/* Split Range Controller */}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={splitPosition}
                    onChange={(e) => setSplitPosition(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
                  />

                  <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded font-medium">
                    Grad-CAM
                  </div>
                  <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded font-medium">
                    Raw Fundus
                  </div>
                </div>
              )}

              {viewMode === 'side-by-side' && (
                <div className="grid grid-cols-2 gap-3 w-full max-w-[560px]">
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-black border border-slate-800">
                    <img
                      src={originalImage}
                      alt="Raw Fundus"
                      className="w-full h-full object-contain"
                    />
                    <span className="absolute top-2 left-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded font-medium">
                      Raw Fundus
                    </span>
                  </div>
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-black border border-slate-800">
                    <img
                      src={originalImage}
                      alt="Underlay"
                      className="w-full h-full object-contain"
                    />
                    {heatmapDataUrl && (
                      <img
                        src={heatmapDataUrl}
                        alt="Heatmap overlay"
                        style={{ opacity: 0.85 }}
                        className="absolute inset-0 w-full h-full object-contain"
                      />
                    )}
                    <span className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded font-semibold">
                      Grad-CAM Heatmap
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* XAI Heatmap Controls Bar */}
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Opacity Slider */}
                <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                  <Sliders className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="text-xs font-bold text-slate-700 shrink-0">
                    {language === 'en' ? 'Heatmap Opacity:' : 'हीटमैप पारदर्शिता:'}
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={heatmapOpacity}
                    onChange={(e) => setHeatmapOpacity(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <span className="text-xs font-mono font-bold text-slate-600 w-9 text-right">
                    {Math.round(heatmapOpacity * 100)}%
                  </span>
                </div>

                {/* Colormap Selector */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-700">
                    {language === 'en' ? 'Palette:' : 'रंग:'}
                  </span>
                  {(['jet', 'inferno', 'turbo', 'hotspot'] as ColormapType[]).map((cmap) => (
                    <button
                      key={cmap}
                      onClick={() => setSelectedColormap(cmap)}
                      className={`px-2 py-1 rounded text-[11px] font-bold uppercase transition-all ${
                        selectedColormap === cmap
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {cmap}
                    </button>
                  ))}
                </div>
              </div>

              {/* Lesion Hotspot Pin Inspector Rationale Card */}
              {selectedHotspot && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                        ★
                      </span>
                      <h4 className="text-xs font-bold text-slate-900">
                        {language === 'en' ? selectedHotspot.name : selectedHotspot.hindiName || selectedHotspot.name}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        Grad-CAM Weight: {Math.round(selectedHotspot.featureAttributionScore * 100)}%
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          selectedHotspot.severity === 'high'
                            ? 'bg-rose-100 text-rose-800'
                            : selectedHotspot.severity === 'medium'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {selectedHotspot.severity} severity
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {selectedHotspot.clinicalSignificance}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Clinical Diagnosis & Action Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Primary Diagnosis Badge & Grade */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {language === 'en' ? 'Clinical AI Diagnosis' : 'नैदानिक निष्कर्ष'}
                </span>
              </div>
              <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold border border-blue-200">
                Latency {prediction.inferenceTimeMs}ms
              </span>
            </div>

            {/* Severity Stage Display */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-500">
                  {prediction.icdrClassification}
                </span>
                <span className="text-xs font-extrabold text-blue-600 font-mono">
                  {(prediction.confidence * 100).toFixed(1)}% Confidence
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  {prediction.stageName}
                </h3>
                <span className="text-sm font-bold text-slate-500">
                  (Grade {prediction.grade}/4)
                </span>
              </div>

              <p className="text-xs text-slate-600 mt-1 font-medium">
                {language === 'en' ? prediction.hindiStageName : prediction.stageName}
              </p>
            </div>

            {/* Risk Category Badge */}
            <div className={`p-3 rounded-xl border flex items-center justify-between ${riskBadge.bg}`}>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${riskBadge.dot} animate-pulse`}></span>
                <span className="text-xs font-bold">{riskBadge.label}</span>
              </div>
              <span className="text-[11px] font-extrabold uppercase tracking-wide">
                {prediction.isReferable ? '● Referable DR' : '○ Non-Referable'}
              </span>
            </div>

            {/* Referral Plan & Triage Timeline */}
            <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2 shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                <span className="flex items-center gap-1.5 text-blue-400">
                  <Clock className="w-3.5 h-3.5" />
                  {language === 'en' ? 'Referral Timeline' : 'रेफरल समयसीमा'}
                </span>
                <span className="bg-blue-950 text-blue-300 px-2 py-0.5 rounded text-[11px] font-mono font-bold border border-blue-800">
                  {prediction.urgencyDays}
                </span>
              </div>

              <h4 className="text-sm font-bold text-white leading-snug">
                {prediction.referral}
              </h4>

              <p className="text-xs text-slate-300 pt-1 leading-relaxed border-t border-slate-800">
                {language === 'en' ? prediction.clinicalSummary : prediction.hindiSummary}
              </p>
            </div>

            {/* 5-Stage Probability Histogram */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">
                  {language === 'en' ? 'Class Probability Distribution' : 'वर्ग संभावना वितरण'}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">Softmax Logits</span>
              </div>

              <div className="space-y-1.5">
                {prediction.classProbabilities.map((prob) => {
                  const isPredicted = prob.grade === prediction.grade;
                  return (
                    <div key={prob.grade} className="space-y-0.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className={`font-semibold ${isPredicted ? 'text-blue-700 font-bold' : 'text-slate-600'}`}>
                          Grade {prob.grade}: {prob.name}
                        </span>
                        <span className="font-mono font-bold text-slate-700">
                          {(prob.probability * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${prob.probability * 100}%` }}
                          className={`h-full rounded-full transition-all duration-500 ${
                            isPredicted ? 'bg-blue-600' : 'bg-slate-300'
                          }`}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pathological Findings Checklist */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-700 block">
                {language === 'en' ? 'Key Biomarkers Detected:' : 'पहचाने गए मुख्य लक्षण:'}
              </span>
              <div className="space-y-1">
                {prediction.detectedLesions.map((lesion, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{lesion}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
