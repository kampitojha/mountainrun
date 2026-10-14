import os
import sys
import openpyxl
from psycopg2.extras import RealDictCursor

sys.path.insert(0, os.path.abspath("."))
import scripts.medal_dispatch_manager as mm

def main():
    conn = mm.get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute('SELECT id, title, slug FROM "Event" WHERE title ILIKE %s OR slug ILIKE %s', ('%Gandhi%', '%gandhi%'))
    events = cur.fetchall()
    print("Found Events:", [dict(e) for e in events])

    # Check all GJVR registrations
    cur.execute("""
        SELECT 
            r.id as registration_id,
            r."bibNumber" as bib,
            r."userId" as user_id,
            r.distance,
            r."shippingName",
            r."shippingPhone",
            u.name as user_name,
            u.email as user_email,
            m.id as medal_delivery_id,
            m.status as medal_status,
            m."trackingNumber" as tracking_number,
            m.courier,
            m."dispatchedAt"
        FROM "Registration" r
        JOIN "User" u ON r."userId" = u.id
        LEFT JOIN "MedalDelivery" m ON m."registrationId" = r.id
        WHERE r."bibNumber" ILIKE 'GJVR-%'
    """)
    db_rows = cur.fetchall()
    print(f"Total GJVR registrations in DB: {len(db_rows)}")

    # Check how many have tracking in DB
    db_by_bib = {}
    for r in db_rows:
        bib = (r["bib"] or "").strip().upper()
        db_by_bib[bib] = r

    excel_path = os.path.join(os.getcwd(), "Complete gandhi jayanti.xlsx")
    wb = openpyxl.load_workbook(excel_path, data_only=True)
    ws = wb["Gandhi Jayanti 2026"]
    excel_rows = list(ws.iter_rows(values_only=True))

    header = excel_rows[2]
    # columns:
    # 0: S.No, 1: BIB Number, 2: Recipient Name, 3: Primary Mobile, 4: Email Address,
    # 5: Full Shipping Address, 6: City, 7: State, 8: Pincode, 9: Event Name,
    # 10: Distance Category, 11: Package Contents, 12: TRACKING NO, 13: COURIER, 14: AMOUNT

    excel_records = []
    for r in excel_rows[3:]:
        sno = r[0]
        bib = str(r[1] or "").strip()
        name = str(r[2] or "").strip()
        email = str(r[4] or "").strip()
        tracking = str(r[12] or "").strip() if r[12] is not None else ""
        courier = str(r[13] or "").strip() if r[13] is not None else ""

        if not bib and not name:
            continue
        excel_records.append({
            "sno": sno,
            "bib": bib,
            "name": name,
            "email": email,
            "tracking": tracking,
            "courier": courier,
            "raw_row": r
        })

    print(f"Total Excel records: {len(excel_records)}")

    # Cross match
    in_db_count = 0
    not_in_db = []
    already_has_tracking_in_db = []
    needs_update_and_send = []
    no_tracking_in_excel = []

    for item in excel_records:
        bib_upper = item["bib"].upper()
        tracking_val = item["tracking"]
        
        if not tracking_val or tracking_val.lower() in ["none", "nan", "null", "-", ""]:
            no_tracking_in_excel.append(item)
            continue

        d = db_by_bib.get(bib_upper)
        if not d:
            not_in_db.append(item)
            continue

        in_db_count += 1
        db_t = (d["tracking_number"] or "").strip()
        db_status = d["medal_status"]

        if db_t and db_status == "DISPATCHED":
            already_has_tracking_in_db.append({
                "excel": item,
                "db": d
            })
        else:
            needs_update_and_send.append({
                "excel": item,
                "db": d
            })

    print(f"\n--- MATCHING RESULTS ---")
    print(f"Matched in DB: {in_db_count}")
    print(f"Not in DB: {len(not_in_db)}")
    if not_in_db:
        for n in not_in_db:
            print(f"   Missing in DB: S.No {n['sno']} | BIB {n['bib']} | Name {n['name']} | Email {n['email']}")
    
    print(f"No tracking in Excel: {len(no_tracking_in_excel)}")
    if no_tracking_in_excel:
        for n in no_tracking_in_excel:
            print(f"   No tracking: S.No {n['sno']} | BIB {n['bib']} | Name {n['name']}")

    print(f"Already DISPATCHED with Tracking in DB: {len(already_has_tracking_in_db)}")
    mismatches = []
    for a in already_has_tracking_in_db:
        ex_t = a["excel"]["tracking"].strip()
        db_t = (a["db"]["tracking_number"] or "").strip()
        if ex_t != db_t:
            mismatches.append((a["excel"]["bib"], a["excel"]["name"], ex_t, db_t))

    print(f"Tracking ID mismatches in already dispatched: {len(mismatches)}")
    for m in mismatches:
        print(f"   BIB: {m[0]} | Name: {m[1]} | Sheet: {m[2]} vs DB: {m[3]}")

    print(f"\n--- BREAKDOWN OF 81 TO SEND ---")
    status_counts = {}
    for item in needs_update_and_send:
        st = item["db"]["medal_status"]
        status_counts[st] = status_counts.get(st, 0) + 1
    print(f"Status in DB for the 81 records: {status_counts}")

    from collections import Counter
    courier_counts = Counter(item["excel"]["courier"].strip().upper() for item in needs_update_and_send)
    print(f"Courier breakdown for 81 to send: {dict(courier_counts)}")

    print(f"First 10 of the 81 to send:")
    for idx, item in enumerate(needs_update_and_send[:10], 1):
        ex = item["excel"]
        print(f"  {idx}. BIB: {ex['bib']} | Name: {ex['name']} | Email: {ex['email']} | Tracking: {ex['tracking']} | Courier: {ex['courier']}")

    print(f"\nLast 5 of the 81 to send:")
    for idx, item in enumerate(needs_update_and_send[-5:], len(needs_update_and_send)-4):
        ex = item["excel"]
        print(f"  {idx}. BIB: {ex['bib']} | Name: {ex['name']} | Email: {ex['email']} | Tracking: {ex['tracking']} | Courier: {ex['courier']}")

if __name__ == "__main__":
    main()
