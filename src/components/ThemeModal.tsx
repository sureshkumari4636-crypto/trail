import React from 'react';
import { X, Palette, Check, Sun, Moon, Sparkles, Type, Sliders, Contrast, Eye } from 'lucide-react';
import { useTheme, THEMES_LIST, AppTheme, LayoutDensity, FontSizeScale } from '../context/ThemeContext';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeModal: React.FC<ThemeModalProps> = ({ isOpen, onClose }) => {
  const { theme, setTheme, density, setDensity, fontSize, setFontSize, currentThemeConfig } = useTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 no-print">
      <div className="bg-theme-card text-theme-primary w-full max-w-3xl rounded-3xl shadow-2xl border border-theme overflow-hidden flex flex-col max-h-[92vh] transition-colors duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                Clinical Display & Theme Studio
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/30 text-blue-200">
                  Real-time Swatches
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Tailor contrast, color spectrums, and font scale for ophthalmic darkrooms or bright field camps
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-xs">
          {/* Section 1: Themes Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-theme-primary flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-theme-primary-accent" />
                Select Clinical Theme Palette ({THEMES_LIST.length} Distinct Approaches)
              </h4>
              <span className="text-[11px] text-theme-muted font-medium">
                Active: <strong className="text-theme-primary-accent">{currentThemeConfig.name}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {THEMES_LIST.map((th) => {
                const isSelected = theme === th.id;
                return (
                  <button
                    key={th.id}
                    onClick={() => setTheme(th.id)}
                    className={`relative flex flex-col p-4 rounded-2xl border-2 transition-all text-left cursor-pointer group ${
                      isSelected
                        ? 'border-blue-500 ring-2 ring-blue-500/30 shadow-md bg-theme-subtle'
                        : 'border-theme hover:border-theme-strong hover:shadow-xs bg-theme-card'
                    }`}
                  >
                    {/* Visual Color Swatch Ribbon */}
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-5 h-5 rounded-full border border-black/10 shadow-xs flex items-center justify-center text-[10px] text-white font-bold"
                          style={{ backgroundColor: th.primaryColor }}
                        >
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                        <span className="font-bold text-xs text-theme-primary">
                          {th.name}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex items-center gap-1 ${
                          th.isDark
                            ? 'bg-slate-800 text-slate-200 border border-slate-700'
                            : 'bg-amber-100 text-amber-900 border border-amber-200'
                        }`}
                      >
                        {th.isDark ? <Moon className="w-2.5 h-2.5" /> : <Sun className="w-2.5 h-2.5" />}
                        {th.category}
                      </span>
                    </div>

                    {/* Preview box representation */}
                    <div
                      className="w-full h-12 rounded-xl p-2 mb-2.5 flex items-center justify-between border border-black/10 transition-transform group-hover:scale-[1.02]"
                      style={{ backgroundColor: th.previewBg }}
                    >
                      <div
                        className="w-16 h-7 rounded-lg shadow-xs flex items-center justify-center px-1.5"
                        style={{ backgroundColor: th.previewCard }}
                      >
                        <div
                          className="w-full h-2 rounded-sm"
                          style={{ backgroundColor: th.previewAccent }}
                        ></div>
                      </div>
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: th.previewAccent }}></div>
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: th.primaryColor }}></div>
                      </div>
                    </div>

                    <p className="text-[11px] text-theme-muted line-clamp-2 leading-relaxed">
                      {th.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Display Accessibility & Ergonomics */}
          <div className="pt-4 border-t border-theme grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Font Scaling */}
            <div className="bg-theme-subtle p-4 rounded-2xl border border-theme">
              <label className="text-xs font-bold text-theme-primary mb-2 flex items-center gap-1.5">
                <Type className="w-4 h-4 text-theme-primary-accent" />
                Text Scale & Readability
              </label>
              <p className="text-[11px] text-theme-muted mb-3">
                Adjust typography size for field screening tablets or enhanced readability in sunlight.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setFontSize('standard')}
                  className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                    fontSize === 'standard'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-theme-card text-theme-primary border-theme hover:bg-theme-card-subtle'
                  }`}
                >
                  Standard (100%)
                </button>
                <button
                  onClick={() => setFontSize('large')}
                  className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                    fontSize === 'large'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-theme-card text-theme-primary border-theme hover:bg-theme-card-subtle'
                  }`}
                >
                  Field Large (112.5%)
                </button>
              </div>
            </div>

            {/* Layout Density */}
            <div className="bg-theme-subtle p-4 rounded-2xl border border-theme">
              <label className="text-xs font-bold text-theme-primary mb-2 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-theme-primary-accent" />
                Interface Layout Density
              </label>
              <p className="text-[11px] text-theme-muted mb-3">
                Choose between spacious layout for touchscreens or compact for clinical desk workstations.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setDensity('comfortable')}
                  className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                    density === 'comfortable'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-theme-card text-theme-primary border-theme hover:bg-theme-card-subtle'
                  }`}
                >
                  Spacious & Touch
                </button>
                <button
                  onClick={() => setDensity('compact')}
                  className={`py-2 px-3 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                    density === 'compact'
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-theme-card text-theme-primary border-theme hover:bg-theme-card-subtle'
                  }`}
                >
                  Compact Clinic
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-theme-subtle px-6 py-4 border-t border-theme flex items-center justify-between">
          <div className="text-[11px] text-theme-muted flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-theme-primary-accent" />
            <span>Theme choice persists automatically in browser local cache</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-sm"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
