import os
import sys
import psycopg2
from psycopg2.extras import RealDictCursor

sys.path.insert(0, os.path.abspath("."))
import scripts.medal_dispatch_manager as mm

env = mm.get_backend_env()
conn = psycopg2.connect(env["DATABASE_URL"])
cur = conn.cursor(cursor_factory=RealDictCursor)

cur.execute("""
    SELECT 
        r.id,
        r."bibNumber" as bib,
        r."shippingName" as shipping_name,
        u.name as user_name,
        u.email,
        u.phone as user_phone,
        r."shippingPhone" as shipping_phone,
        r."shippingLine1" as line1,
        r."shippingLine2" as line2,
        r."shippingCity" as city,
        r."shippingState" as state,
        r."shippingPincode" as pincode,
        r.distance,
        r."proofStatus" as proof_status,
        m.status as medal_status,
        m."trackingNumber" as tracking_number
    FROM "Registration" r
    JOIN "User" u ON r."userId" = u.id
    JOIN "Event" e ON r."eventId" = e.id
    LEFT JOIN "MedalDelivery" m ON m."registrationId" = r.id
    WHERE (e.slug ILIKE '%rise%' OR r."bibNumber" ILIKE 'RAR-%')
      AND (
          r."proofStatus" = 'APPROVED' 
          OR r."bibNumber" IN ('RAR-525812', 'RAR-226585')
      )
      AND (m."trackingNumber" IS NULL OR m."trackingNumber" = '')
    ORDER BY r."bibNumber"
""")
rows = cur.fetchall()
conn.close()

print(f"Total pending after approving the 2: {len(rows)}")
for i, r in enumerate(rows, 1):
    name = r["shipping_name"] or r["user_name"]
    print(f"{i:02d}. BIB: {r['bib']:12} | Name: {name:25} | Phone: {r['shipping_phone'] or r['user_phone']} | City: {r['city']}")
