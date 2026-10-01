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
      month: "short",
      year: "numeric",
    }),
    verifyUrl: buildCertificatePublicUrl(input.certificateNumber),
  };
}

/** HTML email body for certificate delivery — matching reference certificate design with full responsiveness. */
export function buildCertificateEmailHtml(data: CertificateRenderData) {
  if (data.eventTitle.toLowerCase().includes("gandhi")) {
    return buildGandhiJayantiCertificateEmailHtml(data);
  }

  const DARK_GREEN = "#0d3829";
  const ACCENT_GREEN = "#134e3a";
  const GOLD = "#c9a227";
  const BRIGHT_GOLD = "#e5b83b";
  const CREAM = "#fcfaf5";
  const WARM_BG = "#f5f0e6";
  const MUTED = "#7a6e5a";
  const BORDER_COLOR = "#d9cdb0";
  const qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&margin=0&color=0d3829&bgcolor=fcfaf5&data=${encodeURIComponent(data.verifyUrl)}`;

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Mountain Run Certificate of Achievement</title>
  <style type="text/css">
    @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Cinzel:wght@700;900&family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap');
    
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; background-color: #e9e4d8; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    
    @media only screen and (max-width: 640px) {
      .email-container { width: 100% !important; max-width: 100% !important; border-radius: 12px !important; }
      .cert-padding { padding: 20px 16px !important; }
      .runner-name { font-size: 34px !important; line-height: 1.2 !important; }
      .stat-grid-cell { display: block !important; width: 100% !important; border-right: none !important; border-bottom: 1px solid ${BORDER_COLOR} !important; padding: 12px 6px !important; }
      .stat-grid-cell-last { border-bottom: none !important; }
      .sign-col { display: block !important; width: 100% !important; text-align: center !important; margin-bottom: 16px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#e9e4d8;">

  <!-- Preheader preview text -->
  <div style="display:none;font-size:1px;color:#e9e4d8;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    Official Certificate of Achievement for ${escapeHtml(data.runnerName)} — ${escapeHtml(data.distance)} in ${escapeHtml(data.eventTitle)}. 🏅 Verified Finisher Credential.
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#e9e4d8;padding:24px 8px;">
    <tr>
      <td align="center">
        <!-- Main Certificate Container with Dual Luxury Gold/Emerald Border -->
        <table class="email-container" width="640" cellpadding="0" cellspacing="0" border="0" style="max-width:640px;width:100%;background-color:${CREAM};border-radius:20px;overflow:hidden;box-shadow:0 16px 48px rgba(13,56,41,0.22);border:3px solid ${GOLD};">

          <!-- ══════ TOP HEADER SECTION WITH BADGE & MOUNTAINS ══════ -->
          <tr>
            <td style="padding:0;background:linear-gradient(180deg, #f7f3e8 0%, ${CREAM} 100%);">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <!-- Left: Hanging Green Ribbon Badge -->
                  <td width="25%" align="left" valign="top" style="padding:16px 0 0 20px;">
                    <table cellpadding="0" cellspacing="0" border="0" style="width:72px;">
                      <tr>
                        <td style="background-color:${DARK_GREEN};border:2px solid ${GOLD};border-bottom:none;border-radius:6px 6px 0 0;padding:10px 4px 6px;text-align:center;box-shadow:0 4px 10px rgba(0,0,0,0.15);">
                          <div style="font-size:14px;color:${BRIGHT_GOLD};line-height:1;margin-bottom:2px;">▲▲</div>
                          <p style="margin:0;font-size:9px;font-weight:900;letter-spacing:0.18em;text-transform:uppercase;color:${BRIGHT_GOLD};line-height:1.2;">RUN</p>
                          <p style="margin:0;font-size:7px;font-weight:800;letter-spacing:0.15em;text-transform:uppercase;color:#ffffff;line-height:1.2;">WITH</p>
                          <p style="margin:0;font-size:8px;font-weight:900;letter-spacing:0.18em;text-transform:uppercase;color:${BRIGHT_GOLD};line-height:1.2;">PRIDE</p>
                          <p style="margin:3px 0 0;font-size:10px;color:${BRIGHT_GOLD};">★</p>
                        </td>
                      </tr>
                      <!-- Ribbon chevron cut -->
                      <tr>
                        <td style="height:14px;background-color:${DARK_GREEN};border-left:2px solid ${GOLD};border-right:2px solid ${GOLD};clip-path:polygon(0 0, 100% 0, 50% 100%);border-bottom:2px solid ${GOLD};"></td>
                      </tr>
                    </table>
                  </td>

                  <!-- Center: Mountain Run Logo Crest -->
                  <td width="50%" align="center" valign="top" style="padding:24px 8px 12px;">
                    <div style="display:inline-block;text-align:center;">
                      <!-- Stylized Mountains + Sun SVG / Icon -->
                      <div style="font-size:32px;line-height:1;margin-bottom:6px;">⛰️☀️</div>
                      <p style="margin:0;font-size:22px;font-weight:900;letter-spacing:0.15em;text-transform:uppercase;color:${DARK_GREEN};font-family:'Cinzel', Georgia, serif;line-height:1.1;">
                        MOUNTAIN <span style="color:#d97706;">RUN</span>
                      </p>
                      <p style="margin:4px 0 0;font-size:9px;font-weight:800;letter-spacing:0.3em;text-transform:uppercase;color:${MUTED};">
                        — RUN YOUR PRIDE —
                      </p>
                    </div>
                  </td>

                  <!-- Right: Mountain Silhouette Illustration Accent -->
                  <td width="25%" align="right" valign="top" style="padding:16px 20px 0 0;">
                    <div style="text-align:right;">
                      <p style="margin:0;font-size:16px;color:#c9a227;line-height:1;">🦅</p>
                      <p style="margin:2px 0 0;font-size:9px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${DARK_GREEN};">
                        ${escapeHtml(data.eventTitle)}
                      </p>
                      <div style="height:2px;background:linear-gradient(90deg, transparent, ${GOLD});margin-top:4px;width:80px;display:inline-block;"></div>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ══════ CERTIFICATE OF ACHIEVEMENT TITLE ══════ -->
          <tr>
            <td style="padding:14px 28px 8px;text-align:center;">
              <h1 style="margin:0;font-size:36px;font-weight:900;letter-spacing:0.14em;text-transform:uppercase;color:${DARK_GREEN};font-family:'Cinzel', Georgia, serif;line-height:1.1;">
                CERTIFICATE
              </h1>
              <div style="margin:8px auto 0;display:inline-block;text-align:center;">
                <p style="margin:0;font-size:12px;font-weight:800;letter-spacing:0.35em;text-transform:uppercase;color:${GOLD};">
                  — ❖ OF ACHIEVEMENT ❖ —
                </p>
              </div>
            </td>
          </tr>

          <!-- ══════ RECIPIENT PRESENTATION & NAME ══════ -->
          <tr>
            <td class="cert-padding" style="padding:18px 36px 12px;text-align:center;">
              <p style="margin:0 0 10px;font-size:11px;font-weight:800;letter-spacing:0.28em;text-transform:uppercase;color:${MUTED};">
                THIS CERTIFICATE IS PROUDLY PRESENTED TO
              </p>

              <!-- Participant Name in Royal Calligraphy Script -->
              <div style="margin:6px auto 14px;display:inline-block;padding:4px 32px;border-top:2px solid ${GOLD};border-bottom:2px solid ${GOLD};">
                <p class="runner-name" style="margin:0;font-size:52px;font-family:'Dancing Script', 'Brush Script MT', 'Great Vibes', cursive;color:${DARK_GREEN};font-weight:700;line-height:1.2;text-shadow:0 1px 2px rgba(0,0,0,0.08);">
                  ${escapeHtml(data.runnerName)}
                </p>
              </div>

              <!-- Decorative Mountain Divider Accent -->
              <div style="margin:0 auto 12px;font-size:16px;color:${GOLD};line-height:1;">
                ▲ ▲ ▲
              </div>

              <!-- Completion Statement & Distance Pill -->
              <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;">
                <tr>
                  <td valign="middle" style="font-size:15px;color:#3d362a;padding-right:10px;font-weight:500;">
                    for successfully completing the
                  </td>
                  <td valign="middle">
                    <div style="background-color:${DARK_GREEN};border:1.5px solid ${GOLD};border-radius:24px;padding:6px 18px;display:inline-block;box-shadow:0 2px 8px rgba(13,56,41,0.2);">
                      <span style="font-size:15px;font-weight:900;color:#ffffff;letter-spacing:0.06em;">${escapeHtml(data.distance)}</span>
                    </div>
                  </td>
                  <td valign="middle" style="padding-left:10px;font-size:14px;color:${GOLD};">
                    🌿
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ══════ 4-COLUMN STATS CARD (MATCHING REFERENCE IMAGE) ══════ -->
          <tr>
            <td class="cert-padding" style="padding:16px 32px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border:2px solid ${BORDER_COLOR};border-radius:16px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.05);">
                <tr>
                  <!-- 1. Distance -->
                  <td class="stat-grid-cell" width="25%" align="center" valign="middle" style="padding:16px 8px;border-right:1px solid ${BORDER_COLOR};">
                    <div style="font-size:22px;margin-bottom:4px;">🏔️</div>
                    <p style="margin:0;font-size:9px;font-weight:900;letter-spacing:0.18em;text-transform:uppercase;color:${MUTED};">DISTANCE</p>
                    <p style="margin:6px 0 0;font-size:16px;font-weight:900;color:${DARK_GREEN};">${escapeHtml(data.distance)}</p>
                  </td>

                  <!-- 2. Completion Time -->
                  <td class="stat-grid-cell" width="25%" align="center" valign="middle" style="padding:16px 8px;border-right:1px solid ${BORDER_COLOR};">
                    <div style="font-size:22px;margin-bottom:4px;">⏱️</div>
                    <p style="margin:0;font-size:9px;font-weight:900;letter-spacing:0.18em;text-transform:uppercase;color:${MUTED};">COMPLETION TIME</p>
                    <p style="margin:6px 0 0;font-size:15px;font-weight:900;color:${DARK_GREEN};font-family:Consolas,monospace;">${escapeHtml(data.finishTimeLabel)}</p>
                  </td>

                  <!-- 3. Activity Date -->
                  <td class="stat-grid-cell" width="25%" align="center" valign="middle" style="padding:16px 8px;border-right:1px solid ${BORDER_COLOR};">
                    <div style="font-size:22px;margin-bottom:4px;">📅</div>
                    <p style="margin:0;font-size:9px;font-weight:900;letter-spacing:0.18em;text-transform:uppercase;color:${MUTED};">ACTIVITY DATE</p>
                    <p style="margin:6px 0 0;font-size:14px;font-weight:800;color:${DARK_GREEN};">${escapeHtml(data.issuedAtLabel)}</p>
                  </td>

                  <!-- 4. Event -->
                  <td class="stat-grid-cell stat-grid-cell-last" width="25%" align="center" valign="middle" style="padding:16px 8px;">
                    <div style="font-size:22px;margin-bottom:4px;">🏅</div>
                    <p style="margin:0;font-size:9px;font-weight:900;letter-spacing:0.18em;text-transform:uppercase;color:${MUTED};">EVENT</p>
                    <p style="margin:6px 0 0;font-size:12px;font-weight:900;color:#c9a227;line-height:1.2;text-transform:uppercase;">${escapeHtml(data.eventTitle)}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ══════ SIGNATURES & 3D WAX SEAL SECTION ══════ -->
          <tr>
            <td class="cert-padding" style="padding:14px 32px 18px;background:linear-gradient(180deg, ${CREAM} 0%, #f4ede1 100%);">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <!-- Left: Organizer Signature -->
                  <td class="sign-col" width="30%" align="center" valign="bottom">
                    <p style="margin:0;font-family:'Dancing Script', cursive;font-size:22px;color:${DARK_GREEN};font-weight:700;">Mountain Run Team</p>
                    <div style="height:1.5px;background:${GOLD};margin:6px auto 4px;width:130px;"></div>
                    <p style="margin:0;font-size:9px;font-weight:900;letter-spacing:0.16em;text-transform:uppercase;color:${DARK_GREEN};">MOUNTAIN RUN TEAM</p>
                    <p style="margin:2px 0 0;font-size:8px;color:${MUTED};text-transform:uppercase;">Organizer</p>
                  </td>

                  <!-- Center: Grand 3D Gold & Emerald Seal + Ribbon -->
                  <td class="sign-col" width="40%" align="center" valign="middle">
                    <div style="display:inline-block;width:96px;height:96px;border-radius:50%;background:linear-gradient(135deg, ${DARK_GREEN} 0%, #082118 100%);border:3px solid ${GOLD};box-shadow:0 6px 18px rgba(0,0,0,0.25);text-align:center;padding-top:12px;box-sizing:border-box;">
                      <p style="margin:0;font-size:8px;font-weight:900;letter-spacing:0.15em;text-transform:uppercase;color:#ffffff;">MOUNTAIN RUN</p>
                      <div style="font-size:16px;line-height:1;margin:4px 0 2px;">⛰️</div>
                      <p style="margin:0;font-size:7px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${BRIGHT_GOLD};">RUN YOUR PRIDE</p>
                      <p style="margin:2px 0 0;font-size:11px;color:${BRIGHT_GOLD};line-height:1;">★★★</p>
                    </div>
                  </td>

                  <!-- Right: Keep Running Signature -->
                  <td class="sign-col" width="30%" align="center" valign="bottom">
                    <p style="margin:0;font-family:'Dancing Script', cursive;font-size:22px;color:${DARK_GREEN};font-weight:700;">Keep Running</p>
                    <div style="height:1.5px;background:${GOLD};margin:6px auto 4px;width:130px;"></div>
                    <p style="margin:0;font-size:8.5px;font-weight:900;letter-spacing:0.12em;text-transform:uppercase;color:${DARK_GREEN};">KEEP RUNNING, KEEP INSPIRING</p>
                    <p style="margin:2px 0 0;font-size:8px;color:${MUTED};">Every Finish Has a Story ♥</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ══════ QR CODE & VERIFICATION CTA ══════ -->
          <tr>
            <td style="padding:14px 28px 20px;text-align:center;background:#f4ede1;">
              <!-- QR Code Container -->
              <table cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 14px;">
                <tr>
                  <td align="center" style="background:#ffffff;padding:8px;border-radius:12px;border:1.5px solid ${BORDER_COLOR};box-shadow:0 4px 12px rgba(0,0,0,0.06);">
                    <img src="${qrImgUrl}" alt="Certificate QR" width="80" height="80" style="display:block;border-radius:6px;" />
                    <p style="margin:4px 0 0;font-size:8px;font-weight:900;letter-spacing:0.12em;text-transform:uppercase;color:${DARK_GREEN};">SCAN TO VERIFY</p>
                  </td>
                </tr>
              </table>

              <!-- Grand CTA Button -->
              <a href="${escapeHtml(data.verifyUrl)}"
                 style="display:inline-block;background:linear-gradient(135deg, ${DARK_GREEN} 0%, ${ACCENT_GREEN} 100%);color:#ffffff;text-decoration:none;padding:15px 38px;border-radius:50px;font-size:14px;font-weight:900;letter-spacing:0.08em;border:2px solid ${GOLD};box-shadow:0 6px 20px rgba(13,56,41,0.32);">
                🏆 &nbsp;VIEW &amp; DOWNLOAD E-CERTIFICATE
              </a>

              <p style="margin:12px 0 0;font-size:11px;font-family:Consolas, monospace;color:${MUTED};">
                CERTIFICATE NO: <strong style="color:${DARK_GREEN};">${escapeHtml(data.certificateNumber)}</strong> &nbsp;•&nbsp; BIB: <strong style="color:${DARK_GREEN};">${escapeHtml(data.bibNumber)}</strong>
              </p>
            </td>
          </tr>

          <!-- ══════ MEDAL & DISPATCH NOTICE CALLOUT ══════ -->
          <tr>
            <td style="padding:0 24px 24px;background:#f4ede1;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(135deg, ${DARK_GREEN} 0%, #082118 100%);border:2px solid ${GOLD};border-radius:14px;overflow:hidden;box-shadow:0 6px 20px rgba(13,56,41,0.25);">
                <tr>
                  <td style="padding:18px 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <!-- Medal Icon -->
                        <td width="48" valign="middle" align="center" style="font-size:32px;line-height:1;padding-right:12px;">
                          🏅
                        </td>
                        <!-- Text Description -->
                        <td valign="middle" align="left">
                          <p style="margin:0;font-size:13px;font-weight:900;letter-spacing:0.08em;text-transform:uppercase;color:${BRIGHT_GOLD};line-height:1.2;">
                            FINISHER MEDAL &amp; GOODIES UPDATE
                          </p>
                          <p style="margin:4px 0 0;font-size:12px;color:#fdfaf3;line-height:1.5;">
                            Your official engraved physical finisher medal is being prepared! <strong>You will receive your Courier Tracking ID (Delhivery / DTDC) via email in a few days</strong> as soon as your package is dispatched.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ══════ FOOTER LEGAL DISCLAIMER ══════ -->
          <tr>
            <td style="background:${DARK_GREEN};padding:18px 24px;text-align:center;">
              <p style="margin:0 0 6px;font-size:9px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.8);">
                THIS IS AN OFFICIAL VERIFIED DIGITAL E-CERTIFICATE ISSUED BY MOUNTAIN RUN.
              </p>
              <p style="margin:0;font-size:9px;color:rgba(255,255,255,0.45);line-height:1.6;">
                © ${new Date().getFullYear()} Mountain Run India. All rights reserved.<br/>
                Verify authenticity anytime at <a href="${escapeHtml(data.verifyUrl)}" style="color:${BRIGHT_GOLD};text-decoration:none;">${escapeHtml(data.verifyUrl)}</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Dedicated, premium Gandhi Jayanti Victory Run 2026 Certificate email template */
export function buildGandhiJayantiCertificateEmailHtml(data: CertificateRenderData) {
  const DARK_GREEN = "#0d3829";
  const ACCENT_GREEN = "#134e3a";
  const GOLD = "#c9a227";
  const BRIGHT_GOLD = "#e5b83b";
  const CREAM = "#fcfbf7";
  const WARM_PARCHMENT = "#faf6ee";
  const MUTED = "#7a6e5a";
  const BORDER_COLOR = "#d9cdb0";
  const SAFFRON = "#e67300";
  const INDIAN_GREEN = "#138808";
  const NAVY = "#000080";
  const qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&margin=0&color=0d3829&bgcolor=fcfaf5&data=${encodeURIComponent(data.verifyUrl)}`;
  const gandhiPortraitUrl = "https://res.cloudinary.com/yppcqzt6/image/upload/v1790852436/mountainrun/certificates/gandhi_portrait_certificate_art.jpg";
  const skylineUrl = "https://res.cloudinary.com/yppcqzt6/image/upload/v1790852524/mountainrun/certificates/india_skyline_certificate_art.jpg";

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Gandhi Jayanti Victory Run 2026 — Certificate of Participation</title>
  <style type="text/css">
    @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Cinzel:wght@700;900&family=Plus+Jakarta+Sans:wght@400;600;700;800;900&display=swap');
    
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; background-color: #e9e4d8; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table { border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    
    @media only screen and (max-width: 640px) {
      .email-container { width: 100% !important; max-width: 100% !important; border-radius: 12px !important; }
      .cert-padding { padding: 16px 14px !important; }
      .runner-name { font-size: 32px !important; line-height: 1.2 !important; }
      .stat-grid-cell { display: block !important; width: 100% !important; border-right: none !important; border-bottom: 1px solid ${BORDER_COLOR} !important; padding: 10px 6px !important; }
      .stat-grid-cell-last { border-bottom: none !important; }
      .portrait-col { display: block !important; width: 100% !important; text-align: center !important; margin-bottom: 12px !important; }
      .content-col { display: block !important; width: 100% !important; text-align: center !important; }
      .sign-col { display: block !important; width: 100% !important; text-align: center !important; margin-bottom: 14px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#e9e4d8;">

  <!-- Preheader text -->
  <div style="display:none;font-size:1px;color:#e9e4d8;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    Official Certificate of Participation for ${escapeHtml(data.runnerName)} — Gandhi Jayanti Victory Run 2026 (${escapeHtml(data.distance)}). Verified Finisher Credential.
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#e9e4d8;padding:24px 8px;">
    <tr>
      <td align="center">
        <!-- Main Certificate Container -->
        <table class="email-container" width="660" cellpadding="0" cellspacing="0" border="0" style="max-width:660px;width:100%;background-color:${CREAM};border-radius:20px;overflow:hidden;box-shadow:0 18px 50px rgba(13,56,41,0.24);border:3px solid ${GOLD};">

          <!-- ══════ TOP TRICOLOR RIBBON BAND ══════ -->
          <tr>
            <td style="padding:0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="33.3%" height="5" style="background:#FF9933;"></td>
                  <td width="33.4%" height="5" style="background:#ffffff;"></td>
                  <td width="33.3%" height="5" style="background:#138808;"></td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ══════ HEADER: TRICOLOR EMBLEM + MOUNTAIN RUN + NATIONAL FITNESS ══════ -->
          <tr>
            <td style="padding:16px 24px 10px;background:linear-gradient(180deg, #f7f3e8 0%, ${CREAM} 100%);border-bottom:1px solid ${BORDER_COLOR};">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <!-- Left: Indian Tricolor with Ashoka Chakra -->
                  <td width="30%" align="left" valign="middle">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <!-- Ashoka Chakra SVG Circle -->
                        <td valign="middle" style="padding-right:8px;">
                          <div style="width:34px;height:34px;border-radius:50%;border:2px solid ${NAVY};display:inline-block;text-align:center;line-height:30px;font-size:16px;color:${NAVY};background:#ffffff;box-shadow:0 2px 6px rgba(0,0,128,0.15);">
                            ☸
                          </div>
                        </td>
                        <td valign="middle">
                          <p style="margin:0;font-size:10px;font-weight:900;letter-spacing:0.12em;text-transform:uppercase;color:${SAFFRON};line-height:1.2;">NATIONAL</p>
                          <p style="margin:0;font-size:9px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:${INDIAN_GREEN};line-height:1.2;">TRIBUTE RUN</p>
                        </td>
                      </tr>
                    </table>
                  </td>

                  <!-- Center: Mountain Run Logo Crest -->
                  <td width="40%" align="center" valign="middle">
                    <div style="text-align:center;">
                      <div style="font-size:26px;line-height:1;margin-bottom:3px;">⛰️</div>
                      <p style="margin:0;font-size:20px;font-weight:900;letter-spacing:0.16em;text-transform:uppercase;color:${DARK_GREEN};font-family:'Cinzel', Georgia, serif;line-height:1.1;">
                        MOUNTAIN <span style="color:#d97706;">RUN</span>
                      </p>
                      <p style="margin:2px 0 0;font-size:8px;font-weight:800;letter-spacing:0.25em;text-transform:uppercase;color:${MUTED};">
                        RUN • RIDE • WALK • EXPLORE
                      </p>
                    </div>
                  </td>

                  <!-- Right: Fit India Tag -->
                  <td width="30%" align="right" valign="middle">
                    <div style="text-align:right;">
                      <p style="margin:0;font-size:8px;font-weight:900;letter-spacing:0.18em;text-transform:uppercase;color:${DARK_GREEN};line-height:1.3;">
                        FIT INDIA
                      </p>
                      <p style="margin:0;font-size:7.5px;font-weight:800;letter-spacing:0.14em;text-transform:uppercase;color:${GOLD};line-height:1.3;">
                        HEALTHY INDIA
                      </p>
                      <p style="margin:0;font-size:7px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${MUTED};line-height:1.3;">
                        STRONGER TOMORROW
                      </p>
                      <div style="height:2px;background:linear-gradient(90deg, transparent, ${GOLD});margin-top:3px;width:70px;display:inline-block;"></div>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ══════ MAIN HERO: GANDHI PORTRAIT + CERTIFICATE PRESENTATION ══════ -->
          <tr>
            <td class="cert-padding" style="padding:22px 28px 12px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <!-- Left: Mahatma Gandhi Artistic Portrait -->
                  <td class="portrait-col" width="34%" align="center" valign="middle" style="padding-right:16px;">
                    <div style="display:inline-block;padding:4px;background:#ffffff;border:2px solid ${GOLD};border-radius:16px;box-shadow:0 6px 18px rgba(0,0,0,0.1);">
                      <img src="${gandhiPortraitUrl}"
                           alt="Mahatma Gandhi Tribute"
                           width="180"
                           style="display:block;border-radius:12px;width:100%;max-width:180px;height:auto;" />
                    </div>
                    <div style="margin-top:8px;text-align:center;">
                      <p style="margin:0;font-size:9px;font-weight:900;letter-spacing:0.18em;text-transform:uppercase;color:${DARK_GREEN};">MAHATMA GANDHI</p>
                      <p style="margin:2px 0 0;font-size:8px;color:${MUTED};font-style:italic;">1869 – 1948 • Father of the Nation</p>
                    </div>
                  </td>

                  <!-- Right: Certificate Details -->
                  <td class="content-col" width="66%" align="center" valign="middle">
                    <h1 style="margin:0;font-size:28px;font-weight:900;letter-spacing:0.14em;text-transform:uppercase;color:${DARK_GREEN};font-family:'Cinzel', Georgia, serif;line-height:1.15;">
                      CERTIFICATE
                    </h1>
                    <p style="margin:4px 0 0;font-size:11px;font-weight:800;letter-spacing:0.3em;text-transform:uppercase;color:${GOLD};">
                      — OF PARTICIPATION —
                    </p>

                    <p style="margin:14px 0 6px;font-size:10px;font-weight:800;letter-spacing:0.25em;text-transform:uppercase;color:${MUTED};">
                      PROUDLY PRESENTED TO
                    </p>

                    <!-- Runner Name in Cursive Calligraphy -->
                    <div style="margin:4px auto 10px;display:inline-block;padding:2px 24px;border-top:2px solid ${GOLD};border-bottom:2px solid ${GOLD};">
                      <p class="runner-name" style="margin:0;font-size:42px;font-family:'Dancing Script', 'Brush Script MT', 'Great Vibes', cursive;color:${DARK_GREEN};font-weight:700;line-height:1.2;text-shadow:0 1px 2px rgba(0,0,0,0.08);">
                        ${escapeHtml(data.runnerName)}
                      </p>
                    </div>

                    <p style="margin:6px 0 2px;font-size:12px;color:#3d362a;font-weight:500;">
                      for successfully completing the
                    </p>

                    <p style="margin:0 0 2px;font-size:16px;font-weight:900;color:${SAFFRON};letter-spacing:0.04em;text-transform:uppercase;font-family:Georgia, serif;">
                      GANDHI JAYANTI RUN 2026
                    </p>
                    <p style="margin:0;font-size:11px;font-weight:700;color:${DARK_GREEN};">
                      Run for Peace &bull; Run for a Healthier India
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ══════ 3-COLUMN NON-OVERLAPPING STATS CARDS ══════ -->
          <tr>
            <td class="cert-padding" style="padding:14px 28px 18px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;border:2px solid ${BORDER_COLOR};border-radius:14px;overflow:hidden;box-shadow:0 4px 14px rgba(0,0,0,0.06);">
                <tr>
                  <!-- 1. Distance -->
                  <td class="stat-grid-cell" width="33.3%" align="center" valign="middle" style="padding:14px 8px;border-right:1px solid ${BORDER_COLOR};">
                    <div style="font-size:22px;margin-bottom:3px;">👟</div>
                    <p style="margin:0;font-size:9px;font-weight:900;letter-spacing:0.18em;text-transform:uppercase;color:${MUTED};">DISTANCE</p>
                    <p style="margin:4px 0 0;font-size:16px;font-weight:900;color:${DARK_GREEN};">${escapeHtml(data.distance)}</p>
                  </td>

                  <!-- 2. Completion Time -->
                  <td class="stat-grid-cell" width="33.4%" align="center" valign="middle" style="padding:14px 8px;border-right:1px solid ${BORDER_COLOR};">
                    <div style="font-size:22px;margin-bottom:3px;">⏱️</div>
                    <p style="margin:0;font-size:9px;font-weight:900;letter-spacing:0.18em;text-transform:uppercase;color:${MUTED};">TIME</p>
                    <p style="margin:4px 0 0;font-size:15px;font-weight:900;color:${DARK_GREEN};font-family:Consolas,monospace;">${escapeHtml(data.finishTimeLabel)}</p>
                  </td>

                  <!-- 3. Event Dates -->
                  <td class="stat-grid-cell stat-grid-cell-last" width="33.3%" align="center" valign="middle" style="padding:14px 8px;">
                    <div style="font-size:22px;margin-bottom:3px;">📅</div>
                    <p style="margin:0;font-size:9px;font-weight:900;letter-spacing:0.18em;text-transform:uppercase;color:${MUTED};">EVENT DATES</p>
                    <p style="margin:4px 0 0;font-size:13px;font-weight:800;color:${DARK_GREEN};">2 Oct – 6 Oct 2026</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ══════ INSPIRING PLEDGE & MOTTO ══════ -->
          <tr>
            <td style="padding:0 28px 14px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#554c3d;line-height:1.6;font-style:italic;">
                &ldquo;Thank you for being a part of this initiative and supporting a fitter, healthier and more active India.&rdquo;
              </p>
              <div style="margin:8px auto 0;height:1px;width:160px;background:linear-gradient(90deg, transparent, ${GOLD}, transparent);"></div>
            </td>
          </tr>

          <!-- ══════ MONUMENT SKYLINE ARTWORK BANNER ══════ -->
          <tr>
            <td style="padding:0 20px 14px;">
              <div style="border-radius:12px;overflow:hidden;border:1.5px solid ${BORDER_COLOR};box-shadow:0 4px 12px rgba(0,0,0,0.06);background:#ffffff;">
                <img src="${skylineUrl}"
                     alt="India Gate, Red Fort & Runners Skyline"
                     width="620"
                     style="display:block;width:100%;height:auto;max-height:140px;object-fit:cover;" />
              </div>
            </td>
          </tr>

          <!-- ══════ VERIFICATION QR, CATEGORY BADGES & SIGNATURE ══════ -->
          <tr>
            <td class="cert-padding" style="padding:14px 28px 18px;background:linear-gradient(180deg, ${CREAM} 0%, #f4ede1 100%);border-top:1px solid ${BORDER_COLOR};">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <!-- Left: QR Code Verification -->
                  <td class="sign-col" width="30%" align="center" valign="middle">
                    <table cellpadding="0" cellspacing="0" border="0" style="margin:0 auto;">
                      <tr>
                        <td align="center" style="background:#ffffff;padding:6px;border-radius:10px;border:1.5px solid ${BORDER_COLOR};box-shadow:0 2px 8px rgba(0,0,0,0.06);">
                          <img src="${qrImgUrl}" alt="Verify QR" width="68" height="68" style="display:block;border-radius:4px;" />
                        </td>
                      </tr>
                    </table>
                    <p style="margin:5px 0 0;font-size:8px;font-weight:900;letter-spacing:0.12em;text-transform:uppercase;color:${DARK_GREEN};">VERIFY CERTIFICATE</p>
                    <p style="margin:1px 0 0;font-size:7px;color:${MUTED};">Scan to verify authenticity</p>
                  </td>

                  <!-- Center: Category Badges (Running, Cycling, Walking) -->
                  <td class="sign-col" width="40%" align="center" valign="middle">
                    <p style="margin:0 0 6px;font-size:8px;font-weight:900;letter-spacing:0.15em;text-transform:uppercase;color:${MUTED};">OFFICIAL DISCIPLINES</p>
                    <table cellpadding="0" cellspacing="0" border="0" align="center">
                      <tr>
                        <td style="padding:0 4px;text-align:center;">
                          <div style="width:34px;height:34px;border-radius:50%;background:${DARK_GREEN};color:#ffffff;line-height:34px;font-size:16px;border:1.5px solid ${GOLD};">🏃</div>
                          <p style="margin:3px 0 0;font-size:7px;font-weight:800;color:${DARK_GREEN};">RUNNING</p>
                        </td>
                        <td style="padding:0 4px;text-align:center;">
                          <div style="width:34px;height:34px;border-radius:50%;background:${DARK_GREEN};color:#ffffff;line-height:34px;font-size:16px;border:1.5px solid ${GOLD};">🚴</div>
                          <p style="margin:3px 0 0;font-size:7px;font-weight:800;color:${DARK_GREEN};">CYCLING</p>
                        </td>
                        <td style="padding:0 4px;text-align:center;">
                          <div style="width:34px;height:34px;border-radius:50%;background:${DARK_GREEN};color:#ffffff;line-height:34px;font-size:16px;border:1.5px solid ${GOLD};">🚶</div>
                          <p style="margin:3px 0 0;font-size:7px;font-weight:800;color:${DARK_GREEN};">WALKING</p>
                        </td>
                      </tr>
                    </table>
                  </td>

                  <!-- Right: Organizer Signature -->
                  <td class="sign-col" width="30%" align="center" valign="middle">
                    <p style="margin:0;font-family:'Dancing Script', cursive;font-size:24px;color:${DARK_GREEN};font-weight:700;">Mountain Run</p>
                    <div style="height:1.5px;background:${GOLD};margin:4px auto;width:110px;"></div>
                    <p style="margin:0;font-size:8.5px;font-weight:900;letter-spacing:0.14em;text-transform:uppercase;color:${DARK_GREEN};">TEAM MOUNTAIN RUN</p>
                    <p style="margin:2px 0 0;font-size:7.5px;color:${MUTED};">Organizer &bull; mountainrun.in</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ══════ CTA BUTTON & CREDENTIAL ID ══════ -->
          <tr>
            <td style="padding:16px 24px 18px;text-align:center;background:#f4ede1;border-top:1px solid ${BORDER_COLOR};">
              <a href="${escapeHtml(data.verifyUrl)}"
                 style="display:inline-block;background:linear-gradient(135deg, ${DARK_GREEN} 0%, ${ACCENT_GREEN} 100%);color:#ffffff;text-decoration:none;padding:14px 34px;border-radius:50px;font-size:13px;font-weight:900;letter-spacing:0.08em;border:2px solid ${GOLD};box-shadow:0 6px 20px rgba(13,56,41,0.32);">
                🏆 &nbsp;VIEW &amp; DOWNLOAD HIGH-RES E-CERTIFICATE
              </a>

              <p style="margin:10px 0 0;font-size:10px;font-family:Consolas, monospace;color:${MUTED};">
                CERTIFICATE ID: <strong style="color:${DARK_GREEN};">${escapeHtml(data.certificateNumber)}</strong> &nbsp;&bull;&nbsp; BIB: <strong style="color:${DARK_GREEN};">${escapeHtml(data.bibNumber)}</strong>
              </p>
            </td>
          </tr>

          <!-- ══════ HEAVYWEIGHT 3D GANDHI MEDAL DISPATCH UPDATE ══════ -->
          <tr>
            <td style="padding:0 20px 20px;background:#f4ede1;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:linear-gradient(135deg, ${DARK_GREEN} 0%, #061c14 100%);border:2px solid ${GOLD};border-radius:12px;overflow:hidden;box-shadow:0 6px 18px rgba(13,56,41,0.25);">
                <tr>
                  <td style="padding:14px 18px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td width="42" valign="middle" align="center" style="font-size:28px;line-height:1;padding-right:10px;">
                          🏅
                        </td>
                        <td valign="middle" align="left">
                          <p style="margin:0;font-size:11px;font-weight:900;letter-spacing:0.08em;text-transform:uppercase;color:${BRIGHT_GOLD};line-height:1.2;">
                            ANTIQUE BRONZE FINISHER MEDAL &bull; FREE DOORSTEP DELIVERY
                          </p>
                          <p style="margin:3px 0 0;font-size:11px;color:#fdfaf3;line-height:1.4;">
                            Your heavy 3D antique bronze finisher medal with custom tricolor ribbon is being prepared. Tracking ID will be emailed upon dispatch!
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ══════ FOOTER COPYRIGHT & TRICOLOR STRIP ══════ -->
          <tr>
            <td style="background:${DARK_GREEN};padding:14px 20px;text-align:center;">
              <p style="margin:0 0 4px;font-size:8.5px;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.85);">
                OFFICIAL VERIFIED DIGITAL CREDENTIAL &bull; MOUNTAIN RUN INDIA
              </p>
              <p style="margin:0;font-size:8px;color:rgba(255,255,255,0.45);line-height:1.5;">
                &copy; 2026 Mountain Run. All rights reserved. &bull; <a href="${escapeHtml(data.verifyUrl)}" style="color:${BRIGHT_GOLD};text-decoration:none;">mountainrun.in</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="33.3%" height="4" style="background:#FF9933;"></td>
                  <td width="33.4%" height="4" style="background:#ffffff;"></td>
                  <td width="33.3%" height="4" style="background:#138808;"></td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

