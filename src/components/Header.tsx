import React, { useState } from 'react';
import {
  Eye,
  ShieldCheck,
  WifiOff,
  FileCode2,
  Globe,
  HeartPulse,
  Palette,
  Sparkles,
  Sun,
  Moon,
  ChevronDown,
  Activity,
  ClipboardList,
  BookOpen,
  Cloud,
  HardDrive,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { SupportedLanguage } from '../types/dr';
import { useTheme, THEMES_LIST, AppTheme } from '../context/ThemeContext';
import { useGoogleAuth } from '../context/GoogleAuthContext';

export type MainAppTab = 'screening' | 'queue' | 'guide';

interface HeaderProps {
  activeTab: MainAppTab;
  onSelectTab: (tab: MainAppTab) => void;
  queueCount: number;
  onOpenArchitecture: () => void;
  onOpenImpact: () => void;
  onOpenThemeStudio: () => void;
  onOpenGoogleDrive: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  queueCount,
  onOpenArchitecture,
  onOpenImpact,
  onOpenThemeStudio,
  onOpenGoogleDrive,
}) => {
  const { lang, setLang, t } = useLanguage();
  const { theme, setTheme, currentThemeConfig, cycleNextTheme, isDark } = useTheme();
  const { user, isAuthenticated } = useGoogleAuth();
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-40 header-glass backdrop-blur-md border-b border-theme shadow-xs transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-2">
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-blue-500 text-white shadow-md shadow-blue-500/20">
              <Eye className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white items-center justify-center text-[8px] font-bold text-white">✓</span>
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg sm:text-xl font-black tracking-tight text-theme-primary flex items-center gap-1.5">
                  {t('appTitle')}
                  <span className="text-[10px] px-2 py-0.5 font-bold rounded-md bg-blue-500/10 text-theme-primary-accent border border-blue-500/20 hidden sm:inline-block">
                    SIH 2024–25
                  </span>
                </h1>
              </div>
              <p className="text-[11px] sm:text-xs text-theme-muted font-medium line-clamp-1 max-w-xs sm:max-w-md">
                {t('appSubtitle')}
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center p-1 bg-theme-subtle rounded-2xl border border-theme text-xs font-semibold">
            <button
              onClick={() => onSelectTab('screening')}
              id="tab-screening-btn"
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'screening'
                  ? 'bg-theme-card text-theme-primary shadow-xs font-bold'
                  : 'text-theme-muted hover:text-theme-primary'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-theme-primary-accent" />
              <span>Screening Studio</span>
            </button>

            <button
              onClick={() => onSelectTab('queue')}
              id="tab-queue-btn"
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'queue'
                  ? 'bg-theme-card text-theme-primary shadow-xs font-bold'
                  : 'text-theme-muted hover:text-theme-primary'
              }`}
            >
              <ClipboardList className="w-3.5 h-3.5 text-blue-500" />
              <span>Camp Register</span>
              {queueCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-600 text-white font-bold">
                  {queueCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectTab('guide')}
              id="tab-guide-btn"
              className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'guide'
                  ? 'bg-theme-card text-theme-primary shadow-xs font-bold'
                  : 'text-theme-muted hover:text-theme-primary'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
              <span>Clinical Manual</span>
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-2 sm:space-x-2.5">
            {/* Google Drive Integration Action Button */}
            <button
              onClick={onOpenGoogleDrive}
              id="header-google-drive-btn"
              className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                isAuthenticated
                  ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30 hover:bg-blue-500/25'
                  : 'bg-theme-subtle hover:bg-theme-card text-theme-secondary border-theme'
              }`}
              title="Google Drive Cloud Sync & Vault"
            >
              <Cloud className="w-3.5 h-3.5 text-blue-500" />
              <span className="hidden sm:inline">Google Drive</span>
              {isAuthenticated && (
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              )}
            </button>

            {/* Theme Selector Dropdown & Studio Button */}
            <div className="relative">
              <div className="flex items-center bg-theme-subtle p-0.5 rounded-xl border border-theme">
                <button
                  onClick={() => setShowThemeDropdown(!showThemeDropdown)}
                  id="theme-quick-btn"
                  className="flex items-center space-x-1.5 px-2.5 py-1.5 text-xs font-semibold text-theme-primary hover:bg-theme-card rounded-lg transition-colors cursor-pointer"
                  title="Choose UI Theme & Display Style"
                >
                  <span
                    className="w-3 h-3 rounded-full border border-black/20"
                    style={{ backgroundColor: currentThemeConfig.primaryColor }}
                  ></span>
                  <span className="hidden lg:inline text-[11px] font-bold">
                    {currentThemeConfig.name}
                  </span>
                  {isDark ? (
                    <Moon className="w-3.5 h-3.5 text-purple-400" />
                  ) : (
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                  )}
                  <ChevronDown className="w-3 h-3 text-theme-muted" />
                </button>

                <button
                  onClick={onOpenThemeStudio}
                  id="theme-studio-open-btn"
                  className="p-1.5 text-theme-muted hover:text-theme-primary hover:bg-theme-card rounded-lg transition-colors cursor-pointer"
                  title="Open Theme & Display Studio"
                >
                  <Palette className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Theme Quick Dropdown Menu */}
              {showThemeDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setShowThemeDropdown(false)}
                  ></div>
                  <div className="absolute right-0 mt-2 w-64 bg-theme-card rounded-2xl shadow-xl border border-theme p-2 z-40 text-xs space-y-1 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-2 py-1.5 font-bold text-theme-muted text-[10px] uppercase tracking-wider flex items-center justify-between">
                      <span>Visual Aesthetics</span>
                      <button
                        onClick={() => {
                          setShowThemeDropdown(false);
                          onOpenThemeStudio();
                        }}
                        className="text-theme-primary-accent hover:underline font-semibold"
                      >
                        More Options
                      </button>
                    </div>

                    {THEMES_LIST.map((th) => {
                      const isSelected = theme === th.id;
                      return (
                        <button
                          key={th.id}
                          onClick={() => {
                            setTheme(th.id);
                            setShowThemeDropdown(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-theme-subtle font-bold text-theme-primary'
                              : 'hover:bg-theme-subtle/60 text-theme-secondary'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-xs"
                              style={{ backgroundColor: th.primaryColor }}
                            ></span>
                            <span className="text-xs">{th.name}</span>
                          </div>
                          <span className="text-[10px] text-theme-muted">{th.category}</span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Impact / Tele-Screening Stats */}
            <button
              onClick={onOpenImpact}
              id="header-impact-btn"
              className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold text-theme-secondary bg-theme-subtle hover:bg-theme-card border border-theme transition-colors cursor-pointer"
              title="Rural India Tele-Screening Impact"
            >
              <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
              <span className="hidden sm:inline">Impact</span>
            </button>

            {/* Backend & PyTorch Architecture */}
            <button
              onClick={onOpenArchitecture}
              id="header-arch-btn"
              className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold text-theme-primary-text bg-theme-primary-subtle hover:opacity-90 border border-theme transition-colors cursor-pointer"
              title="SIH Backend & Grad-CAM Model Code"
            >
              <FileCode2 className="w-3.5 h-3.5 text-theme-primary-accent" />
              <span className="hidden xl:inline">PyTorch & Backend</span>
            </button>

            {/* Language Selector */}
            <div className="flex items-center space-x-1 pl-1 border-l border-theme">
              <Globe className="w-3.5 h-3.5 text-theme-muted" />
              <select
                id="language-selector"
                value={lang}
                onChange={(e) => setLang(e.target.value as SupportedLanguage)}
                className="text-xs font-bold bg-transparent text-theme-primary focus:outline-hidden py-1 px-1 rounded cursor-pointer"
              >
                <option value="en" className="bg-slate-900 text-white">English (EN)</option>
                <option value="hi" className="bg-slate-900 text-white">हिन्दी (Hindi)</option>
                <option value="ta" className="bg-slate-900 text-white">தமிழ் (Tamil)</option>
                <option value="te" className="bg-slate-900 text-white">తెలుగు (Telugu)</option>
                <option value="bn" className="bg-slate-900 text-white">বাংলা (Bengali)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-theme text-xs font-bold">
          <button
            onClick={() => onSelectTab('screening')}
            className={`flex items-center space-x-1 py-1 px-2.5 rounded-lg ${
              activeTab === 'screening'
                ? 'bg-theme-card text-theme-primary shadow-xs'
                : 'text-theme-muted'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-theme-primary-accent" />
            <span>Screening</span>
          </button>
          <button
            onClick={() => onSelectTab('queue')}
            className={`flex items-center space-x-1 py-1 px-2.5 rounded-lg ${
              activeTab === 'queue'
                ? 'bg-theme-card text-theme-primary shadow-xs'
                : 'text-theme-muted'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5 text-blue-500" />
            <span>Register ({queueCount})</span>
          </button>
          <button
            onClick={() => onSelectTab('guide')}
            className={`flex items-center space-x-1 py-1 px-2.5 rounded-lg ${
              activeTab === 'guide'
                ? 'bg-theme-card text-theme-primary shadow-xs'
                : 'text-theme-muted'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
            <span>ICDR Guide</span>
          </button>
          <button
            onClick={onOpenGoogleDrive}
            className="flex items-center space-x-1 py-1 px-2.5 rounded-lg text-blue-600 dark:text-blue-400"
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Drive</span>
          </button>
        </div>
      </div>
    </header>
  );
};
