import sys
import os
sys.path.insert(0, os.path.abspath("."))
import scripts.medal_dispatch_manager as mm
from psycopg2.extras import RealDictCursor

conn = mm.get_db_connection()
cur = conn.cursor(cursor_factory=RealDictCursor)

cur.execute("""
    SELECT 
        r.id as registration_id,
        r."bibNumber" as bib_number,
        r."userId" as user_id,
        u.name as user_name,
        u.email as email,
        COALESCE(r."shippingPhone", u.phone) as phone,
        r.distance as distance,
        r."activityType" as activity_type,
        r."finishTimeSeconds" as finish_time_seconds,
        r."shippingName" as shipping_name,
        r."shippingLine1" as address_line1,
        COALESCE(r."shippingLine2", '') as address_line2,
        r."shippingCity" as city,
        r."shippingState" as state,
        r."shippingPincode" as pincode,
        r."proofStatus" as proof_status,
        COALESCE(m.status, 'PENDING') as medal_status,
        m."trackingNumber" as tracking_number,
        m."courier" as courier,
        r."registeredAt" as registered_at,
        c."certificateNumber" as certificate_number,
        pu."activityImageUrl" as proof_url,
        pu."submittedAt" as proof_submitted_at,
        pu."reviewedAt" as proof_reviewed_at,
        p."razorpayPaymentId" as payment_id,
        p."amountInPaise" as amount_in_paise
    FROM "Registration" r
    JOIN "User" u ON r."userId" = u.id
    JOIN "Event" e ON r."eventId" = e.id
    LEFT JOIN "Payment" p ON p."registrationId" = r.id
    LEFT JOIN "MedalDelivery" m ON m."registrationId" = r.id
    LEFT JOIN "ProofUpload" pu ON pu."registrationId" = r.id
    LEFT JOIN "Certificate" c ON c."registrationId" = r.id
    WHERE e.slug = 'sports-day-celebration'
      AND r."proofStatus" = 'APPROVED'
    ORDER BY r."registeredAt" ASC
""")

rows = cur.fetchall()
print(f"Total rows retrieved (with joins): {len(rows)}")

# Deduplicate if a registration had multiple proofs or payments
by_bib = {}
for r in rows:
    bib = r['bib_number']
    if bib not in by_bib:
        by_bib[bib] = r
    else:
        # Keep one with proof_url or most recent
        if not by_bib[bib]['proof_url'] and r['proof_url']:
            by_bib[bib] = r

print(f"Unique registrations (by BIB): {len(by_bib)}")

# Check medal delivery status breakdown
medal_statuses = {}
for r in by_bib.values():
    st = r['medal_status']
    medal_statuses[st] = medal_statuses.get(st, 0) + 1
print("Medal Delivery Statuses:", medal_statuses)

conn.close()
