import React, {useState, useEffect, useMemo} from 'react';
import {Outlet} from 'react-router-dom';

import {plugins} from 'virtual:gustav-plugins';
import {PublicLayout} from './PublicLayout';
import {ActiveThemeContext, ActiveThemeInfo} from './ActiveThemeContext';
import {themeSdk} from './sdk';

const DARK_STYLE_ID = 'gustav-theme-dark-override';
const FONT_LINK_ID = 'gustav-theme-font';

export function ThemeLayoutWrapper() {
  const [activeTheme, setActiveTheme] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await themeSdk.getActiveTheme();
        if (!cancelled) {
          setActiveTheme(result.activeTheme);
        }
      } catch (err) {
        console.error('Failed to fetch active theme', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const themePlugin = useMemo(() => {
    if (!activeTheme) return null;
    return plugins.find(p => p.name === activeTheme && p.theme) || null;
  }, [activeTheme]);

  const themeDef = themePlugin?.theme;

  const cssVars = useMemo(() => {
    if (!themeDef) return {} as Record<string, string>;
    return {...(themeDef.cssVariables || {})};
  }, [themeDef]);

  const darkVars = useMemo(() => {
    if (!themeDef?.darkCssVariables) return {} as Record<string, string>;
    return {...themeDef.darkCssVariables};
  }, [themeDef?.darkCssVariables]);

  useEffect(() => {
    if (!themeDef?.fontFamily) return;

    const existing = document.getElementById(FONT_LINK_ID) as HTMLLinkElement | null;
    const href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(themeDef.fontFamily)}:wght@400;500;600;700;800;900&display=swap`;

    if (existing) {
      existing.href = href;
    } else {
      const link = document.createElement('link');
      link.id = FONT_LINK_ID;
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    }
  }, [themeDef?.fontFamily]);

  useEffect(() => {
    const existing = document.getElementById(DARK_STYLE_ID);
    if (existing) existing.remove();

    if (Object.keys(darkVars).length > 0) {
      const style = document.createElement('style');
      style.id = DARK_STYLE_ID;
      const vars = Object.entries(darkVars)
        .map(([k, v]) => `${k}: ${v};`)
        .join(' ');
      style.textContent = `@media (prefers-color-scheme: dark) { .gustav-theme-wrapper { ${vars} } }`;
      document.head.appendChild(style);
    }

    return () => {
      const el = document.getElementById(DARK_STYLE_ID);
      if (el) el.remove();
    };
  }, [darkVars]);

  const themeContextValue = useMemo(
    () => ({activeTheme, themePlugin, loading}),
    [activeTheme, themePlugin, loading]
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-[3px] border-layer-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const LayoutComponent = themeDef?.layout
    ? (themeDef.layout as React.ComponentType<{children: React.ReactNode}>)
    : PublicLayout;

  const wrapperStyle: React.CSSProperties = {
    ...cssVars,
    ...(themeDef?.fontFamily
      ? {'--font-family-base': `'${themeDef.fontFamily}', sans-serif`}
      : {}),
  } as React.CSSProperties;

  return (
    <ActiveThemeContext.Provider value={themeContextValue}>
      <div className="gustav-theme-wrapper" style={wrapperStyle}>
        <LayoutComponent>
          <Outlet />
        </LayoutComponent>
      </div>
    </ActiveThemeContext.Provider>
  );
}