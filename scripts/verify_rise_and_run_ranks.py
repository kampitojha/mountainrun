import sys
import os
import psycopg2
from psycopg2.extras import RealDictCursor

sys.path.insert(0, os.path.abspath('scripts'))
from tshirt_list_manager import get_backend_env

env = get_backend_env()
conn = psycopg2.connect(env.get('DATABASE_URL'), connect_timeout=10)
cur = conn.cursor(cursor_factory=RealDictCursor)

bibs = [
    'RAR-022007', 'RAR-752636', 'RAR-236816', # 1.6k
    'RAR-955620', 'RAR-997500', 'RAR-360061', # 3.2k
    'RAR-596446', 'RAR-292447', 'RAR-710322', # 5k
    'RAR-871227', 'RAR-627239', 'RAR-463752', # 10k
    'RAR-474191', 'RAR-283732', 'RAR-815836', # 21k
]

for bib in bibs:
    cur.execute('''
        SELECT r.id, r."bibNumber", r.distance, r."eventId", r."finishTimeSeconds"
        FROM "Registration" r
        WHERE r."bibNumber" = %s
    ''', (bib,))
    reg = cur.fetchone()
    if not reg:
        print(f"BIB {bib} NOT FOUND")
        continue

    cur.execute('''
        SELECT id, "bibNumber", "finishTimeSeconds"
        FROM "Registration"
        WHERE "eventId" = %s AND distance = %s AND "proofStatus" = 'APPROVED'
        ORDER BY "finishTimeSeconds" ASC
    ''', (reg['eventId'], reg['distance']))
    finishers = cur.fetchall()

    idx = next((i for i, f in enumerate(finishers) if f['id'] == reg['id']), -1)
    rank_label = "Unknown"
    if idx == 0: rank_label = "🥇 1st Place (Winner)"
    elif idx == 1: rank_label = "🥈 2nd Place"
    elif idx == 2: rank_label = "🥉 3rd Place"
    else: rank_label = f"#{idx+1} Finisher"

    print(f"{bib:12s} | Cat: {reg['distance']:6s} | Rank: {rank_label}")

conn.close()
