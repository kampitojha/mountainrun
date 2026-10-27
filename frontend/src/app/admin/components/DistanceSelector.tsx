"use client";

import React, { useState } from "react";
import { Check, Plus, X, Sparkles, MoveRight } from "lucide-react";

interface DistanceSelectorProps {
  value: string[];
  onChange: (distances: string[]) => void;
  label?: string;
  helperText?: string;
}

const PRESET_DISTANCES: Array<{ value: string; label: string; badge?: string }> = [
  { value: "1.6 km", label: "1.6 km", badge: "1 Mile" },
  { value: "3.2 km", label: "3.2 km", badge: "2 Miles" },
  { value: "5 km", label: "5 km", badge: "Popular" },
  { value: "10 km", label: "10 km", badge: "Popular" },
  { value: "21.1 km", label: "21.1 km", badge: "Half Marathon" },
  { value: "42.2 km", label: "42.2 km", badge: "Full Marathon" },
  { value: "50 km", label: "50 km", badge: "Ultra" },
];

export function DistanceSelector({
  value = [],
  onChange,
  label = "Event Distances",
  helperText = "Select the running categories available for participant registration, or add custom distances.",
}: DistanceSelectorProps) {
  const [customInput, setCustomInput] = useState("");
  const [customError, setCustomError] = useState<string | null>(null);

  // Normalize check (case and whitespace insensitive)
  const isSelected = (dist: string) => {
    const norm = dist.trim().toLowerCase();
    return value.some((v) => v.trim().toLowerCase() === norm);
  };

  const togglePreset = (dist: string) => {
    if (isSelected(dist)) {
      const norm = dist.trim().toLowerCase();
      onChange(value.filter((v) => v.trim().toLowerCase() !== norm));
    } else {
      onChange([...value, dist]);
    }
  };

  const removeDistance = (dist: string) => {
    const norm = dist.trim().toLowerCase();
    onChange(value.filter((v) => v.trim().toLowerCase() !== norm));
  };

  const handleAddCustom = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCustomError(null);
    let val = customInput.trim();
    if (!val) return;

    // Automatically append "km" if only a number is typed
    if (/^\d+(\.\d+)?$/.test(val)) {
      val = `${val} km`;
    }

    if (isSelected(val)) {
      setCustomError(`"${val}" is already added.`);
      return;
    }

    onChange([...value, val]);
    setCustomInput("");
  };

  const handleSelectAllPresets = () => {
    const presets = PRESET_DISTANCES.map((p) => p.value);
    const combined = Array.from(new Set([...value, ...presets]));
    onChange(combined);
  };

  const handleClearAll = () => {
    onChange([]);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <div>
          <label className="block text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">
            {label} <span className="text-emerald-400 font-normal">({value.length} selected)</span>
          </label>
          {helperText && (
            <p className="text-[11px] text-[var(--muted)] mt-0.5">{helperText}</p>
          )}
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleSelectAllPresets}
            className="text-[10px] font-semibold text-emerald-400 hover:text-emerald-300 underline cursor-pointer"
          >
            Select Standard All
          </button>
          <span className="text-[var(--muted)] text-[10px]">•</span>
          <button
            type="button"
            onClick={handleClearAll}
            className="text-[10px] font-semibold text-rose-400 hover:text-rose-300 underline cursor-pointer"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Quick Select Presets Grid */}
      <div className="flex flex-wrap gap-2 pt-1">
        {PRESET_DISTANCES.map((preset) => {
          const active = isSelected(preset.value);
          return (
            <button
              key={preset.value}
              type="button"
              onClick={() => togglePreset(preset.value)}
              className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border select-none ${
                active
                  ? "border-emerald-500/60 bg-emerald-500/15 text-emerald-300 shadow-sm shadow-emerald-950 scale-[1.02]"
                  : "border-[var(--line)] bg-[var(--background)] text-[var(--muted)] hover:border-[var(--line-strong)] hover:text-[var(--foreground)]"
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] transition-transform ${
                  active
                    ? "bg-emerald-500 text-black font-extrabold"
                    : "border border-[var(--line)] text-[var(--muted)] group-hover:border-emerald-400"
                }`}
              >
                {active ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : <Plus className="w-2.5 h-2.5" />}
              </span>
              <span>{preset.label}</span>
              {preset.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-full font-medium ${
                    active
                      ? "bg-emerald-500/30 text-emerald-200"
                      : "bg-[var(--line)] text-[var(--muted)]"
                  }`}
                >
                  {preset.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Custom Distance Input */}
      <div className="flex items-center gap-2 pt-1">
        <div className="relative flex-1 max-w-xs">
          <input
            type="text"
            value={customInput}
            onChange={(e) => {
              setCustomInput(e.target.value);
              setCustomError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddCustom();
              }
            }}
            placeholder="Custom distance (e.g. 7 km, 15 km)..."
            className="w-full px-3 py-1.5 text-xs rounded-xl border border-[var(--line)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--muted)] outline-none focus:border-emerald-500"
          />
        </div>
        <button
          type="button"
          onClick={() => handleAddCustom()}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition cursor-pointer shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
        {customError && (
          <span className="text-[11px] text-rose-400 font-medium">{customError}</span>
        )}
      </div>

      {/* Currently Selected Distances Badge Sequence */}
      {value.length > 0 ? (
        <div className="p-3 rounded-xl border border-[var(--line)] bg-[var(--background)]/60 space-y-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            Configured Race Categories for this Event:
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {value.map((dist, idx) => (
              <span
                key={dist}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 animate-in fade-in zoom-in-95 duration-100"
              >
                <span className="text-[9px] font-mono opacity-70">#{idx + 1}</span>
                <span>{dist}</span>
                <button
                  type="button"
                  onClick={() => removeDistance(dist)}
                  title={`Remove ${dist}`}
                  className="hover:bg-rose-500/20 hover:text-rose-400 rounded p-0.5 text-emerald-400/70 transition cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-3 rounded-xl border border-dashed border-rose-500/30 bg-rose-950/10 text-rose-300 text-xs">
          ⚠️ No distance categories selected yet! Click the pills above to select at least one distance.
        </div>
      )}
    </div>
  );
}

export default DistanceSelector;
