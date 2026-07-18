"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { Moon, Sun } from "lucide-react";
import {
  ADMIN_THEME_DEFAULT,
  ADMIN_THEME_EVENT,
  ADMIN_THEME_KEY,
  getOppositeTheme,
  readStoredTheme,
  writeStoredTheme,
  type Theme,
} from "../../lib/theme";

type AdminThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  mounted: boolean;
};

const AdminThemeContext = createContext<AdminThemeContextValue | null>(null);

function subscribe(onStoreChange: () => void) {
  const handler = () => onStoreChange();
  window.addEventListener("storage", handler);
  window.addEventListener(ADMIN_THEME_EVENT, handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(ADMIN_THEME_EVENT, handler);
  };
}

function getSnapshot(): Theme {
  return readStoredTheme(ADMIN_THEME_KEY, ADMIN_THEME_DEFAULT);
}

function getServerSnapshot(): Theme {
  return ADMIN_THEME_DEFAULT;
}

export function AdminThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  const setTheme = useCallback((next: Theme) => {
    writeStoredTheme(ADMIN_THEME_KEY, next, ADMIN_THEME_EVENT);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(getOppositeTheme(theme));
  }, [setTheme, theme]);

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme, mounted }),
    [theme, setTheme, toggleTheme, mounted],
  );

  return (
    <AdminThemeContext.Provider value={value}>{children}</AdminThemeContext.Provider>
  );
}

export function useAdminTheme() {
  const ctx = useContext(AdminThemeContext);
  if (!ctx) {
    throw new Error("useAdminTheme must be used within AdminThemeProvider");
  }
  return ctx;
}

/** Compact control for admin chrome — does not touch site theme. */
export function AdminThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme, mounted } = useAdminTheme();
  const isDark = !mounted || theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch admin to light theme" : "Switch admin to dark theme"}
      title={isDark ? "Light mode" : "Dark mode"}
      className={[
        "admin-theme-toggle",
        className,
      ].join(" ")}
    >
      {isDark ? (
        <Sun className="h-4 w-4" aria-hidden="true" strokeWidth={1.75} />
      ) : (
        <Moon className="h-4 w-4" aria-hidden="true" strokeWidth={1.75} />
      )}
      <span className="admin-theme-toggle-label">
        {isDark ? "Light" : "Dark"}
      </span>
    </button>
  );
}
