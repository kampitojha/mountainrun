#!/usr/bin/env python3
"""
Mountain Run — Official T-Shirt Dispatch Manager & Email Sender
"""

import sys
import os
import re
import json
import time
import datetime
import urllib.request
import urllib.error
import pandas as pd

if sys.platform.startswith("win"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# ---------------------------------------------------------
# Environment & Configuration
# ---------------------------------------------------------
def get_backend_env():
    possible_paths = [
        os.path.join(os.getcwd(), "backend", ".env"),
        os.path.join(os.path.dirname(__file__), "..", "backend", ".env"),
        os.path.join(os.path.dirname(__file__), ".env"),
        os.path.join(os.getcwd(), ".env")
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
RESEND_API_KEY = ENV.get("RESEND_API_KEY")
RESEND_FROM = ENV.get("RESEND_FROM_EMAIL", "Mountain Run <onboarding@mountainrun.in>")

# ---------------------------------------------------------
# Email Template Builder
# ---------------------------------------------------------
def build_tshirt_dispatch_html(payload):
    DARK_GREEN = "#1a3a2e"
    GOLD = "#c9a227"
    CREAM = "#fcfaf5"
    MUTED = "#8a7a5a"
    LINE = "#e8dfc8"

    runner_name = payload.get("runnerName", "Runner")
    bib_number = payload.get("bibNumber", "N/A")
    event_title = payload.get("eventTitle", "Independence Day Virtual Run 2026")
    courier_name = payload.get("courier", "DTDC Express")
    tracking_num = str(payload.get("trackingNumber", "")).strip()
    tracking_url = payload.get("trackingUrl") or "https://www.dtdc.com/track-your-shipment/"
    shipping_address = payload.get("shippingAddress", "").strip()
    phone_number = str(payload.get("phoneNumber", "")).strip()
    tshirt_size = payload.get("tshirtSize", "")

    size_display_html = f"""
    <tr>
      <td style="padding:14px 18px;border-bottom:1px solid #f0ede5;background-color:#faf8f3;">
        <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:{MUTED};">Item & Size</p>
      </td>
      <td style="padding:14px 18px;border-bottom:1px solid #f0ede5;background-color:#ffffff;">
        <p style="margin:0;font-size:14px;font-weight:800;color:{DARK_GREEN};">Official Runner T-Shirt <span style="display:inline-block;background-color:#fef3c7;color:#92400e;font-size:11px;padding:2px 8px;border-radius:6px;margin-left:6px;border:1px solid #fde68a;">Size: {tshirt_size}</span></p>
      </td>
    </tr>
    """ if tshirt_size else f"""
    <tr>
      <td style="padding:14px 18px;border-bottom:1px solid #f0ede5;background-color:#faf8f3;">
        <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:{MUTED};">Item</p>
      </td>
      <td style="padding:14px 18px;border-bottom:1px solid #f0ede5;background-color:#ffffff;">
        <p style="margin:0;font-size:14px;font-weight:800;color:{DARK_GREEN};">Official Runner T-Shirt 👕</p>
      </td>
    </tr>
    """

    address_html = f"""
    <tr>
      <td style="padding:0 36px 24px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#faf8f3;border:1px dashed {LINE};border-radius:10px;padding:16px 18px;">
          <tr>
            <td>
              <p style="margin:0 0 6px;font-size:11px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:{MUTED};">📍 Delivery Address Provided</p>
              <p style="margin:0 0 4px;font-size:13px;color:#333333;line-height:1.6;font-weight:500;">{shipping_address}</p>
              {f'<p style="margin:6px 0 0;font-size:12px;color:#666666;">📞 Contact: <strong>{phone_number}</strong></p>' if phone_number else ''}
            </td>
          </tr>
        </table>
      </td>
    </tr>
    """ if shipping_address else ""

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Your Official Event T-Shirt is on the Way! — Mountain Run</title>
</head>
<body style="margin:0;padding:0;background-color:#f0ede5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <div style="display:none;font-size:1px;color:#f0ede5;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    Great news {runner_name}! Your official Mountain Run Event T-Shirt has been dispatched via {courier_name}. Tracking AWB: {tracking_num} 👕
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0ede5;padding:32px 12px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:{CREAM};border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(26,58,46,0.12);border:1px solid {LINE};">

          <!-- Tricolor Top Accent -->
          <tr>
            <td style="background-color:{DARK_GREEN};padding:0;">
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
                      <span style="font-size:12px;font-weight:800;letter-spacing:0.22em;text-transform:uppercase;color:{GOLD};">⛰️ MOUNTAIN RUN</span>
                    </div>
                    <p style="margin:0;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:rgba(255,255,255,0.6);">Official Merchandise · Dispatch Notification</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Hero Greeting -->
          <tr>
            <td style="padding:36px 36px 20px;text-align:center;">
              <div style="display:inline-block;width:68px;height:68px;line-height:68px;background-color:#fbf6e8;border:2px solid {GOLD};border-radius:50%;font-size:34px;margin-bottom:14px;">
                👕
              </div>
              <h1 style="margin:0 0 6px;font-size:24px;font-weight:800;color:{DARK_GREEN};font-family:Georgia,serif;letter-spacing:-0.01em;">
                Your Official Event T-Shirt is on the Way!
              </h1>
              <p style="margin:0 0 20px;font-size:12px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:{GOLD};">
                ── {event_title} ──
              </p>
              <p style="margin:0;font-size:15px;color:#444444;line-height:1.7;text-align:left;">
                Hi <strong style="color:{DARK_GREEN};">{runner_name}</strong>,<br/><br/>
                Get ready to wear your achievement with pride! Your official premium <strong>Event T-Shirt</strong> has been carefully packed and handed over to our delivery partner <strong>{courier_name}</strong>.
              </p>
            </td>
          </tr>

          <!-- Tracking Details Card -->
          <tr>
            <td style="padding:0 36px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border:1.5px solid {LINE};border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.03);">
                <tr>
                  <td colspan="2" style="background-color:#f6f1e5;padding:12px 18px;border-bottom:1px solid {LINE};">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="left">
                          <span style="font-size:11px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:{DARK_GREEN};">📦 Consignment Details</span>
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

                {size_display_html}

                <tr>
                  <td style="padding:14px 18px;border-bottom:1px solid #f0ede5;width:40%;background-color:#faf8f3;">
                    <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:{MUTED};">Courier Partner</p>
                  </td>
                  <td style="padding:14px 18px;border-bottom:1px solid #f0ede5;background-color:#ffffff;">
                    <p style="margin:0;font-size:14px;font-weight:700;color:{DARK_GREEN};">{courier_name}</p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:14px 18px;border-bottom:1px solid #f0ede5;background-color:#faf8f3;">
                    <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:{MUTED};">Tracking / AWB No.</p>
                  </td>
                  <td style="padding:14px 18px;border-bottom:1px solid #f0ede5;background-color:#ffffff;">
                    <p style="margin:0;font-size:18px;font-weight:900;color:{DARK_GREEN};letter-spacing:0.08em;font-family:Consolas,Monaco,monospace;">
                      {tracking_num}
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:14px 18px;border-bottom:1px solid #f0ede5;background-color:#faf8f3;">
                    <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:{MUTED};">BIB Number</p>
                  </td>
                  <td style="padding:14px 18px;border-bottom:1px solid #f0ede5;background-color:#ffffff;">
                    <p style="margin:0;font-size:14px;font-weight:800;color:{DARK_GREEN};">{bib_number}</p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:14px 18px;background-color:#faf8f3;">
                    <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:{MUTED};">Estimated Delivery</p>
                  </td>
                  <td style="padding:14px 18px;background-color:#ffffff;">
                    <p style="margin:0;font-size:14px;font-weight:700;color:#166534;">4 – 7 Business Days</p>
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
                    <a href="{tracking_url}" target="_blank" style="display:inline-block;background-color:{DARK_GREEN};color:#ffffff;font-size:14px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;text-decoration:none;padding:15px 36px;border-radius:10px;box-shadow:0 6px 18px rgba(26,58,46,0.25);border:1px solid {GOLD};">
                      🚚 Track Live on DTDC Portal &rarr;
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top:12px;">
                    <p style="margin:0;font-size:12px;color:#555555;line-height:1.5;">
                      Enter your Consignment/AWB Number <strong>{tracking_num}</strong> on DTDC's tracker.
                    </p>
                    <p style="margin:8px 0 0;font-size:11px;color:#777777;">
                      Direct Link: <a href="{tracking_url}" target="_blank" style="color:{DARK_GREEN};font-weight:600;word-break:break-all;">{tracking_url}</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          {address_html}

          <!-- Delivery Guidelines -->
          <tr>
            <td style="padding:0 36px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border:1px solid #ebe5d8;border-radius:10px;padding:18px 20px;">
                <tr>
                  <td>
                    <p style="margin:0 0 10px;font-size:12px;font-weight:800;letter-spacing:0.05em;text-transform:uppercase;color:{DARK_GREEN};">
                      💡 Important Delivery Information:
                    </p>
                    <ul style="margin:0;padding-left:18px;font-size:13px;color:#555555;line-height:1.7;">
                      <li><strong>Tracking Updates:</strong> DTDC scan updates typically reflect on their portal within 12–24 hours of dispatch.</li>
                      <li><strong>Delivery Timeline:</strong> Shipments are delivered within <strong>4 to 7 working days</strong> depending on your pincode.</li>
                      <li><strong>Delivery Contact:</strong> Please ensure your registered mobile number is reachable when the delivery agent attempts delivery.</li>
                    </ul>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:{DARK_GREEN};border-radius:0 0 16px 16px;padding:0;">
              <div style="height:2px;background:linear-gradient(90deg,transparent,{GOLD},transparent);"></div>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:26px 32px;text-align:center;">
                    <p style="margin:0 0 4px;font-size:17px;color:rgba(255,255,255,0.95);font-family:Georgia,serif;font-style:italic;">
                      Wear Your Passion · Run With Pride!
                    </p>
                    <p style="margin:0 0 16px;font-size:10px;color:{GOLD};letter-spacing:0.2em;text-transform:uppercase;">
                      ── Mountain Run Official Gear ──
                    </p>
                    <p style="margin:0 0 2px;font-size:13px;font-weight:700;color:#ffffff;">Mountain Run Logistics Team</p>
                    <p style="margin:0 0 16px;font-size:11px;color:rgba(255,255,255,0.5);">
                      Official Virtual Marathon Platform · <a href="https://mountainrun.in" target="_blank" style="color:{GOLD};text-decoration:none;">mountainrun.in</a>
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
                Questions regarding your T-Shirt dispatch? Write to us at <a href="mailto:support@mountainrun.in" style="color:#64748b;text-decoration:underline;">support@mountainrun.in</a>.<br/>
                © {datetime.datetime.now().year} Mountain Run. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""

# ---------------------------------------------------------
# Send Email via Resend
# ---------------------------------------------------------
def send_resend_email(to_email, subject, html_content, max_retries=3):
    if not RESEND_API_KEY:
        raise ValueError("RESEND_API_KEY not found in backend/.env")

    req_body = json.dumps({
        "from": RESEND_FROM,
        "to": [to_email],
        "subject": subject,
        "html": html_content
    }).encode("utf-8")

    for attempt in range(max_retries):
        req = urllib.request.Request(
            "https://api.resend.com/emails",
            data=req_body,
            headers={
                "Authorization": f"Bearer {RESEND_API_KEY}",
                "Content-Type": "application/json",
                "User-Agent": "MountainRun-TshirtManager/1.0"
            },
            method="POST"
        )

        try:
            with urllib.request.urlopen(req) as resp:
                res_data = json.loads(resp.read().decode("utf-8"))
                return res_data
        except urllib.error.HTTPError as e:
            err_msg = e.read().decode("utf-8") if e.fp else str(e)
            if e.code == 429 and attempt < max_retries - 1:
                wait_time = (attempt + 1) * 2
                print(f"⏳ [Rate-limit 429] Waiting {wait_time}s before retry...")
                time.sleep(wait_time)
                continue
            raise RuntimeError(f"HTTP {e.code}: {err_msg}")

# ---------------------------------------------------------
# Bulk Dispatch to All Runners
# ---------------------------------------------------------
def dispatch_all(dry_run=False):
    import openpyxl
    import psycopg2
    from psycopg2.extras import RealDictCursor

    excel_path = os.path.join(os.getcwd(), "TSHIRT_DISPATCH_LIST.xlsx")
    if not os.path.exists(excel_path):
        raise FileNotFoundError(f"Excel file not found at {excel_path}")

    # Connect to DB
    conn = psycopg2.connect(ENV.get("DATABASE_URL"))
    cur = conn.cursor(cursor_factory=RealDictCursor)

    wb = openpyxl.load_workbook(excel_path)
    ws = wb["T-Shirt Dispatch"]
    rows = list(ws.iter_rows(values_only=True))

    print("\n=======================================================")
    print("     MOUNTAIN RUN — T-SHIRT EMAIL DISPATCH RUNNER     ")
    print("=======================================================\n")

    dispatch_list = []

    for r in rows[1:]:
        if not any(r):
            continue
        sno, bib, name, phone, address, tracking = r[0], r[1], r[2], r[3], r[4], r[5]
        if tracking is None or str(tracking).strip() == "":
            continue

        found = None
        if bib:
            cur.execute("""
                SELECT r."bibNumber", r."shippingName", u.name as user_name, u.email, COALESCE(r."shippingPhone", u.phone) as phone, e.title as event_title, r.distance
                FROM "Registration" r
                JOIN "User" u ON r."userId" = u.id
                JOIN "Event" e ON r."eventId" = e.id
                WHERE r."bibNumber" ILIKE %s
            """, (f"%{str(bib).strip()}%",))
            found = cur.fetchall()

        if not found and phone:
            p_clean = str(phone).replace("+91", "").strip()[-10:]
            cur.execute("""
                SELECT r."bibNumber", r."shippingName", u.name as user_name, u.email, COALESCE(r."shippingPhone", u.phone) as phone, e.title as event_title, r.distance
                FROM "Registration" r
                JOIN "User" u ON r."userId" = u.id
                JOIN "Event" e ON r."eventId" = e.id
                WHERE r."shippingPhone" ILIKE %s OR u.phone ILIKE %s
            """, (f"%{p_clean}%", f"%{p_clean}%"))
            found = cur.fetchall()

        if not found and name:
            cur.execute("""
                SELECT r."bibNumber", r."shippingName", u.name as user_name, u.email, COALESCE(r."shippingPhone", u.phone) as phone, e.title as event_title, r.distance
                FROM "Registration" r
                JOIN "User" u ON r."userId" = u.id
                JOIN "Event" e ON r."eventId" = e.id
                WHERE u.name ILIKE %s OR r."shippingName" ILIKE %s
            """, (f"%{str(name).strip()}%", f"%{str(name).strip()}%"))
            found = cur.fetchall()

        if found:
            f = found[0]
            clean_event = f["event_title"].replace("🇮🇳", "").strip()
            clean_bib = str(bib or f["bibNumber"] or "N/A").strip()
            item = {
                "sno": sno,
                "runnerName": name or f["shippingName"] or f["user_name"],
                "email": f["email"].strip().lower(),
                "bibNumber": clean_bib,
                "trackingNumber": str(tracking).strip(),
                "courier": "DTDC Express",
                "trackingUrl": "https://www.dtdc.com/track-your-shipment/",
                "eventTitle": clean_event,
                "shippingAddress": str(address or "").strip(),
                "phoneNumber": str(phone or f["phone"] or "").strip(),
            }
            dispatch_list.append(item)
        else:
            print(f"⚠️ Warning: Could not find DB match for Sno {sno}: {name} ({bib})")

    conn.close()

    total_to_send = len(dispatch_list)
    print(f"Found {total_to_send} runners ready for dispatch.\n")

    if dry_run:
        print("🔍 DRY RUN MODE — No emails will be sent:")
        for idx, item in enumerate(dispatch_list, 1):
            print(f"  {idx}. [{item['bibNumber']}] {item['runnerName']} -> {item['email']} (AWB: {item['trackingNumber']}, Event: {item['eventTitle']})")
        return

    success_count = 0
    fail_count = 0
    results = []

    for idx, item in enumerate(dispatch_list, 1):
        subject = f"Your Official Event T-Shirt is on the Way! 👕 — {item['eventTitle']}"
        html_content = build_tshirt_dispatch_html(item)

        print(f"[{idx}/{total_to_send}] Sending to {item['runnerName']} ({item['email']}) | AWB: {item['trackingNumber']}...", end=" ", flush=True)

        try:
            res = send_resend_email(item['email'], subject, html_content)
            res_id = res.get("id", "N/A")
            print(f"✅ SENT (ID: {res_id})")
            success_count += 1
            results.append({"sno": item["sno"], "name": item["runnerName"], "email": item["email"], "status": "SUCCESS", "id": res_id})
        except Exception as e:
            print(f"❌ FAILED: {e}")
            fail_count += 1
            results.append({"sno": item["sno"], "name": item["runnerName"], "email": item["email"], "status": "FAILED", "error": str(e)})

        # Polite delay to respect Resend rate limits
        time.sleep(0.8)

    print("\n=======================================================")
    print(f"DISPATCH COMPLETED: {success_count} Succeeded, {fail_count} Failed (Total: {total_to_send})")
    print("=======================================================\n")

def send_test_email(recipient_email="itskampitojha@gmail.com"):
    sample_payload = {
        "runnerName": "Kampit Ojha",
        "eventTitle": "Independence Day Virtual Run 2026",
        "bibNumber": "IDVR-662712",
        "tshirtSize": "L",
        "courier": "DTDC Express",
        "trackingNumber": "7D136266669",
        "trackingUrl": "https://www.dtdc.com/track-your-shipment/",
        "shippingAddress": "Molan Pukhuri Balipara, district- sonitpur, Station road Balipara, Balipara, Assam - 784101",
        "phoneNumber": "8099923050",
    }
    subject = f"Your Official Event T-Shirt is on the Way! 👕 — {sample_payload['eventTitle']}"
    html_content = build_tshirt_dispatch_html(sample_payload)
    print(f"Sending test email to {recipient_email}...")
    res = send_resend_email(recipient_email, subject, html_content)
    print(f"✅ TEST EMAIL SENT SUCCESSFULLY! ID: {res.get('id')}")
    return res

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] in ["--all", "dispatch-all", "all"]:
        dry = "--dry-run" in sys.argv
        dispatch_all(dry_run=dry)
    elif len(sys.argv) > 1 and sys.argv[1] == "--dry-run":
        dispatch_all(dry_run=True)
    else:
        target = sys.argv[1] if len(sys.argv) > 1 else "itskampitojha@gmail.com"
        send_test_email(target)

