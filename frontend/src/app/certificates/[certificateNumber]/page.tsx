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
  if (seconds == null || !Number.isFinite(seconds) || seconds <= 0) return "\u2014";
  const total = Math.round(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
  return `${m}m ${String(s).padStart(2, "0")}s`;
}

export default function CertificateVerifyPage() {
  const params = useParams<{ certificateNumber: string }>();
  const [data, setData] = useState<CertificateData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          getApiUrl(`/api/certificates/verify/${encodeURIComponent(params.certificateNumber)}`),
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
    return () => { cancelled = true; };
  }, [params.certificateNumber]);

  return (
    <PageShell>
      <section className="section">
        <div className="container-page max-w-3xl">
          <div className="flex flex-wrap items-end justify-between gap-3 print:hidden">
            <div>
              <p className="eyebrow">Certificate</p>
              <h1 className="heading mt-3">Finish certificate</h1>
              <p className="lede mt-3">Public verification for Mountain Run e-certificates.</p>
            </div>
            {data ? (
              <button className="btn btn-primary" onClick={() => window.print()} type="button">
                Print / Save PDF
              </button>
            ) : null}
          </div>

          {loading ? (
            <div className="card mt-8 p-8 text-center text-sm text-(--muted)">
              Checking certificate&#8230;
            </div>
          ) : null}

          {error ? (
            <div className="card mt-8 p-8 text-center">
              <p className="text-base font-medium text-(--danger)">{error}</p>
              <Link className="btn btn-secondary mt-6" href="/">Back home</Link>
            </div>
          ) : null}

          {data ? (
            <article className="cert-sheet relative mt-8 overflow-hidden rounded-[18px] bg-(--panel) p-[5px] shadow-lg" id="certificate-print">
              {/* Outer frame */}
              <div className="relative rounded-[13px] border border-(--sage)/40 bg-(--panel) p-0">

                {/* Top sage band */}
                <div className="h-1.5 rounded-t-[13px] bg-gradient-to-r from-(--sage) via-teal-400 to-(--sage)" />

                <div className="px-8 py-9 sm:px-12 sm:py-12">

                  {/* Decorative top rule */}
                  <div className="flex items-center gap-3 mb-7">
                    <span className="h-px flex-1 bg-(--sage)/40" />
                    <span className="h-2 w-2 rotate-45 border border-(--sage)/50" />
                    <span className="h-px flex-1 bg-(--sage)/40" />
                  </div>

                  {/* Header */}
                  <div className="text-center">
                    <p className="text-[0.6rem] font-semibold uppercase tracking-[0.25em] text-(--sage)">Mountain Run</p>
                    <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-(--foreground) sm:text-4xl">
                      Certificate of Completion
                    </h2>
                    <p className="mt-1 text-xs uppercase tracking-[0.15em] text-(--muted-soft)">Verified Virtual Finish</p>
                  </div>

                  {/* Decorative bottom rule */}
                  <div className="flex items-center gap-3 mt-6 mb-8">
                    <span className="h-px flex-1 bg-(--sage)/40" />
                    <span className="h-2 w-2 rotate-45 border border-(--sage)/50" />
                    <span className="h-px flex-1 bg-(--sage)/40" />
                  </div>

                  {/* Body */}
                  <div className="text-center">
                    <p className="text-sm text-(--muted)">This certifies that</p>

                    <div className="inline-block border-t border-b border-(--line) px-6 py-3 my-3">
                      <p className="font-serif text-3xl font-bold tracking-tight text-(--foreground) sm:text-4xl">
                        {data.runnerName}
                      </p>
                    </div>

                    <p className="text-sm text-(--muted)">has successfully completed the following distance</p>
                    <p className="mt-2 text-xl font-bold text-(--sage)">{data.distance}</p>
                    <p className="mt-1 text-sm text-(--muted)">
                      in the <strong className="text-(--foreground)">{data.event}</strong> virtual event
                    </p>
                  </div>

                  {/* Details grid */}
                  <dl className="mt-8 grid gap-px overflow-hidden rounded-xl border border-(--line) bg-(--line) text-sm sm:grid-cols-2">
                    {[
                      ["Bib number", data.bibNumber, "font-mono text-xs"],
                      ["Finish time", formatFinishTime(data.finishTimeSeconds), ""],
                      ["Certificate no.", data.certificateNumber, "font-mono text-xs"],
                      ["Issued on", data.issuedAt
                        ? new Date(data.issuedAt).toLocaleDateString("en-IN", {
                            day: "numeric", month: "long", year: "numeric",
                          })
                        : "\u2014", ""],
                    ].map(([label, value, extra], i) => (
                      <div key={i} className={`flex items-center justify-between gap-2 px-4 py-3 ${i % 2 === 0 ? "bg-(--panel)" : "bg-(--panel-soft)"}`}>
                        <dt className="text-xs text-(--muted-soft)">{label}</dt>
                        <dd className={`text-right text-sm font-semibold text-(--foreground) ${extra}`}>{value}</dd>
                      </div>
                    ))}
                  </dl>

                  {/* Signature & seal */}
                  <div className="mt-10 flex flex-wrap items-end justify-between gap-6 border-t border-(--line) pt-6">
                    <div>
                      <p className="text-2xl text-(--foreground)" style={{ fontFamily: "'Segoe Script', 'Brush Script MT', cursive" }}>
                        Mountain Run
                      </p>
                      <p className="mt-1 text-[0.55rem] font-semibold uppercase tracking-[0.15em] text-(--muted-soft)">
                        Race Director &middot; Authorized digital seal
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 border-(--sage)">
                        <span className="text-[0.5rem] font-bold leading-tight text-(--sage) text-center">MR<br/>✓</span>
                      </div>
                      <p className="mt-1 text-[0.55rem] text-(--muted-soft)">Digitally verified</p>
                    </div>
                  </div>

                  {/* Status badge footer */}
                  <div className="mt-6 text-center">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-(--sage-soft) px-3 py-1 text-[0.6rem] font-bold uppercase tracking-wider text-(--sage)">
                      <span className="h-1.5 w-1.5 rounded-full bg-(--sage)" />
                      {data.status === "SENT" ? "Issued & emailed" : data.status === "GENERATED" ? "Issued" : data.status}
                    </span>
                  </div>
                </div>

                {/* Bottom sage band */}
                <div className="h-1.5 rounded-b-[13px] bg-gradient-to-r from-(--sage) via-teal-400 to-(--sage)" />
              </div>
            </article>
          ) : null}

          {data ? (
            <div className="mt-6 flex flex-wrap gap-2 print:hidden">
              <Link className="btn btn-secondary" href="/dashboard">Dashboard</Link>
              <Link className="btn btn-ghost" href="/leaderboard">Leaderboard</Link>
            </div>
          ) : null}
        </div>
      </section>

      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            @page { margin: 0.3in; }
            body * { visibility: hidden; }
            #certificate-print, #certificate-print * { visibility: visible; }
            #certificate-print {
              position: absolute; left: 0; top: 0; width: 100%;
              box-shadow: none !important; border: none !important;
              padding: 0 !important; margin: 0 !important;
            }
            #certificate-print > div {
              box-shadow: none !important; border: 1.5px solid #0d9488 !important;
            }
            header, footer, nav { display: none !important; }
          }
        `,
      }} />
    </PageShell>
  );
}
