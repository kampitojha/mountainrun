import os
import sys
import json
import psycopg2
from psycopg2.extras import RealDictCursor

if sys.platform.startswith("win"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

def get_backend_env():
    possible_paths = [
        os.path.join(os.getcwd(), "backend", ".env"),
        os.path.join(os.path.dirname(__file__), "..", "backend", ".env"),
        os.path.join(os.path.dirname(__file__), ".env"),
        os.path.join(os.getcwd(), ".env")
    ]
    env_vars = {}
    for p in possible_paths:
        if os.path.exists(p):
            with open(p, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        env_vars[k.strip()] = v.strip("\"'")
            break
    return env_vars

ENV = get_backend_env()
DB_URL = ENV.get("DATABASE_URL")

conn = psycopg2.connect(DB_URL)
cur = conn.cursor(cursor_factory=RealDictCursor)

cur.execute("""
    SELECT 
        r.*,
        u.name as user_name, u.email as user_email, u.phone as user_phone,
        e.title as event_title, e.slug as event_slug,
        p.status as payment_status, p."amountInPaise", p."paidAt", p."razorpayPaymentId", p."razorpayOrderId",
        pu.id as proof_id, pu."activityImageUrl", pu."sourceApp", pu."submittedAt" as proof_submitted_at, pu.status as proof_upload_status, pu."reviewerNote",
        m.status as medal_status, m.courier, m."trackingNumber", m."trackingUrl", m."dispatchedAt", m."deliveredAt",
        c."certificateNumber", c.status as certificate_status
    FROM "Registration" r
    JOIN "User" u ON r."userId" = u.id
    JOIN "Event" e ON r."eventId" = e.id
    LEFT JOIN "Payment" p ON p."registrationId" = r.id
    LEFT JOIN "ProofUpload" pu ON pu."registrationId" = r.id
    LEFT JOIN "MedalDelivery" m ON m."registrationId" = r.id
    LEFT JOIN "Certificate" c ON c."registrationId" = r.id
    WHERE r."bibNumber" ILIKE '%662712%'
""")
res = cur.fetchall()
print(json.dumps([dict(r) for r in res], default=str, indent=2))

conn.close()
