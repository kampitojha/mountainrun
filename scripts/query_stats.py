import os
import sys
import psycopg2
from psycopg2.extras import RealDictCursor
from tshirt_list_manager import get_backend_env

conn = psycopg2.connect(get_backend_env()['DATABASE_URL'])
cur = conn.cursor(cursor_factory=RealDictCursor)

# 1. Overall stats per event
cur.execute("""
    SELECT 
        e.id as event_id,
        e.title as event_title,
        COUNT(r.id) as total_confirmed,
        COUNT(CASE WHEN r."proofStatus" IN ('SUBMITTED', 'APPROVED') OR pu.id IS NOT NULL THEN 1 END) as proof_submitted_count,
        COUNT(CASE WHEN (r."proofStatus" IN ('SUBMITTED', 'APPROVED') OR pu.id IS NOT NULL) 
                        AND (m.status = 'DISPATCHED' OR m.status = 'DELIVERED') 
                        AND m."trackingNumber" IS NOT NULL AND TRIM(m."trackingNumber") != '' THEN 1 END) as medal_dispatched_with_proof,
        COUNT(CASE WHEN (r."proofStatus" IN ('SUBMITTED', 'APPROVED') OR pu.id IS NOT NULL) 
                        AND (m.status IS NULL OR m.status = 'PENDING' OR m."trackingNumber" IS NULL OR TRIM(m."trackingNumber") = '') THEN 1 END) as pending_medal_with_proof
    FROM "Event" e
    JOIN "Registration" r ON r."eventId" = e.id
    LEFT JOIN "Payment" p ON p."registrationId" = r.id
    LEFT JOIN "ProofUpload" pu ON pu."registrationId" = r.id
    LEFT JOIN "MedalDelivery" m ON m."registrationId" = r.id
    WHERE r.status IN ('CONFIRMED', 'COMPLETED') OR p.status = 'PAID'
    GROUP BY e.id, e.title
    ORDER BY e.title
""")
stats = cur.fetchall()

print("\n=========================================================================================")
print("                   PROOF SUBMITTED VS MEDAL DISPATCH STATUS PER EVENT                    ")
print("=========================================================================================")
for s in stats:
    print(f"Event: {s['event_title']}")
    print(f"  ├─ Total Confirmed Registrations:       {s['total_confirmed']}")
    print(f"  ├─ Total Proofs Submitted / Approved:   {s['proof_submitted_count']}")
    print(f"  ├─ Medals Already Dispatched (w/ proof): {s['medal_dispatched_with_proof']}")
    print(f"  └─ 🚨 Medals PENDING Dispatch (w/ proof): {s['pending_medal_with_proof']}")
    print()

# 2. Detailed list of all pending runners who submitted proof but medal not dispatched
cur.execute("""
    SELECT 
        e.title as event_title,
        r."bibNumber" as bib_number,
        u.name as user_name,
        r."shippingName" as shipping_name,
        u.email,
        COALESCE(r."shippingPhone", u.phone) as phone,
        r.distance,
        r."shippingCity" as city,
        r."shippingState" as state,
        r."shippingPincode" as pincode,
        r."proofStatus" as proof_status,
        COALESCE(m.status, 'PENDING') as medal_status,
        r."registeredAt" as registered_at
    FROM "Registration" r
    JOIN "User" u ON r."userId" = u.id
    JOIN "Event" e ON r."eventId" = e.id
    LEFT JOIN "Payment" p ON p."registrationId" = r.id
    LEFT JOIN "ProofUpload" pu ON pu."registrationId" = r.id
    LEFT JOIN "MedalDelivery" m ON m."registrationId" = r.id
    WHERE (r.status IN ('CONFIRMED', 'COMPLETED') OR p.status = 'PAID')
      AND (r."proofStatus" IN ('SUBMITTED', 'APPROVED') OR pu.id IS NOT NULL)
      AND (m.status IS NULL OR m.status = 'PENDING' OR m."trackingNumber" IS NULL OR TRIM(m."trackingNumber") = '')
    ORDER BY e.title, r."registeredAt" ASC
""")
pending = cur.fetchall()

print("=========================================================================================")
print(f"  TOTAL RUNNERS (PROOF SUBMITTED, MEDAL NOT DISPATCHED): {len(pending)}")
print("=========================================================================================")
print(f"{'#':<3} | {'BIB Number':<12} | {'Runner Name':<20} | {'Distance':<8} | {'City':<14} | {'State':<15} | {'Proof Status':<12} | {'Medal Status':<12}")
print("-" * 105)
for idx, p in enumerate(pending, 1):
    print(f"{idx:<3} | {p['bib_number']:<12} | {p['user_name'][:18]:<20} | {p['distance']:<8} | {str(p['city'])[:12]:<14} | {str(p['state'])[:13]:<15} | {p['proof_status']:<12} | {p['medal_status']:<12}")
print("=========================================================================================\n")

conn.close()
