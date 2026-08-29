"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
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

/* ── Inline SVG Icons matching the reference certificate ── */

function GoldHangingRibbonBadge() {
  return (
    <div className="relative inline-flex flex-col items-center">
      <div
        className="rounded-t-md px-3.5 pt-2.5 pb-2 text-center shadow-lg border-2 border-b-0 border-[#c9a227]"
        style={{
          background: "linear-gradient(180deg, #0d3829 0%, #061c14 100%)",
        }}
      >
        <div className="text-[0.65rem] text-[#e5b83b] leading-none mb-0.5">▲▲</div>
        <p className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-[#e5b83b] leading-tight">RUN</p>
        <p className="text-[0.5rem] font-bold uppercase tracking-[0.15em] text-white/90 leading-tight">WITH</p>
        <p className="text-[0.55rem] font-black uppercase tracking-[0.2em] text-[#e5b83b] leading-tight">PRIDE</p>
        <p className="text-[0.6rem] text-[#e5b83b] leading-none mt-1">★</p>
      </div>
      {/* Ribbon chevron tail */}
      <div
        className="w-full h-3 border-x-2 border-b-2 border-[#c9a227]"
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
    <div className="flex flex-col items-center text-center">
      <svg width="72" height="46" viewBox="0 0 72 46" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Mountain range */}
        <polygon points="36,4 12,38 60,38" fill="#0d3829" />
        <polygon points="52,16 38,38 66,38" fill="#134e3a" opacity="0.85" />
        <polygon points="20,18 6,38 34,38" fill="#082118" opacity="0.95" />
        {/* Snow peak cap */}
        <polygon points="36,4 30,16 36,13 42,16" fill="#ffffff" />
        {/* Golden sun */}
        <circle cx="54" cy="10" r="4.5" fill="#c9a227" />
        {/* Trail runner */}
        <ellipse cx="40" cy="8" rx="1.5" ry="1.5" fill="#fcfaf5" />
        <path d="M40 9.5 L39 14 L36 17 L38 18 L40 15 L43 18 L45 17 L42 14 L41 9.5 Z" fill="#fcfaf5" />
      </svg>
      <h3
        className="text-xl sm:text-2xl font-black uppercase tracking-[0.16em] text-[#0d3829] leading-tight mt-1"
        style={{ fontFamily: "'Cinzel', Georgia, serif" }}
      >
        MOUNTAIN <span className="text-[#d97706]">RUN</span>
      </h3>
      <p className="text-[0.6rem] font-black uppercase tracking-[0.3em] text-[#7a6e5a] mt-0.5">
        — RUN YOUR PRIDE —
      </p>
    </div>
  );
}

function GoldMountainPeaksDivider() {
  return (
    <div className="flex items-center justify-center gap-2 my-1 text-[#c9a227]">
      <span className="h-[1px] w-12 sm:w-16 bg-gradient-to-r from-transparent to-[#c9a227]" />
      <span className="text-xs sm:text-sm tracking-widest">▲ ▲ ▲</span>
      <span className="h-[1px] w-12 sm:w-16 bg-gradient-to-l from-transparent to-[#c9a227]" />
    </div>
  );
}

function LuxuryWaxSeal() {
  return (
    <div className="relative inline-flex flex-col items-center justify-center">
      <div
        className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-3 border-[#c9a227] flex flex-col items-center justify-center text-center p-2 shadow-xl"
        style={{
          background: "linear-gradient(135deg, #0d3829 0%, #061c14 100%)",
          boxShadow: "0 8px 24px rgba(13,56,41,0.35), inset 0 2px 6px rgba(201,162,39,0.3)",
        }}
      >
        <p className="text-[0.45rem] font-black uppercase tracking-widest text-white/90 leading-none">MOUNTAIN RUN</p>
        <div className="text-sm my-0.5">⛰️</div>
        <p className="text-[0.45rem] font-extrabold uppercase tracking-wider text-[#e5b83b] leading-tight">RUN YOUR PRIDE</p>
        <p className="text-[0.65rem] text-[#e5b83b] leading-none mt-0.5">★★★</p>
      </div>
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

  return (
    <PageShell footerMode="minimal">
      <section className="section py-8">
        <div className="container-page max-w-5xl">
          {/* Header controls (hidden on print) */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 print:hidden">
            <div>
              <p className="eyebrow text-[#c9a227]">Official Finisher Credential</p>
              <h1 className="heading text-2xl sm:text-3xl mt-1">Certificate of Achievement</h1>
              <p className="lede text-xs sm:text-sm mt-1">Verified Mountain Run finisher achievement.</p>
            </div>
            {data && (
              <div className="flex gap-2">
                <button
                  className="btn btn-primary gap-2 shadow-lg"
                  onClick={() => window.print()}
                  type="button"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9V2h12v7" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>
                  Print / Save PDF
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
                {error}. You can search using your <strong>Bib Number</strong> (e.g. <code>TAR124824</code> or <code>SDC-1234</code>) or Certificate ID.
              </p>

              {/* Direct Bib / Certificate Search Input */}
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

          {/* ══════ LUXURY GOLD & EMERALD CERTIFICATE CANVAS ══════ */}
          {data && (
            <article
              id="certificate-print"
              className="relative overflow-hidden rounded-3xl shadow-2xl transition-all"
              style={{
                background: "linear-gradient(135deg, #fbf8f0 0%, #fcfaf5 40%, #f4ede1 100%)",
                border: "3.5px solid #c9a227",
                boxShadow: "0 24px 60px rgba(13,56,41,0.22), 0 0 0 1px rgba(201,162,39,0.4)",
                color: "#0d3829",
              }}
            >
              {/* Gold Filigree Corner Accents */}
              <div className="absolute top-0 left-0 w-16 h-16 pointer-events-none border-t-4 border-l-4 border-[#c9a227] rounded-tl-2xl m-2" />
              <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none border-t-4 border-r-4 border-[#c9a227] rounded-tr-2xl m-2" />
              <div className="absolute bottom-0 left-0 w-16 h-16 pointer-events-none border-b-4 border-l-4 border-[#c9a227] rounded-bl-2xl m-2" />
              <div className="absolute bottom-0 right-0 w-16 h-16 pointer-events-none border-b-4 border-r-4 border-[#c9a227] rounded-br-2xl m-2" />

              {/* Watermark background texture */}
              <div
                className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{
                  backgroundImage: `radial-gradient(#0d3829 1px, transparent 1px), radial-gradient(#c9a227 1px, #fcfaf5 1px)`,
                  backgroundSize: "24px 24px",
                }}
              />

              <div className="relative px-6 py-8 sm:px-14 sm:py-12">

                {/* ── TOP ROW: Hanging Ribbon Badge | Crest Logo | Event Banner ── */}
                <div className="flex items-start justify-between gap-4">
                  {/* Left Badge */}
                  <div className="w-1/4">
                    <GoldHangingRibbonBadge />
                  </div>

                  {/* Center Mountain Run Logo Crest */}
                  <div className="w-2/4 flex justify-center">
                    <MountainRunHeaderCrest />
                  </div>

                  {/* Right Event Header */}
                  <div className="w-1/4 flex flex-col items-end text-right">
                    <p className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-[#d97706] leading-none">
                      — EVENT —
                    </p>
                    <p className="text-xs sm:text-sm font-black uppercase tracking-wide text-[#0d3829] leading-tight mt-1">
                      {data.event}
                    </p>
                    <div className="h-0.5 w-16 bg-gradient-to-l from-[#c9a227] to-transparent mt-1.5" />
                  </div>
                </div>

                {/* ── CERTIFICATE OF ACHIEVEMENT TITLE ── */}
                <div className="mt-8 text-center">
                  <h2
                    className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-[0.12em] text-[#0d3829] leading-none"
                    style={{ fontFamily: "'Cinzel', Georgia, 'Times New Roman', serif" }}
                  >
                    CERTIFICATE
                  </h2>
                  <div className="flex items-center justify-center gap-3 mt-2">
                    <span className="h-0.5 w-12 sm:w-20 bg-gradient-to-r from-transparent to-[#c9a227]" />
                    <p className="text-xs sm:text-sm font-black uppercase tracking-[0.35em] text-[#c9a227]">
                      — ❖ OF ACHIEVEMENT ❖ —
                    </p>
                    <span className="h-0.5 w-12 sm:w-20 bg-gradient-to-l from-transparent to-[#c9a227]" />
                  </div>
                </div>

                {/* ── RECIPIENT NAME & DISTANCE ── */}
                <div className="mt-6 text-center">
                  <p className="text-[0.65rem] sm:text-xs font-black uppercase tracking-[0.28em] text-[#7a6e5a]">
                    THIS CERTIFICATE IS PROUDLY PRESENTED TO
                  </p>

                  <div className="my-2 sm:my-3 inline-block">
                    <div
                      className="px-8 sm:px-16 py-1"
                      style={{
                        borderTop: "2px solid #c9a227",
                        borderBottom: "2px solid #c9a227",
                      }}
                    >
                      <p
                        className="text-4xl sm:text-6xl lg:text-7xl text-[#0d3829] font-bold"
                        style={{
                          fontFamily: "'Great Vibes', 'Dancing Script', 'Brush Script MT', cursive",
                          lineHeight: 1.25,
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
                  <div className="mt-3 flex items-center justify-center gap-2">
                    <span className="text-xs sm:text-sm text-[#3d362a]">for successfully completing the</span>
                    <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-[#0d3829] border border-[#c9a227] text-white font-black text-xs sm:text-sm tracking-wide shadow-sm">
                      {data.distance}
                    </span>
                    <span className="text-[#c9a227] text-xs">🌿</span>
                  </div>
                </div>

                {/* ── 4-COLUMN STATS CARD (MATCHING REFERENCE IMAGE) ── */}
                <div className="mt-8 rounded-2xl border-2 border-[#d9cdb0] bg-white/95 backdrop-blur-sm shadow-md overflow-hidden">
                  <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#d9cdb0]">
                    {/* Distance */}
                    <div className="flex flex-col items-center text-center p-4">
                      <div className="text-2xl mb-1">🏔️</div>
                      <p className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-[#7a6e5a]">DISTANCE</p>
                      <p className="text-base sm:text-lg font-black text-[#0d3829] mt-0.5">{data.distance}</p>
                    </div>

                    {/* Completion Time */}
                    <div className="flex flex-col items-center text-center p-4">
                      <div className="text-2xl mb-1">⏱️</div>
                      <p className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-[#7a6e5a]">COMPLETION TIME</p>
                      <p className="text-base sm:text-lg font-black text-[#0d3829] mt-0.5 font-mono">
                        {formatFinishTime(data.finishTimeSeconds)}
                      </p>
                    </div>

                    {/* Activity Date */}
                    <div className="flex flex-col items-center text-center p-4">
                      <div className="text-2xl mb-1">📅</div>
                      <p className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-[#7a6e5a]">ACTIVITY DATE</p>
                      <p className="text-base sm:text-lg font-black text-[#0d3829] mt-0.5">
                        {formatIssuedAt(data.issuedAt)}
                      </p>
                    </div>

                    {/* Event */}
                    <div className="flex flex-col items-center text-center p-4">
                      <div className="text-2xl mb-1">🏅</div>
                      <p className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-[#7a6e5a]">EVENT</p>
                      <p className="text-xs sm:text-sm font-black text-[#c9a227] uppercase mt-0.5 leading-tight">
                        {data.event}
                      </p>
                    </div>
                  </div>
                </div>

                {/* ── BOTTOM SIGNATURES, 3D WAX SEAL & QR CODE ── */}
                <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 items-end gap-6 text-center">
                  {/* Left: Organizer Signature */}
                  <div className="flex flex-col items-center">
                    <p
                      className="text-2xl sm:text-3xl text-[#0d3829] font-bold"
                      style={{ fontFamily: "'Dancing Script', cursive" }}
                    >
                      Mountain Run Team
                    </p>
                    <div className="h-0.5 w-32 bg-[#c9a227] my-1" />
                    <p className="text-[0.6rem] font-black uppercase tracking-[0.16em] text-[#0d3829]">
                      MOUNTAIN RUN TEAM
                    </p>
                    <p className="text-[0.55rem] text-[#7a6e5a]">Organizer</p>
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
                      className="w-16 h-16 rounded-lg border-2 border-[#d9cdb0] shadow-sm p-1 bg-white"
                    />
                    <p className="text-[0.55rem] font-black uppercase tracking-wider text-[#0d3829] mt-1">
                      SCAN TO VERIFY
                    </p>
                  </div>

                  {/* Right: Keep Running Signature */}
                  <div className="flex flex-col items-center">
                    <p
                      className="text-2xl sm:text-3xl text-[#0d3829] font-bold"
                      style={{ fontFamily: "'Dancing Script', cursive" }}
                    >
                      Keep Running
                    </p>
                    <div className="h-0.5 w-32 bg-[#c9a227] my-1" />
                    <p className="text-[0.55rem] font-black uppercase tracking-wider text-[#0d3829]">
                      KEEP RUNNING, KEEP INSPIRING
                    </p>
                    <p className="text-[0.5rem] text-[#7a6e5a]">Every Finish Has a Story ♥</p>
                  </div>
                </div>

                {/* Floating CTA Pill */}
                <div className="mt-8 flex justify-center">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-[#0d3829] to-[#134e3a] border-2 border-[#c9a227] text-white font-black text-xs sm:text-sm tracking-wider uppercase shadow-xl hover:scale-105 active:scale-95 transition-all print:hidden"
                  >
                    🏆 View &amp; Download E-Certificate
                  </button>
                </div>

                {/* Monospace Footer info */}
                <div className="mt-6 pt-4 border-t border-[#d9cdb0]/60 text-center">
                  <p className="text-[0.55rem] font-mono font-bold uppercase tracking-widest text-[#7a6e5a]">
                    CERTIFICATE NO: <span className="text-[#0d3829] font-black">{data.certificateNumber}</span> &nbsp;•&nbsp; BIB: <span className="text-[#0d3829] font-black">{data.bibNumber}</span>
                  </p>
                </div>
              </div>
            </article>
          )}

          {/* Action buttons (hidden on print) */}
          {data && (
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
              <div className="flex gap-2">
                <Link className="btn btn-secondary" href="/dashboard">
                  My Dashboard
                </Link>
                <Link className="btn btn-ghost" href="/leaderboard">
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
          @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Dancing+Script:wght@700&family=Great+Vibes&display=swap');

          @media print {
            @page {
              size: A4 landscape;
              margin: 0.25in;
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
