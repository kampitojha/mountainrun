import sys
import os
sys.path.insert(0, os.path.abspath("."))
import scripts.medal_dispatch_manager as mm
from psycopg2.extras import RealDictCursor

conn = mm.get_db_connection()
cur = conn.cursor(cursor_factory=RealDictCursor)

cur.execute('SELECT id, title, slug FROM "Event"')
events = cur.fetchall()
print("=== ALL EVENTS ===")
for e in events:
    print(e)

cur.execute("""
    SELECT e.title, e.slug, r."proofStatus", count(*) as total
    FROM "Registration" r
    JOIN "Event" e ON r."eventId" = e.id
    GROUP BY e.title, e.slug, r."proofStatus"
    ORDER BY e.title, r."proofStatus"
""")
print("\n=== REGISTRATIONS BY PROOF STATUS ===")
for row in cur.fetchall():
    print(dict(row))

cur.execute("""
    SELECT count(DISTINCT r.id) as distinct_registrations_with_proof
    FROM "ProofUpload" pu
    JOIN "Registration" r ON pu."registrationId" = r.id
    JOIN "Event" e ON r."eventId" = e.id
    WHERE e.title ILIKE '%sports%' or e.slug ILIKE '%sports%'
""")
print("\n=== PROOF UPLOADS FOR SPORTS DAY ===", cur.fetchone())

# Check schema of ProofUpload
cur.execute("""
    SELECT column_name, data_type
    FROM information_schema.columns
    WHERE table_name = 'ProofUpload'
""")
print("\n=== PROOF UPLOAD COLUMNS ===")
for col in cur.fetchall():
    print(dict(col))

conn.close()
