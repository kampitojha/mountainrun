import os
import sys
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
EXCEL_PATH = os.path.join(os.getcwd(), "TSHIRT_DISPATCH_LIST.xlsx")

def get_db():
    return psycopg2.connect(DB_URL)

def lookup_bib(bib_number):
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    bib_clean = bib_number.strip().upper()
    
    # Try direct match or format match
    cur.execute('''
        SELECT 
            r.id as registration_id,
            r."bibNumber" as bib_number,
            r."shippingName" as shipping_name,
            u.name as user_name,
            u.email as email,
            COALESCE(r."shippingPhone", u.phone) as phone,
            r.distance as distance,
            r."shippingLine1" as address_line1,
            COALESCE(r."shippingLine2", '') as address_line2,
            r."shippingCity" as city,
            r."shippingState" as state,
            r."shippingPincode" as pincode,
            r."registeredAt" as registered_at,
            e.title as event_title
        FROM "Registration" r
        JOIN "User" u ON r."userId" = u.id
        JOIN "Event" e ON r."eventId" = e.id
        WHERE r."bibNumber" ILIKE %s 
           OR r."bibNumber" ILIKE %s
           OR r."bibNumber" = %s
    ''', (f"%{bib_number.strip()}%", f"%{bib_clean}%", bib_clean))
    
    row = cur.fetchone()
    conn.close()
    return row

def get_current_list():
    if os.path.exists(EXCEL_PATH):
        try:
            return pd.read_excel(EXCEL_PATH)
        except Exception:
            pass
    return pd.DataFrame()

def add_bibs(bib_entries):
    """
    bib_entries: list of tuples (bib_number, size) or list of bib_number strings
    """
    existing_df = get_current_list()
    existing_bibs = set(existing_df['BIB Number'].astype(str).str.strip().tolist()) if not existing_df.empty and 'BIB Number' in existing_df.columns else set()
    
    new_rows = []
    for entry in bib_entries:
        if isinstance(entry, tuple):
            bib, size = entry
        else:
            bib, size = entry, "L"
        
        row = lookup_bib(bib)
        if not row:
            print(f"⚠️ BIB {bib} not found in database!")
            continue
            
        bib_str = row['bib_number']
        if bib_str in existing_bibs:
            print(f"ℹ️ BIB {bib_str} already in T-shirt list. Updating size to {size}...")
            if not existing_df.empty and 'BIB Number' in existing_df.columns:
                existing_df.loc[existing_df['BIB Number'].astype(str).str.strip() == bib_str, 'T-Shirt Size'] = size.upper()
            continue
            
        full_addr = f"{row['address_line1']}, {row['address_line2']}".strip(", ")
        new_rows.append({
            "BIB Number": bib_str,
            "Runner Name": row['shipping_name'] or row['user_name'],
            "T-Shirt Size": size.upper() if size else "L",
            "Event": row.get('event_title', 'Virtual Run'),
            "Mobile Number": str(row['phone'] or '').replace('+91', '').strip(),
            "Email": row['email'],
            "Category / Distance": row['distance'],
            "Address Line 1": row['address_line1'],
            "Address Line 2": row['address_line2'],
            "City": row['city'],
            "State": row['state'],
            "Pincode": row['pincode'],
            "Full Shipping Address": f"{full_addr}, {row['city']}, {row['state']} - {row['pincode']}",
            "Date Added": pd.Timestamp.now().strftime("%d-%b-%Y")
        })
        existing_bibs.add(bib_str)
        print(f"✓ Added: {bib_str} | {row['shipping_name'] or row['user_name']} | Size: {size}")

    if not new_rows and existing_df.empty:
        print("No rows to write.")
        return

    if not existing_df.empty:
        updated_df = pd.concat([existing_df, pd.DataFrame(new_rows)], ignore_index=True)
    else:
        updated_df = pd.DataFrame(new_rows)
        
    # Re-index S.No
    if 'S.No' in updated_df.columns:
        updated_df = updated_df.drop(columns=['S.No'])
    updated_df.insert(0, 'S.No', range(1, len(updated_df) + 1))
    
    # Save to Excel
    with pd.ExcelWriter(EXCEL_PATH, engine='openpyxl') as writer:
        updated_df.to_excel(writer, index=False, sheet_name="T-Shirt Dispatch")
        worksheet = writer.sheets["T-Shirt Dispatch"]
        for col in worksheet.columns:
            max_len = max(len(str(cell.value or '')) for cell in col)
            col_letter = col[0].column_letter
            worksheet.column_dimensions[col_letter].width = max(max_len + 3, 12)
            
    print(f"\n✓ Updated Excel saved at: {EXCEL_PATH} (Total: {len(updated_df)} runners)")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        args = sys.argv[1:]
        entries = []
        i = 0
        while i < len(args):
            arg = args[i]
            if ":" in arg:
                b, s = arg.split(":", 1)
                entries.append((b.strip(), s.strip()))
                i += 1
            elif i + 1 < len(args) and args[i+1].upper() in ['S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL', 'XS']:
                entries.append((arg.strip(), args[i+1].strip()))
                i += 2
            else:
                entries.append((arg.strip(), "L"))
                i += 1
        add_bibs(entries)
    else:
        print("Usage: python scripts/tshirt_list_manager.py <BIB1> [SIZE1] <BIB2> [SIZE2]...")
