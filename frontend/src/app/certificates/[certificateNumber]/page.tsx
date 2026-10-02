"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import { PageShell } from "../../components/app-shell";
import { getApiUrl, readApiError } from "../../../lib/api";

type CertificateData = {
  certificateNumber: string;
  status: string;
  runnerName: string;
  event: string;
  distance: string;
  bibNumber: string;
  finishTimeSeconds?: number | null;
  issuedAt: string | null;
  pdfUrl?: string | null;
  verified?: boolean;
};

function formatFinishTime(seconds: number | null | undefined) {
  if (seconds == null || !Number.isFinite(seconds) || seconds <= 0) return "—";
  const total = Math.round(seconds);
  const d = Math.floor(total / 86400);
  const remDay = total % 86400;
  const h = Math.floor(remDay / 3600);
  const m = Math.floor((remDay % 3600) / 60);
  const s = remDay % 60;
  if (d > 0) {
    return `${d}d ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  if (h > 0) {
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatIssuedAt(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/* ── Inline Visual Components ── */

function GoldHangingRibbonBadge() {
  return (
    <div className="relative inline-flex flex-col items-center select-none">
      <div
        className="rounded-t-md px-2.5 sm:px-3.5 pt-2 sm:pt-2.5 pb-1.5 sm:pb-2 text-center shadow-lg border-2 border-b-0 border-[#c9a227]"
        style={{
          background: "linear-gradient(180deg, #0d3829 0%, #061c14 100%)",
        }}
      >
        <div className="text-[0.55rem] sm:text-[0.65rem] text-[#e5b83b] leading-none mb-0.5">▲▲</div>
        <p className="text-[0.5rem] sm:text-[0.6rem] font-black uppercase tracking-[0.18em] text-[#e5b83b] leading-tight">RUN</p>
        <p className="text-[0.45rem] sm:text-[0.5rem] font-bold uppercase tracking-[0.12em] text-white/90 leading-tight">WITH</p>
        <p className="text-[0.5rem] sm:text-[0.55rem] font-black uppercase tracking-[0.18em] text-[#e5b83b] leading-tight">PRIDE</p>
        <p className="text-[0.55rem] sm:text-[0.6rem] text-[#e5b83b] leading-none mt-0.5">★</p>
      </div>
      {/* Ribbon chevron tail */}
      <div
        className="w-full h-2.5 sm:h-3.5 border-x-2 border-b-2 border-[#c9a227]"
        style={{
          background: "#061c14",
          clipPath: "polygon(0 0, 100% 0, 50% 100%)",
        }}
      />
    </div>
  );
}

function MountainRunHeaderCrest() {
  return (
    <div className="flex flex-col items-center text-center select-none">
      <svg className="w-12 h-8 sm:w-16 sm:h-10" viewBox="0 0 72 46" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Mountain range */}
        <polygon points="36,4 12,38 60,38" fill="#0d3829" />
        <polygon points="52,16 38,38 66,38" fill="#134e3a" opacity="0.85" />
        <polygon points="20,18 6,38 34,38" fill="#082118" opacity="0.95" />
        {/* Snow cap */}
        <polygon points="36,4 30,16 36,13 42,16" fill="#ffffff" />
        {/* Golden sun */}
        <circle cx="54" cy="10" r="4.5" fill="#c9a227" />
        {/* Trail runner */}
        <ellipse cx="40" cy="8" rx="1.5" ry="1.5" fill="#fcfaf5" />
        <path d="M40 9.5 L39 14 L36 17 L38 18 L40 15 L43 18 L45 17 L42 14 L41 9.5 Z" fill="#fcfaf5" />
      </svg>
      <h3
        className="text-base sm:text-2xl font-black uppercase tracking-[0.14em] text-[#0d3829] leading-tight mt-0.5 sm:mt-1"
        style={{ fontFamily: "'Cinzel', Georgia, serif" }}
      >
        MOUNTAIN <span className="text-[#d97706]">RUN</span>
      </h3>
      <p className="text-[0.5rem] sm:text-[0.6rem] font-black uppercase tracking-[0.25em] text-[#7a6e5a] mt-0.5">
        — RUN YOUR PRIDE —
      </p>
    </div>
  );
}

function GoldMountainPeaksDivider() {
  return (
    <div className="flex items-center justify-center gap-2 my-1 text-[#c9a227] select-none">
      <span className="h-[1px] w-8 sm:w-16 bg-gradient-to-r from-transparent to-[#c9a227]" />
      <span className="text-[0.65rem] sm:text-sm tracking-widest">▲ ▲ ▲</span>
      <span className="h-[1px] w-8 sm:w-16 bg-gradient-to-l from-transparent to-[#c9a227]" />
    </div>
  );
}

function LuxuryWaxSeal() {
  return (
    <div className="relative inline-flex flex-col items-center justify-center select-none">
      <div
        className="w-16 h-16 sm:w-22 sm:h-22 rounded-full border-2 sm:border-3 border-[#c9a227] flex flex-col items-center justify-center text-center p-1.5 shadow-xl"
        style={{
          background: "linear-gradient(135deg, #0d3829 0%, #061c14 100%)",
          boxShadow: "0 6px 20px rgba(13,56,41,0.35), inset 0 2px 5px rgba(201,162,39,0.3)",
        }}
      >
        <p className="text-[0.4rem] sm:text-[0.45rem] font-black uppercase tracking-widest text-white/90 leading-none">MOUNTAIN RUN</p>
        <div className="text-xs sm:text-sm my-0.5">⛰️</div>
        <p className="text-[0.38rem] sm:text-[0.42rem] font-extrabold uppercase tracking-wider text-[#e5b83b] leading-tight">RUN YOUR PRIDE</p>
        <p className="text-[0.55rem] sm:text-[0.65rem] text-[#e5b83b] leading-none mt-0.5">★★★</p>
      </div>
    </div>
  );
}

function GandhiCertificateCanvas({
  data,
  viewMode = "landscape",
  certRef,
  onDownload,
  isDownloading,
  onShare,
  copied,
}: {
  data: CertificateData;
  viewMode?: "landscape" | "portrait";
  certRef: React.RefObject<HTMLElement | null>;
  onDownload: () => void;
  isDownloading: boolean;
  onShare?: () => void;
  copied?: boolean;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [renderedImageUrl, setRenderedImageUrl] = useState<string | null>(null);

  // Priority: Local first-party certificate asset for Kampit, avoiding any raw Cloudinary URLs
  const isKampitRecord = Boolean(
    data.certificateNumber === "MR-2026-GJVR-109452" ||
      data.bibNumber === "GJVR-109452" ||
      (data.runnerName && data.runnerName.toLowerCase().includes("kampit")),
  );

  const initialImgSrc = isKampitRecord
    ? "/images/certificates/gandhi-kampit-cert.png"
    : data.pdfUrl &&
        !data.pdfUrl.includes("cloudinary.com") &&
        (data.pdfUrl.endsWith(".png") || data.pdfUrl.endsWith(".jpg") || data.pdfUrl.endsWith(".webp"))
      ? data.pdfUrl
      : "/images/certificates/gandhi-master-template.png";

  useEffect(() => {
    // If it's Kampit or already a local image, no need for canvas synthesis
    if (isKampitRecord) {
      return;
    }

    let isCancelled = false;

    // Dynamically synthesize certificate on HTML5 Canvas for other participants
    async function generateCustomCertificate() {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 1000;
        canvas.height = 700;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // 1. Draw Master Template
        const templateImg = new Image();
        templateImg.crossOrigin = "anonymous";
        templateImg.src = "/images/certificates/gandhi-master-template.png";

        await new Promise<void>((resolve, reject) => {
          templateImg.onload = () => resolve();
          templateImg.onerror = () => reject(new Error("Template load failed"));
        });

        if (isCancelled) return;
        ctx.drawImage(templateImg, 0, 0, 1000, 700);

        // 2. Wait for web fonts if supported
        if (typeof document !== "undefined" && document.fonts) {
          try {
            await document.fonts.ready;
          } catch {
            // Proceed
          }
        }

        // 3. Draw Runner Name in Cursive Calligraphy
        ctx.textAlign = "center";
        ctx.textBaseline = "alphabetic";
        ctx.fillStyle = "#0d2130";
        ctx.font = "60px 'Alex Brush', 'Great Vibes', cursive";
        ctx.fillText(data.runnerName, 502, 328);

        // 4. Stats: Distance & Time
        ctx.font = "bold 15px 'Montserrat', -apple-system, sans-serif";
        ctx.fillStyle = "#0f1928";
        ctx.textAlign = "left";

        const rawDist = (data.distance || "10 KM").toUpperCase();
        const formattedDist = rawDist.endsWith("KM") ? rawDist : `${rawDist} KM`;
        ctx.fillText(formattedDist, 328, 488);

        const timeStr = formatFinishTime(data.finishTimeSeconds);
        ctx.fillText(timeStr !== "—" ? timeStr : "00:58:24", 502, 488);

        // 5. Draw QR Code in white box
        const verifyUrl =
          typeof window !== "undefined"
            ? window.location.href
            : `https://mountainrun.in/certificates/${data.certificateNumber}`;
        const qrImg = new Image();
        qrImg.crossOrigin = "anonymous";
        qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&margin=0&color=000000&bgcolor=ffffff&data=${encodeURIComponent(verifyUrl)}`;

        await new Promise<void>((resolve) => {
          qrImg.onload = () => resolve();
          qrImg.onerror = () => resolve();
        });

        if (!isCancelled) {
          ctx.drawImage(qrImg, 49, 615, 50, 50);

          // 6. Draw Certificate ID text
          ctx.font = "bold 11px 'Montserrat', -apple-system, sans-serif";
          ctx.fillStyle = "#ffffff";
          ctx.fillText(`Certificate ID: ${data.certificateNumber}`, 115, 668);

          const finalUrl = canvas.toDataURL("image/png", 0.98);
          setRenderedImageUrl(finalUrl);
        }
      } catch (err) {
        console.warn("Client canvas certificate synthesis notice:", err);
      }
    }

    void generateCustomCertificate();

    return () => {
      isCancelled = true;
    };
  }, [data, isKampitRecord]);

  const displayImage = renderedImageUrl || initialImgSrc;

  const handleGandhiDownload = async () => {
    try {
      const filename = `MountainRun-GandhiJayanti-Certificate-${data.bibNumber || data.certificateNumber || "Finisher"}.png`;
      if (displayImage.startsWith("data:")) {
        const link = document.createElement("a");
        link.download = filename;
        link.href = displayImage;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }
      const res = await fetch(displayImage);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = filename;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.warn("Direct download fallback:", err);
      onDownload();
    }
  };

  return (
    <div className={`w-full mx-auto space-y-6 transition-all duration-300 ${viewMode === "portrait" ? "max-w-xl" : "max-w-4xl"}`}>
      {/* ── Direct Hero Certificate (Clean Centerpiece without Nested Frames) ── */}
      <div
        ref={certRef as React.RefObject<HTMLDivElement>}
        id="certificate-print"
        className="relative group rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 hover:shadow-[0_25px_65px_rgba(0,0,0,0.6)] cursor-pointer bg-white"
        onClick={() => setIsModalOpen(true)}
        style={{
          boxShadow: "0 22px 55px rgba(0,0,0,0.45), 0 0 0 1px rgba(201,162,39,0.35)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={displayImage}
          alt={`Official Certificate of Participation — ${data.runnerName}`}
          className="w-full h-auto block select-none"
        />

        {/* Hover zoom hint */}
        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="px-5 py-2.5 rounded-full bg-black/85 text-[#e5b83b] text-xs sm:text-sm font-bold shadow-2xl backdrop-blur-xs flex items-center gap-2 border border-[#c9a227]/50">
            🔍 Click to View Fullscreen / Zoom
          </span>
        </div>
      </div>

      {/* ── Primary Action Buttons Directly Below Certificate ── */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-1 print:hidden">
        <button
          type="button"
          onClick={handleGandhiDownload}
          disabled={isDownloading}
          className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 rounded-full bg-gradient-to-r from-[#0d3829] to-[#134e3a] border-2 border-[#c9a227] text-white font-black text-xs sm:text-sm tracking-wider uppercase shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-75"
        >
          {isDownloading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Preparing PNG...</span>
            </>
          ) : (
            <>
              <span>🏆</span>
              <span>DOWNLOAD HIGH-RES CERTIFICATE (PNG)</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 sm:px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 border-2 border-white/20 text-white font-bold text-xs sm:text-sm tracking-wide shadow-md transition-all cursor-pointer"
        >
          <span>🔍</span>
          <span>VIEW FULLSCREEN</span>
        </button>

        {onShare && (
          <button
            type="button"
            onClick={onShare}
            className="inline-flex items-center gap-2 px-5 sm:px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 border-2 border-white/15 text-white/90 font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
          >
            <span>{copied ? "✓ Copied Link!" : "🔗 Share Certificate"}</span>
          </button>
        )}
      </div>

      {/* ── Official Athlete Credential Summary Card ── */}
      <div className="rounded-2xl border border-white/15 bg-white/5 backdrop-blur-md overflow-hidden shadow-xl">
        <div className="bg-white/10 px-4 sm:px-6 py-3 border-b border-white/10 flex items-center justify-between">
          <p className="text-[0.65rem] sm:text-xs font-black uppercase tracking-wider text-[#e5b83b] flex items-center gap-2">
            <span>📝</span> OFFICIAL CREDENTIAL VERIFICATION
          </p>
          <span className="text-[0.65rem] sm:text-xs font-mono text-white/80">
            ID: <strong className="text-white font-bold">{data.certificateNumber}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/10 text-center">
          <div className="p-3.5 sm:p-5">
            <p className="text-[0.55rem] sm:text-[0.65rem] font-bold uppercase tracking-wider text-white/60">ATHLETE</p>
            <p className="text-xs sm:text-base font-black text-white mt-1 truncate">{data.runnerName}</p>
          </div>

          <div className="p-3.5 sm:p-5">
            <p className="text-[0.55rem] sm:text-[0.65rem] font-bold uppercase tracking-wider text-white/60">BIB NUMBER</p>
            <p className="text-xs sm:text-base font-black text-[#e5b83b] mt-1 font-mono">{data.bibNumber}</p>
          </div>

          <div className="p-3.5 sm:p-5">
            <p className="text-[0.55rem] sm:text-[0.65rem] font-bold uppercase tracking-wider text-white/60">DISTANCE</p>
            <p className="text-xs sm:text-base font-black text-white mt-1">{data.distance}</p>
          </div>

          <div className="p-3.5 sm:p-5">
            <p className="text-[0.55rem] sm:text-[0.65rem] font-bold uppercase tracking-wider text-white/60">FINISH TIME</p>
            <p className="text-xs sm:text-base font-black text-white mt-1 font-mono">
              {formatFinishTime(data.finishTimeSeconds)}
            </p>
          </div>
        </div>

        <div className="bg-black/20 px-4 sm:px-6 py-2.5 border-t border-white/10 text-center">
          <p className="text-[0.6rem] sm:text-xs text-white/60 font-mono">
            ISSUED: <strong className="text-white font-bold">{formatIssuedAt(data.issuedAt)}</strong> &nbsp;•&nbsp; ORGANIZER:{" "}
            <strong className="text-white font-bold">MOUNTAIN RUN INDIA</strong>
          </p>
        </div>
      </div>

      {/* ── Finisher Medal Delivery Update Card ── */}
      <div className="rounded-2xl border border-[#c9a227]/40 bg-gradient-to-r from-[#0d3829] to-[#061c14] p-4 sm:p-5 text-white shadow-xl flex items-center gap-3 sm:gap-5">
        <div className="text-3xl sm:text-4xl shrink-0 p-2 rounded-full bg-white/10 border border-[#c9a227]">
          🎖️
        </div>
        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#e5b83b] leading-tight">
            ANTIQUE BRONZE FINISHER MEDAL • FREE DOORSTEP DELIVERY
          </p>
          <p className="text-[0.65rem] sm:text-xs text-white/85 leading-relaxed mt-1">
            Your physical antique bronze finisher medal with custom Gandhi Jayanti tricolor ribbon is being prepared. Courier tracking updates will be emailed upon dispatch!
          </p>
        </div>
      </div>

      {/* ── Fullscreen Zoom Lightbox Modal ── */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 print:hidden"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="relative max-w-5xl w-full max-h-[92vh] flex flex-col items-center">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute -top-11 right-0 text-white hover:text-[#e5b83b] text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-full border border-white/20 transition-all"
            >
              ✕ Close
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={displayImage}
              alt={`Full Resolution Certificate — ${data.runnerName}`}
              className="max-h-[82vh] w-auto max-w-full rounded-2xl shadow-2xl border-2 border-[#c9a227] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  void handleGandhiDownload();
                }}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#0d3829] to-[#134e3a] border-2 border-[#c9a227] text-white text-xs sm:text-sm font-bold hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-lg"
              >
                🏆 Download PNG
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CertificateVerifyPage() {
  const params = useParams<{ certificateNumber: string }>();
  const [data, setData] = useState<CertificateData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [overrideQuery, setOverrideQuery] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"landscape" | "portrait">(() => {
    if (typeof window !== "undefined" && window.innerWidth >= 640) {
      return "landscape";
    }
    return "portrait";
  });
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const certRef = useRef<HTMLElement>(null);

  const activeQuery = overrideQuery ?? params.certificateNumber;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!activeQuery) return;
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          getApiUrl(`/api/certificates/verify/${encodeURIComponent(activeQuery)}`),
        );
        if (!response.ok) throw new Error(await readApiError(response, "Certificate not found"));
        const json = await response.json();
        if (!cancelled) setData(json.data as CertificateData);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not verify certificate");
          setData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [activeQuery]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const query = searchInput.trim();
    if (query) {
      setOverrideQuery(query);
    }
  }

  async function handleDownloadImage() {
    let directImgUrl: string | null = null;
    const isGandhi = Boolean(data?.event?.toLowerCase().includes("gandhi"));
    const isKampit = Boolean(
      data?.certificateNumber === "MR-2026-GJVR-109452" ||
        data?.bibNumber === "GJVR-109452" ||
        (data?.runnerName && data.runnerName.toLowerCase().includes("kampit")),
    );

    if (isGandhi) {
      if (isKampit) {
        directImgUrl = "/images/certificates/gandhi-kampit-cert.png";
      } else if (
        data?.pdfUrl &&
        !data.pdfUrl.includes("cloudinary.com") &&
        (data.pdfUrl.endsWith(".png") || data.pdfUrl.endsWith(".jpg") || data.pdfUrl.endsWith(".webp"))
      ) {
        directImgUrl = data.pdfUrl;
      }
    } else if (
      data?.pdfUrl &&
      !data.pdfUrl.includes("cloudinary.com") &&
      (data.pdfUrl.endsWith(".png") || data.pdfUrl.endsWith(".jpg") || data.pdfUrl.endsWith(".webp"))
    ) {
      directImgUrl = data.pdfUrl;
    }

    if (directImgUrl) {
      try {
        setIsDownloading(true);
        const res = await fetch(directImgUrl);
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `MountainRun-Certificate-${data?.bibNumber || "Finisher"}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        return;
      } catch (err) {
        console.warn("Direct image fetch download error:", err);
      } finally {
        setIsDownloading(false);
      }
    }

    if (!certRef.current) return;
    try {
      setIsDownloading(true);
      const dataUrl = await toPng(certRef.current, {
        cacheBust: true,
        pixelRatio: 2, // Ultra sharp 2x retina output
        quality: 0.98,
      });
      const link = document.createElement("a");
      link.download = `MountainRun-Certificate-${data?.bibNumber || "Finisher"}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to export certificate image:", err);
      window.print();
    } finally {
      setIsDownloading(false);
    }
  }

  function handleCopyShare() {
    if (typeof window !== "undefined") {
      void navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  return (
    <PageShell footerMode="minimal">
      <section className="section pt-24 sm:pt-32 pb-12 sm:pb-16">
        <div className="container-page max-w-5xl">
          {/* Header controls (hidden on print) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 print:hidden">
            <div>
              <p className="eyebrow text-[#c9a227]">Official Finisher Credential</p>
              <h1 className="heading text-2xl sm:text-3xl mt-1">Certificate of Achievement</h1>
              <p className="lede text-xs sm:text-sm mt-1">Verified Mountain Run finisher achievement.</p>
            </div>

            {data && (
              <div className="flex flex-wrap items-center gap-2">
                {/* View Mode Toggle Switch */}
                <div className="inline-flex rounded-xl bg-black/10 p-1 border border-white/15">
                  <button
                    type="button"
                    onClick={() => setViewMode("landscape")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      viewMode === "landscape"
                        ? "bg-[#0d3829] text-[#e5b83b] shadow-md"
                        : "text-(--muted) hover:text-foreground"
                    }`}
                  >
                    📜 <span>Rectangle (A4)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("portrait")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      viewMode === "portrait"
                        ? "bg-[#0d3829] text-[#e5b83b] shadow-md"
                        : "text-(--muted) hover:text-foreground"
                    }`}
                  >
                    📱 <span>Mobile Fit</span>
                  </button>
                </div>

                {/* 1-Click High-Res Download PNG Button */}
                <button
                  className="btn btn-primary gap-1.5 text-xs h-9 px-3.5 shadow-md"
                  onClick={handleDownloadImage}
                  disabled={isDownloading}
                  type="button"
                >
                  {isDownloading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      <span>Download PNG</span>
                    </>
                  )}
                </button>

                {/* Print / Save PDF Button */}
                <button
                  className="btn btn-secondary gap-1.5 text-xs h-9 px-3"
                  onClick={() => window.print()}
                  type="button"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>
                  <span>PDF / Print</span>
                </button>

                {/* Share Link Button */}
                <button
                  className="btn btn-ghost gap-1 text-xs h-9 px-2.5"
                  onClick={handleCopyShare}
                  type="button"
                  title="Copy Certificate Link"
                >
                  {copied ? "✓ Copied!" : "🔗 Share"}
                </button>
              </div>
            )}
          </div>

          {/* Loading state */}
          {loading && (
            <div className="card p-14 text-center">
              <div className="inline-block h-8 w-8 border-3 border-[#c9a227] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm font-medium text-(--muted)">Loading verified certificate…</p>
            </div>
          )}

          {/* Error state */}
          {error && !loading && (
            <div className="card p-8 sm:p-12 text-center max-w-xl mx-auto">
              <div className="text-4xl mb-3">⚠️</div>
              <h3 className="text-lg font-bold text-foreground">Certificate Not Found</h3>
              <p className="text-xs sm:text-sm text-(--muted) mt-1 max-w-md mx-auto">
                {error}. You can search using your <strong>Bib Number</strong> (e.g. <code>SDC-124824</code> or <code>TAR124824</code>) or Certificate ID.
              </p>

              <form onSubmit={handleSearchSubmit} className="mt-5 flex items-center gap-2 max-w-md mx-auto">
                <input
                  type="text"
                  className="input flex-1 text-xs font-mono"
                  placeholder="Enter Bib # or Certificate ID..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                <button type="submit" className="btn btn-primary h-10 px-4 text-xs font-bold shrink-0">
                  Find Certificate
                </button>
              </form>

              <div className="mt-6 flex items-center justify-center gap-3">
                <Link className="btn btn-secondary text-xs" href="/dashboard">
                  Go to My Dashboard
                </Link>
                <Link className="btn btn-ghost text-xs" href="/">
                  Back to Home
                </Link>
              </div>
            </div>
          )}

          {/* ══════ MAIN CERTIFICATE CANVAS CONTAINER ══════ */}
          {data && (
            <div className="w-full">
              {/* Landscape View Hint on Mobile */}
              {viewMode === "landscape" && (
                <div className="sm:hidden mb-2 text-center">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/20 text-[0.65rem] font-bold text-[#c9a227]">
                    🔄 Tip: Pinch to zoom or switch to &quot;Mobile Fit&quot; for vertical view
                  </span>
                </div>
              )}

              {/* Responsive Scroll / Frame Wrapper */}
              <div className={viewMode === "landscape" ? "overflow-x-auto pb-4 pt-1" : ""}>
                {data.event.toLowerCase().includes("gandhi") ? (
                  <GandhiCertificateCanvas
                    data={data}
                    viewMode={viewMode}
                    certRef={certRef}
                    onDownload={handleDownloadImage}
                    isDownloading={isDownloading}
                    onShare={handleCopyShare}
                    copied={copied}
                  />
                ) : (
                <article
                  ref={certRef}
                  id="certificate-print"
                  className={`relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl transition-all mx-auto ${
                    viewMode === "landscape"
                      ? "w-[760px] sm:w-full max-w-4xl"
                      : "w-full max-w-lg"
                  }`}
                  style={{
                    background: "linear-gradient(135deg, #fcf9f2 0%, #faf6eb 40%, #f4ede1 100%)",
                    border: "3.5px solid #c9a227",
                    boxShadow: "0 20px 50px rgba(13,56,41,0.22), 0 0 0 1px rgba(201,162,39,0.4)",
                    color: "#0d3829",
                  }}
                >
                  {/* Gold Filigree Corner Accents */}
                  <div className="absolute top-0 left-0 w-12 sm:w-16 h-12 sm:h-16 pointer-events-none border-t-3 sm:border-t-4 border-l-3 sm:border-l-4 border-[#c9a227] rounded-tl-xl sm:rounded-tl-2xl m-1.5 sm:m-2" />
                  <div className="absolute top-0 right-0 w-12 sm:w-16 h-12 sm:h-16 pointer-events-none border-t-3 sm:border-t-4 border-r-3 sm:border-r-4 border-[#c9a227] rounded-tr-xl sm:rounded-tr-2xl m-1.5 sm:m-2" />
                  <div className="absolute bottom-0 left-0 w-12 sm:w-16 h-12 sm:h-16 pointer-events-none border-b-3 sm:border-b-4 border-l-3 sm:border-l-4 border-[#c9a227] rounded-bl-xl sm:rounded-bl-2xl m-1.5 sm:m-2" />
                  <div className="absolute bottom-0 right-0 w-12 sm:w-16 h-12 sm:h-16 pointer-events-none border-b-3 sm:border-b-4 border-r-3 sm:border-r-4 border-[#c9a227] rounded-br-xl sm:rounded-br-2xl m-1.5 sm:m-2" />

                  {/* Watermark background texture */}
                  <div
                    className="absolute inset-0 pointer-events-none opacity-[0.03]"
                    style={{
                      backgroundImage: `radial-gradient(#0d3829 1px, transparent 1px), radial-gradient(#c9a227 1px, #fcfaf5 1px)`,
                      backgroundSize: "24px 24px",
                    }}
                  />

                  {/* Top Indian Tricolor Ribbon Strip */}
                  <div className="flex h-1.5 sm:h-2 w-full">
                    <div className="flex-1 bg-[#FF9933]" />
                    <div className="flex-1 bg-white" />
                    <div className="flex-1 bg-[#138808]" />
                  </div>

                  <div className="relative px-5 py-6 sm:px-12 sm:py-10">

                    {/* ── TOP BAR: Non-Overlapping Balanced 3-Column Layout ── */}
                    <div className="grid grid-cols-3 items-start gap-2">
                      {/* Left: Hanging Ribbon Badge */}
                      <div className="flex justify-start">
                        <GoldHangingRibbonBadge />
                      </div>

                      {/* Center: Mountain Run Logo Crest */}
                      <div className="flex justify-center">
                        <MountainRunHeaderCrest />
                      </div>

                      {/* Right: Event Banner with No-Wrap Overlap Fix */}
                      <div className="flex flex-col items-end text-right min-w-0">
                        <p className="text-[0.5rem] sm:text-[0.6rem] font-black uppercase tracking-[0.2em] text-[#d97706] leading-none">
                          — EVENT —
                        </p>
                        <p className="text-[0.65rem] sm:text-sm font-black uppercase tracking-wide text-[#0d3829] leading-tight mt-0.5 sm:mt-1 break-words max-w-full">
                          {data.event}
                        </p>
                        <div className="h-0.5 w-12 sm:w-16 bg-gradient-to-l from-[#c9a227] to-transparent mt-1" />
                      </div>
                    </div>

                    {/* ── CERTIFICATE OF ACHIEVEMENT TITLE ── */}
                    <div className="mt-5 sm:mt-8 text-center">
                      <h2
                        className="text-2xl sm:text-5xl lg:text-6xl font-black uppercase tracking-[0.1em] sm:tracking-[0.14em] text-[#0d3829] leading-none"
                        style={{ fontFamily: "'Cinzel', Georgia, 'Times New Roman', serif" }}
                      >
                        CERTIFICATE
                      </h2>
                      <div className="flex items-center justify-center gap-2 sm:gap-3 mt-1.5 sm:mt-2">
                        <span className="h-0.5 w-8 sm:w-20 bg-gradient-to-r from-transparent to-[#c9a227]" />
                        <p className="text-[0.65rem] sm:text-sm font-black uppercase tracking-[0.25em] sm:tracking-[0.35em] text-[#c9a227]">
                          — ❖ OF ACHIEVEMENT ❖ —
                        </p>
                        <span className="h-0.5 w-8 sm:w-20 bg-gradient-to-l from-transparent to-[#c9a227]" />
                      </div>
                    </div>

                    {/* ── RECIPIENT NAME & DISTANCE ── */}
                    <div className="mt-4 sm:mt-6 text-center">
                      <p className="text-[0.55rem] sm:text-xs font-black uppercase tracking-[0.25em] text-[#7a6e5a]">
                        THIS CERTIFICATE IS PROUDLY PRESENTED TO
                      </p>

                      <div className="my-1.5 sm:my-3 inline-block">
                        <div
                          className="px-6 sm:px-16 py-1"
                          style={{
                            borderTop: "2px solid #c9a227",
                            borderBottom: "2px solid #c9a227",
                          }}
                        >
                          <p
                            className="text-3xl sm:text-6xl lg:text-7xl text-[#0d3829] font-bold"
                            style={{
                              fontFamily: "'Great Vibes', 'Dancing Script', 'Brush Script MT', cursive",
                              lineHeight: 1.2,
                              textShadow: "0 1px 3px rgba(0,0,0,0.06)",
                            }}
                          >
                            {data.runnerName}
                          </p>
                        </div>
                      </div>

                      {/* Golden Mountain Peaks Line Divider */}
                      <GoldMountainPeaksDivider />

                      {/* Distance Pill */}
                      <div className="mt-2 sm:mt-3 flex items-center justify-center gap-1.5 sm:gap-2">
                        <span className="text-[0.7rem] sm:text-sm text-[#3d362a]">for successfully completing the</span>
                        <span className="inline-flex items-center px-3 sm:px-4 py-0.5 sm:py-1 rounded-full bg-[#0d3829] border border-[#c9a227] text-white font-black text-[0.7rem] sm:text-sm tracking-wide shadow-sm">
                          {data.distance}
                        </span>
                        <span className="text-[#c9a227] text-xs">🌿</span>
                      </div>
                    </div>

                    {/* ── 4-COLUMN STATS CARD (MATCHING REFERENCE IMAGE) ── */}
                    <div className="mt-5 sm:mt-8 rounded-xl sm:rounded-2xl border-1.5 sm:border-2 border-[#d9cdb0] bg-white/95 backdrop-blur-sm shadow-md overflow-hidden">
                      <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#d9cdb0]">
                        {/* Distance */}
                        <div className="flex flex-col items-center text-center p-2.5 sm:p-4">
                          <div className="text-lg sm:text-2xl mb-0.5 sm:mb-1">🏔️</div>
                          <p className="text-[0.5rem] sm:text-[0.6rem] font-black uppercase tracking-[0.18em] text-[#7a6e5a]">DISTANCE</p>
                          <p className="text-xs sm:text-lg font-black text-[#0d3829] mt-0.5">{data.distance}</p>
                        </div>

                        {/* Completion Time */}
                        <div className="flex flex-col items-center text-center p-2.5 sm:p-4">
                          <div className="text-lg sm:text-2xl mb-0.5 sm:mb-1">⏱️</div>
                          <p className="text-[0.5rem] sm:text-[0.6rem] font-black uppercase tracking-[0.18em] text-[#7a6e5a]">COMPLETION TIME</p>
                          <p className="text-xs sm:text-lg font-black text-[#0d3829] mt-0.5 font-mono">
                            {formatFinishTime(data.finishTimeSeconds)}
                          </p>
                        </div>

                        {/* Activity Date */}
                        <div className="flex flex-col items-center text-center p-2.5 sm:p-4">
                          <div className="text-lg sm:text-2xl mb-0.5 sm:mb-1">📅</div>
                          <p className="text-[0.5rem] sm:text-[0.6rem] font-black uppercase tracking-[0.18em] text-[#7a6e5a]">ACTIVITY DATE</p>
                          <p className="text-xs sm:text-base font-black text-[#0d3829] mt-0.5">
                            {formatIssuedAt(data.issuedAt)}
                          </p>
                        </div>

                        {/* Event */}
                        <div className="flex flex-col items-center text-center p-2.5 sm:p-4">
                          <div className="text-lg sm:text-2xl mb-0.5 sm:mb-1">🏅</div>
                          <p className="text-[0.5rem] sm:text-[0.6rem] font-black uppercase tracking-[0.18em] text-[#7a6e5a]">EVENT</p>
                          <p className="text-[0.65rem] sm:text-xs font-black text-[#c9a227] uppercase mt-0.5 leading-tight line-clamp-2">
                            {data.event}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* ── BOTTOM SIGNATURES, 3D WAX SEAL & QR CODE ── */}
                    <div className="mt-5 sm:mt-8 grid grid-cols-2 sm:grid-cols-4 items-end gap-3 sm:gap-6 text-center">
                      {/* Left: Organizer Signature */}
                      <div className="flex flex-col items-center">
                        <p
                          className="text-lg sm:text-3xl text-[#0d3829] font-bold"
                          style={{ fontFamily: "'Dancing Script', cursive" }}
                        >
                          Mountain Run Team
                        </p>
                        <div className="h-0.5 w-24 sm:w-32 bg-[#c9a227] my-0.5 sm:my-1" />
                        <p className="text-[0.5rem] sm:text-[0.6rem] font-black uppercase tracking-[0.14em] text-[#0d3829]">
                          MOUNTAIN RUN TEAM
                        </p>
                        <p className="text-[0.45rem] sm:text-[0.55rem] text-[#7a6e5a]">Organizer</p>
                      </div>

                      {/* Center-Left: Grand 3D Wax Seal */}
                      <div className="flex flex-col items-center">
                        <LuxuryWaxSeal />
                      </div>

                      {/* Center-Right: QR Code */}
                      <div className="flex flex-col items-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&margin=0&color=0d3829&bgcolor=fcfaf5&data=${encodeURIComponent(typeof window !== "undefined" ? window.location.href : data.certificateNumber)}`}
                          alt="Certificate QR"
                          className="w-12 h-12 sm:w-16 sm:h-16 rounded-md sm:rounded-lg border-1.5 sm:border-2 border-[#d9cdb0] shadow-sm p-0.5 sm:p-1 bg-white"
                        />
                        <p className="text-[0.45rem] sm:text-[0.55rem] font-black uppercase tracking-wider text-[#0d3829] mt-0.5 sm:mt-1">
                          SCAN TO VERIFY
                        </p>
                      </div>

                      {/* Right: Keep Running Signature */}
                      <div className="flex flex-col items-center">
                        <p
                          className="text-lg sm:text-3xl text-[#0d3829] font-bold"
                          style={{ fontFamily: "'Dancing Script', cursive" }}
                        >
                          Keep Running
                        </p>
                        <div className="h-0.5 w-24 sm:w-32 bg-[#c9a227] my-0.5 sm:my-1" />
                        <p className="text-[0.45rem] sm:text-[0.55rem] font-black uppercase tracking-wider text-[#0d3829]">
                          KEEP RUNNING, KEEP INSPIRING
                        </p>
                        <p className="text-[0.4rem] sm:text-[0.5rem] text-[#7a6e5a]">Every Finish Has a Story ♥</p>
                      </div>
                    </div>

                    {/* Floating CTA Pill in web view */}
                    <div className="mt-6 flex justify-center print:hidden">
                      <button
                        type="button"
                        onClick={handleDownloadImage}
                        className="inline-flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-[#0d3829] to-[#134e3a] border-2 border-[#c9a227] text-white font-black text-xs sm:text-sm tracking-wider uppercase shadow-xl hover:scale-105 active:scale-95 transition-all"
                      >
                        🏆 Download High-Res PNG
                      </button>
                    </div>

                    {/* Monospace Footer Info */}
                    <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-[#d9cdb0]/60 text-center">
                      <p className="text-[0.5rem] sm:text-[0.55rem] font-mono font-bold uppercase tracking-widest text-[#7a6e5a]">
                        CERTIFICATE NO: <span className="text-[#0d3829] font-black">{data.certificateNumber}</span> &nbsp;•&nbsp; BIB: <span className="text-[#0d3829] font-black">{data.bibNumber}</span>
                      </p>
                    </div>
                  </div>

                  {/* Bottom Indian Tricolor Strip */}
                  <div className="flex h-1 sm:h-1.5 w-full">
                    <div className="flex-1 bg-[#FF9933]" />
                    <div className="flex-1 bg-white" />
                    <div className="flex-1 bg-[#138808]" />
                  </div>
                </article>
                )}
              </div>
            </div>
          )}

          {/* Action buttons (hidden on print) */}
          {data && (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
              <div className="flex gap-2">
                <Link className="btn btn-secondary text-xs sm:text-sm" href="/dashboard">
                  My Dashboard
                </Link>
                <Link className="btn btn-ghost text-xs sm:text-sm" href="/leaderboard">
                  View Leaderboard
                </Link>
              </div>
              <p className="text-xs text-(--muted)">
                Need help? Contact support with Certificate ID: <strong className="font-mono text-(--foreground)">{data.certificateNumber}</strong>
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── Print & Font Styles ── */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @import url('https://fonts.googleapis.com/css2?family=Alex+Brush&family=Cinzel:wght@700;900&family=Dancing+Script:wght@700&family=Great+Vibes&family=Montserrat:wght@400;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap');

          @media print {
            @page {
              size: A4 landscape;
              margin: 0.2in;
            }
            body * { visibility: hidden !important; }
            #certificate-print,
            #certificate-print * { visibility: visible !important; }
            #certificate-print {
              position: fixed !important;
              inset: 0 !important;
              width: 100% !important;
              height: 100% !important;
              box-shadow: none !important;
              border-radius: 0 !important;
              overflow: visible !important;
              margin: 0 !important;
            }
            header, footer, nav, .print\\:hidden { display: none !important; }
          }
        `,
      }} />
    </PageShell>
  );
}
