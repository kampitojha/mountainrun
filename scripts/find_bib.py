import os
import psycopg2
from psycopg2.extras import RealDictCursor
from tshirt_list_manager import get_backend_env

conn = psycopg2.connect(get_backend_env()['DATABASE_URL'])
cur = conn.cursor(cursor_factory=RealDictCursor)

cur.execute("""
    SELECT r.id, r."bibNumber", r."shippingName", u.name, e.title
    FROM "Registration" r
    JOIN "User" u ON r."userId" = u.id
    JOIN "Event" e ON r."eventId" = e.id
    WHERE r."bibNumber" ILIKE '%127494%' OR r."bibNumber" ILIKE '%127%' OR r."bibNumber" ILIKE '%SDC%'
""")
rows = cur.fetchall()
print("Matches found:")
for r in rows:
    print(dict(r))
conn.close()
