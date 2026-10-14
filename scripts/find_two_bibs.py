import os
import sys
import psycopg2
from psycopg2.extras import RealDictCursor

sys.path.insert(0, os.path.abspath("."))
import scripts.medal_dispatch_manager as mm

env = mm.get_backend_env()
conn = psycopg2.connect(env["DATABASE_URL"])
cur = conn.cursor(cursor_factory=RealDictCursor)

print("--- Searching for RAR-525812 ---")
cur.execute("""
    SELECT r.id, r."bibNumber", r."shippingName", u.name, u.email, r.status, r."proofStatus", r."finishTimeSeconds", e.title as event_title, e.slug as event_slug
    FROM "Registration" r
    JOIN "User" u ON r."userId" = u.id
    JOIN "Event" e ON r."eventId" = e.id
    WHERE r."bibNumber" ILIKE '%525812%'
""")
for r in cur.fetchall():
    print(dict(r))

for reg_id, bib in [('cmu336pib015xo601qi6bfat5', 'RAR-525812'), ('cmttkx0i1004wo601yyfm6p9l', 'RAR-226585')]:
    print(f"\n--- Checking {bib} ---")
    cur.execute('SELECT * FROM "Registration" WHERE id = %s', (reg_id,))
    reg = cur.fetchone()
    print("Registration:", reg)


conn.close()

