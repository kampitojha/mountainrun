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
event_id = event['id']
print(f"Event: {event['title']} (ID: {event_id})")

# Query all registrations for this event where proof is NOT submitted
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
        r."shippingName" as shipping_name,
        r."shippingLine1" as address_line1,
        COALESCE(r."shippingLine2", '') as address_line2,
        r."shippingCity" as city,
        r."shippingState" as state,
        r."shippingPincode" as pincode,
        r."proofStatus" as proof_status,
        r."registeredAt" as registered_at,
        p.status as payment_status,
        p."amountInPaise" as amount_in_paise,
        p."paidAt" as paid_at,
        p."razorpayPaymentId" as payment_id
    FROM "Registration" r
    JOIN "User" u ON r."userId" = u.id
    LEFT JOIN "Payment" p ON p."registrationId" = r.id
    LEFT JOIN "ProofUpload" pu ON pu."registrationId" = r.id
    WHERE r."eventId" = %s
      AND (r.status = 'CONFIRMED' OR p.status = 'PAID')
      AND r."proofStatus" = 'NOT_SUBMITTED'
      AND pu.id IS NULL
    ORDER BY r."registeredAt" ASC
''', (event_id,))

rows = cur.fetchall()
print(f"\nTotal Runners who have NOT submitted proof: {len(rows)} runners\n")

excel_data = []
for idx, r in enumerate(rows, 1):
    full_address = f"{r['address_line1']}, {r['address_line2']}".strip(", ")
    
    excel_data.append({
        "S.No": idx,
        "BIB Number": r['bib_number'],
        "Runner Name": r['user_name'],
        "Shipping Recipient": r['shipping_name'],
        "Mobile Number": str(r['phone'] or '').replace('+91', '').strip(),
        "Email": r['email'],
        "Category / Distance": r['distance'],
        "Amount Paid (Rs)": round((r['amount_in_paise'] or 0) / 100),
        "Payment ID": r['payment_id'] or "N/A",
        "Payment Date": r['paid_at'].strftime("%d-%b-%Y") if r['paid_at'] else "N/A",
        "Address Line 1": r['address_line1'],
        "Address Line 2": r['address_line2'],
        "City": r['city'],
        "State": r['state'],
        "Pincode": r['pincode'],
        "Full Shipping Address": f"{full_address}, {r['city']}, {r['state']} - {r['pincode']}",
        "Proof Status": "NOT SUBMITTED",
        "Registration Date": r['registered_at'].strftime("%d-%b-%Y") if r['registered_at'] else "N/A"
    })

df = pd.DataFrame(excel_data)

# Save to Excel
output_path = os.path.join(os.getcwd(), "PROOF_NOT_SUBMITTED.xlsx")

with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
    df.to_excel(writer, index=False, sheet_name="Proof Not Submitted")
    
    # Auto-adjust column widths
    worksheet = writer.sheets["Proof Not Submitted"]
    for col in worksheet.columns:
        max_len = max(len(str(cell.value or '')) for cell in col)
        col_letter = col[0].column_letter
        worksheet.column_dimensions[col_letter].width = max(max_len + 3, 12)

print(f"✓ Excel file successfully created at: {output_path}")

# Print table to stdout
print("\n" + "="*115)
print(f"{'S.No':<5} | {'BIB':<12} | {'Name':<22} | {'Phone':<12} | {'Distance':<8} | {'City':<15} | {'State':<18} | {'Pincode':<7}")
print("="*115)
for row in excel_data:
    print(f"{row['S.No']:<5} | {row['BIB Number']:<12} | {row['Runner Name'][:20]:<22} | {row['Mobile Number']:<12} | {row['Category / Distance']:<8} | {row['City'][:13]:<15} | {row['State'][:16]:<18} | {row['Pincode']:<7}")
print("="*115)

conn.close()
