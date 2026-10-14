import sys
import os
sys.path.insert(0, os.path.abspath('scripts'))
from tshirt_list_manager import get_db
from psycopg2.extras import RealDictCursor

conn = get_db()
cur = conn.cursor(cursor_factory=RealDictCursor)

print("=== SPORTS DAY APPROVED RUNNERS BY DISTANCE ===")
cur.execute('''
    SELECT r.distance, count(*) as cnt
    FROM "Registration" r
    JOIN "Event" e ON r."eventId" = e.id
    WHERE e.slug = 'sports-day-celebration' AND r."proofStatus" = 'APPROVED'
    GROUP BY r.distance
    ORDER BY cnt DESC
''')
for row in cur.fetchall():
    print(f"Distance: {row['distance']} -> Real Approved Finishers: {row['cnt']}")

# Check if there is ANY field or table with tshirt size
cur.execute('''
    SELECT table_name, column_name, data_type
    FROM information_schema.columns 
    WHERE column_name ILIKE '%size%' OR column_name ILIKE '%tshirt%' OR column_name ILIKE '%shirt%'
''')
tshirt_cols = cur.fetchall()
print("\n=== COLUMNS RELATED TO SIZE/TSHIRT IN DB ===")
for c in tshirt_cols:
    print(f"Table: {c['table_name']} | Column: {c['column_name']} | Type: {c['data_type']}")

# Check adminNote or any other column in Registration
cur.execute('''
    SELECT r."bibNumber", r."adminNote", r."shippingLine2"
    FROM "Registration" r
    JOIN "Event" e ON r."eventId" = e.id
    WHERE e.slug = 'sports-day-celebration' AND (r."adminNote" IS NOT NULL OR r."shippingLine2" ILIKE '%size%')
''')
notes = cur.fetchall()
print(f"\n=== REGISTRATIONS WITH ADMIN NOTES OR SIZE IN LINE2: {len(notes)} ===")
for n in notes:
    print(n)

conn.close()
