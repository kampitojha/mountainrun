"use client";

import React, { useState, useRef } from "react";
import {
  UploadCloud,
  ImageIcon,
  CheckCircle2,
  Trash2,
  RefreshCw,
  ExternalLink,
  Link as LinkIcon,
  AlertCircle,
  Eye,
} from "lucide-react";
import { adminFetch } from "../../../lib/admin-api";

interface ImageUploadDropzoneProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  getToken: () => Promise<string | null>;
  folder?: string;
  helperText?: string;
  aspectHint?: "banner" | "square" | "gallery" | "any";
  placeholderUrl?: string;
  required?: boolean;
}

export function ImageUploadDropzone({
  label,
  value,
  onChange,
  getToken,
  folder = "mountainrun/admin",
  helperText,
  aspectHint = "any",
  required = false,
}: ImageUploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  async function processFile(file: File) {
    setError(null);

    // Validate type
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (PNG, JPG, WebP, or AVIF).");
      return;
    }

    // Validate size (max 12MB)
    if (file.size > 12 * 1024 * 1024) {
      setError("Image file is too large (max 12 MB). Please select a compressed image.");
      return;
    }

    setUploading(true);
    setUploadProgress(`Processing ${file.name} (${(file.size / (1024 * 1024)).toFixed(1)} MB)...`);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          setUploadProgress("Uploading to Cloudinary CDN...");

          const token = await getToken();
          const res = await adminFetch<{ data: { url: string; provider?: string } }>(
            "/api/uploads/image",
            token,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                file: base64,
                folder,
              }),
            }
          );

          if (res?.data?.url) {
            onChange(res.data.url);
            setUploadProgress(null);
            setError(null);
          } else {
            throw new Error("Did not receive uploaded image URL from server.");
          }
        } catch (err: any) {
          setError(err.message || "Failed to upload image. Please try again.");
        } finally {
          setUploading(false);
          setUploadProgress(null);
        }
      };

      reader.onerror = () => {
        setError("Failed to read image file from disk.");
        setUploading(false);
        setUploadProgress(null);
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      setError(err.message || "Upload process failed.");
      setUploading(false);
      setUploadProgress(null);
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      void processFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      void processFile(files[0]);
    }
    // reset input so the same file can be re-selected if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getAspectClass = () => {
    if (aspectHint === "banner") return "aspect-video max-h-48";
    if (aspectHint === "square") return "aspect-square max-w-44 max-h-44";
    if (aspectHint === "gallery") return "aspect-4/3 max-h-48";
    return "aspect-video max-h-52";
  };

  const isCloudinary = Boolean(value && value.includes("cloudinary.com"));

  return (
    <div className="space-y-2">
      {/* Label & Actions Bar */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-[var(--foreground)] uppercase tracking-wider">
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] font-semibold text-[var(--muted)] hover:text-emerald-400 inline-flex items-center gap-1 cursor-pointer transition"
        >
          <LinkIcon className="w-3 h-3" />
          {showUrlInput ? "Hide Direct URL" : "Edit / View URL"}
        </button>
      </div>

      {helperText && (
        <p className="text-[11px] text-[var(--muted)] leading-relaxed">{helperText}</p>
      )}

      {/* Hidden native file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
        className="hidden"
      />

      {/* View 1: When image is already uploaded */}
      {value ? (
        <div className="relative rounded-2xl border border-[var(--line)] bg-[var(--background)] p-3 shadow-sm space-y-2 group">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Live Image Preview */}
            <div
              className={`relative overflow-hidden rounded-xl border border-[var(--line)] bg-black/20 shrink-0 w-full sm:w-auto ${getAspectClass()}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value}
                alt={label}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <a
                href={value}
                target="_blank"
                rel="noreferrer"
                title="View full image in new tab"
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-black text-white text-xs transition backdrop-blur-xs cursor-pointer shadow-md"
              >
                <Eye className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Info & Action Buttons */}
            <div className="flex-1 min-w-0 space-y-2.5 w-full">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  {isCloudinary ? "Hosted on Cloudinary CDN" : "Image Ready"}
                </span>
                {uploading && (
                  <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-medium">
                    <RefreshCw className="w-3 h-3 animate-spin" /> Replacing...
                  </span>
                )}
              </div>

              <p className="text-xs font-mono text-[var(--muted)] truncate max-w-md bg-[var(--panel)] px-2.5 py-1.5 rounded-lg border border-[var(--line)]">
                {value}
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--line)] bg-[var(--panel)] hover:bg-[var(--line)] text-xs font-bold text-[var(--foreground)] transition cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                  Replace Image
                </button>
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => onChange("")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-xs font-bold text-rose-300 transition cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* View 2: Upload Dropzone when empty */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => {
            if (!uploading) fileInputRef.current?.click();
          }}
          className={`relative rounded-2xl border-2 border-dashed p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 select-none ${
            isDragging
              ? "border-emerald-500 bg-emerald-500/10 scale-[1.01]"
              : "border-[var(--line)] bg-[var(--background)]/60 hover:border-emerald-500/60 hover:bg-[var(--background)]"
          }`}
        >
          {uploading ? (
            <div className="space-y-3 flex flex-col items-center py-2 animate-pulse">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-950">
                <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-emerald-300">
                  {uploadProgress || "Uploading image..."}
                </p>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  Uploading directly to Cloudinary storage...
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5 flex flex-col items-center">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                  isDragging
                    ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/30"
                    : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                }`}
              >
                <UploadCloud className="w-6 h-6" />
              </div>

              <div>
                <p className="text-xs sm:text-sm font-bold text-[var(--foreground)]">
                  <span className="text-emerald-400 underline">Click to choose image</span> or drag and drop
                </p>
                <p className="text-[11px] text-[var(--muted)] mt-1">
                  PNG, JPG, WebP, AVIF up to 12 MB • Auto-optimized on Cloudinary
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Optional fallback direct URL text input */}
      {showUrlInput && (
        <div className="pt-1 animate-in fade-in duration-150">
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://res.cloudinary.com/..."
            className="w-full px-3 py-2 rounded-xl border border-[var(--line)] bg-[var(--background)] text-xs font-mono text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-emerald-500 outline-none"
          />
          <p className="text-[10px] text-[var(--muted)] mt-1">
            Manual override: You can paste any direct Cloudinary or CDN image URL here.
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-2.5 rounded-xl border border-rose-500/30 bg-rose-950/20 text-rose-300 text-xs animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

export default ImageUploadDropzone;
