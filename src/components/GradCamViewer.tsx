import React, { useState, useEffect, useRef } from 'react';
import { renderGradCAMHeatmap } from '../utils/fundusCanvas';
import { Hotspot } from '../utils/fundusCanvas';
import { Layers, Eye, Sliders, Zap, Sparkles, ZoomIn, Info, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface GradCamViewerProps {
  imageUrl: string;
  hotspots: Hotspot[];
  stageName: string;
  stageNum: number;
  xaiExplanation: {
    primaryFocusRegion: string;
    anatomicalStructures: string[];
    gradCamInterpretation: string;
    clinicalRationale: string;
  };
}

export const GradCamViewer: React.FC<GradCamViewerProps> = ({
  imageUrl,
  hotspots,
  stageName,
  stageNum,
  xaiExplanation,
}) => {
  const { isDark } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageObjRef = useRef<HTMLImageElement | null>(null);

  const [colormap, setColormap] = useState<'jet' | 'turbo' | 'inferno' | 'viridis'>('jet');
  const [opacity, setOpacity] = useState<number>(0.65);
  const [showContours, setShowContours] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'overlay' | 'split' | 'side-by-side'>('overlay');
  const [splitPos, setSplitPos] = useState<number>(50); // percentage for split view
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'xai' | 'layers' | 'anatomical'>('xai');

  // Load image into memory
  useEffect(() => {
    setIsLoaded(false);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageUrl;
    img.onload = () => {
      imageObjRef.current = img;
      setIsLoaded(true);
    };
  }, [imageUrl]);

  // Re-render canvas whenever controls change
  useEffect(() => {
    if (!isLoaded || !imageObjRef.current || !canvasRef.current) return;
    renderGradCAMHeatmap(
      canvasRef.current,
      imageObjRef.current,
      hotspots,
      colormap,
      opacity,
      showContours
    );
  }, [isLoaded, hotspots, colormap, opacity, showContours]);

  return (
    <div className="bg-theme-card rounded-3xl border border-theme shadow-xs overflow-hidden transition-colors duration-200">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2 flex-wrap">
              <h3 className="text-base font-extrabold text-white tracking-tight">
                Grad-CAM++ Explainability Map
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-400/30">
                Layer: `conv5_block3_out`
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Visual proof of deep learning gradient flow localizing diagnostic lesions
            </p>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center space-x-1 bg-slate-900/90 p-1 rounded-2xl border border-slate-800 text-xs">
          <button
            onClick={() => setViewMode('overlay')}
            id="view-mode-overlay"
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              viewMode === 'overlay'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Overlay
          </button>
          <button
            onClick={() => setViewMode('split')}
            id="view-mode-split"
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              viewMode === 'split'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Split Slider
          </button>
          <button
            onClick={() => setViewMode('side-by-side')}
            id="view-mode-side"
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              viewMode === 'side-by-side'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Side-by-Side
          </button>
        </div>
      </div>

      {/* Main Canvas / Image Area */}
      <div className="p-4 sm:p-6 bg-slate-950">
        {viewMode === 'side-by-side' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Original */}
            <div className="flex flex-col items-center">
              <span className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" /> Original Fundus Photograph (Input)
              </span>
              <div className="relative aspect-square w-full max-w-[420px] rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-xl">
                <img
                  src={imageUrl}
                  alt="Original Retinal Fundus"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            {/* Grad-CAM Heatmap */}
            <div className="flex flex-col items-center">
              <span className="text-xs font-bold text-blue-400 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" /> Grad-CAM Activation Map (Output)
              </span>
              <div className="relative aspect-square w-full max-w-[420px] rounded-2xl overflow-hidden bg-black border border-blue-500/40 shadow-xl shadow-blue-500/10">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={600}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        ) : viewMode === 'split' ? (
          <div className="flex flex-col items-center">
            <div className="relative aspect-square w-full max-w-[500px] rounded-2xl overflow-hidden bg-black border border-slate-800 select-none shadow-2xl">
              {/* Underlying Grad-CAM Canvas */}
              <canvas
                ref={canvasRef}
                width={600}
                height={600}
                className="w-full h-full object-contain"
              />
              {/* Overlaid Original Image clipped by split percentage */}
              <div
                className="absolute inset-0 overflow-hidden pointer-events-none"
                style={{ width: `${splitPos}%` }}
              >
                <img
                  src={imageUrl}
                  alt="Original Fundus"
                  className="w-[500px] h-[500px] max-w-none object-contain"
                  style={{ width: '100%', height: '100%' }}
                />
              </div>
              {/* Split Line */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)] pointer-events-none"
                style={{ left: `${splitPos}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-slate-900 font-black text-xs flex items-center justify-center shadow-lg border-2 border-blue-600">
                  ↔
                </div>
              </div>
            </div>
            {/* Split Slider Bar */}
            <div className="w-full max-w-[500px] mt-3 flex items-center space-x-3 px-2">
              <span className="text-[11px] text-slate-400 font-bold">Original</span>
              <input
                type="range"
                min="0"
                max="100"
                value={splitPos}
                onChange={(e) => setSplitPos(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <span className="text-[11px] text-blue-400 font-bold">Grad-CAM</span>
            </div>
          </div>
        ) : (
          /* Single Overlay View */
          <div className="flex flex-col items-center">
            <div className="relative aspect-square w-full max-w-[480px] rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-2xl">
              <canvas
                ref={canvasRef}
                width={600}
                height={600}
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        )}

        {/* Heatmap Colorbar & Hotspot Legend */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 max-w-[500px] mx-auto text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-300">Model Attention:</span>
            <div className="flex items-center space-x-1">
              <span className="text-[10px]">Low (0.0)</span>
              <div className="w-28 h-3 rounded-md bg-gradient-to-r from-blue-600 via-cyan-400 via-yellow-400 to-red-600 border border-slate-700"></div>
              <span className="text-[10px] text-rose-400 font-bold">High (1.0)</span>
            </div>
          </div>
          {hotspots.length > 0 && (
            <div className="flex items-center space-x-1.5 text-blue-300 bg-blue-950/80 px-3 py-1 rounded-xl border border-blue-800/50 text-[11px] font-bold">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{hotspots.length} Neural Activation Focal Points</span>
            </div>
          )}
        </div>
      </div>

      {/* Control Bar & Explainability Breakdown */}
      <div className="p-5 sm:p-6 border-t border-theme bg-theme-subtle">
        {/* Interactive Sliders & Colormap Picker */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 border-b border-theme">
          {/* Colormap selection */}
          <div>
            <label className="block text-xs font-bold text-theme-primary mb-1.5 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-theme-primary-accent" />
              Colormap Spectrum
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'jet', label: 'Jet' },
                { id: 'turbo', label: 'Turbo' },
                { id: 'inferno', label: 'Inferno' },
                { id: 'viridis', label: 'Viridis' },
              ].map((cm) => (
                <button
                  key={cm.id}
                  onClick={() => setColormap(cm.id as any)}
                  className={`px-2 py-1.5 text-[11px] font-bold rounded-xl border transition-all cursor-pointer ${
                    colormap === cm.id
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-theme-card text-theme-primary border-theme hover:bg-theme-card-subtle'
                  }`}
                >
                  {cm.label}
                </button>
              ))}
            </div>
          </div>

          {/* Opacity Slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-theme-primary">Heatmap Opacity</label>
              <span className="text-xs font-mono font-bold text-theme-primary-accent">
                {Math.round(opacity * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              className="w-full h-2 bg-theme-card rounded-lg appearance-none cursor-pointer accent-blue-600 border border-theme"
            />
          </div>

          {/* Contours toggle */}
          <div className="flex flex-col justify-end">
            <label className="text-xs font-bold text-theme-primary mb-1.5">Lesion Boundary Contours</label>
            <label className="flex items-center space-x-2 text-xs text-theme-primary bg-theme-card p-2.5 rounded-xl border border-theme cursor-pointer hover:bg-theme-card-subtle transition-colors">
              <input
                type="checkbox"
                checked={showContours}
                onChange={(e) => setShowContours(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-theme focus:ring-blue-500"
              />
              <span className="font-bold">Show Activation Hotspot Rings</span>
            </label>
          </div>
        </div>

        {/* Explainability / XAI Rationale Panel */}
        <div className="mt-4">
          <div className="flex items-center space-x-3 border-b border-theme mb-3 pb-1">
            <button
              onClick={() => setActiveTab('xai')}
              className={`text-xs font-bold pb-2 transition-colors cursor-pointer border-b-2 ${
                activeTab === 'xai'
                  ? 'text-theme-primary-accent border-blue-600'
                  : 'text-theme-muted border-transparent hover:text-theme-primary'
              }`}
            >
              Why did AI make this decision?
            </button>
            <button
              onClick={() => setActiveTab('anatomical')}
              className={`text-xs font-bold pb-2 transition-colors cursor-pointer border-b-2 ${
                activeTab === 'anatomical'
                  ? 'text-theme-primary-accent border-blue-600'
                  : 'text-theme-muted border-transparent hover:text-theme-primary'
              }`}
            >
              Anatomical Localization
            </button>
            <button
              onClick={() => setActiveTab('layers')}
              className={`text-xs font-bold pb-2 transition-colors cursor-pointer border-b-2 ${
                activeTab === 'layers'
                  ? 'text-theme-primary-accent border-blue-600'
                  : 'text-theme-muted border-transparent hover:text-theme-primary'
              }`}
            >
              Grad-CAM Math & CNN Weights
            </button>
          </div>

          {activeTab === 'xai' && (
            <div className="bg-theme-card p-4 rounded-2xl border border-theme text-xs text-theme-primary space-y-2.5 shadow-xs">
              <div className="flex items-start space-x-2.5">
                <Info className="w-4 h-4 text-theme-primary-accent shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <strong className="text-theme-primary">Grad-CAM Interpretation: </strong>
                  {xaiExplanation.gradCamInterpretation}
                </p>
              </div>
              <div className="flex items-start space-x-2.5 pt-2 border-t border-theme">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed text-theme-secondary">
                  <strong className="text-theme-primary">Clinical Rationale: </strong>
                  {xaiExplanation.clinicalRationale}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'anatomical' && (
            <div className="bg-theme-card p-4 rounded-2xl border border-theme text-xs text-theme-primary shadow-xs">
              <p className="font-bold text-theme-primary mb-2">
                Primary Landmark: <span className="text-theme-primary-accent">{xaiExplanation.primaryFocusRegion}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {xaiExplanation.anatomicalStructures.map((struct, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-xl bg-theme-subtle text-theme-primary font-bold text-[11px] border border-theme"
                  >
                    📍 {struct}
                  </span>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'layers' && (
            <div className="bg-slate-900 text-slate-200 p-4 rounded-2xl font-mono text-[11px] space-y-1.5 border border-slate-800">
              <p className="text-emerald-400 font-bold">
                L^c_Grad-CAM = ReLU( ∑_k α^c_k · A^k )
              </p>
              <p className="text-slate-400">
                • Target Class: c = {stageNum} ({stageName})
              </p>
              <p className="text-slate-400">
                • Target Feature Map: Backpropagated gradients ∂y^c / ∂A^k from last convolutional layer (ResNet/EfficientNet).
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
