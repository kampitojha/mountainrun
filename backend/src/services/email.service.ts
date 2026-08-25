import { Resend } from "resend";
import { env } from "../config/env.js";
import { sendTelegramAlert } from "./alert.service.js";
import {
  buildCertificateEmailHtml,
  type CertificateRenderData,
} from "./certificate.service.js";

const resend = env.resendApiKey ? new Resend(env.resendApiKey) : null;

export type RegistrationEmailPayload = {
  to: string;
  runnerName: string;
  eventTitle: string;
  distance: string;
  bibNumber: string;
  amountInPaise: number;
};

function formatRupees(amountInPaise: number) {
  return `Rs. ${(amountInPaise / 100).toFixed(0)}`;
}

function buildConfirmationHtml(payload: RegistrationEmailPayload) {
  const DARK_GREEN = "#1a3a2e";
  const GOLD = "#c9a227";
  const CREAM = "#fefcf7";
  const MUTED = "#8a7a5a";
  const LINE = "#e8dfc8";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Registration Confirmed — Mountain Run</title>
</head>
<body style="margin:0;padding:0;background:#f0ede5;font-family:Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    Registration confirmed! Welcome to Mountain Run, ${payload.runnerName}. Your Bib is ready. 🏃
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f0ede5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:${DARK_GREEN};border-radius:16px 16px 0 0;overflow:hidden;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="33.3%" height="4" style="background:#FF9933;"></td>
                  <td width="33.4%" height="4" style="background:#ffffff;"></td>
                  <td width="33.3%" height="4" style="background:#138808;"></td>
                </tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:28px 32px 20px;text-align:center;">
                    <div style="display:inline-block;background:rgba(255,255,255,0.08);border:1px solid rgba(201,162,39,0.4);border-radius:50px;padding:6px 20px;margin-bottom:10px;">
                      <span style="font-size:11px;font-weight:700;letter-spacing:0.25em;text-transform:uppercase;color:${GOLD};">⛰️ MOUNTAIN RUN</span>
                    </div>
                    <p style="margin:0;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.5);">Run Anywhere, Anytime</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body card -->
          <tr>
            <td style="background:${CREAM};border-left:1px solid ${LINE};border-right:1px solid ${LINE};padding:0;">
              <div style="height:2px;background:linear-gradient(90deg,transparent,${GOLD},transparent);"></div>

              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:36px 40px 20px;text-align:center;">
                    <p style="margin:0 0 4px;font-size:28px;">🎉</p>
                    <h1 style="margin:0 0 6px;font-size:26px;font-weight:800;color:${DARK_GREEN};font-family:Georgia,serif;">
                      Registration Confirmed!
                    </h1>
                    <p style="margin:0 0 20px;font-size:13px;letter-spacing:0.15em;text-transform:uppercase;color:${GOLD};">── You're officially in! ──</p>
                    <p style="margin:0;font-size:15px;color:#4a4a4a;line-height:1.7;">
                      Hi <strong style="color:${DARK_GREEN};">${payload.runnerName}</strong>,<br/>
                      Your Mountain Run registration is confirmed and payment has been received successfully.<br/>
                      We're thrilled to have you on board! 🏔️
                    </p>
                  </td>
                </tr>
              </table>

              <div style="height:1px;background:linear-gradient(90deg,transparent,${GOLD},transparent);margin:0 40px;"></div>

              <!-- Details -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:24px 40px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-radius:12px;overflow:hidden;border:1px solid ${LINE};">
                      <tr>
                        <td style="padding:14px 18px;background:#f8f4ec;border-bottom:1px solid ${LINE};width:40%;">
                          <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:${MUTED};">🏆 Event</p>
                        </td>
                        <td style="padding:14px 18px;background:#f8f4ec;border-bottom:1px solid ${LINE};">
                          <p style="margin:0;font-size:14px;font-weight:700;color:${DARK_GREEN};">${payload.eventTitle}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:14px 18px;background:#ffffff;border-bottom:1px solid ${LINE};">
                          <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:${MUTED};">🏃 Distance</p>
                        </td>
                        <td style="padding:14px 18px;background:#ffffff;border-bottom:1px solid ${LINE};">
                          <p style="margin:0;font-size:14px;font-weight:700;color:${DARK_GREEN};">${payload.distance}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:14px 18px;background:#f8f4ec;border-bottom:1px solid ${LINE};">
                          <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:${MUTED};">🏷️ Bib Number</p>
                        </td>
                        <td style="padding:14px 18px;background:#f8f4ec;border-bottom:1px solid ${LINE};">
                          <p style="margin:0;font-size:18px;font-weight:900;color:${DARK_GREEN};letter-spacing:0.05em;">${payload.bibNumber}</p>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:14px 18px;background:#ffffff;">
                          <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:${MUTED};">💳 Amount Paid</p>
                        </td>
                        <td style="padding:14px 18px;background:#ffffff;">
                          <p style="margin:0;font-size:14px;font-weight:700;color:${DARK_GREEN};">${formatRupees(payload.amountInPaise)}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <div style="height:1px;background:linear-gradient(90deg,transparent,${GOLD},transparent);margin:0 40px;"></div>

              <!-- Next step message -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:24px 40px;text-align:center;">
                    <p style="margin:0;font-size:14px;color:#4a4a4a;line-height:1.7;">
                      📸 After completing your run, upload your <strong style="color:${DARK_GREEN};">GPS proof</strong> from your dashboard.<br/>
                      Once approved, your official e-certificate will be emailed to you.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:${DARK_GREEN};border-radius:0 0 16px 16px;padding:0;">
              <div style="height:2px;background:linear-gradient(90deg,transparent,${GOLD},transparent);"></div>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:24px 32px;text-align:center;">
                    <p style="margin:0 0 4px;font-size:18px;color:rgba(255,255,255,0.9);font-family:Georgia,serif;font-style:italic;">
                      Keep Running, Keep Inspiring!
                    </p>
                    <p style="margin:0 0 16px;font-size:11px;color:${GOLD};letter-spacing:0.2em;text-transform:uppercase;">── Every Finish Has a Story ──</p>
                    <p style="margin:0 0 2px;font-size:13px;font-weight:700;color:#ffffff;">Mountain Run Team</p>
                    <p style="margin:0 0 16px;font-size:11px;color:rgba(255,255,255,0.4);">Organizer · mountainrun.in</p>
                    <table width="200" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;">
                      <tr>
                        <td width="66" height="3" style="background:#FF9933;border-radius:2px 0 0 2px;"></td>
                        <td width="68" height="3" style="background:#ffffff;"></td>
                        <td width="66" height="3" style="background:#138808;border-radius:0 2px 2px 0;"></td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="33.3%" height="4" style="background:#FF9933;border-radius:0 0 0 16px;"></td>
                  <td width="33.4%" height="4" style="background:#ffffff;"></td>
                  <td width="33.3%" height="4" style="background:#138808;border-radius:0 0 16px 0;"></td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Disclaimer -->
          <tr>
            <td style="padding:16px;text-align:center;">
              <p style="margin:0;font-size:10px;color:#94a3b8;line-height:1.5;">
                You're receiving this because you registered for a Mountain Run virtual event.<br/>
                © ${new Date().getFullYear()} Mountain Run. All rights reserved.
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


export type EmailSendResult = { sent: boolean; id?: string; error?: string };

export async function sendRegistrationConfirmationEmail(
  payload: RegistrationEmailPayload,
): Promise<EmailSendResult> {
  if (!resend) {
    console.warn(
      "[email] RESEND_API_KEY is not set. Skipping confirmation email to",
      payload.to,
    );
    void sendTelegramAlert({
      title: "Email Dispatcher Not Configured",
      level: "WARNING",
      service: "Email Service (Resend)",
      message: "RESEND_API_KEY is missing. Registration confirmation email was skipped.",
      details: {
        to: payload.to,
        runner: payload.runnerName,
        event: payload.eventTitle,
        bibNumber: payload.bibNumber,
      },
      link: `${env.frontendUrl}/admin/registrations`,
    });
    return { sent: false, error: "RESEND_API_KEY is not configured" };
  }

  try {
    const from = env.resendFromEmail;
    const result = await resend.emails.send({
      from,
      to: payload.to,
      subject: `Mountain Run confirmed — Bib ${payload.bibNumber}`,
      html: buildConfirmationHtml(payload),
    });

    if (result.error) {
      console.error("[email] Resend error:", result.error, { from });
      const errorMsg = `${result.error.message} (from: ${from})`;
      void sendTelegramAlert({
        title: "Registration Email Delivery Failed",
        level: "ERROR",
        service: "Resend Email",
        message: errorMsg,
        details: {
          to: payload.to,
          runner: payload.runnerName,
          event: payload.eventTitle,
          bibNumber: payload.bibNumber,
        },
        error: result.error,
        link: `${env.frontendUrl}/admin/registrations`,
      });
      return {
        sent: false,
        error: errorMsg,
      };
    }

    console.info("[email] Confirmation sent:", result.data?.id, "to", payload.to);
    return { sent: true, id: result.data?.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown email error";
    console.error("[email] Failed to send confirmation:", message);
    void sendTelegramAlert({
      title: "Registration Email Exception",
      level: "ERROR",
      service: "Resend Email",
      message,
      details: {
        to: payload.to,
        runner: payload.runnerName,
        event: payload.eventTitle,
        bibNumber: payload.bibNumber,
      },
      error,
      link: `${env.frontendUrl}/admin/registrations`,
    });
    return { sent: false, error: message };
  }
}

export async function sendCertificateEmail(input: {
  to: string;
  data: CertificateRenderData;
}): Promise<EmailSendResult> {
  if (!resend) {
    console.warn(
      "[email] RESEND_API_KEY is not set. Skipping certificate email to",
      input.to,
    );
    void sendTelegramAlert({
      title: "Email Dispatcher Not Configured",
      level: "WARNING",
      service: "Email Service (Resend)",
      message: "RESEND_API_KEY is missing. Certificate email was skipped.",
      details: {
        to: input.to,
        certificateNumber: input.data.certificateNumber,
        runner: input.data.runnerName,
        event: input.data.eventTitle,
      },
      link: `${env.frontendUrl}/admin/certificates`,
    });
    return { sent: false, error: "RESEND_API_KEY is not configured" };
  }

  try {
    const from = env.resendFromEmail;
    const result = await resend.emails.send({
      from,
      to: input.to,
      subject: `Your Mountain Run certificate — ${input.data.eventTitle}`,
      html: buildCertificateEmailHtml(input.data),
    });

    if (result.error) {
      console.error("[email] Certificate Resend error:", result.error, { from });
      const errorMsg = `${result.error.message} (from: ${from})`;
      void sendTelegramAlert({
        title: "Certificate Email Delivery Failed",
        level: "ERROR",
        service: "Resend Email",
        message: errorMsg,
        details: {
          to: input.to,
          certificateNumber: input.data.certificateNumber,
          runner: input.data.runnerName,
          event: input.data.eventTitle,
        },
        error: result.error,
        link: `${env.frontendUrl}/admin/certificates`,
      });
      return {
        sent: false,
        error: errorMsg,
      };
    }

    console.info(
      "[email] Certificate sent:",
      result.data?.id,
      "to",
      input.to,
      input.data.certificateNumber,
    );
    return { sent: true, id: result.data?.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown email error";
    console.error("[email] Failed to send certificate:", message);
    void sendTelegramAlert({
      title: "Certificate Email Exception",
      level: "ERROR",
      service: "Resend Email",
      message,
      details: {
        to: input.to,
        certificateNumber: input.data.certificateNumber,
        runner: input.data.runnerName,
        event: input.data.eventTitle,
      },
      error,
      link: `${env.frontendUrl}/admin/certificates`,
    });
    return { sent: false, error: message };
  }
}

export type MedalDispatchEmailPayload = {
  to: string;
  runnerName: string;
  eventTitle: string;
  distance: string;
  bibNumber: string;
  courier: string;
  trackingNumber: string;
  trackingUrl?: string;
  shippingLine1?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingPincode?: string;
};

export function buildMedalDispatchHtml(payload: MedalDispatchEmailPayload) {
  const DARK_GREEN = "#1a3a2e";
  const GOLD = "#c9a227";
  const CREAM = "#fcfaf5";
  const MUTED = "#8a7a5a";
  const LINE = "#e8dfc8";

  const trackingUrl =
    payload.trackingUrl ||
    `https://track.dtdc.com/ctrk-tracking/tracker?awbNo=${payload.trackingNumber}`;

  const addressDisplay = [
    payload.shippingLine1,
    payload.shippingCity,
    payload.shippingState ? `${payload.shippingState}${payload.shippingPincode ? ` - ${payload.shippingPincode}` : ""}` : payload.shippingPincode,
  ]
    .filter(Boolean)
    .join(", ");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Your Finisher Medal is on the Way! — Mountain Run</title>
</head>
<body style="margin:0;padding:0;background-color:#f0ede5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <div style="display:none;font-size:1px;color:#f0ede5;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    Great news ${payload.runnerName}! Your official finisher medal for ${payload.eventTitle} has been dispatched via ${payload.courier}. Tracking: ${payload.trackingNumber} 🏅
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0ede5;padding:32px 12px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:${CREAM};border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(26,58,46,0.12);border:1px solid ${LINE};">

          <!-- Header -->
          <tr>
            <td style="background-color:${DARK_GREEN};padding:0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="33.3%" height="4" style="background-color:#FF9933;"></td>
                  <td width="33.4%" height="4" style="background-color:#ffffff;"></td>
                  <td width="33.3%" height="4" style="background-color:#138808;"></td>
                </tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:28px 32px 22px;text-align:center;">
                    <div style="display:inline-block;background:rgba(255,255,255,0.08);border:1px solid rgba(201,162,39,0.4);border-radius:50px;padding:6px 20px;margin-bottom:8px;">
                      <span style="font-size:12px;font-weight:800;letter-spacing:0.22em;text-transform:uppercase;color:${GOLD};">⛰️ MOUNTAIN RUN</span>
                    </div>
                    <p style="margin:0;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:rgba(255,255,255,0.6);">Official Event Logistics · Dispatch Update</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Hero Greeting -->
          <tr>
            <td style="padding:36px 36px 20px;text-align:center;">
              <div style="display:inline-block;width:64px;height:64px;line-height:64px;background-color:#fbf6e8;border:2px solid ${GOLD};border-radius:50%;font-size:32px;margin-bottom:14px;">
                🏅
              </div>
              <h1 style="margin:0 0 6px;font-size:24px;font-weight:800;color:${DARK_GREEN};font-family:Georgia,serif;letter-spacing:-0.01em;">
                Your Finisher Medal is on the Way!
              </h1>
              <p style="margin:0 0 20px;font-size:12px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:${GOLD};">
                ── ${payload.eventTitle} ──
              </p>
              <p style="margin:0;font-size:15px;color:#444444;line-height:1.7;text-align:left;">
                Hi <strong style="color:${DARK_GREEN};">${payload.runnerName}</strong>,<br/><br/>
                Congratulations once again on your incredible spirit and achievement! We are delighted to inform you that your official physical <strong>Finisher Medal</strong> has been packed and handed over to our courier partner.
              </p>
            </td>
          </tr>

          <!-- Tracking Card -->
          <tr>
            <td style="padding:0 36px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border:1.5px solid ${LINE};border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.03);">
                <tr>
                  <td colspan="2" style="background-color:#f6f1e5;padding:12px 18px;border-bottom:1px solid ${LINE};">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="left">
                          <span style="font-size:11px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:${DARK_GREEN};">📦 Consignment Details</span>
                        </td>
                        <td align="right">
                          <span style="display:inline-block;background-color:#e6f4ea;color:#137333;font-size:10px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;padding:3px 10px;border-radius:20px;border:1px solid #b7e1cd;">
                            ● Dispatched
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding:14px 18px;border-bottom:1px solid #f0ede5;width:40%;background-color:#faf8f3;">
                    <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${MUTED};">Courier Partner</p>
                  </td>
                  <td style="padding:14px 18px;border-bottom:1px solid #f0ede5;background-color:#ffffff;">
                    <p style="margin:0;font-size:14px;font-weight:700;color:${DARK_GREEN};">${payload.courier}</p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:14px 18px;border-bottom:1px solid #f0ede5;background-color:#faf8f3;">
                    <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${MUTED};">Tracking / AWB No.</p>
                  </td>
                  <td style="padding:14px 18px;border-bottom:1px solid #f0ede5;background-color:#ffffff;">
                    <p style="margin:0;font-size:17px;font-weight:900;color:${DARK_GREEN};letter-spacing:0.08em;font-family:Consolas,Monaco,monospace;">
                      ${payload.trackingNumber}
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:14px 18px;border-bottom:1px solid #f0ede5;background-color:#faf8f3;">
                    <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${MUTED};">Bib Number</p>
                  </td>
                  <td style="padding:14px 18px;border-bottom:1px solid #f0ede5;background-color:#ffffff;">
                    <p style="margin:0;font-size:14px;font-weight:800;color:${DARK_GREEN};">${payload.bibNumber}</p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:14px 18px;background-color:#faf8f3;">
                    <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${MUTED};">Category / Distance</p>
                  </td>
                  <td style="padding:14px 18px;background-color:#ffffff;">
                    <p style="margin:0;font-size:14px;font-weight:700;color:${DARK_GREEN};">${payload.distance || "Finisher"}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding:0 36px 28px;text-align:center;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <a href="${trackingUrl}" target="_blank" style="display:inline-block;background-color:${DARK_GREEN};color:#ffffff;font-size:14px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;text-decoration:none;padding:15px 36px;border-radius:10px;box-shadow:0 6px 18px rgba(26,58,46,0.25);border:1px solid ${GOLD};">
                      🚚 Track Your Medal Live &rarr;
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top:10px;">
                    <p style="margin:0;font-size:11px;color:#777777;">
                      Direct Link: <a href="${trackingUrl}" target="_blank" style="color:${DARK_GREEN};font-weight:600;word-break:break-all;">${trackingUrl}</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${
            addressDisplay
              ? `<!-- Delivery Address -->
          <tr>
            <td style="padding:0 36px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#faf8f3;border:1px dashed ${LINE};border-radius:10px;padding:14px 18px;">
                <tr>
                  <td>
                    <p style="margin:0 0 4px;font-size:11px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:${MUTED};">📍 Shipping Address Provided</p>
                    <p style="margin:0;font-size:13px;color:#444444;line-height:1.5;">${addressDisplay}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`
              : ""
          }

          <!-- Delivery Guidelines -->
          <tr>
            <td style="padding:0 36px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border:1px solid #ebe5d8;border-radius:10px;padding:18px 20px;">
                <tr>
                  <td>
                    <p style="margin:0 0 10px;font-size:12px;font-weight:800;letter-spacing:0.05em;text-transform:uppercase;color:${DARK_GREEN};">
                      💡 Important Delivery Notes:
                    </p>
                    <ul style="margin:0;padding-left:18px;font-size:13px;color:#555555;line-height:1.7;">
                      <li><strong>Delivery Timeline:</strong> Typically arrives in <strong>4 to 7 working days</strong> depending on your location.</li>
                      <li><strong>Tracking Activation:</strong> Courier tracking status usually reflects active movement within 24 hours of scan.</li>
                      <li><strong>Courier Contact:</strong> Please ensure your registered contact number is reachable for the delivery agent.</li>
                    </ul>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:${DARK_GREEN};border-radius:0 0 16px 16px;padding:0;">
              <div style="height:2px;background:linear-gradient(90deg,transparent,${GOLD},transparent);"></div>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:26px 32px;text-align:center;">
                    <p style="margin:0 0 4px;font-size:17px;color:rgba(255,255,255,0.95);font-family:Georgia,serif;font-style:italic;">
                      Keep Running, Keep Inspiring!
                    </p>
                    <p style="margin:0 0 16px;font-size:10px;color:${GOLD};letter-spacing:0.2em;text-transform:uppercase;">
                      ── Every Finish Has a Story ──
                    </p>
                    <p style="margin:0 0 2px;font-size:13px;font-weight:700;color:#ffffff;">Mountain Run Team</p>
                    <p style="margin:0 0 16px;font-size:11px;color:rgba(255,255,255,0.5);">
                      Official Virtual Marathon Platform · <a href="https://mountainrun.in" target="_blank" style="color:${GOLD};text-decoration:none;">mountainrun.in</a>
                    </p>
                    <table width="180" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;">
                      <tr>
                        <td width="60" height="3" style="background-color:#FF9933;border-radius:2px 0 0 2px;"></td>
                        <td width="60" height="3" style="background-color:#ffffff;"></td>
                        <td width="60" height="3" style="background-color:#138808;border-radius:0 2px 2px 0;"></td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Disclaimer / Support -->
          <tr>
            <td style="padding:16px;text-align:center;">
              <p style="margin:0;font-size:10px;color:#94a3b8;line-height:1.6;">
                Need help with your shipment? Reach us at <a href="mailto:support@mountainrun.in" style="color:#64748b;text-decoration:underline;">support@mountainrun.in</a>.<br/>
                © ${new Date().getFullYear()} Mountain Run. All rights reserved.
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

export async function sendMedalDispatchEmail(
  payload: MedalDispatchEmailPayload,
): Promise<EmailSendResult> {
  if (!resend) {
    console.warn(
      "[email] RESEND_API_KEY is not set. Skipping medal dispatch email to",
      payload.to,
    );
    void sendTelegramAlert({
      title: "Email Dispatcher Not Configured",
      level: "WARNING",
      service: "Email Service (Resend)",
      message: "RESEND_API_KEY is missing. Medal dispatch email was skipped.",
      details: {
        to: payload.to,
        bibNumber: payload.bibNumber,
        runner: payload.runnerName,
        trackingNumber: payload.trackingNumber,
      },
      link: `${env.frontendUrl}/admin`,
    });
    return { sent: false, error: "RESEND_API_KEY is not configured" };
  }

  try {
    const from = env.resendFromEmail;
    const result = await resend.emails.send({
      from,
      to: payload.to,
      subject: `Your Finisher Medal is on the Way! 🏅 — ${payload.eventTitle}`,
      html: buildMedalDispatchHtml(payload),
    });

    if (result.error) {
      console.error("[email] Medal Dispatch Resend error:", result.error, { from });
      const errorMsg = `${result.error.message} (from: ${from})`;
      void sendTelegramAlert({
        title: "Medal Dispatch Email Delivery Failed",
        level: "ERROR",
        service: "Resend Email",
        message: errorMsg,
        details: {
          to: payload.to,
          bibNumber: payload.bibNumber,
          runner: payload.runnerName,
          trackingNumber: payload.trackingNumber,
        },
        error: result.error,
        link: `${env.frontendUrl}/admin`,
      });
      return { sent: false, error: errorMsg };
    }

    console.info("[email] Medal dispatch sent:", result.data?.id, "to", payload.to);
    return { sent: true, id: result.data?.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown email error";
    console.error("[email] Failed to send medal dispatch email:", message);
    return { sent: false, error: message };
  }
}
