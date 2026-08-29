import sys
import os
import json
import psycopg2
from psycopg2.extras import RealDictCursor
from tshirt_list_manager import get_backend_env

conn = psycopg2.connect(get_backend_env()['DATABASE_URL'])
cur = conn.cursor(cursor_factory=RealDictCursor)

queries = sys.argv[1:] if len(sys.argv) > 1 else ['478727', '969498']

for q in queries:
    print(f"\n==================== SEARCH: {q} ====================")
    cur.execute("""
        SELECT 
            r.id, r."bibNumber", r.distance, r.status, r."proofStatus",
            r."finishTimeSeconds",
            r."shippingName", r."shippingPhone", r."shippingLine1", r."shippingLine2",
            r."shippingCity", r."shippingState", r."shippingPincode",
            r."registeredAt",
            u.name as user_name, u.email as user_email, u.phone as user_phone,
            e.title as event_title, e.slug as event_slug,
            p.status as payment_status, p."amountInPaise",
            pu.id as proof_id, pu.status as proof_status_upload,
            m.status as medal_status, m."trackingNumber" as tracking_number,
            c."certificateNumber" as certificate_number
        FROM "Registration" r
        JOIN "User" u ON r."userId" = u.id
        JOIN "Event" e ON r."eventId" = e.id
        LEFT JOIN "Payment" p ON p."registrationId" = r.id
        LEFT JOIN "ProofUpload" pu ON pu."registrationId" = r.id
        LEFT JOIN "MedalDelivery" m ON m."registrationId" = r.id
        LEFT JOIN "Certificate" c ON c."registrationId" = r.id
        WHERE r."bibNumber" ILIKE %s 
           OR u.name ILIKE %s 
           OR u.email ILIKE %s 
           OR u.phone ILIKE %s 
           OR r."shippingPhone" ILIKE %s
    """, (f'%{q}%', f'%{q}%', f'%{q}%', f'%{q}%', f'%{q}%'))
    rows = cur.fetchall()
    if not rows:
        print("  NO MATCHES FOUND")
    for r in rows:
        print(json.dumps(dict(r), default=str, indent=2))

conn.close()

