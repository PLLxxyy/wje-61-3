import { useState, useEffect, useCallback } from 'react';
import type { TerminalTheme } from '../engines/types';
import { TERMINAL_THEMES } from '../engines/types';

export function useTerminalTheme(initialTheme: TerminalTheme = 'green') {
  const [theme, setTheme] = useState<TerminalTheme>(initialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const cycleTheme = useCallback(() => {
    const themes: TerminalTheme[] = ['green', 'amber', 'blue', 'mono'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  }, [theme]);

  return {
    theme,
    setTheme,
    cycleTheme,
    themeConfig: TERMINAL_THEMES[theme],
    allThemes: TERMINAL_THEMES,
  };
}
