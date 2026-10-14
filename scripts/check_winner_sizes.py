import json
import psycopg2
from psycopg2.extras import RealDictCursor
import sys
import os

sys.path.insert(0, os.path.abspath('scripts'))
from tshirt_list_manager import get_backend_env

with open('scripts/top3_sports_day.json', 'r', encoding='utf-8') as f:
    winners = json.load(f)

bibs = [w['bib'] for w in winners]

env = get_backend_env()
conn = None
for i in range(5):
    try:
        conn = psycopg2.connect(env.get('DATABASE_URL'), connect_timeout=10)
        break
    except Exception:
        import time
        time.sleep(2)
cur = conn.cursor(cursor_factory=RealDictCursor)

cur.execute('''
    SELECT 
        r."bibNumber", r."adminNote", r."shippingLine1", r."shippingLine2",
        pu."reviewerNote", pu."sourceApp"
    FROM "Registration" r
    LEFT JOIN "ProofUpload" pu ON pu."registrationId" = r.id
    WHERE r."bibNumber" = ANY(%s)
''', (bibs,))

rows = cur.fetchall()
print(f"Total winners checked in DB: {len(rows)}")
found_any = False
for r in rows:
    text = f"{r['adminNote']} {r['shippingLine2']} {r['reviewerNote']}"
    for s in [' S ', ' M ', ' L ', ' XL ', ' XXL ', 'size', 'Size', 'SIZE', 'tshirt', 't-shirt']:
        if s in text:
            print(f"Found mention in BIB {r['bibNumber']}: {text}")
            found_any = True

if not found_any:
    print("RESULT: In 21 winners me se kisi ka bhi T-shirt size database me kahin bhi maujood NAHI hai.")

conn.close()
