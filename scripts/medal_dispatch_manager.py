#!/usr/bin/env python3
"""
Mountain Run — Medal Dispatch & Status Management System
Usage:
  python scripts/medal_dispatch_manager.py status
  python scripts/medal_dispatch_manager.py export-pending
  python scripts/medal_dispatch_manager.py test <email>
  python scripts/medal_dispatch_manager.py dispatch "MEDALS.xlsx" [--dry-run]
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
import psycopg2
from psycopg2.extras import RealDictCursor

# Ensure UTF-8 output on Windows
if sys.platform.startswith("win"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# ---------------------------------------------------------
# 1. Environment & Database Configuration
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
DB_URL = ENV.get("DATABASE_URL")
RESEND_API_KEY = ENV.get("RESEND_API_KEY")
RESEND_FROM = ENV.get("RESEND_FROM_EMAIL", "Mountain Run <onboarding@mountainrun.in>")

def get_db_connection():
    if not DB_URL:
        raise ValueError("DATABASE_URL not found in backend/.env")
    return psycopg2.connect(DB_URL, connect_timeout=15)

def get_courier_info(raw_courier, tracking_number):
    c_upper = str(raw_courier or "").upper().strip()
    t_str = str(tracking_number or "").strip()

    if "DELHIVERY" in c_upper:
        return {
            "name": "Delhivery Express",
            "url": f"https://www.delhivery.com/track/package/{t_str}"
        }
    elif "BLUEDART" in c_upper or "BLUE DART" in c_upper:
        return {
            "name": "Blue Dart Express",
            "url": "https://www.bluedart.com/tracking"
        }
    else:
        return {
            "name": "DTDC Express",
            "url": f"https://track.dtdc.com/ctrk-tracking/tracker?awbNo={t_str}"
        }

# ---------------------------------------------------------
# 2. Email Template Builder
# ---------------------------------------------------------
def build_medal_dispatch_html(payload):
    DARK_GREEN = "#1a3a2e"
    GOLD = "#c9a227"
    CREAM = "#fcfaf5"
    MUTED = "#8a7a5a"
    LINE = "#e8dfc8"

    tracking_num = str(payload.get("trackingNumber", "")).strip()
    courier_name = payload.get("courier", "DTDC Express")
    tracking_url = payload.get("trackingUrl") or f"https://track.dtdc.com/ctrk-tracking/tracker?awbNo={tracking_num}"

    address_parts = [
        payload.get("shippingLine1"),
        payload.get("shippingCity"),
        f"{payload.get('shippingState', '')} - {payload.get('shippingPincode', '')}".strip(" -")
    ]
    address_display = ", ".join([p for p in address_parts if p])

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Your Finisher Medal is on the Way! — Mountain Run</title>
</head>
<body style="margin:0;padding:0;background-color:#f0ede5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <div style="display:none;font-size:1px;color:#f0ede5;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    Great news {payload['runnerName']}! Your official finisher medal for {payload['eventTitle']} has been dispatched via {courier_name}. Tracking: {tracking_num} 🏅
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0ede5;padding:32px 12px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:{CREAM};border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(26,58,46,0.12);border:1px solid {LINE};">

          <!-- Header -->
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
                    <p style="margin:0;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:rgba(255,255,255,0.6);">Official Event Logistics · Dispatch Update</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Hero Greeting -->
          <tr>
            <td style="padding:36px 36px 20px;text-align:center;">
              <div style="display:inline-block;width:64px;height:64px;line-height:64px;background-color:#fbf6e8;border:2px solid {GOLD};border-radius:50%;font-size:32px;margin-bottom:14px;">
                🏅
              </div>
              <h1 style="margin:0 0 6px;font-size:24px;font-weight:800;color:{DARK_GREEN};font-family:Georgia,serif;letter-spacing:-0.01em;">
                Your Finisher Medal is on the Way!
              </h1>
              <p style="margin:0 0 20px;font-size:12px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:{GOLD};">
                ── {payload['eventTitle']} ──
              </p>
              <p style="margin:0;font-size:15px;color:#444444;line-height:1.7;text-align:left;">
                Hi <strong style="color:{DARK_GREEN};">{payload['runnerName']}</strong>,<br/><br/>
                Congratulations once again on your incredible spirit and achievement! We are delighted to inform you that your official physical <strong>Finisher Medal</strong> has been packed and handed over to our courier partner.
              </p>
            </td>
          </tr>

          <!-- Tracking Card -->
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
                    <p style="margin:0;font-size:17px;font-weight:900;color:{DARK_GREEN};letter-spacing:0.08em;font-family:Consolas,Monaco,monospace;">
                      {tracking_num}
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:14px 18px;border-bottom:1px solid #f0ede5;background-color:#faf8f3;">
                    <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:{MUTED};">Bib Number</p>
                  </td>
                  <td style="padding:14px 18px;border-bottom:1px solid #f0ede5;background-color:#ffffff;">
                    <p style="margin:0;font-size:14px;font-weight:800;color:{DARK_GREEN};">{payload['bibNumber']}</p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:14px 18px;background-color:#faf8f3;">
                    <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:{MUTED};">Category / Distance</p>
                  </td>
                  <td style="padding:14px 18px;background-color:#ffffff;">
                    <p style="margin:0;font-size:14px;font-weight:700;color:{DARK_GREEN};">{payload.get('distance', 'Virtual Run Finisher')}</p>
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
                      🚚 Track Your Medal Live &rarr;
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top:10px;">
                    <p style="margin:0;font-size:11px;color:#777777;">
                      Direct Link: <a href="{tracking_url}" target="_blank" style="color:{DARK_GREEN};font-weight:600;word-break:break-all;">{tracking_url}</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          {f'''<!-- Delivery Address -->
          <tr>
            <td style="padding:0 36px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#faf8f3;border:1px dashed {LINE};border-radius:10px;padding:14px 18px;">
                <tr>
                  <td>
                    <p style="margin:0 0 4px;font-size:11px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:{MUTED};">📍 Shipping Address Provided</p>
                    <p style="margin:0;font-size:13px;color:#444444;line-height:1.5;">{address_display}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>''' if address_display else ''}

          <!-- Delivery Guidelines -->
          <tr>
            <td style="padding:0 36px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border:1px solid #ebe5d8;border-radius:10px;padding:18px 20px;">
                <tr>
                  <td>
                    <p style="margin:0 0 10px;font-size:12px;font-weight:800;letter-spacing:0.05em;text-transform:uppercase;color:{DARK_GREEN};">
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
            <td style="background-color:{DARK_GREEN};border-radius:0 0 16px 16px;padding:0;">
              <div style="height:2px;background:linear-gradient(90deg,transparent,{GOLD},transparent);"></div>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:26px 32px;text-align:center;">
                    <p style="margin:0 0 4px;font-size:17px;color:rgba(255,255,255,0.95);font-family:Georgia,serif;font-style:italic;">
                      Keep Running, Keep Inspiring!
                    </p>
                    <p style="margin:0 0 16px;font-size:10px;color:{GOLD};letter-spacing:0.2em;text-transform:uppercase;">
                      ── Every Finish Has a Story ──
                    </p>
                    <p style="margin:0 0 2px;font-size:13px;font-weight:700;color:#ffffff;">Mountain Run Team</p>
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
                Need help with your shipment? Reach us at <a href="mailto:support@mountainrun.in" style="color:#64748b;text-decoration:underline;">support@mountainrun.in</a>.<br/>
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
                "User-Agent": "MountainRun-DispatchManager/1.0"
            },
            method="POST"
        )

        try:
            with urllib.request.urlopen(req) as resp:
                res_data = json.loads(resp.read().decode("utf-8"))
                return res_data
        except urllib.error.HTTPError as e:
            if e.code == 429 and attempt < max_retries - 1:
                wait_time = (attempt + 1) * 2
                print(f"       ⏳ [Rate-limit 429] Waiting {wait_time}s before retry...")
                time.sleep(wait_time)
                continue
            raise e


# ---------------------------------------------------------
# 3. Core Commands
# ---------------------------------------------------------
def command_status():
    print("\n=======================================================")
    print("        MOUNTAIN RUN — MEDAL LOGISTICS STATUS         ")
    print("=======================================================\n")
    
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute("""
        SELECT 
            e."id" as event_id,
            e."title" as event_title,
            COUNT(r."id") as total_registrations,
            COUNT(CASE WHEN md."status" = 'DISPATCHED' THEN 1 END) as dispatched_count,
            COUNT(CASE WHEN md."status" = 'DELIVERED' THEN 1 END) as delivered_count,
            COUNT(CASE WHEN md."status" = 'PENDING' OR md."status" IS NULL THEN 1 END) as pending_count
        FROM "Event" e
        JOIN "Registration" r ON e."id" = r."eventId"
        LEFT JOIN "MedalDelivery" md ON r."id" = md."registrationId"
        WHERE r."status" IN ('CONFIRMED', 'COMPLETED')
        GROUP BY e."id", e."title"
        ORDER BY e."createdAt" DESC
    """)
    events = cur.fetchall()

    for ev in events:
        print(f"🏆 Event: {ev['event_title']}")
        print(f"   ├─ Total Confirmed Registrations: {ev['total_registrations']}")
        print(f"   ├─ 🚚 Dispatched (In Transit):   {ev['dispatched_count']}")
        print(f"   ├─ ✅ Delivered:                 {ev['delivered_count']}")
        print(f"   └─ ⏳ Pending Dispatch:          {ev['pending_count']}")
        print()

    conn.close()

def command_test_email(to_email, sample_type="delhivery"):
    print(f"\n[Test] Sending a test medal dispatch email ({sample_type.upper()}) to: {to_email}...")
    
    if sample_type == "delhivery":
        courier_info = get_courier_info("DELHIVERY", "42833510606152")
        sample_payload = {
            "to": to_email,
            "runnerName": "Kampit Ojha (Delhivery Sample)",
            "eventTitle": "Independence Day Virtual Run 2026 🇮🇳",
            "distance": "10K Challenge",
            "bibNumber": "IDVR-278064",
            "courier": courier_info["name"],
            "trackingNumber": "42833510606152",
            "trackingUrl": courier_info["url"],
            "shippingLine1": "B302 Anuvigyan CHS, Sector 4, Kharghar",
            "shippingCity": "Navi Mumbai",
            "shippingState": "Maharashtra",
            "shippingPincode": "410210"
        }
    else:
        courier_info = get_courier_info("DTDC", "7D136259730")
        sample_payload = {
            "to": to_email,
            "runnerName": "Kampit Ojha (DTDC Sample)",
            "eventTitle": "Independence Day Virtual Run 2026 🇮🇳",
            "distance": "10K Challenge",
            "bibNumber": "IDVR-738626",
            "courier": courier_info["name"],
            "trackingNumber": "7D136259730",
            "trackingUrl": courier_info["url"],
            "shippingLine1": "B302 Anuvigyan CHS, Sector 4, Kharghar",
            "shippingCity": "Navi Mumbai",
            "shippingState": "Maharashtra",
            "shippingPincode": "410210"
        }

    html = build_medal_dispatch_html(sample_payload)
    subject = f"Your Finisher Medal is on the Way! 🏅 — {sample_payload['eventTitle']}"
    
    try:
        res = send_resend_email(to_email, subject, html)
        print("✅ SUCCESS! Test email dispatched successfully.")
        print(f"   Resend ID: {res.get('id')}")
        print(f"   From: {RESEND_FROM}")
        print(f"   To: {to_email}")
        print(f"   Courier: {courier_info['name']}")
        print(f"   Tracking Link: {courier_info['url']}\n")
    except Exception as e:
        print(f"❌ Failed to send test email: {e}")

def command_dispatch_batch(excel_path, dry_run=False):
    if not os.path.exists(excel_path):
        print(f"❌ Error: Excel file '{excel_path}' not found!")
        return

    print("\n=======================================================")
    print(f"   MOUNTAIN RUN — BATCH DISPATCH EXECUTION {'(DRY RUN)' if dry_run else ''}")
    print("=======================================================\n")

    df = pd.read_excel(excel_path)
    print(f"📦 Loaded {len(df)} rows from '{excel_path}'")

    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    # 1. Fetch DB records for all BIBs in excel
    bib_list = df["BIB Number"].dropna().astype(str).str.strip().tolist()
    cur.execute("""
        SELECT 
            r."id" as registration_id,
            r."bibNumber",
            r."distance",
            r."shippingName",
            r."shippingPhone",
            r."shippingLine1",
            r."shippingLine2",
            r."shippingCity",
            r."shippingState",
            r."shippingPincode",
            u."name" as user_name,
            u."email" as user_email,
            e."title" as event_title,
            md."id" as medal_delivery_id,
            md."courier",
            md."trackingNumber",
            md."status" as medal_status
        FROM "Registration" r
        JOIN "User" u ON r."userId" = u."id"
        JOIN "Event" e ON r."eventId" = e."id"
        LEFT JOIN "MedalDelivery" md ON r."id" = md."registrationId"
        WHERE r."bibNumber" = ANY(%s)
    """, (bib_list,))
    
    db_rows = cur.fetchall()
    db_by_bib = {r["bibNumber"]: r for r in db_rows}

    dispatch_logs = []
    sent_count = 0
    skipped_count = 0
    failed_count = 0

    now_iso = datetime.datetime.now(datetime.timezone.utc)

    for idx, row in df.iterrows():
        bib = str(row["BIB Number"]).strip() if pd.notna(row["BIB Number"]) else None
        tracking_num = str(row.get("Tracking Number", "")).replace(".0", "").strip() if pd.notna(row.get("Tracking Number")) else None
        courier_raw = str(row.get("Courier", "")).strip() if pd.notna(row.get("Courier")) else "DTDC"

        # Ignore total / summary row or rows without BIB
        if not bib or bib == "nan" or not tracking_num or tracking_num == "nan" or tracking_num == "":
            continue

        db_reg = db_by_bib.get(bib)
        if not db_reg:
            print(f"[{idx+1}/{len(df)}] ⚠️ SKIP: BIB '{bib}' not found in database!")
            dispatch_logs.append({
                "Row": idx+1, "BIB": bib, "Status": "FAILED", "Reason": "Not found in DB", "Email": ""
            })
            failed_count += 1
            continue

        bib_resolved = db_reg["bibNumber"]
        target_email = db_reg["user_email"]
        runner_name = db_reg["shippingName"] or db_reg["user_name"]

        # Duplicate check: If already dispatched
        if db_reg.get("medal_status") == "DISPATCHED":
            print(f"[{idx+1}/{len(df)}] ⏩ SKIP (Already Dispatched): {bib_resolved} | {runner_name} ({target_email})")
            dispatch_logs.append({
                "Row": idx+1, "BIB": bib_resolved, "Runner": runner_name, "Email": target_email,
                "Tracking": tracking_num, "Status": "SKIPPED_ALREADY_DISPATCHED"
            })
            skipped_count += 1
            continue

        courier_info = get_courier_info(courier_raw, tracking_num)

        payload = {
            "to": target_email,
            "runnerName": runner_name,
            "eventTitle": db_reg["event_title"],
            "distance": db_reg["distance"],
            "bibNumber": bib_resolved,
            "courier": courier_info["name"],
            "trackingNumber": tracking_num,
            "trackingUrl": courier_info["url"],
            "shippingLine1": db_reg["shippingLine1"],
            "shippingCity": db_reg["shippingCity"],
            "shippingState": db_reg["shippingState"],
            "shippingPincode": db_reg["shippingPincode"]
        }

        if dry_run:
            print(f"[{idx+1}/{len(df)}] [DRY-RUN] Would send to: {runner_name} <{target_email}> | Courier: {courier_info['name']} | Tracking: {tracking_num}")
            dispatch_logs.append({
                "Row": idx+1, "BIB": bib_resolved, "Runner": runner_name, "Email": target_email,
                "Courier": courier_info["name"], "Tracking": tracking_num, "Status": "DRY_RUN_OK"
            })
            sent_count += 1
            continue

        # LIVE EXECUTION:
        try:
            html = build_medal_dispatch_html(payload)
            subject = f"Your Finisher Medal is on the Way! 🏅 — {payload['eventTitle']}"
            resend_res = send_resend_email(target_email, subject, html)
            
            # Upsert MedalDelivery
            if db_reg.get("medal_delivery_id"):
                cur.execute("""
                    UPDATE "MedalDelivery"
                    SET "courier" = %s,
                        "trackingNumber" = %s,
                        "trackingUrl" = %s,
                        "status" = 'DISPATCHED',
                        "dispatchedAt" = %s
                    WHERE "id" = %s
                """, (courier_info["name"], tracking_num, courier_info["url"], now_iso, db_reg["medal_delivery_id"]))
            else:
                cur.execute("""
                    INSERT INTO "MedalDelivery" ("id", "registrationId", "courier", "trackingNumber", "trackingUrl", "status", "dispatchedAt")
                    VALUES (gen_random_uuid(), %s, %s, %s, %s, 'DISPATCHED', %s)
                """, (db_reg["registration_id"], courier_info["name"], tracking_num, courier_info["url"], now_iso))
            
            conn.commit()

            print(f"[{idx+1}/{len(df)}] ✅ SENT & DB UPDATED: {bib_resolved} | {runner_name} <{target_email}> | {courier_info['name']} ({tracking_num})")
            dispatch_logs.append({
                "Row": idx+1, "BIB": bib_resolved, "Runner": runner_name, "Email": target_email,
                "Courier": courier_info["name"], "Tracking": tracking_num, "Status": "SUCCESS", "ResendId": resend_res.get('id')
            })
            sent_count += 1

            time.sleep(0.25)

        except Exception as e:
            conn.rollback()
            print(f"[{idx+1}/{len(df)}] ❌ ERROR sending to {target_email}: {e}")
            dispatch_logs.append({
                "Row": idx+1, "BIB": bib_resolved, "Runner": runner_name, "Email": target_email,
                "Courier": courier_info["name"], "Tracking": tracking_num, "Status": "FAILED", "Error": str(e)
            })
            failed_count += 1

    conn.close()

    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    report_file = f"DISPATCH_AUDIT_REPORT_{timestamp}.xlsx"
    pd.DataFrame(dispatch_logs).to_excel(report_file, index=False)

    print("\n-------------------------------------------------------")
    print(f"📊 SUMMARY: {'(DRY RUN)' if dry_run else ''}")
    print(f"   ├─ Total Rows in Excel:   {len(df)}")
    print(f"   ├─ Successfully Sent:     {sent_count}")
    print(f"   ├─ Skipped (Duplicates):  {skipped_count}")
    print(f"   └─ Failed:                {failed_count}")
    print(f"📁 Detailed Audit Log saved to: {report_file}")
    print("-------------------------------------------------------\n")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(0)

    cmd = sys.argv[1].lower()

    if cmd == "status":
        command_status()
    elif cmd == "test":
        target = sys.argv[2] if len(sys.argv) > 2 else "itskampitojha@gmail.com"
        sample_type = sys.argv[3] if len(sys.argv) > 3 else "delhivery"
        command_test_email(target, sample_type)
    elif cmd == "dispatch":
        excel_path = sys.argv[2] if len(sys.argv) > 2 else "MEDALS.xlsx"
        dry_run = "--dry-run" in sys.argv
        command_dispatch_batch(excel_path, dry_run=dry_run)
    else:
        print(f"Unknown command: {cmd}")
        print(__doc__)
