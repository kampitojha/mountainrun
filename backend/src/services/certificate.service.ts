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
  const S = "#0d9488";
  const G = "#e2e8f0";
  const FG = "#0f172a";
  const MUTED = "#64748b";

  return `
<div style="max-width: 620px; margin: 0 auto; font-family: Georgia, 'Times New Roman', serif; color: ${FG}; line-height: 1.5;">
  <div style="background: #ffffff; border-radius: 20px; padding: 6px; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
    <div style="border: 1.5px solid ${S}; border-radius: 16px; padding: 0; background: #fff; overflow: hidden;">

      <!-- Top decorative band -->
      <div style="height: 6px; background: linear-gradient(90deg, ${S}, #14b8a6, ${S});"></div>

      <div style="padding: 36px 32px 28px;">

        <!-- Ornamental header -->
        <div style="text-align: center; position: relative;">
          <div style="border-top: 2px solid ${S}; height: 1px; margin: 0 0 24px;"></div>
          <p style="margin: 0 0 6px; font-size: 11px; letter-spacing: 0.22em; text-transform: uppercase; color: ${S}; font-family: Arial, sans-serif; font-weight: 600;">Mountain Run</p>
          <h1 style="margin: 0 0 2px; font-size: 30px; font-weight: 600; letter-spacing: 0.02em; color: ${FG};">Certificate of Completion</h1>
          <p style="margin: 0 0 16px; color: ${MUTED}; font-size: 13px; font-family: Arial, sans-serif;">Verified Virtual Finish</p>
          <div style="border-bottom: 2px solid ${S}; height: 1px; margin: 0 0 24px;"></div>
        </div>

        <!-- Decorative corner ornaments are approximated with bordered squares -->
        <div style="text-align: center; margin: 0 0 12px;">

          <p style="margin: 0 0 4px; font-size: 14px; color: #475569; font-family: Arial, sans-serif;">This certifies that</p>

          <div style="display: inline-block; border-top: 1.5px solid ${G}; border-bottom: 1.5px solid ${G}; padding: 10px 32px; margin: 4px 0 12px;">
            <p style="margin: 0; font-size: 28px; font-weight: 700; color: ${FG}; letter-spacing: 0.03em;">${escapeHtml(data.runnerName)}</p>
          </div>

          <p style="margin: 0 0 4px; font-size: 13px; color: #475569; font-family: Arial, sans-serif;">has successfully completed the following distance</p>

          <p style="margin: 0; font-size: 18px; font-weight: 700; color: ${S};">${escapeHtml(data.distance)}</p>
          <p style="margin: 2px 0 0; font-size: 13px; color: #64748b; font-family: Arial, sans-serif;">in the <strong style="color: ${FG};">${escapeHtml(data.eventTitle)}</strong> virtual event</p>
        </div>

        <!-- Details grid -->
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0 0; font-family: Arial, sans-serif; font-size: 13px;">
          <tr>
            <td style="padding: 7px 12px; color: ${MUTED}; background: #f8fafc; width: 40%; border-radius: 6px 0 0 0;">Bib number</td>
            <td style="padding: 7px 12px; font-weight: 600; background: #f8fafc; border-radius: 0 6px 0 0;">${escapeHtml(data.bibNumber)}</td>
          </tr>
          <tr>
            <td style="padding: 7px 12px; color: ${MUTED}; border-bottom: 1px solid ${G};">Finish time</td>
            <td style="padding: 7px 12px; font-weight: 600; border-bottom: 1px solid ${G};">${escapeHtml(data.finishTimeLabel)}</td>
          </tr>
          <tr>
            <td style="padding: 7px 12px; color: ${MUTED};">Certificate no.</td>
            <td style="padding: 7px 12px; font-weight: 600; font-family: ui-monospace, monospace; font-size: 12px;">${escapeHtml(data.certificateNumber)}</td>
          </tr>
          <tr>
            <td style="padding: 7px 12px; color: ${MUTED}; background: #f8fafc; border-radius: 0 0 0 6px;">Issued on</td>
            <td style="padding: 7px 12px; font-weight: 600; background: #f8fafc; border-radius: 0 0 6px 0;">${escapeHtml(data.issuedAtLabel)}</td>
          </tr>
        </table>

        <!-- Signature & seal -->
        <div style="margin-top: 28px; padding-top: 20px; border-top: 1px solid ${G}; display: flex; justify-content: space-between; align-items: end; gap: 16px;">
          <div>
            <div style="font-family: 'Segoe Script', 'Brush Script MT', cursive; font-size: 22px; color: ${FG}; line-height: 1.2;">Mountain Run</div>
            <p style="margin: 4px 0 0; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: ${MUTED}; font-family: Arial, sans-serif;">Race Director &middot; Authorized digital seal</p>
          </div>
          <div style="text-align: center;">
            <div style="width: 52px; height: 52px; border: 2px solid ${S}; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 4px;">
              <span style="font-size: 10px; font-weight: 700; color: ${S}; letter-spacing: 0.05em; text-align: center; line-height: 1.2;">MR<br/>✓</span>
            </div>
            <p style="margin: 0; font-size: 9px; color: ${MUTED}; font-family: Arial, sans-serif;">Digitally verified</p>
          </div>
        </div>

        <!-- CTA -->
        <p style="margin: 24px 0 0; text-align: center; font-family: Arial, sans-serif;">
          <a href="${escapeHtml(data.verifyUrl)}" style="display: inline-block; background: ${S}; color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 999px; font-size: 14px; font-weight: 600; letter-spacing: 0.01em;">
            View &amp; download certificate
          </a>
        </p>
      </div>

      <!-- Bottom decorative band -->
      <div style="height: 6px; background: linear-gradient(90deg, ${S}, #14b8a6, ${S});"></div>
    </div>
  </div>
  <p style="font-family: Arial, sans-serif; font-size: 11px; color: #94a3b8; margin-top: 16px; text-align: center;">
    This certificate was issued automatically after GPS proof approval. Verify authenticity anytime at the link above.
  </p>
</div>`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
