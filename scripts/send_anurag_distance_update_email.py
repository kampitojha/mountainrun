import os
import sys
import json
import time
import datetime
import urllib.request
import urllib.error

# Setup UTF-8 for Windows console
if sys.platform.startswith("win"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

def get_backend_env():
    possible_paths = [
        os.path.join(os.getcwd(), "backend", ".env"),
        os.path.join(os.path.dirname(__file__), "..", "backend", ".env"),
        os.path.join(os.path.dirname(__file__), ".env"),
        os.path.join(os.getcwd(), ".env")
    ]
    env_vars = {}
    for p in possible_paths:
        if os.path.exists(p) and not os.path.isdir(p):
            with open(p, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        env_vars[k.strip()] = v.strip("\"'")
            break
    return env_vars

ENV = get_backend_env()
RESEND_API_KEY = ENV.get("RESEND_API_KEY")
RESEND_FROM = ENV.get("RESEND_FROM_EMAIL", "Mountain Run <onboarding@mountainrun.in>")

def build_email_html():
    DARK_GREEN = "#1a3a2e"
    GOLD = "#c9a227"
    CREAM = "#fcfaf5"
    MUTED = "#8a7a5a"
    LINE = "#e8dfc8"
    LIGHT_BG = "#f4f1ea"

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Distance Category Updated — Mountain Run</title>
</head>
<body style="margin:0;padding:0;background-color:#f0ede5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <div style="display:none;font-size:1px;color:#f0ede5;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    Hi Anurag! Your distance category for Rise and Run (BIB: RAR-937297) has been successfully updated to 5 KM.
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0ede5;padding:32px 12px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:{CREAM};border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(26,58,46,0.12);border:1px solid {LINE};">

          <!-- Header -->
          <tr>
            <td style="background-color:{DARK_GREEN};padding:0;">
              <!-- Tricolor ribbon -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="33.3%" height="4" style="background-color:#FF9933;"></td>
                  <td width="33.4%" height="4" style="background-color:#ffffff;"></td>
                  <td width="33.3%" height="4" style="background-color:#138808;"></td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:28px 32px 24px;text-align:center;">
                    <div style="display:inline-block;background:rgba(255,255,255,0.08);border:1px solid rgba(201,162,39,0.4);border-radius:50px;padding:6px 20px;margin-bottom:10px;">
                      <span style="font-size:11px;font-weight:700;letter-spacing:0.25em;text-transform:uppercase;color:{GOLD};">⛰️ MOUNTAIN RUN</span>
                    </div>
                    <h1 style="margin:0 0 6px;font-size:24px;font-weight:800;color:#ffffff;letter-spacing:-0.02em;">
                      Distance Category Updated
                    </h1>
                    <p style="margin:0;font-size:12px;letter-spacing:0.15em;text-transform:uppercase;color:rgba(255,255,255,0.65);">
                      Rise and Run Virtual Event
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Gold divider -->
          <tr>
            <td style="height:2px;background:linear-gradient(90deg,transparent,{GOLD},transparent);padding:0;"></td>
          </tr>

          <!-- Greeting & Confirmation -->
          <tr>
            <td style="padding:32px 36px 20px;">
              <p style="margin:0 0 12px;font-size:16px;color:#2c3e50;line-height:1.6;">
                Dear <strong>Anurag Singh</strong>,
              </p>
              <p style="margin:0 0 20px;font-size:15px;color:#4a5568;line-height:1.65;">
                As per your request, your distance category for the <strong>Rise and Run</strong> virtual event has been successfully updated from <strong>1.6 KM</strong> to <strong>5 KM</strong>.
              </p>

              <!-- Updated Details Card -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:{LIGHT_BG};border:1px solid {LINE};border-radius:12px;margin-bottom:24px;overflow:hidden;">
                <tr>
                  <td style="background-color:{DARK_GREEN};padding:10px 20px;">
                    <span style="font-size:11px;font-weight:800;letter-spacing:0.15em;text-transform:uppercase;color:{GOLD};">
                      📋 Updated Registration Details
                    </span>
                  </td>
                </tr>
                <tr>
                  <td style="padding:18px 20px;">
                    <table width="100%" cellpadding="6" cellspacing="0" border="0" style="font-size:14px;color:#2d3748;">
                      <tr>
                        <td width="38%" style="color:{MUTED};font-weight:600;">Runner Name:</td>
                        <td style="font-weight:700;color:{DARK_GREEN};">Anurag Singh</td>
                      </tr>
                      <tr>
                        <td style="color:{MUTED};font-weight:600;">BIB Number:</td>
                        <td><span style="display:inline-block;background:{DARK_GREEN};color:{GOLD};padding:3px 10px;border-radius:6px;font-weight:800;font-family:monospace;letter-spacing:0.08em;">RAR-937297</span></td>
                      </tr>
                      <tr>
                        <td style="color:{MUTED};font-weight:600;">Event:</td>
                        <td style="font-weight:600;color:#1a202c;">Rise and Run</td>
                      </tr>
                      <tr>
                        <td style="color:{MUTED};font-weight:600;">Updated Distance:</td>
                        <td><strong style="color:#047857;font-size:15px;">5 KM</strong> <span style="font-size:12px;color:#718096;">(Updated from 1.6 KM)</span></td>
                      </tr>
                      <tr>
                        <td style="color:{MUTED};font-weight:600;">Registration Status:</td>
                        <td><span style="color:#059669;font-weight:700;">● Confirmed</span></td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Important Guidelines -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border:1px solid #e2e8f0;border-left:4px solid {GOLD};border-radius:8px;padding:18px 20px;margin-bottom:24px;">
                <tr>
                  <td>
                    <p style="margin:0 0 10px;font-size:13px;font-weight:800;letter-spacing:0.05em;text-transform:uppercase;color:{DARK_GREEN};">
                      ⚠️ Important Guidelines & Event Time Window:
                    </p>
                    <ul style="margin:0;padding-left:20px;font-size:13.5px;color:#4a5568;line-height:1.75;">
                      <li>
                        <strong>Event Duration Window:</strong> Your 5 KM run/walk must be completed <strong>strictly within the official event dates</strong>. Runs performed outside the event window cannot be accepted.
                      </li>
                      <li>
                        <strong>Tracking App:</strong> Record your activity using any GPS fitness application of your choice (Strava, Nike Run Club, Garmin, Apple Fitness, etc.).
                      </li>
                      <li>
                        <strong>Proof Submission:</strong> Once finished, log in to your account at <a href="https://mountainrun.in" target="_blank" style="color:{DARK_GREEN};font-weight:700;text-decoration:underline;">mountainrun.in</a> and submit your activity screenshot before the proof submission window closes.
                      </li>
                    </ul>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 6px;font-size:14px;color:#4a5568;line-height:1.6;">
                If you have any questions or require further assistance, simply reply directly to this email or reach us at <a href="mailto:mountainrunofficial@gmail.com" style="color:{DARK_GREEN};font-weight:600;">mountainrunofficial@gmail.com</a>.
              </p>
              <p style="margin:16px 0 0;font-size:14px;font-weight:600;color:{DARK_GREEN};">
                Best of luck with your 5 KM run! 🏃🏔️
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:{DARK_GREEN};border-radius:0 0 16px 16px;padding:0;">
              <div style="height:2px;background:linear-gradient(90deg,transparent,{GOLD},transparent);"></div>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:24px 32px;text-align:center;">
                    <p style="margin:0 0 4px;font-size:16px;color:rgba(255,255,255,0.95);font-family:Georgia,serif;font-style:italic;">
                      Run Anywhere, Anytime
                    </p>
                    <p style="margin:0 0 14px;font-size:10px;color:{GOLD};letter-spacing:0.2em;text-transform:uppercase;">
                      ── Mountain Run Virtual Series ──
                    </p>
                    <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#ffffff;">Mountain Run Team</p>
                    <p style="margin:0 0 16px;font-size:11px;color:rgba(255,255,255,0.5);">
                      Official Platform · <a href="https://mountainrun.in" target="_blank" style="color:{GOLD};text-decoration:none;">mountainrun.in</a>
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

          <!-- Unsubscribe / copyright info -->
          <tr>
            <td style="padding:14px;text-align:center;">
              <p style="margin:0;font-size:10px;color:#94a3b8;line-height:1.6;">
                © {datetime.datetime.now().year} Mountain Run. All rights reserved.<br/>
                You are receiving this update regarding your registration for Rise and Run.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""

def send_email():
    recipient = "anuragsingh122017@gmail.com"
    subject = "Distance Category Updated to 5 KM — BIB: RAR-937297 | Mountain Run"
    
    print("=" * 60)
    print("  SENDING DISTANCE CATEGORY UPDATE EMAIL VIA RESEND")
    print("=" * 60)
    print(f"To:      {recipient}")
    print(f"From:    {RESEND_FROM}")
    print(f"Subject: {subject}")
    print(f"Key:     {RESEND_API_KEY[:8]}... (configured)")
    
    if not RESEND_API_KEY:
        print("❌ Error: RESEND_API_KEY is not configured!")
        return False
        
    html_content = build_email_html()
    
    text_content = """Dear Anurag Singh,

As per your request, your distance category for the Rise and Run virtual event has been successfully updated from 1.6 KM to 5 KM.

UPDATED REGISTRATION DETAILS:
• Runner Name:       Anurag Singh
• BIB Number:        RAR-937297
• Event:             Rise and Run
• Distance Category: 5 KM (Updated from 1.6 KM)
• Registration:      Confirmed

IMPORTANT GUIDELINES & EVENT TIME WINDOW:
1. Event Duration Window: Your 5 KM run/walk must be completed strictly within the official event duration window. Activities outside the event dates cannot be accepted.
2. Tracking: Record your activity using any fitness tracking app (Strava, Nike Run Club, Garmin, etc.).
3. Proof Submission: Once completed, log in to https://mountainrun.in and upload your activity screenshot before the proof submission window closes to claim your finisher medal and e-certificate.

If you have any questions, feel free to reply directly to this email or reach us at mountainrunofficial@gmail.com.

Best of luck with your 5 KM run!

Warm regards,
Team Mountain Run
https://mountainrun.in
"""

    url = "https://api.resend.com/emails"
    headers = {
        "Authorization": f"Bearer {RESEND_API_KEY}",
        "Content-Type": "application/json",
        "User-Agent": "MountainRun/1.0",
    }
    payload = {
        "from": RESEND_FROM,
        "to": [recipient],
        "subject": subject,
        "html": html_content,
        "text": text_content,
        "reply_to": "mountainrunofficial@gmail.com"
    }

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers=headers,
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode())
            print(f"✅ Email sent successfully!")
            print(f"Response: {json.dumps(data, indent=2)}")
            return True
    except urllib.error.HTTPError as e:
        error_body = e.read().decode()
        print(f"❌ Resend API HTTP Error {e.code}: {error_body}")
        return False
    except Exception as e:
        print(f"❌ Unexpected Error: {e}")
        return False

if __name__ == "__main__":
    send_email()
