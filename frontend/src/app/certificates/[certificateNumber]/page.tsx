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
  issuedAt: string | null;
};

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
        <div className="container-page max-w-2xl">
          <p className="eyebrow">Certificate</p>
          <h1 className="heading mt-3">Verify finish certificate</h1>
          <p className="lede mt-3">Public QR verification for Mountain Run e-certificates.</p>

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
            <div className="card mt-8 space-y-4 p-6 sm:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <span className="badge badge-sage">Verified record</span>
                <span className="badge">{data.status}</span>
              </div>
              <h2 className="text-2xl font-semibold tracking-tight">{data.runnerName}</h2>
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-[var(--muted)]">Event</dt>
                  <dd className="mt-1 font-medium">{data.event}</dd>
                </div>
                <div>
                  <dt className="text-[var(--muted)]">Distance</dt>
                  <dd className="mt-1 font-medium">{data.distance}</dd>
                </div>
                <div>
                  <dt className="text-[var(--muted)]">Bib</dt>
                  <dd className="mt-1 font-mono text-xs font-medium">{data.bibNumber}</dd>
                </div>
                <div>
                  <dt className="text-[var(--muted)]">Certificate no.</dt>
                  <dd className="mt-1 font-mono text-xs font-medium">{data.certificateNumber}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-[var(--muted)]">Issued</dt>
                  <dd className="mt-1 font-medium">
                    {data.issuedAt
                      ? new Date(data.issuedAt).toLocaleString("en-IN")
                      : "Queued / pending issue date"}
                  </dd>
                </div>
              </dl>
              <div className="flex flex-wrap gap-2 pt-2">
                <Link className="btn btn-primary" href="/leaderboard">
                  Leaderboard
                </Link>
                <Link className="btn btn-secondary" href="/events">
                  Events
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </PageShell>
  );
}
