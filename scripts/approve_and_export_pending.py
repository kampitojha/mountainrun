import os
import sys
import uuid
import datetime
import json
import urllib.request
import urllib.error
import psycopg2
from psycopg2.extras import RealDictCursor
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

sys.path.insert(0, os.path.abspath("."))
import scripts.medal_dispatch_manager as mm

ENV = mm.get_backend_env()
RESEND_API_KEY = ENV.get("RESEND_API_KEY")
RESEND_FROM = ENV.get("RESEND_FROM_EMAIL", "Mountain Run <onboarding@mountainrun.in>")
FRONTEND_URL = ENV.get("FRONTEND_URL", "https://mountainrun.in").rstrip("/")

def send_resend_email(to_email, subject, html_content, max_retries=3):
    if not RESEND_API_KEY:
        print("Warning: RESEND_API_KEY not found, skipping email.")
        return None
    url = "https://api.resend.com/emails"
    headers = {
        "Authorization": f"Bearer {RESEND_API_KEY}",
        "Content-Type": "application/json",
        "User-Agent": "MountainRunDispatch/1.0",
    }
    payload = {
        "from": RESEND_FROM,
        "to": [to_email],
        "subject": subject,
        "html": html_content,
        "reply_to": "mountainrunofficial@gmail.com",
    }
    for attempt in range(max_retries):
        try:
            req = urllib.request.Request(url, data=json.dumps(payload).encode("utf-8"), headers=headers, method="POST")
            with urllib.request.urlopen(req, timeout=15) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except Exception as e:
            if attempt < max_retries - 1:
                import time
                time.sleep(2)
            else:
                print(f"Email sending failed to {to_email}: {e}")
                return None

def build_proof_approved_html(runner_name, event_title, bib_number, distance, finish_time_str, cert_url, dashboard_url):
    DARK_GREEN = "#1a3a2e"
    GOLD = "#c9a227"
    CREAM = "#fcfaf5"
    MUTED = "#8a7a5a"
    LINE = "#e8dfc8"

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

        <!-- Top Banner -->
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
                  <div style="display:inline-block;background:rgba(255,255,255,0.08);border:1px solid rgba(201,162,39,0.4);
                              border-radius:50px;padding:6px 20px;margin-bottom:8px;">
                    <span style="font-size:12px;font-weight:800;letter-spacing:0.22em;text-transform:uppercase;color:{GOLD};">
                      ⛰️ MOUNTAIN RUN
                    </span>
                  </div>
                  <p style="margin:0;font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:rgba(255,255,255,0.6);">
                    Official Event Verification · Finisher Update
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body Content -->
        <tr>
          <td style="padding:32px 36px;">
            <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:{DARK_GREEN};line-height:1.3;">
              Run Verified! Congratulations, {runner_name}! 🏅
            </h1>
            <p style="margin:0 0 24px;font-size:14px;color:{MUTED};line-height:1.6;">
              Your submission for <strong>{event_title}</strong> ({distance}) has been officially verified by our race operations team. Your timing has been recorded and your certificate is ready.
            </p>

            <!-- Timing Box -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0"
                   style="background:rgba(26,58,46,0.04);border:1px solid {LINE};border-radius:12px;margin-bottom:24px;">
              <tr>
                <td style="padding:16px 20px;width:50%;border-right:1px solid {LINE};text-align:center;">
                  <span style="display:block;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:{MUTED};margin-bottom:4px;">BIB Number</span>
                  <span style="font-size:18px;font-weight:800;color:{DARK_GREEN};font-family:monospace;">{bib_number}</span>
                </td>
                <td style="padding:16px 20px;width:50%;text-align:center;">
                  <span style="display:block;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:{MUTED};margin-bottom:4px;">Finish Time</span>
                  <span style="font-size:18px;font-weight:800;color:{DARK_GREEN};font-family:monospace;">{finish_time_str}</span>
                </td>
              </tr>
            </table>

            <!-- Button -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
              <tr>
                <td align="center">
                  <a href="{cert_url}"
                     style="display:inline-block;background:{DARK_GREEN};color:#ffffff;text-decoration:none;
                            font-size:14px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;
                            padding:14px 32px;border-radius:50px;box-shadow:0 4px 15px rgba(26,58,46,0.25);">
                    View & Download Certificate 🏆
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:0;font-size:12px;color:{MUTED};text-align:center;line-height:1.5;">
              Your official finisher medal is being prepared for dispatch. You will receive tracking details once the courier partner generates your AWB.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f4f0e6;border-top:1px solid {LINE};padding:20px 36px;text-align:center;">
            <p style="margin:0 0 6px;font-size:11px;color:{MUTED};">
              Mountain Run — Built for runners, by runners.
            </p>
            <p style="margin:0;font-size:10px;color:rgba(138,122,90,0.7);">
              Have questions? Email us at <a href="mailto:mountainrunofficial@gmail.com" style="color:{DARK_GREEN};">mountainrunofficial@gmail.com</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>"""

def clean_phone(phone_str):
    if not phone_str:
        return ""
    clean = str(phone_str).replace("+91", "").replace("-", "").replace(" ", "").strip()
    if clean.startswith("91") and len(clean) == 12:
        clean = clean[2:]
    return clean[-10:] if len(clean) >= 10 else clean

def format_finish_time(seconds):
    if not seconds:
        return "N/A"
    try:
        sec = int(seconds)
        h = sec // 3600
        m = (sec % 3600) // 60
        s = sec % 60
        if h > 0:
            return f"{h:02d}:{m:02d}:{s:02d}"
        return f"{m:02d}:{s:02d}"
    except Exception:
        return str(seconds)

def get_db_conn(max_retries=5):
    import time
    for attempt in range(max_retries):
        try:
            return psycopg2.connect(ENV["DATABASE_URL"], connect_timeout=15)
        except Exception as e:
            if attempt < max_retries - 1:
                print(f"DB connect retry {attempt+1}/{max_retries}: {e}")
                time.sleep(2)
            else:
                raise e

def main():
    conn = get_db_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)


    now_utc = datetime.datetime.now(datetime.timezone.utc)

    # 1. Approve RAR-525812 and RAR-226585
    targets = [
        {"bib": "RAR-525812", "time_sec": 1774, "time_str": "29:34"},
        {"bib": "RAR-226585", "time_sec": 1832, "time_str": "30:32"}
    ]

    print("==================================================")
    print("STEP 1: APPROVING PROOF FOR RAR-525812 & RAR-226585")
    print("==================================================")

    for t in targets:
        bib = t["bib"]
        cur.execute("""
            SELECT r.id, r."bibNumber", r."userId", r.distance, r."shippingName", u.name as user_name, u.email, e.title as event_title
            FROM "Registration" r
            JOIN "User" u ON r."userId" = u.id
            JOIN "Event" e ON r."eventId" = e.id
            WHERE r."bibNumber" = %s
        """, (bib,))
        reg = cur.fetchone()
        if not reg:
            print(f"❌ BIB {bib} not found in DB!")
            continue

        reg_id = reg["id"]
        user_id = reg["userId"]
        runner_name = reg["shippingName"] or reg["user_name"]
        runner_email = reg["email"]
        clean_bib = bib.replace("-", "").upper()
        cert_num = f"MR-2026-{clean_bib}"
        cert_url = f"{FRONTEND_URL}/certificates/{cert_num}"
        qr_payload = json.dumps({"issuer": "Mountain Run", "certificateNumber": cert_num, "verifyUrl": cert_url})

        # Update Registration
        cur.execute("""
            UPDATE "Registration"
            SET "proofStatus" = 'APPROVED',
                "status" = 'CONFIRMED',
                "finishTimeSeconds" = %s
            WHERE id = %s
        """, (t["time_sec"], reg_id))

        # Upsert ProofUpload
        cur.execute("""
            INSERT INTO "ProofUpload"
                (id, "registrationId", "activityImageUrl", "sourceApp", "status", "reviewerNote", "submittedAt", "reviewedAt")
            VALUES (%s, %s, %s, 'Manual Verification', 'APPROVED', 'Approved by Admin - Verified Finisher (Manual Proof)', %s, %s)
            ON CONFLICT ("registrationId") DO UPDATE
            SET status = 'APPROVED',
                "reviewerNote" = EXCLUDED."reviewerNote",
                "reviewedAt" = EXCLUDED."reviewedAt"
        """, (str(uuid.uuid4()), reg_id, "https://res.cloudinary.com/yppcqzt6/image/upload/v1788010023/mountainrun/manual_proof.png", now_utc, now_utc))

        # Upsert MedalDelivery
        cur.execute("""
            INSERT INTO "MedalDelivery" (id, "registrationId", status)
            VALUES (%s, %s, 'PENDING')
            ON CONFLICT ("registrationId") DO NOTHING
        """, (str(uuid.uuid4()), reg_id))

        # Upsert Certificate
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

        print(f"✅ Approved {bib} ({runner_name}) — Time: {t['time_str']}, Cert: {cert_num}")

        # Send Email
        html = build_proof_approved_html(
            runner_name=runner_name,
            event_title=reg["event_title"] or "Rise and Run Virtual Challenge 2026",
            bib_number=bib,
            distance=reg["distance"] or "5 KM",
            finish_time_str=t["time_str"],
            cert_url=cert_url,
            dashboard_url=f"{FRONTEND_URL}/dashboard"
        )
        subject = f"Your Run is Verified! (Time: {t['time_str']}) 🏅 — {reg['event_title']}"
        res = send_resend_email(runner_email, subject, html)
        if res:
            print(f"   📧 Email sent to {runner_email} (Resend ID: {res.get('id')})")

    conn.commit()

    # 2. Query ALL Approved Proofs where Medal is PENDING (No tracking number yet)
    print("\n==================================================")
    print("STEP 2: FETCHING ALL APPROVED PROOFS WITH PENDING MEDAL")
    print("==================================================")

    cur.execute("""
        SELECT 
            r.id as registration_id,
            r."bibNumber" as bib_number,
            r."userId" as user_id,
            u.name as user_name,
            u.email as email,
            u.phone as user_phone,
            r."shippingName" as shipping_name,
            r."shippingPhone" as shipping_phone,
            r."shippingLine1" as address_line1,
            r."shippingLine2" as address_line2,
            r."shippingCity" as city,
            r."shippingState" as state,
            r."shippingPincode" as pincode,
            r.distance as distance,
            r."activityType" as activity_type,
            r."finishTimeSeconds" as finish_time_seconds,
            r."proofStatus" as proof_status,
            r."registeredAt" as registered_at,
            COALESCE(m.status::text, 'PENDING') as medal_status,
            m."trackingNumber" as tracking_number,
            m.courier as courier,
            c."certificateNumber" as certificate_number,
            pu."activityImageUrl" as proof_url,
            pu."submittedAt" as proof_submitted_at,
            p."razorpayPaymentId" as payment_id,
            p."amountInPaise" as amount_in_paise
        FROM "Registration" r
        JOIN "User" u ON r."userId" = u.id
        JOIN "Event" e ON r."eventId" = e.id
        LEFT JOIN "Payment" p ON p."registrationId" = r.id
        LEFT JOIN "MedalDelivery" m ON m."registrationId" = r.id
        LEFT JOIN "ProofUpload" pu ON pu."registrationId" = r.id
        LEFT JOIN "Certificate" c ON c."registrationId" = r.id
        WHERE (e.slug ILIKE '%rise%' OR r."bibNumber" ILIKE 'RAR-%')
          AND r."proofStatus" = 'APPROVED'
          AND (m."trackingNumber" IS NULL OR m."trackingNumber" = '')
        ORDER BY r."registeredAt" ASC
    """)
    pending_rows = cur.fetchall()
    conn.close()

    print(f"Total Pending Athletes with Approved Proof: {len(pending_rows)}")

    # 3. Create Excel Workbook matching SAINI 2 / Courier Dispatch Ready format
    wb = openpyxl.Workbook()

    # Styling Palette
    COLOR_PRIMARY_DARK  = "0F3D24"    # Dark Forest Green
    COLOR_PRIMARY_MED   = "1B633D"    # Medium Forest Green
    COLOR_ZEBRA_ROW     = "F6FAF7"    # Mint zebra row
    COLOR_WHITE         = "FFFFFF"
    COLOR_BORDER        = "D1E2D8"
    COLOR_TEXT_MAIN     = "111827"
    COLOR_TEXT_MUTED    = "4B5563"

    thin_border = Border(
        left=Side(style="thin", color=COLOR_BORDER),
        right=Side(style="thin", color=COLOR_BORDER),
        top=Side(style="thin", color=COLOR_BORDER),
        bottom=Side(style="thin", color=COLOR_BORDER)
    )

    header_border = Border(
        left=Side(style="thin", color="0D4A2B"),
        right=Side(style="thin", color="0D4A2B"),
        top=Side(style="medium", color="0D4A2B"),
        bottom=Side(style="medium", color="0D4A2B")
    )

    f_banner_title = Font(name="Segoe UI", size=15, bold=True, color="FFFFFF")
    f_banner_sub = Font(name="Segoe UI", size=10, italic=True, color="E2E8F0")
    f_table_header = Font(name="Segoe UI", size=10, bold=True, color="FFFFFF")
    f_data_regular = Font(name="Segoe UI", size=9.5, color=COLOR_TEXT_MAIN)
    f_data_bold = Font(name="Segoe UI", size=9.5, bold=True, color=COLOR_TEXT_MAIN)
    f_data_muted = Font(name="Segoe UI", size=9, italic=True, color=COLOR_TEXT_MUTED)
    f_hyperlink = Font(name="Segoe UI", size=9.5, color="1D4ED8", underline="single")

    align_center = Alignment(horizontal="center", vertical="center", wrap_text=False)
    align_left = Alignment(horizontal="left", vertical="center", wrap_text=False)
    align_right = Alignment(horizontal="right", vertical="center", wrap_text=False)
    align_wrap_left = Alignment(horizontal="left", vertical="center", wrap_text=True)

    fill_banner = PatternFill(start_color=COLOR_PRIMARY_DARK, end_color=COLOR_PRIMARY_DARK, fill_type="solid")
    fill_sub_banner = PatternFill(start_color=COLOR_PRIMARY_MED, end_color=COLOR_PRIMARY_MED, fill_type="solid")
    fill_header = PatternFill(start_color=COLOR_PRIMARY_MED, end_color=COLOR_PRIMARY_MED, fill_type="solid")
    fill_zebra = PatternFill(start_color=COLOR_ZEBRA_ROW, end_color=COLOR_ZEBRA_ROW, fill_type="solid")
    fill_white = PatternFill(start_color=COLOR_WHITE, end_color=COLOR_WHITE, fill_type="solid")
    fill_pending = PatternFill(start_color="FEF3C7", end_color="FEF3C7", fill_type="solid")
    font_pending = Font(name="Segoe UI", size=9.5, bold=True, color="92400E")

    # SHEET 1: Courier Dispatch Ready
    ws1 = wb.active
    ws1.title = "Courier Dispatch Ready"
    ws1.views.sheetView[0].showGridLines = True
    ws1.freeze_panes = "D4"

    headers_saini = [
        ("S.No", 6, align_center),
        ("BIB Number", 14, align_center),
        ("Recipient Name", 24, align_left),
        ("Primary Mobile (10 Digits)", 16, align_center),
        ("Alternate Mobile", 16, align_center),
        ("Email Address", 28, align_left),
        ("Address Line 1", 32, align_left),
        ("Address Line 2 / Landmark", 24, align_left),
        ("Full Shipping Address", 48, align_wrap_left),
        ("City", 16, align_left),
        ("State", 18, align_left),
        ("Pincode", 10, align_center),
        ("Package Contents", 28, align_left),
        ("Category", 18, align_center),
        ("Payment Mode", 14, align_center),
        ("AWB / Tracking No", 20, align_center),
        ("wait", 10, align_center),
        ("Dispatch Date", 16, align_center),
        ("Delivery Status", 16, align_center),
        ("AMOUNT", 12, align_right),
    ]

    last_col_ws1 = get_column_letter(len(headers_saini))

    # Banner Row 1
    ws1.merge_cells(f"A1:{last_col_ws1}1")
    b1 = ws1["A1"]
    b1.value = "MOUNTAIN RUN  |  RISE AND RUN VIRTUAL CHALLENGE 2026"
    b1.font = f_banner_title
    b1.fill = fill_banner
    b1.alignment = align_center
    ws1.row_dimensions[1].height = 30

    # Subtitle Row 2
    ws1.merge_cells(f"A2:{last_col_ws1}2")
    b2 = ws1["A2"]
    b2.value = f"REMAINING APPROVED PROOFS — MEDAL DISPATCH READY LIST (TOTAL: {len(pending_rows)} ATHLETES) · GENERATED: {now_utc.strftime('%d-%b-%Y %I:%M %p UTC')}"
    b2.font = f_banner_sub
    b2.fill = fill_sub_banner
    b2.alignment = align_center
    ws1.row_dimensions[2].height = 20

    # Header Row 3
    ws1.row_dimensions[3].height = 26
    for c_idx, (h_title, col_width, h_align) in enumerate(headers_saini, 1):
        cell = ws1.cell(3, c_idx, h_title)
        cell.font = f_table_header
        cell.fill = fill_header
        cell.alignment = align_center
        cell.border = header_border
        col_letter = get_column_letter(c_idx)
        ws1.column_dimensions[col_letter].width = col_width

    # Data Rows
    for idx, r in enumerate(pending_rows, 1):
        row_num = idx + 3
        ws1.row_dimensions[row_num].height = 22

        line1 = str(r["address_line1"] or "").strip()
        line2 = str(r["address_line2"] or "").strip()
        city = str(r["city"] or "").strip().title()
        state = str(r["state"] or "").strip().title()
        pincode = str(r["pincode"] or "").strip()

        addr_parts = [p for p in [line1, line2] if p]
        full_street = ", ".join(addr_parts)
        full_addr = f"{full_street}, {city}, {state} - {pincode}".strip(" ,-")

        ship_phone = clean_phone(r["shipping_phone"])
        usr_phone = clean_phone(r["user_phone"])
        primary_phone = ship_phone or usr_phone
        alt_phone = usr_phone if usr_phone and usr_phone != ship_phone else ""

        recipient_name = (r["shipping_name"] or r["user_name"] or "Runner").strip().title()
        distance_str = (r["distance"] or "5 KM").strip().upper()
        amount_rs = round((r["amount_in_paise"] or 0) / 100) if r["amount_in_paise"] else 0

        row_data = [
            idx,
            r["bib_number"],
            recipient_name,
            primary_phone,
            alt_phone,
            r["email"] or "",
            line1,
            line2,
            full_addr,
            city,
            state,
            pincode,
            f"Rise & Run Finisher Medal ({distance_str})",
            f"Medal ({distance_str})",
            "Prepaid",
            "",         # AWB / Tracking No to be filled by courier
            "",         # wait
            "",         # Dispatch Date
            "PENDING",  # Delivery Status
            amount_rs
        ]

        row_fill = fill_zebra if idx % 2 == 0 else fill_white

        for c_idx, val in enumerate(row_data, 1):
            cell = ws1.cell(row_num, c_idx, val)
            cell.font = f_data_regular
            cell.fill = row_fill
            cell.border = thin_border
            cell.alignment = headers_saini[c_idx - 1][2]

            if c_idx == 2:
                cell.font = f_data_bold
            elif c_idx == 19:
                cell.fill = fill_pending
                cell.font = font_pending

    # SHEET 2: Master Data & Proofs
    ws2 = wb.create_sheet(title="Master Data & Proofs")
    ws2.views.sheetView[0].showGridLines = True
    ws2.freeze_panes = "D4"

    master_headers = [
        ("S.No", 6, align_center),
        ("BIB Number", 14, align_center),
        ("Runner Name", 24, align_left),
        ("Email Address", 28, align_left),
        ("Phone Number", 16, align_center),
        ("Distance", 16, align_center),
        ("Activity Type", 14, align_center),
        ("Finish Time", 14, align_center),
        ("Proof Status", 14, align_center),
        ("Proof URL", 30, align_left),
        ("Certificate Number", 20, align_center),
        ("City", 16, align_left),
        ("State", 18, align_left),
        ("Pincode", 10, align_center),
        ("Razorpay Payment ID", 22, align_center),
        ("Medal Status", 14, align_center)
    ]

    last_col_ws2 = get_column_letter(len(master_headers))
    ws2.merge_cells(f"A1:{last_col_ws2}1")
    m1 = ws2["A1"]
    m1.value = "MOUNTAIN RUN  |  ATHLETE PROOF & REGISTRATION MASTER DATA"
    m1.font = f_banner_title
    m1.fill = fill_banner
    m1.alignment = align_center
    ws2.row_dimensions[1].height = 30

    ws2.merge_cells(f"A2:{last_col_ws2}2")
    m2 = ws2["A2"]
    m2.value = f"REMAINING APPROVED PROOFS AWAITING MEDAL DISPATCH ({len(pending_rows)} ATHLETES)"
    m2.font = f_banner_sub
    m2.fill = fill_sub_banner
    m2.alignment = align_center
    ws2.row_dimensions[2].height = 20

    ws2.row_dimensions[3].height = 26
    for c_idx, (h_title, col_width, h_align) in enumerate(master_headers, 1):
        cell = ws2.cell(3, c_idx, h_title)
        cell.font = f_table_header
        cell.fill = fill_header
        cell.alignment = align_center
        cell.border = header_border
        ws2.column_dimensions[get_column_letter(c_idx)].width = col_width

    for idx, r in enumerate(pending_rows, 1):
        row_num = idx + 3
        ws2.row_dimensions[row_num].height = 22
        r_fill = fill_zebra if idx % 2 == 0 else fill_white

        m_data = [
            idx,
            r["bib_number"],
            (r["shipping_name"] or r["user_name"] or "").strip().title(),
            r["email"] or "",
            clean_phone(r["shipping_phone"] or r["user_phone"]),
            r["distance"] or "",
            (r["activity_type"] or "running").capitalize(),
            format_finish_time(r["finish_time_seconds"]),
            r["proof_status"],
            r["proof_url"] or "",
            r["certificate_number"] or "",
            (r["city"] or "").strip().title(),
            (r["state"] or "").strip().title(),
            r["pincode"] or "",
            r["payment_id"] or "",
            "PENDING"
        ]

        for c_idx, val in enumerate(m_data, 1):
            cell = ws2.cell(row_num, c_idx, val)
            cell.font = f_data_regular
            cell.fill = r_fill
            cell.border = thin_border
            cell.alignment = master_headers[c_idx - 1][2]
            if c_idx == 2:
                cell.font = f_data_bold
            elif c_idx == 10 and val:
                cell.hyperlink = val
                cell.font = f_hyperlink

    # SHEET 3: Summary & Analytics
    ws3 = wb.create_sheet(title="Summary & Analytics")
    ws3.views.sheetView[0].showGridLines = True

    ws3.column_dimensions["A"].width = 6
    ws3.column_dimensions["B"].width = 28
    ws3.column_dimensions["C"].width = 16
    ws3.column_dimensions["D"].width = 16

    ws3.merge_cells("B2:D2")
    s_title = ws3["B2"]
    s_title.value = "DISPATCH BATCH 3 — SUMMARY KPI"
    s_title.font = f_table_header
    s_title.fill = fill_banner
    s_title.alignment = align_center
    ws3.row_dimensions[2].height = 28

    kpis = [
        ("Total Remaining Pending Medals", len(pending_rows)),
        ("Event", "Rise and Run Virtual Challenge"),
        ("Proof Status", "100% Approved"),
        ("Medal Status", "Pending Courier Booking"),
        ("Packaging Required", f"{len(pending_rows)} Finisher Medals"),
    ]

    for k_idx, (k_label, k_val) in enumerate(kpis, 3):
        ws3.cell(k_idx, 2, k_label).font = f_data_bold
        ws3.cell(k_idx, 2).border = thin_border
        ws3.cell(k_idx, 2).fill = fill_zebra if k_idx % 2 == 0 else fill_white
        c_val = ws3.cell(k_idx, 3, k_val)
        c_val.font = f_data_bold
        c_val.alignment = align_center
        c_val.border = thin_border
        c_val.fill = fill_pending if "Medal" in k_label or "Total" in k_label else (fill_zebra if k_idx % 2 == 0 else fill_white)
        ws3.merge_cells(f"C{k_idx}:D{k_idx}")

    # Distance Breakdown
    from collections import Counter
    dist_counts = Counter(r["distance"] or "5 KM" for r in pending_rows)
    start_r = len(kpis) + 5
    ws3.merge_cells(f"B{start_r}:D{start_r}")
    d_hdr = ws3[f"B{start_r}"]
    d_hdr.value = "DISTANCE CATEGORY BREAKDOWN"
    d_hdr.font = f_table_header
    d_hdr.fill = fill_header
    d_hdr.alignment = align_center

    cur_r = start_r + 1
    for dist_k, count_v in dist_counts.items():
        ws3.cell(cur_r, 2, dist_k).font = f_data_regular
        ws3.cell(cur_r, 2).border = thin_border
        ws3.cell(cur_r, 3, count_v).font = f_data_bold
        ws3.cell(cur_r, 3).alignment = align_center
        ws3.cell(cur_r, 3).border = thin_border
        ws3.merge_cells(f"C{cur_r}:D{cur_r}")
        cur_r += 1

    excel_file = "RISE_AND_RUN_PENDING_MEDALS_DISPATCH_LIST.xlsx"
    wb.save(excel_file)
    print(f"\n🎉 Successfully created Excel dispatch file: {excel_file}")

    # Print summary of the 19 athletes
    print(f"\n==================================================")
    print(f"LIST OF ALL {len(pending_rows)} ATHLETES IN THE PENDING EXCEL:")
    print(f"==================================================")
    for i, r in enumerate(pending_rows, 1):
        name = (r["shipping_name"] or r["user_name"] or "").strip().title()
        print(f"{i:02d}. {r['bib_number']:12} | {name:25} | {clean_phone(r['shipping_phone'] or r['user_phone']):12} | {r['city']}")

if __name__ == "__main__":
    main()
