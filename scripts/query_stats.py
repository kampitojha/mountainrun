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

# 1. Fetch events
cur.execute('SELECT id, title, slug, status FROM "Event"')
events = cur.fetchall()
print("=== ALL EVENTS ===")
for e in events:
    print(f"ID: {e['id']} | Title: {e['title']} | Slug: {e['slug']} | Status: {e['status']}")

# Find independence day event
ind_events = [e for e in events if "independ" in e['title'].lower() or "independ" in e['slug'].lower() or "tiranga" in e['title'].lower() or "tiranga" in e['slug'].lower() or "15" in e['slug'].lower()]

print("\n=== MATCHING INDEPENDENCE EVENTS ===")
for e in ind_events:
    print(e)

if not ind_events:
    print("No specific independence slug found, showing all events' registration stats:")
    target_events = events
else:
    target_events = ind_events

for ev in target_events:
    ev_id = ev['id']
    print(f"\n=======================================================")
    print(f"STATS FOR EVENT: {ev['title']} ({ev['slug']}) [ID: {ev_id}]")
    print(f"=======================================================")
    
    # Total confirmed registrations
    cur.execute('''
        SELECT 
            r.id,
            r."bibNumber",
            r."userId",
            r.status as reg_status,
            r."proofStatus",
            r."shippingName",
            r."shippingPhone",
            r."shippingCity",
            r."shippingState",
            r."shippingPincode",
            u.name as user_name,
            u.email as user_email,
            u.phone as user_phone,
            p.status as payment_status,
            m.status as medal_status,
            m.courier as courier,
            m."trackingNumber" as tracking_number,
            m."dispatchedAt" as dispatched_at,
            pu.status as upload_status,
            pu."submittedAt" as proof_submitted_at,
            pu."activityImageUrl" as proof_image
        FROM "Registration" r
        JOIN "User" u ON r."userId" = u.id
        LEFT JOIN "Payment" p ON p."registrationId" = r.id
        LEFT JOIN "MedalDelivery" m ON m."registrationId" = r.id
        LEFT JOIN "ProofUpload" pu ON pu."registrationId" = r.id
        WHERE r."eventId" = %s
    ''', (ev_id,))
    
    regs = cur.fetchall()
    print(f"Total Registrations in DB: {len(regs)}")
    
    # Breakdown by registration status
    reg_by_status = {}
    for r in regs:
        st = r['reg_status']
        reg_by_status[st] = reg_by_status.get(st, 0) + 1
    print(f"Registration Status breakdown: {reg_by_status}")
    
    # Consider only CONFIRMED or paid registrations (since pending payment didn't complete)
    confirmed_regs = [r for r in regs if r['reg_status'] == 'CONFIRMED' or (r['payment_status'] == 'PAID')]
    print(f"Confirmed / Paid Registrations: {len(confirmed_regs)}")
    
    # 1. Proof submitted but medal NOT dispatched
    # Proof submitted: proofStatus in ('SUBMITTED', 'APPROVED') or proofUpload exists
    # Medal not dispatched: medal_status IS NULL or medal_status in ('PENDING', 'NOT_ELIGIBLE') or tracking_number is NULL or dispatched_at is NULL
    proof_submitted_not_dispatched = []
    proof_submitted_dispatched = []
    proof_not_submitted = []
    proof_rejected = []
    
    for r in confirmed_regs:
        has_proof = r['proofStatus'] in ('SUBMITTED', 'APPROVED') or (r['proof_submitted_at'] is not None)
        is_rejected = r['proofStatus'] == 'REJECTED'
        is_dispatched = r['medal_status'] in ('DISPATCHED', 'DELIVERED') or (r['tracking_number'] is not None and len(str(r['tracking_number']).strip()) > 0)
        
        if is_rejected:
            proof_rejected.append(r)
        elif has_proof:
            if is_dispatched:
                proof_submitted_dispatched.append(r)
            else:
                proof_submitted_not_dispatched.append(r)
        else:
            proof_not_submitted.append(r)
            
    print("\n--- DETAILED SUMMARY (CONFIRMED / PAID USERS) ---")
    print(f"1. Proof submitted LEKIN Medal dispatch NAHI hua: {len(proof_submitted_not_dispatched)}")
    print(f"2. Proof submitted AND Medal DISPATCHED: {len(proof_submitted_dispatched)}")
    print(f"3. Proof submit HI NAHI kiya (NOT SUBMITTED): {len(proof_not_submitted)}")
    print(f"4. Proof REJECTED: {len(proof_rejected)}")
    
    print("\n--- LIST: Proof Submitted but Medal NOT Dispatched ---")
    for idx, r in enumerate(proof_submitted_not_dispatched, 1):
        print(f"{idx}. BIB: {r['bibNumber']} | Name: {r['shippingName'] or r['user_name']} | Email: {r['user_email']} | Phone: {r['shippingPhone'] or r['user_phone']} | ProofStatus: {r['proofStatus']} | MedalStatus: {r['medal_status']}")
        
    # Edge cases: Unconfirmed registrations with proofs
    cur.execute('''
        SELECT r.id, r."bibNumber", r.status, r."proofStatus", pu.id as proof_id
        FROM "Registration" r
        JOIN "ProofUpload" pu ON pu."registrationId" = r.id
        WHERE r."eventId" = %s AND r.status != 'CONFIRMED'
    ''', (ev_id,))
    unconfirmed_with_proof = cur.fetchall()
    print(f"Unconfirmed / Failed Payment with Proof Upload: {len(unconfirmed_with_proof)}")

conn.close()
