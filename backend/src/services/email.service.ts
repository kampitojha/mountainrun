import { Resend } from "resend";
import { env } from "../config/env.js";
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
  return `
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #151512;">
      <h1 style="font-size: 22px; margin-bottom: 8px;">Registration confirmed</h1>
      <p style="color: #555;">Hi ${payload.runnerName},</p>
      <p>Your Mountain Run registration is confirmed. Payment received successfully.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
          <td style="padding: 8px 0; color: #666;">Event</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 600;">${payload.eventTitle}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">Distance</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 600;">${payload.distance}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">Bib number</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 600;">${payload.bibNumber}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;">Amount paid</td>
          <td style="padding: 8px 0; text-align: right; font-weight: 600;">${formatRupees(payload.amountInPaise)}</td>
        </tr>
      </table>
      <p style="color: #555;">Upload your GPS proof after the run to appear on the leaderboard and receive your certificate.</p>
      <p style="margin-top: 24px;">— Mountain Run Team</p>
    </div>
  `;
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
    console.info("[email] Would send:", {
      to: payload.to,
      bibNumber: payload.bibNumber,
      eventTitle: payload.eventTitle,
    });
    return { sent: false, error: "RESEND_API_KEY is not configured" };
  }

  try {
    const result = await resend.emails.send({
      from: env.resendFromEmail,
      to: payload.to,
      subject: `Mountain Run confirmed — Bib ${payload.bibNumber}`,
      html: buildConfirmationHtml(payload),
    });

    if (result.error) {
      console.error("[email] Resend error:", result.error);
      return { sent: false, error: result.error.message };
    }

    console.info("[email] Confirmation sent:", result.data?.id, "to", payload.to);
    return { sent: true, id: result.data?.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown email error";
    console.error("[email] Failed to send confirmation:", message);
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
    console.info("[email] Would send certificate:", {
      to: input.to,
      certificateNumber: input.data.certificateNumber,
      verifyUrl: input.data.verifyUrl,
    });
    return { sent: false, error: "RESEND_API_KEY is not configured" };
  }

  try {
    const result = await resend.emails.send({
      from: env.resendFromEmail,
      to: input.to,
      subject: `Your Mountain Run certificate — ${input.data.eventTitle}`,
      html: buildCertificateEmailHtml(input.data),
    });

    if (result.error) {
      console.error("[email] Certificate Resend error:", result.error);
      return { sent: false, error: result.error.message };
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
    return { sent: false, error: message };
  }
}
