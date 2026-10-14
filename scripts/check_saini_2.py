import os
import sys
import json
import openpyxl
import psycopg2
from psycopg2.extras import RealDictCursor

sys.path.insert(0, os.path.abspath("."))
import scripts.medal_dispatch_manager as mm

def get_courier_details(raw_courier, tracking_number):
    c_upper = str(raw_courier or "").upper().strip()
    t_str = str(tracking_number or "").strip()

    if any(k in c_upper for k in ["DELHIV", "DELHIVAR", "DELHIVERY", "DALEVER"]) or t_str.startswith("428"):
        return {
            "name": "Delhivery Express",
            "url": f"https://www.delhivery.com/track/package/{t_str}"
        }
    elif any(k in c_upper for k in ["BLUEDART", "BLUE DART"]):
        return {
            "name": "Blue Dart Express",
            "url": "https://www.bluedart.com/tracking"
        }
    else:
        return {
            "name": "DTDC Express",
            "url": "https://www.dtdc.com/track-your-shipment/"
        }

def inspect_all():
    env = mm.get_backend_env()
    excel_path = os.path.join(os.getcwd(), 'SAINI  2.xlsx')
    wb = openpyxl.load_workbook(excel_path, data_only=True)
    sheet = wb['Courier Dispatch Ready']

    conn = psycopg2.connect(env['DATABASE_URL'])
    cur = conn.cursor(cursor_factory=RealDictCursor)
    cur.execute("""
        SELECT 
            r.id as registration_id,
            r."bibNumber" as bib,
            r.distance,
            r."shippingName" as shipping_name,
            r."shippingPhone" as shipping_phone,
            r."shippingLine1" as address_line1,
            COALESCE(r."shippingLine2", '') as address_line2,
            r."shippingCity" as city,
            r."shippingState" as state,
            r."shippingPincode" as pincode,
            u.name as user_name,
            u.email as user_email,
            e.title as event_title,
            m.id as medal_delivery_id,
            m.status as medal_status,
            m."trackingNumber" as db_tracking_number,
            m.courier as db_courier,
            m."dispatchedAt" as db_dispatched_at
        FROM "Registration" r
        JOIN "User" u ON r."userId" = u.id
        JOIN "Event" e ON r."eventId" = e.id
        LEFT JOIN "MedalDelivery" m ON m."registrationId" = r.id
        WHERE r."bibNumber" ILIKE 'RAR-%'
    """)
    db_rows = cur.fetchall()
    conn.close()

    db_by_bib = {r['bib'].strip().upper(): r for r in db_rows if r['bib']}

    already_done = []
    to_update = []
    no_tracking_in_sheet = []

    for r in range(4, sheet.max_row + 1):
        bib = str(sheet.cell(r, 2).value or '').strip()
        name = str(sheet.cell(r, 3).value or '').strip()
        phone = str(sheet.cell(r, 4).value or '').strip()
        email = str(sheet.cell(r, 6).value or '').strip()
        tracking = str(sheet.cell(r, 16).value or '').strip()
        courier_raw = str(sheet.cell(r, 18).value or '').strip()

        if not bib and not name:
            continue

        if not tracking or tracking.lower() in ['none', 'nan', 'null', '-', '']:
            no_tracking_in_sheet.append({
                'row': r, 'bib': bib, 'name': name, 'phone': phone
            })
            continue

        d = db_by_bib.get(bib.upper())
        if not d:
            print(f"Warning: BIB {bib} not found in DB!")
            continue

        courier_info = get_courier_details(courier_raw, tracking)
        runner_name = d["shipping_name"] or d["user_name"] or name
        to_email = d["user_email"] or email
        dist_str = f"{d['distance']} Challenge" if d['distance'] else "Finisher"

        record_info = {
            'row': r,
            'bib': bib,
            'runner_name': runner_name,
            'email': to_email,
            'tracking': tracking,
            'courier_raw': courier_raw,
            'courier_name': courier_info['name'],
            'tracking_url': courier_info['url'],
            'registration_id': d['registration_id'],
            'event_title': d['event_title'] or "Rise and Run Virtual Challenge 2026",
            'distance': dist_str,
            'shippingLine1': d['address_line1'],
            'shippingLine2': d['address_line2'],
            'city': d['city'],
            'state': d['state'],
            'pincode': d['pincode'],
            'db_tracking': (d['db_tracking_number'] or '').strip(),
            'db_status': d['medal_status']
        }

        if record_info['db_tracking']:
            already_done.append(record_info)
        else:
            to_update.append(record_info)

    print(f"Total Rows Checked: {len(already_done) + len(to_update) + len(no_tracking_in_sheet)}")
    print(f"Already updated in DB (SKIP): {len(already_done)}")
    print(f"To update in DB and SEND EMAIL: {len(to_update)}")
    print(f"No tracking in SAINI 2.xlsx (SKIP): {len(no_tracking_in_sheet)}")

    print("\n--- DETAILED LIST OF 27 RUNNERS TO UPDATE & EMAIL ---")
    for i, item in enumerate(to_update, 1):
        print(f"{i:02d}. [Row {item['row']:3d}] {item['bib']:10} | {item['runner_name'][:20]:20} | {item['email'][:30]:30} | {item['courier_name']:16} | AWB: {item['tracking']}")

    return already_done, to_update, no_tracking_in_sheet

if __name__ == '__main__':
    inspect_all()
