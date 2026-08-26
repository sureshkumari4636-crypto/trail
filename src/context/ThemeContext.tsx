import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type AppTheme =
  | 'sapphire'       // Clinical Sapphire (Crisp modern medical light)
  | 'midnight'       // Midnight Diagnostic (High-contrast OLED darkroom)
  | 'emerald'        // Ayush Emerald (Public health / Wellness green)
  | 'terracotta'     // Warm Sunlight / Rural PHC (Warm earthy stone)
  | 'obsidian-rose'  // Surgical Amethyst (Deep violet biotech dark)
  | 'high-contrast'; // High-Contrast Accessibility (Ultra-sharp field mode)

export type LayoutDensity = 'comfortable' | 'compact';
export type FontSizeScale = 'standard' | 'large';

export interface ThemeConfig {
  id: AppTheme;
  name: string;
  category: 'Light' | 'Dark' | 'Accessibility';
  tagline: string;
  primaryColor: string;
  previewBg: string;
  previewCard: string;
  previewAccent: string;
  isDark: boolean;
  description: string;
}

export const THEMES_LIST: ThemeConfig[] = [
  {
    id: 'sapphire',
    name: 'Clinical Sapphire',
    category: 'Light',
    tagline: 'Standard Medical Light',
    primaryColor: '#2563eb',
    previewBg: '#f8fafc',
    previewCard: '#ffffff',
    previewAccent: '#3b82f6',
    isDark: false,
    description: 'Crisp medical-grade slate and sapphire with high readability for indoor clinic environments.',
  },
  {
    id: 'midnight',
    name: 'Midnight Diagnostic',
    category: 'Dark',
    tagline: 'Ophthalmic Darkroom OLED',
    primaryColor: '#38bdf8',
    previewBg: '#080c14',
    previewCard: '#0f172a',
    previewAccent: '#0284c7',
    isDark: true,
    description: 'Deep obsidian dark mode optimized for dilated-eye darkrooms and high-contrast fundus inspection.',
  },
  {
    id: 'emerald',
    name: 'Ayush Emerald',
    category: 'Light',
    tagline: 'National Health & Wellness',
    primaryColor: '#059669',
    previewBg: '#f2f9f5',
    previewCard: '#ffffff',
    previewAccent: '#10b981',
    isDark: false,
    description: 'Soothing mint and deep herbal forest green representing Indian public health initiatives.',
  },
  {
    id: 'terracotta',
    name: 'Rural PHC Sunlight',
    category: 'Light',
    tagline: 'Warm Stone & Glare-Reduced',
    primaryColor: '#ea580c',
    previewBg: '#faf6f0',
    previewCard: '#ffffff',
    previewAccent: '#d97706',
    isDark: false,
    description: 'Warm terracotta ochre palette designed to reduce glare in outdoor village screening camps.',
  },
  {
    id: 'obsidian-rose',
    name: 'Surgical Amethyst',
    category: 'Dark',
    tagline: 'Biotech Luxury Dark',
    primaryColor: '#a855f7',
    previewBg: '#0e0b16',
    previewCard: '#1a1429',
    previewAccent: '#c084fc',
    isDark: true,
    description: 'Deep violet twilight dark palette with luminous neon highlights for modern AI diagnostic suites.',
  },
  {
    id: 'high-contrast',
    name: 'High-Contrast Field',
    category: 'Accessibility',
    tagline: 'High-Visibility Outdoor',
    primaryColor: '#000000',
    previewBg: '#ffffff',
    previewCard: '#ffffff',
    previewAccent: '#0052cc',
    isDark: false,
    description: 'Ultra-high contrast black borders and saturated markers for low-cost outdoor tablet screens.',
  },
];

interface ThemeContextType {
  theme: AppTheme;
  setTheme: (t: AppTheme) => void;
  density: LayoutDensity;
  setDensity: (d: LayoutDensity) => void;
  fontSize: FontSizeScale;
  setFontSize: (s: FontSizeScale) => void;
  isDark: boolean;
  currentThemeConfig: ThemeConfig;
  cycleNextTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    const saved = localStorage.getItem('netra_theme') as AppTheme;
    return saved && THEMES_LIST.some((t) => t.id === saved) ? saved : 'sapphire';
  });

  const [density, setDensityState] = useState<LayoutDensity>(() => {
    const saved = localStorage.getItem('netra_density') as LayoutDensity;
    return saved === 'compact' ? 'compact' : 'comfortable';
  });

  const [fontSize, setFontSizeState] = useState<FontSizeScale>(() => {
    const saved = localStorage.getItem('netra_font_size') as FontSizeScale;
    return saved === 'large' ? 'large' : 'standard';
  });

  const currentThemeConfig = THEMES_LIST.find((t) => t.id === theme) || THEMES_LIST[0];
  const isDark = currentThemeConfig.isDark;

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('netra_theme', newTheme);
  };

  const setDensity = (newDensity: LayoutDensity) => {
    setDensityState(newDensity);
    localStorage.setItem('netra_density', newDensity);
  };

  const setFontSize = (newSize: FontSizeScale) => {
    setFontSizeState(newSize);
    localStorage.setItem('netra_font_size', newSize);
  };

  const cycleNextTheme = () => {
    const currentIndex = THEMES_LIST.findIndex((t) => t.id === theme);
    const nextIndex = (currentIndex + 1) % THEMES_LIST.length;
    setTheme(THEMES_LIST[nextIndex].id);
  };

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-density', density);
    root.setAttribute('data-font-size', fontSize);

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme, density, fontSize, isDark]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        density,
        setDensity,
        fontSize,
        setFontSize,
        isDark,
        currentThemeConfig,
        cycleNextTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
