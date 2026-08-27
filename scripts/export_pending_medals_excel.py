import os
import sys
import datetime
import psycopg2
from psycopg2.extras import RealDictCursor
import pandas as pd

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

conn = psycopg2.connect(DB_URL)
cur = conn.cursor(cursor_factory=RealDictCursor)

# Independence Day Event ID
cur.execute('SELECT id, title, slug FROM "Event" WHERE slug = %s OR title ILIKE %s', 
            ('independence-day-virtual-run-2026', '%Independence Day%'))
event = cur.fetchone()
print(f"Event: {event['title']} (ID: {event['id']})")
event_id = event['id']

# Query all registrations for this event where proof is submitted/approved but medal is NOT dispatched
cur.execute('''
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
        pu."submittedAt" as proof_submitted_at,
        pu."sourceApp" as proof_source,
        COALESCE(m.status, 'PENDING') as medal_status,
        m."trackingNumber" as tracking_number,
        r."registeredAt" as registered_at,
        c."certificateNumber" as certificate_number
    FROM "Registration" r
    JOIN "User" u ON r."userId" = u.id
    LEFT JOIN "Payment" p ON p."registrationId" = r.id
    LEFT JOIN "MedalDelivery" m ON m."registrationId" = r.id
    LEFT JOIN "ProofUpload" pu ON pu."registrationId" = r.id
    LEFT JOIN "Certificate" c ON c."registrationId" = r.id
    WHERE r."eventId" = %s
      AND (r.status = 'CONFIRMED' OR p.status = 'PAID')
      AND (r."proofStatus" IN ('SUBMITTED', 'APPROVED') OR pu.id IS NOT NULL)
      AND (m.status IS NULL OR m.status = 'PENDING' OR m."trackingNumber" IS NULL OR TRIM(m."trackingNumber") = '')
    ORDER BY r."registeredAt" ASC
''', (event_id,))

rows = cur.fetchall()
print(f"\nTotal Pending Medal Dispatch (Proof Submitted/Approved): {len(rows)} runners\n")

def format_time(sec):
    if not sec:
        return "N/A"
    sec = int(sec)
    h = sec // 3600
    m = (sec % 3600) // 60
    s = sec % 60
    if h > 0:
        return f"{h:02d}:{m:02d}:{s:02d}"
    return f"{m:02d}:{s:02d}"

excel_data = []
for idx, r in enumerate(rows, 1):
    full_address = f"{r['address_line1']}, {r['address_line2']}".strip(", ")
    finish_time_str = format_time(r['finish_time_seconds'])
    
    excel_data.append({
        "S.No": idx,
        "BIB Number": r['bib_number'],
        "Runner Name": r['user_name'],
        "Shipping Recipient": r['shipping_name'],
        "Mobile Number": str(r['phone'] or '').replace('+91', '').strip(),
        "Email": r['email'],
        "Category / Distance": r['distance'],
        "Finish Time": finish_time_str,
        "Address Line 1": r['address_line1'],
        "Address Line 2": r['address_line2'],
        "City": r['city'],
        "State": r['state'],
        "Pincode": r['pincode'],
        "Full Shipping Address": f"{full_address}, {r['city']}, {r['state']} - {r['pincode']}",
        "Proof Status": r['proof_status'],
        "Medal Status": r['medal_status'],
        "Certificate No": r['certificate_number'] or "N/A",
        "Registration Date": r['registered_at'].strftime("%d-%b-%Y") if r['registered_at'] else "N/A"
    })

df = pd.DataFrame(excel_data)

# Save to Excel
output_path = os.path.join(os.getcwd(), "PENDING_MEDALS_DISPATCH.xlsx")

# Use openpyxl with styles if available
with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
    df.to_excel(writer, index=False, sheet_name="Pending Medals")
    
    # Auto-adjust column widths
    worksheet = writer.sheets["Pending Medals"]
    for col in worksheet.columns:
        max_len = max(len(str(cell.value or '')) for cell in col)
        col_letter = col[0].column_letter
        worksheet.column_dimensions[col_letter].width = max(max_len + 3, 12)

print(f"✓ Excel file successfully created at: {output_path}")

# Print table to stdout
print("\n" + "="*110)
print(f"{'S.No':<5} | {'BIB':<12} | {'Name':<22} | {'Phone':<13} | {'Distance':<8} | {'City':<15} | {'State':<16} | {'Pincode':<7}")
print("="*110)
for row in excel_data:
    print(f"{row['S.No']:<5} | {row['BIB Number']:<12} | {row['Runner Name'][:20]:<22} | {row['Mobile Number']:<13} | {row['Category / Distance']:<8} | {row['City'][:13]:<15} | {row['State'][:14]:<16} | {row['Pincode']:<7}")
print("="*110)

conn.close()
