#!/usr/bin/env python3
"""
Update timing to 26:45 (1605s) for IDVR-478727 (Subhash Shewale),
update Certificate record to GENERATED, and resend official verified email.
"""

import sys
import os
import json
import uuid
import urllib.request
import urllib.error
from datetime import datetime, timezone

import psycopg2
from psycopg2.extras import RealDictCursor

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
        os.path.join(os.getcwd(), ".env"),
    ]
    env_vars = {}
    for p in possible_paths:
        if os.path.exists(p):
            with open(p, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        env_vars[k.strip()] = v.strip("\"'")
            break
    return env_vars

ENV = get_backend_env()
DB_URL = ENV.get("DATABASE_URL")
RESEND_API_KEY = ENV.get("RESEND_API_KEY")
RESEND_FROM = ENV.get("RESEND_FROM_EMAIL", "Mountain Run <onboarding@mountainrun.in>")
FRONTEND_URL = ENV.get("FRONTEND_URL", "https://mountainrun.in").rstrip("/")

BIB_NUMBER = "IDVR-478727"
FINISH_TIME_SECONDS = 1605  # 26:45

def build_proof_approved_html(runner_name, event_title, bib_number, distance, finish_time_str, cert_url, dashboard_url):
    DARK_GREEN = "#1a3a2e"
    GOLD = "#c9a227"
    CREAM = "#fcfaf5"
    MUTED = "#8a7a5a"
    LINE = "#e8dfc8"
    year = datetime.now().year

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Your Run is Verified! — Mountain Run</title>
</head>
<body style="margin:0;padding:0;background:#f0ede5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="display:none;font-size:1px;color:#f0ede5;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
    Great news {runner_name}! Your official run time ({finish_time_str}) for {event_title} has been recorded. Your certificate is ready! 🏅
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f0ede5;padding:32px 12px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" border="0"
             style="max-width:600px;width:100%;background:{CREAM};border-radius:16px;overflow:hidden;
                    box-shadow:0 10px 30px rgba(26,58,46,0.12);border:1px solid {LINE};">

        <!-- Header -->
        <tr>
          <td style="background:{DARK_GREEN};padding:0;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td width="33.3%" height="4" style="background:#FF9933;"></td>
                <td width="33.4%" height="4" style="background:#ffffff;"></td>
                <td width="33.3%" height="4" style="background:#138808;"></td>
              </tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding:28px 32px 22px;text-align:center;">
                  <div style="display:inline-block;background:rgba(255,255,255,0.08);border:1px solid rgba(201,162,39,0.4);border-radius:50px;padding:6px 20px;margin-bottom:8px;">
                    <span style="font-size:12px;font-weight:800;letter-spacing:0.22em;text-transform:uppercase;color:{GOLD};">⛰️ MOUNTAIN RUN</span>
                  </div>
                  <p style="margin:0;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:rgba(255,255,255,0.6);">Official Event Update · Verified Finisher</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Hero -->
        <tr>
          <td style="padding:36px 36px 20px;text-align:center;">
            <div style="display:inline-block;width:72px;height:72px;line-height:72px;background:#f0faf3;border:2px solid #34a853;border-radius:50%;font-size:36px;margin-bottom:16px;">🏅</div>
            <h1 style="margin:0 0 6px;font-size:26px;font-weight:800;color:{DARK_GREEN};font-family:Georgia,serif;letter-spacing:-0.01em;">
              Official Run Timing Verified!
            </h1>
            <p style="margin:0 0 20px;font-size:12px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:{GOLD};">
              ── {event_title} ──
            </p>
            <p style="margin:0;font-size:15px;color:#444;line-height:1.7;text-align:left;">
              Hi <strong style="color:{DARK_GREEN};">{runner_name}</strong>,<br/><br/>
              Congratulations! Your official finish timing for <strong>{event_title}</strong> has been verified and recorded. You have successfully completed your <strong>{distance}</strong> virtual run! 🏃‍♂️🎉
            </p>
          </td>
        </tr>

        <!-- Details Card -->
        <tr>
          <td style="padding:0 36px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0"
                   style="background:#fff;border:1.5px solid {LINE};border-radius:12px;overflow:hidden;">
              <tr>
                <td colspan="2" style="background:#f6f1e5;padding:12px 18px;border-bottom:1px solid {LINE};">
                  <span style="font-size:11px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:{DARK_GREEN};">🏅 Official Finisher Record</span>
                </td>
              </tr>
              <tr>
                <td style="padding:13px 18px;border-bottom:1px solid #f0ede5;width:40%;background:#faf8f3;">
                  <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:{MUTED};">Bib Number</p>
                </td>
                <td style="padding:13px 18px;border-bottom:1px solid #f0ede5;background:#fff;">
                  <p style="margin:0;font-size:15px;font-weight:900;color:{DARK_GREEN};font-family:Consolas,Monaco,monospace;">{bib_number}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:13px 18px;border-bottom:1px solid #f0ede5;background:#faf8f3;">
                  <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:{MUTED};">Category / Distance</p>
                </td>
                <td style="padding:13px 18px;border-bottom:1px solid #f0ede5;background:#fff;">
                  <p style="margin:0;font-size:14px;font-weight:700;color:{DARK_GREEN};">{distance}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:13px 18px;border-bottom:1px solid #f0ede5;background:#faf8f3;">
                  <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:{MUTED};">Official Finish Time</p>
                </td>
                <td style="padding:13px 18px;border-bottom:1px solid #f0ede5;background:#fff;">
                  <p style="margin:0;font-size:16px;font-weight:900;color:#137333;font-family:Consolas,Monaco,monospace;">{finish_time_str}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:13px 18px;background:#faf8f3;">
                  <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:{MUTED};">Verification Status</p>
                </td>
                <td style="padding:13px 18px;background:#fff;">
                  <span style="display:inline-block;background:#e6f4ea;color:#137333;font-size:11px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;padding:4px 12px;border-radius:20px;border:1px solid #b7e1cd;">
                    ✓ Approved & Recorded
                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- What Happens Next -->
        <tr>
          <td style="padding:0 36px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0"
                   style="background:#fff;border:1px solid #ebe5d8;border-radius:10px;padding:18px 20px;">
              <tr>
                <td>
                  <p style="margin:0 0 10px;font-size:12px;font-weight:800;letter-spacing:0.05em;text-transform:uppercase;color:{DARK_GREEN};">
                    🚀 Next Steps:
                  </p>
                  <ul style="margin:0;padding-left:18px;font-size:13px;color:#555;line-height:1.8;">
                    <li>Your <strong>Official Finisher Certificate</strong> is generated with your timing ({finish_time_str}).</li>
                    <li>Your <strong>Finisher Medal</strong> has been queued for dispatch — tracking details will be emailed once shipped.</li>
                    <li>Access your certificate and registrations anytime from your <a href="{dashboard_url}" style="color:{DARK_GREEN};font-weight:600;">runner dashboard</a>.</li>
                  </ul>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- CTA Buttons -->
        <tr>
          <td style="padding:0 36px 32px;text-align:center;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="center">
                  <a href="{cert_url}" target="_blank"
                     style="display:inline-block;background:{DARK_GREEN};color:#fff;font-size:14px;font-weight:800;
                            letter-spacing:0.08em;text-transform:uppercase;text-decoration:none;padding:15px 32px;
                            border-radius:10px;box-shadow:0 6px 18px rgba(26,58,46,0.25);border:1px solid {GOLD};margin-bottom:12px;">
                    📜 View Official Certificate &rarr;
                  </a>
                </td>
              </tr>
              <tr>
                <td align="center">
                  <a href="{dashboard_url}" target="_blank"
                     style="color:{DARK_GREEN};font-size:13px;font-weight:700;text-decoration:underline;">
                    Go to Runner Dashboard
                  </a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:{DARK_GREEN};border-radius:0 0 16px 16px;padding:0;">
            <div style="height:2px;background:linear-gradient(90deg,transparent,{GOLD},transparent);"></div>
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding:26px 32px;text-align:center;">
                  <p style="margin:0 0 4px;font-size:17px;color:rgba(255,255,255,0.95);font-family:Georgia,serif;font-style:italic;">Keep Running, Keep Inspiring!</p>
                  <p style="margin:0 0 16px;font-size:10px;color:{GOLD};letter-spacing:0.2em;text-transform:uppercase;">── Every Finish Has a Story ──</p>
                  <p style="margin:0 0 2px;font-size:13px;font-weight:700;color:#fff;">Mountain Run Team</p>
                  <p style="margin:0 0 16px;font-size:11px;color:rgba(255,255,255,0.5);">
                    Official Virtual Marathon Platform · <a href="https://mountainrun.in" style="color:{GOLD};text-decoration:none;">mountainrun.in</a>
                  </p>
                  <table width="180" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;">
                    <tr>
                      <td width="60" height="3" style="background:#FF9933;border-radius:2px 0 0 2px;"></td>
                      <td width="60" height="3" style="background:#fff;"></td>
                      <td width="60" height="3" style="background:#138808;border-radius:0 2px 2px 0;"></td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Disclaimer -->
        <tr>
          <td style="padding:16px;text-align:center;">
            <p style="margin:0;font-size:10px;color:#94a3b8;line-height:1.6;">
              Questions? Reach us at <a href="mailto:support@mountainrun.in" style="color:#64748b;text-decoration:underline;">support@mountainrun.in</a>.<br/>
              &copy; {year} Mountain Run. All rights reserved.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>"""

def send_email(to_email, subject, html_content):
    if not RESEND_API_KEY:
        raise ValueError("RESEND_API_KEY not found in backend/.env")

    body = json.dumps({
        "from": RESEND_FROM,
        "to": [to_email],
        "subject": subject,
        "html": html_content,
    }).encode("utf-8")

    req = urllib.request.Request(
        "https://api.resend.com/emails",
        data=body,
        headers={
            "Authorization": f"Bearer {RESEND_API_KEY}",
            "Content-Type": "application/json",
            "User-Agent": "MountainRun-AdminScript/1.0",
        },
        method="POST",
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))

def main():
    print("\n=================================================================")
    print(f"  UPDATE TIMING (26:45) & RESEND EMAIL FOR {BIB_NUMBER} ")
    print("=================================================================\n")

    conn = psycopg2.connect(DB_URL, connect_timeout=15)
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT
            r.id              AS registration_id,
            r."bibNumber"     AS bib_number,
            r.distance        AS distance,
            r.status          AS status,
            r."proofStatus"   AS proof_status,
            u.name            AS runner_name,
            u.email           AS email,
            e.title           AS event_title,
            c.id              AS cert_id,
            c."certificateNumber" AS certificate_number
        FROM "Registration" r
        JOIN "User"  u ON r."userId"  = u.id
        JOIN "Event" e ON r."eventId" = e.id
        LEFT JOIN "Certificate" c ON c."registrationId" = r.id
        WHERE r."bibNumber" ILIKE %s
    """, (BIB_NUMBER,))

    row = cur.fetchone()
    if not row:
        print(f"❌ BIB {BIB_NUMBER} not found!")
        conn.close()
        sys.exit(1)

    reg_id = row["registration_id"]
    bib = row["bib_number"]
    clean_bib = bib.replace("-", "").upper()
    cert_num = f"MR-2026-{clean_bib}"
    cert_url = f"{FRONTEND_URL}/certificates/{cert_num}"
    qr_payload = json.dumps({"issuer": "Mountain Run", "certificateNumber": cert_num, "verifyUrl": cert_url})
    now_utc = datetime.now(timezone.utc)

    # 1. Update Registration with finishTimeSeconds
    cur.execute("""
        UPDATE "Registration"
        SET "finishTimeSeconds" = %s,
            "proofStatus" = 'APPROVED'
        WHERE id = %s
    """, (FINISH_TIME_SECONDS, reg_id))
    print(f"✓ Updated Registration: finishTimeSeconds = {FINISH_TIME_SECONDS} (26:45)")

    # 2. Update/Create Certificate record with correct standard format & GENERATED status
    cur.execute("""
        INSERT INTO "Certificate"
            (id, "registrationId", "certificateNumber", "pdfUrl", "qrPayload", status, "issuedAt")
        VALUES (%s, %s, %s, %s, %s, 'GENERATED', %s)
        ON CONFLICT ("registrationId") DO UPDATE
            SET "certificateNumber" = EXCLUDED."certificateNumber",
                "pdfUrl" = EXCLUDED."pdfUrl",
                "qrPayload" = EXCLUDED."qrPayload",
                status = 'GENERATED',
                "issuedAt" = EXCLUDED."issuedAt"
    """, (str(uuid.uuid4()), reg_id, cert_num, cert_url, qr_payload, now_utc))
    print(f"✓ Certificate updated: {cert_num} (Status: GENERATED, URL: {cert_url})")

    conn.commit()
    conn.close()
    print("✓ DB changes committed successfully!\n")

    # 3. Send Email
    finish_time_str = "26:45"
    dashboard_url = f"{FRONTEND_URL}/dashboard"
    subject = f"Your Run is Verified! (Time: {finish_time_str}) 🏅 — {row['event_title']}"
    html = build_proof_approved_html(
        runner_name=row["runner_name"],
        event_title=row["event_title"],
        bib_number=row["bib_number"],
        distance=row["distance"],
        finish_time_str=finish_time_str,
        cert_url=cert_url,
        dashboard_url=dashboard_url,
    )

    print(f"📧 Sending verified email with timing {finish_time_str} to {row['email']} ...")
    try:
        res = send_email(row["email"], subject, html)
        print(f"✅ Email sent successfully! Resend ID: {res.get('id')}\n")
    except Exception as e:
        print(f"❌ Email sending error: {e}\n")

if __name__ == "__main__":
    main()