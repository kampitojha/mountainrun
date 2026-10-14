import sys
import os
sys.path.insert(0, os.path.abspath("."))
import scripts.medal_dispatch_manager as mm
from psycopg2.extras import RealDictCursor

conn = mm.get_db_connection()
cur = conn.cursor(cursor_factory=RealDictCursor)

cur.execute('SELECT id, title, slug FROM "Event"')
print("=== EVENTS ===")
events = cur.fetchall()
for e in events:
    print(dict(e))

cur.execute('''
    SELECT e.title, e.slug, r."proofStatus", count(*) as cnt
    FROM "Registration" r
    JOIN "Event" e ON r."eventId" = e.id
    GROUP BY e.title, e.slug, r."proofStatus"
    ORDER BY e.title, r."proofStatus"
''')
print("\n=== PROOF STATUSES PER EVENT ===")
for r in cur.fetchall():
    print(dict(r))

# Check MedalDelivery status as well
cur.execute('''
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'MedalDelivery'
''')
print("\n=== MedalDelivery COLUMNS ===")
for col in cur.fetchall():
    print(dict(col))

conn.close()
