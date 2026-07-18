"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  SITE_THEME_DEFAULT,
  SITE_THEME_EVENT,
  SITE_THEME_KEY,
  applySiteTheme,
  getOppositeTheme,
  readStoredTheme,
  writeStoredTheme,
  type Theme,
} from "../../lib/theme";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  mounted: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function subscribe(onStoreChange: () => void) {
  const handler = () => onStoreChange();
  window.addEventListener("storage", handler);
  window.addEventListener(SITE_THEME_EVENT, handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(SITE_THEME_EVENT, handler);
  };
}

function getSnapshot(): Theme {
  return readStoredTheme(SITE_THEME_KEY, SITE_THEME_DEFAULT);
}

function getServerSnapshot(): Theme {
  return SITE_THEME_DEFAULT;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  useEffect(() => {
    applySiteTheme(theme);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    writeStoredTheme(SITE_THEME_KEY, next, SITE_THEME_EVENT);
    applySiteTheme(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(getOppositeTheme(theme));
  }, [setTheme, theme]);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme, mounted }),
    [theme, setTheme, toggleTheme, mounted],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
