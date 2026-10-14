#!/usr/bin/env python3
"""
Export all approved proof participants for Sports Day Celebration to Excel.
Includes all shipping details, proof details, certificate info, and dispatch readiness.
"""

import os
import sys
import datetime
import psycopg2
from psycopg2.extras import RealDictCursor
import pandas as pd
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

if sys.platform.startswith("win"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Add root directory to path
sys.path.insert(0, os.path.abspath("."))
import scripts.medal_dispatch_manager as mm

def format_time(sec):
    if not sec:
        return "N/A"
    try:
        sec = int(sec)
        h = sec // 3600
        m = (sec % 3600) // 60
        s = sec % 60
        if h > 0:
            return f"{h:02d}:{m:02d}:{s:02d}"
        return f"{m:02d}:{s:02d}"
    except Exception:
        return str(sec)

def export_sports_day_approved():
    conn = mm.get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    # 1. Verify Event
    cur.execute("""
        SELECT id, title, slug 
        FROM "Event" 
        WHERE slug = 'sports-day-celebration' OR title ILIKE '%Sports Day%'
    """)
    event = cur.fetchone()
    if not event:
        raise ValueError("Sports Day Celebration event not found in database!")
    
    event_id = event["id"]
    event_title = event["title"]
    print(f"Event: {event_title} (ID: {event_id})")

    # 2. Query Approved Registrations
    cur.execute("""
        SELECT 
            r.id as registration_id,
            r."bibNumber" as bib_number,
            r."userId" as user_id,
            u.name as user_name,
            u.email as email,
            COALESCE(r."shippingPhone", u.phone) as phone,
            r.distance as distance,
            r."activityType" as activity_type,
            r."finishTimeSeconds" as finish_time_seconds,
            r."shippingName" as shipping_name,
            r."shippingLine1" as address_line1,
            COALESCE(r."shippingLine2", '') as address_line2,
            r."shippingCity" as city,
            r."shippingState" as state,
            r."shippingPincode" as pincode,
            r."proofStatus" as proof_status,
            COALESCE(m.status, 'PENDING') as medal_status,
            m."trackingNumber" as tracking_number,
            m."courier" as courier,
            m."dispatchedAt" as dispatched_at,
            r."registeredAt" as registered_at,
            c."certificateNumber" as certificate_number,
            pu."activityImageUrl" as proof_url,
            pu."submittedAt" as proof_submitted_at,
            pu."reviewedAt" as proof_reviewed_at,
            p."razorpayPaymentId" as payment_id,
            p."amountInPaise" as amount_in_paise,
            p."paidAt" as paid_at
        FROM "Registration" r
        JOIN "User" u ON r."userId" = u.id
        LEFT JOIN "Payment" p ON p."registrationId" = r.id
        LEFT JOIN "MedalDelivery" m ON m."registrationId" = r.id
        LEFT JOIN "ProofUpload" pu ON pu."registrationId" = r.id
        LEFT JOIN "Certificate" c ON c."registrationId" = r.id
        WHERE r."eventId" = %s
          AND r."proofStatus" = 'APPROVED'
        ORDER BY r."registeredAt" ASC
    """, (event_id,))

    raw_rows = cur.fetchall()
    conn.close()

    # Deduplicate in case multiple proof records exist for one registration
    by_bib = {}
    for r in raw_rows:
        bib = r["bib_number"]
        if bib not in by_bib:
            by_bib[bib] = r
        else:
            # Prefer row with proof_url or most recent proof
            if not by_bib[bib]["proof_url"] and r["proof_url"]:
                by_bib[bib] = r

    runners = list(by_bib.values())
    print(f"Total Unique Approved Runners: {len(runners)}")

    excel_rows = []
    for idx, r in enumerate(runners, 1):
        line1 = str(r["address_line1"] or "").strip()
        line2 = str(r["address_line2"] or "").strip()
        city = str(r["city"] or "").strip()
        state = str(r["state"] or "").strip()
        pincode = str(r["pincode"] or "").strip()

        addr_parts = [p for p in [line1, line2] if p]
        street = ", ".join(addr_parts)
        full_address = f"{street}, {city}, {state} - {pincode}".strip(" ,-")

        phone_clean = str(r["phone"] or "").replace("+91", "").replace("-", "").replace(" ", "").strip()
        if len(phone_clean) > 10:
            phone_clean = phone_clean[-10:]

        reg_date_str = r["registered_at"].strftime("%d-%b-%Y") if r["registered_at"] else "N/A"
        proof_sub_str = r["proof_submitted_at"].strftime("%d-%b-%Y %I:%M %p") if r["proof_submitted_at"] else "N/A"
        amount_in_rs = round((r["amount_in_paise"] or 0) / 100) if r["amount_in_paise"] else 0

        excel_rows.append({
            "S.No": idx,
            "BIB Number": r["bib_number"],
            "Runner Name": r["user_name"] or r["shipping_name"],
            "Shipping Recipient": r["shipping_name"] or r["user_name"],
            "Mobile Number": phone_clean,
            "Email Address": r["email"],
            "Category / Distance": r["distance"],
            "Activity Type": r["activity_type"] or "Running",
            "Finish Time": format_time(r["finish_time_seconds"]),
            "Full Shipping Address": full_address,
            "Address Line 1": line1,
            "Address Line 2": line2,
            "City": city,
            "State": state,
            "Pincode": pincode,
            "Proof Status": r["proof_status"],
            "Proof Submission Date": proof_sub_str,
            "Proof Screenshot URL": r["proof_url"] or "N/A",
            "Medal Status": str(r["medal_status"]).upper(),
            "Tracking / AWB Number": r["tracking_number"] or "",
            "Courier Partner": r["courier"] or "",
            "Certificate Number": r["certificate_number"] or "N/A",
            "Registration Date": reg_date_str,
            "Amount Paid (Rs)": amount_in_rs,
            "Payment ID": r["payment_id"] or "N/A"
        })

    df = pd.DataFrame(excel_rows)

    output_filename = "SPORTS_DAY_APPROVED_PROOFS_DISPATCH_LIST.xlsx"
    output_path = os.path.join(os.getcwd(), output_filename)

    with pd.ExcelWriter(output_path, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name="Approved Medal Dispatch")
        ws = writer.sheets["Approved Medal Dispatch"]

        # Styling
        header_fill = PatternFill(start_color="1A3A2E", end_color="1A3A2E", fill_type="solid")
        header_font = Font(name="Segoe UI", size=11, bold=True, color="FFFFFF")
        regular_font = Font(name="Segoe UI", size=10)
        bold_font = Font(name="Segoe UI", size=10, bold=True)
        pending_fill = PatternFill(start_color="FEF3C7", end_color="FEF3C7", fill_type="solid") # soft amber
        approved_fill = PatternFill(start_color="DEF7EC", end_color="DEF7EC", fill_type="solid") # soft green

        thin_border = Border(
            left=Side(style="thin", color="E5E7EB"),
            right=Side(style="thin", color="E5E7EB"),
            top=Side(style="thin", color="E5E7EB"),
            bottom=Side(style="thin", color="E5E7EB")
        )

        # Style header row
        for col_idx in range(1, len(df.columns) + 1):
            cell = ws.cell(row=1, column=col_idx)
            cell.fill = header_fill
            cell.font = header_font
            cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=False)
            cell.border = thin_border

        # Style data rows
        for row_idx in range(2, len(df) + 2):
            medal_status_val = ws.cell(row=row_idx, column=19).value # Medal Status column
            for col_idx in range(1, len(df.columns) + 1):
                cell = ws.cell(row=row_idx, column=col_idx)
                cell.font = regular_font
                cell.border = thin_border
                
                # Center align specific columns
                if col_idx in [1, 2, 5, 7, 8, 9, 15, 16, 19, 20, 21, 22, 23, 24]:
                    cell.alignment = Alignment(horizontal="center", vertical="center")
                else:
                    cell.alignment = Alignment(horizontal="left", vertical="center")

                # Highlight BIB
                if col_idx == 2:
                    cell.font = bold_font

                # Highlight Medal Status
                if col_idx == 19:
                    cell.font = bold_font
                    if medal_status_val == "PENDING":
                        cell.fill = pending_fill
                    elif medal_status_val == "DISPATCHED":
                        cell.fill = approved_fill

        # Auto-adjust column widths
        for col in ws.columns:
            max_len = 0
            col_letter = get_column_letter(col[0].column)
            for cell in col:
                val_str = str(cell.value or "")
                if len(val_str) > max_len:
                    max_len = len(val_str)
            ws.column_dimensions[col_letter].width = min(max(max_len + 4, 12), 48)

    print(f"\n✅ Successfully generated Excel at: {output_path}")
    print(f"📊 Total Rows: {len(df)} participants ready for medal dispatch.")
    return output_path, len(df)

if __name__ == "__main__":
    export_sports_day_approved()
