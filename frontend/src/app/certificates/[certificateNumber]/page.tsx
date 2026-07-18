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
  if (seconds == null || !Number.isFinite(seconds) || seconds <= 0) {
    return "—";
  }
  const total = Math.round(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) {
    return `${h}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`;
  }
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
        if (!response.ok) {
          throw new Error(await readApiError(response, "Certificate not found"));
        }
        const json = await response.json();
        if (!cancelled) {
          setData(json.data as CertificateData);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Could not verify certificate");
          setData(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
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
            <div className="card mt-8 p-8 text-center text-sm text-[var(--muted)]">
              Checking certificate…
            </div>
          ) : null}

          {error ? (
            <div className="card mt-8 p-8 text-center">
              <p className="text-base font-medium text-[var(--danger)]">{error}</p>
              <Link className="btn btn-secondary mt-6" href="/">
                Back home
              </Link>
            </div>
          ) : null}

          {data ? (
            <article
              className="cert-sheet relative mt-8 overflow-hidden rounded-3xl border-2 border-[var(--sage)] bg-[var(--panel)] p-6 shadow-[var(--shadow-hover)] sm:p-10"
              id="certificate-print"
            >
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.07]"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 20% 20%, #0d9488 0, transparent 45%), radial-gradient(circle at 80% 0%, #4f46e5 0, transparent 40%)",
                }}
              />

              <div className="relative">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--sage)]">
                      Mountain Run
                    </p>
                    <h2 className="mt-2 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
                      Certificate of Completion
                    </h2>
                    <p className="mt-1 text-sm text-[var(--muted)]">Verified virtual finish</p>
                  </div>
                  <span className="badge badge-sage">Verified</span>
                </div>

                <p className="mt-10 text-sm text-[var(--muted)]">This certifies that</p>
                <p className="mt-2 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
                  {data.runnerName}
                </p>
                <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--muted)]">
                  successfully completed the distance below in a Mountain Run virtual event. GPS
                  proof was reviewed and approved by race operations.
                </p>

                <dl className="mt-8 grid gap-4 border-t border-[var(--line)] pt-6 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-[var(--muted)]">Event</dt>
                    <dd className="mt-1 font-semibold">{data.event}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--muted)]">Distance</dt>
                    <dd className="mt-1 font-semibold">{data.distance}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--muted)]">Bib</dt>
                    <dd className="mt-1 font-mono text-xs font-semibold">{data.bibNumber}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--muted)]">Finish time</dt>
                    <dd className="mt-1 font-semibold">
                      {formatFinishTime(data.finishTimeSeconds)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[var(--muted)]">Certificate no.</dt>
                    <dd className="mt-1 font-mono text-xs font-semibold">
                      {data.certificateNumber}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[var(--muted)]">Issued</dt>
                    <dd className="mt-1 font-semibold">
                      {data.issuedAt
                        ? new Date(data.issuedAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })
                        : "—"}
                    </dd>
                  </div>
                </dl>

                <div className="mt-10 flex flex-wrap items-end justify-between gap-6 border-t border-[var(--line)] pt-6">
                  <div>
                    <p
                      className="text-2xl text-[var(--foreground)]"
                      style={{ fontFamily: "Segoe Script, Brush Script MT, cursive" }}
                    >
                      Mountain Run
                    </p>
                    <p className="mt-1 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                      Race Director · Authorized digital seal
                    </p>
                  </div>
                  <div className="text-right text-xs text-[var(--muted)]">
                    <p>Digitally issued</p>
                    <p className="mt-0.5">Status: {data.status}</p>
                  </div>
                </div>
              </div>
            </article>
          ) : null}

          {data ? (
            <div className="mt-6 flex flex-wrap gap-2 print:hidden">
              <Link className="btn btn-secondary" href="/dashboard">
                Dashboard
              </Link>
              <Link className="btn btn-ghost" href="/leaderboard">
                Leaderboard
              </Link>
            </div>
          ) : null}
        </div>
      </section>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media print {
              body * { visibility: hidden; }
              #certificate-print, #certificate-print * { visibility: visible; }
              #certificate-print {
                position: absolute; left: 0; top: 0; width: 100%;
                border: none !important; box-shadow: none !important;
              }
              header, footer { display: none !important; }
            }
          `,
        }}
      />
    </PageShell>
  );
}
