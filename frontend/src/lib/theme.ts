export type Theme = "light" | "dark";

/** Public marketing site — independent of admin */
export const SITE_THEME_KEY = "mr-site-theme";
export const SITE_THEME_EVENT = "mr-site-theme-change";

/** /admin console — independent of public site */
export const ADMIN_THEME_KEY = "mr-admin-theme";
export const ADMIN_THEME_EVENT = "mr-admin-theme-change";

export const SITE_THEME_DEFAULT: Theme = "dark";
export const ADMIN_THEME_DEFAULT: Theme = "dark";

export function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark";
}

export function readStoredTheme(key: string, fallback: Theme): Theme {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return isTheme(raw) ? raw : fallback;
  } catch {
    return fallback;
  }
}

export function writeStoredTheme(key: string, theme: Theme, eventName: string) {
  try {
    window.localStorage.setItem(key, theme);
  } catch {
    /* private mode / blocked storage */
  }
  window.dispatchEvent(new CustomEvent(eventName, { detail: theme }));
}

/** Apply public site theme on <html> (class + data-theme for CSS). */
export function applySiteTheme(theme: Theme) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
}

export function getOppositeTheme(theme: Theme): Theme {
  return theme === "dark" ? "light" : "dark";
}
