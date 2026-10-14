import openpyxl
import psycopg2
from psycopg2.extras import RealDictCursor
import sys
import os
sys.path.insert(0, os.path.abspath("."))
import scripts.tshirt_dispatch_manager as tm
import scripts.medal_dispatch_manager as mm

conn = mm.get_db_connection()
cur = conn.cursor(cursor_factory=RealDictCursor)

wb = openpyxl.load_workbook('TSHIRT_DISPATCH_LIST.xlsx')
ws = wb['T-Shirt Dispatch']
rows = list(ws.iter_rows(values_only=True))

print(f"Total rows in sheet: {len(rows)}")

matched_runners = []
unmatched_runners = []

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
        p_clean = str(phone).replace('+91', '').strip()[-10:]
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
        # Pick the most relevant registration or latest
        f = found[0]
        matched_runners.append({
            "sno": sno,
            "excel_bib": bib,
            "db_bib": f["bibNumber"],
            "name": name or f["shippingName"] or f["user_name"],
            "email": f["email"],
            "phone": phone or f["phone"],
            "address": address,
            "tracking": tracking,
            "event_title": f["event_title"],
            "distance": f["distance"]
        })
        print(f"✓ [{sno}] {name} ({bib}) -> Email: {f['email']} | Tracking: {tracking}")
    else:
        unmatched_runners.append({
            "sno": sno,
            "excel_bib": bib,
            "name": name,
            "phone": phone,
            "address": address,
            "tracking": tracking
        })
        print(f"❌ [{sno}] UNMATCHED: {name} | BIB: {bib} | Phone: {phone}")

print(f"\nMatched: {len(matched_runners)}, Unmatched: {len(unmatched_runners)}")
conn.close()
