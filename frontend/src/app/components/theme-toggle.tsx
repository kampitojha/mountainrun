"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";

type ThemeToggleProps = {
  className?: string;
  /** Compact circular control for header/mobile */
  size?: "sm" | "md";
};

export function ThemeToggle({ className = "", size = "md" }: ThemeToggleProps) {
  const { theme, toggleTheme, mounted } = useTheme();
  const dim = size === "sm" ? "h-9 w-9" : "h-10 w-10";
  const icon = size === "sm" ? "h-4 w-4" : "h-[1.05rem] w-[1.05rem]";
  const isDark = mounted && theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Light mode" : "Dark mode"}
      className={[
        "theme-toggle focus-ring relative inline-flex items-center justify-center rounded-full border border-(--line) bg-(--panel) text-(--foreground) transition-colors duration-200",
        "hover:bg-(--panel-soft) hover:border-(--line-strong)",
        "cursor-pointer shrink-0",
        dim,
        className,
      ].join(" ")}
    >
      {/* Avoid icon flash before hydration */}
      <span className="sr-only">{isDark ? "Dark" : "Light"} mode</span>
      {isDark ? (
        <Sun className={icon} aria-hidden="true" strokeWidth={1.75} />
      ) : (
        <Moon className={icon} aria-hidden="true" strokeWidth={1.75} />
      )}
    </button>
  );
}
