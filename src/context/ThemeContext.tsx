'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type ThemeState = {
  accent: string;
  brand: string;
  tagline: string;
};

type ThemeContextValue = ThemeState & {
  setAccent: (color: string) => void;
  setBrand: (name: string) => void;
  setTagline: (tagline: string) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function clampChannel(value: number) {
  return Math.max(0, Math.min(255, value));
}

function adjustHex(hex: string, amount: number) {
  const normalized = hex.replace('#', '');
  const num = parseInt(normalized.length === 3 ? normalized.split('').map((c) => c + c).join('') : normalized, 16);
  const r = clampChannel((num >> 16) + amount);
  const g = clampChannel(((num >> 8) & 0x00ff) + amount);
  const b = clampChannel((num & 0x0000ff) + amount);
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [accent, setAccent] = useState('#0D8CBD');
  const [brand, setBrand] = useState('FrieslandMove');
  const [tagline, setTagline] = useState('Schülerbeförderung');

  const accentDark = useMemo(() => adjustHex(accent, -30), [accent]);
  const accentSoft = useMemo(() => adjustHex(accent, 120), [accent]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--accent', accent);
    root.style.setProperty('--accent-strong', accentDark);
    root.style.setProperty('--accent-soft', accentSoft);
    root.style.setProperty('--brand', brand);
    root.style.setProperty('--tagline', tagline);
  }, [accent, accentDark, accentSoft, brand, tagline]);

  const value: ThemeContextValue = {
    accent,
    brand,
    tagline,
    setAccent,
    setBrand,
    setTagline,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
