import sys
import os
import psycopg2
from psycopg2.extras import RealDictCursor

sys.path.insert(0, os.path.abspath('scripts'))
from tshirt_list_manager import get_backend_env

env = get_backend_env()
db_url = env.get("DATABASE_URL")
conn = psycopg2.connect(db_url)
cur = conn.cursor(cursor_factory=RealDictCursor)

cur.execute('SELECT id, title, slug, distances FROM "Event" WHERE slug ILIKE %s', ('%gandhi%',))
event = cur.fetchone()

print(f"Event: {event['title']} ({event['id']})")

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
        r."tshirtSize" as tshirt_size,
        r."proofStatus" as proof_status,
        r.status as status
    FROM "Registration" r
    JOIN "User" u ON r."userId" = u.id
    WHERE r."eventId" = %s AND r."proofStatus" = 'APPROVED'
    ORDER BY r.distance, r."finishTimeSeconds" ASC NULLS LAST
''', (event['id'],))

rows = cur.fetchall()
print(f"Total approved: {len(rows)}")

conn.close()
