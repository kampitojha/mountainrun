import sys
import os
import json
import psycopg2
from psycopg2.extras import RealDictCursor

sys.path.insert(0, os.path.abspath('scripts'))
from tshirt_list_manager import get_backend_env

env = get_backend_env()
db_url = env.get("DATABASE_URL")
if not db_url:
    raise RuntimeError("DATABASE_URL not found")

conn = psycopg2.connect(db_url)
cur = conn.cursor(cursor_factory=RealDictCursor)

cur.execute('SELECT id, title, slug, distances FROM "Event" WHERE slug ILIKE %s', ('%gandhi%',))
event = cur.fetchone()
if not event:
    raise RuntimeError("Gandhi event not found")

distances = event['distances']

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

print("=" * 85)
print(f"OFFICIAL TOP 3 LEADERBOARD FINISHERS — {event['title'].upper()}")
print("=" * 85)

all_top3 = []

for dist in distances:
    cur.execute('''
        SELECT 
            r.id as registration_id,
            r."bibNumber" as bib_number,
            r."userId" as user_id,
            u.name as user_name,
            u.email as email,
            COALESCE(r."shippingPhone", u.phone) as phone,
            r.distance as distance,
            r."finishTimeSeconds" as finish_time_seconds,
            r."shippingName" as shipping_name,
            r."shippingLine1" as address_line1,
            COALESCE(r."shippingLine2", '') as address_line2,
            r."shippingCity" as city,
            r."shippingState" as state,
            r."shippingPincode" as pincode,
            r."adminNote" as admin_note,
            r."tshirtSize" as tshirt_size
        FROM "Registration" r
        JOIN "User" u ON r."userId" = u.id
        WHERE r."eventId" = %s AND r."proofStatus" = 'APPROVED'
          AND LOWER(REPLACE(r.distance, ' ', '')) = LOWER(REPLACE(%s, ' ', ''))
        ORDER BY r."finishTimeSeconds" ASC NULLS LAST
    ''', (event['id'], dist))
    
    rows = cur.fetchall()
    
    print(f"\n📂 CATEGORY: {dist} (Total Approved: {len(rows)})")
    
    for rank in range(1, 4):
        if rank <= len(rows):
            runner = rows[rank - 1]
            is_dummy = (runner['admin_note'] == 'PODIUM_DUMMY_RANK_PLACEHOLDER')
            
            entry = {
                "category": dist,
                "rank": rank,
                "is_real_winner": (rank == 1 and not is_dummy),
                "is_dummy": is_dummy,
                "tshirt_eligible": (rank == 1 and not is_dummy),
                "bib": runner['bib_number'],
                "name": runner['shipping_name'] or runner['user_name'],
                "phone": runner['phone'],
                "email": runner['email'],
                "time": format_time(runner['finish_time_seconds']),
                "seconds": runner['finish_time_seconds'],
                "city": runner['city'],
                "state": runner['state'],
                "pincode": runner['pincode'],
                "address": f"{runner['address_line1']}, {runner['address_line2']}".strip().rstrip(','),
                "tshirt_size": runner['tshirt_size']
            }
            all_top3.append(entry)
            
            status_tag = "🥇 [REAL WINNER -> T-SHIRT]" if entry["tshirt_eligible"] else "🥈/🥉 [PODIUM DUMMY -> NO T-SHIRT]"
            print(f"  Rank {rank} {status_tag}: {entry['name']} ({entry['bib']}) | Time: {entry['time']} | {entry['city']}, {entry['state']}")

conn.close()

output_json_path = os.path.join(os.getcwd(), 'scripts', 'top3_gandhi_jayanti.json')
with open(output_json_path, 'w', encoding='utf-8') as f:
    json.dump(all_top3, f, indent=2, ensure_ascii=False)

print(f"\nSaved Top 3 Gandhi Jayanti list to: {output_json_path}")
