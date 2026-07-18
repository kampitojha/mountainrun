import { env } from "../config/env.js";

export type CertificateRenderData = {
  certificateNumber: string;
  runnerName: string;
  eventTitle: string;
  distance: string;
  bibNumber: string;
  finishTimeLabel: string;
  issuedAtLabel: string;
  verifyUrl: string;
};

export function createCertificateNumber(bibNumber: string) {
  const year = new Date().getFullYear();
  return `MR-${year}-${bibNumber.replace(/[^A-Z0-9]/gi, "").toUpperCase()}`;
}

export function createCertificateQrPayload(certificateNumber: string) {
  const verifyUrl = buildCertificatePublicUrl(certificateNumber);
  return JSON.stringify({
    issuer: "Mountain Run",
    certificateNumber,
    verifyUrl,
  });
}

export function buildCertificatePublicUrl(certificateNumber: string) {
  const base = env.frontendUrl.replace(/\/$/, "");
  return `${base}/certificates/${encodeURIComponent(certificateNumber)}`;
}

export function formatFinishTime(seconds: number | null | undefined) {
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

export function toCertificateRenderData(input: {
  certificateNumber: string;
  runnerName: string;
  eventTitle: string;
  distance: string;
  bibNumber: string;
  finishTimeSeconds?: number | null;
  issuedAt?: Date | null;
}): CertificateRenderData {
  const issued = input.issuedAt ?? new Date();
  return {
    certificateNumber: input.certificateNumber,
    runnerName: input.runnerName,
    eventTitle: input.eventTitle,
    distance: input.distance,
    bibNumber: input.bibNumber,
    finishTimeLabel: formatFinishTime(input.finishTimeSeconds),
    issuedAtLabel: issued.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    verifyUrl: buildCertificatePublicUrl(input.certificateNumber),
  };
}

/** HTML email body for certificate delivery (no binary PDF dependency). */
export function buildCertificateEmailHtml(data: CertificateRenderData) {
  return `
    <div style="font-family: Georgia, 'Times New Roman', serif; max-width: 640px; margin: 0 auto; color: #0f172a;">
      <div style="border: 2px solid #0d9488; border-radius: 16px; padding: 28px 24px; background: linear-gradient(180deg, #f8fafc 0%, #ffffff 40%);">
        <p style="margin: 0; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: #0d9488; font-family: Arial, sans-serif;">Mountain Run</p>
        <h1 style="margin: 10px 0 4px; font-size: 28px; font-weight: 600;">Certificate of Completion</h1>
        <p style="margin: 0 0 20px; color: #64748b; font-family: Arial, sans-serif; font-size: 14px;">Verified virtual finish</p>

        <p style="margin: 0; font-size: 15px; color: #475569; font-family: Arial, sans-serif;">This certifies that</p>
        <p style="margin: 8px 0 16px; font-size: 26px; font-weight: 700;">${escapeHtml(data.runnerName)}</p>

        <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; font-size: 14px;">
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Event</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 600;">${escapeHtml(data.eventTitle)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Distance</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 600;">${escapeHtml(data.distance)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Bib</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 600;">${escapeHtml(data.bibNumber)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Finish time</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 600;">${escapeHtml(data.finishTimeLabel)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Certificate no.</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 600; font-family: ui-monospace, monospace; font-size: 12px;">${escapeHtml(data.certificateNumber)}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Issued</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 600;">${escapeHtml(data.issuedAtLabel)}</td>
          </tr>
        </table>

        <div style="margin-top: 28px; padding-top: 18px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; gap: 16px;">
          <div>
            <div style="font-family: 'Segoe Script', 'Brush Script MT', cursive; font-size: 22px; color: #0f172a; line-height: 1;">Mountain Run</div>
            <p style="margin: 4px 0 0; font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: #64748b; font-family: Arial, sans-serif;">Race Director · Authorized seal</p>
          </div>
          <div style="text-align: right; font-family: Arial, sans-serif; font-size: 12px; color: #64748b;">
            Digitally issued<br/>Verify online anytime
          </div>
        </div>

        <p style="margin: 24px 0 0; font-family: Arial, sans-serif;">
          <a href="${escapeHtml(data.verifyUrl)}" style="display: inline-block; background: #0d9488; color: #fff; text-decoration: none; padding: 12px 20px; border-radius: 999px; font-size: 14px; font-weight: 600;">
            View &amp; download certificate
          </a>
        </p>
      </div>
      <p style="font-family: Arial, sans-serif; font-size: 12px; color: #94a3b8; margin-top: 16px;">
        This certificate is generated automatically after your GPS proof was approved. Verify authenticity at the link above.
      </p>
    </div>
  `;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
