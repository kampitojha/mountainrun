import os
import sys
import json
from collections import Counter
import psycopg2
from psycopg2.extras import RealDictCursor
import openpyxl

sys.path.insert(0, os.path.abspath("."))
import scripts.medal_dispatch_manager as mm

def main():
    env = mm.get_backend_env()
    conn = psycopg2.connect(env["DATABASE_URL"])
    cur = conn.cursor(cursor_factory=RealDictCursor)

    # Check ProofUpload schema
    cur.execute("""
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'ProofUpload'
    """)
    print("ProofUpload columns:", [c["column_name"] for c in cur.fetchall()])

    # Fetch all Rise and Run registrations with proof upload and medal delivery
    cur.execute("""
        SELECT 
            r.id as reg_id,
            r."bibNumber" as bib,
            r.distance,
            r."shippingName" as shipping_name,
            u.name as user_name,
            u.email as user_email,
            u.phone as user_phone,
            r."shippingPhone" as shipping_phone,
            r."shippingCity" as city,
            r."shippingState" as state,
            r.status as reg_status,
            r."proofStatus" as proof_status,
            m.id as medal_id,
            m.status as medal_status,
            m."trackingNumber" as tracking_number,
            m.courier as courier,
            (SELECT COUNT(*) FROM "ProofUpload" pu WHERE pu."registrationId" = r.id) as proof_count,
            (SELECT pu.status FROM "ProofUpload" pu WHERE pu."registrationId" = r.id ORDER BY pu."submittedAt" DESC LIMIT 1) as latest_proof_status,
            (SELECT pu."activityImageUrl" FROM "ProofUpload" pu WHERE pu."registrationId" = r.id ORDER BY pu."submittedAt" DESC LIMIT 1) as latest_proof_url
        FROM "Registration" r
        JOIN "User" u ON r."userId" = u.id
        JOIN "Event" e ON r."eventId" = e.id
        LEFT JOIN "MedalDelivery" m ON m."registrationId" = r.id
        WHERE e.slug ILIKE '%rise%' OR r."bibNumber" ILIKE 'RAR-%'
        ORDER BY r."bibNumber"
    """)
    rows = cur.fetchall()
    conn.close()

    total = len(rows)
    print(f"\n==========================================")
    print(f"Total Rise and Run registrations in DB: {total}")
    print(f"==========================================")

    print("\n--- Registration proofStatus breakdown ---")
    proof_counts = Counter(r["proof_status"] for r in rows)
    for k, v in sorted(proof_counts.items(), key=lambda x: str(x[0])):
        print(f"  {k}: {v}")

    print("\n--- Registrations with actual ProofUpload records ---")
    has_proof = [r for r in rows if r["proof_count"] > 0]
    print(f"Total with at least 1 ProofUpload: {len(has_proof)}")

    print("\n--- MedalDelivery status breakdown across all RAR ---")
    medal_counts = Counter(r["medal_status"] for r in rows)
    for k, v in medal_counts.items():
        print(f"  {k}: {v}")

    has_tracking = [r for r in rows if r["tracking_number"]]
    no_tracking = [r for r in rows if not r["tracking_number"]]
    print(f"Total with trackingNumber in DB: {len(has_tracking)}")
    print(f"Total WITHOUT trackingNumber in DB: {len(no_tracking)}")

    # Load SAINI 2 tracking
    wb = openpyxl.load_workbook('SAINI  2.xlsx', data_only=True)
    sheet = wb['Courier Dispatch Ready']
    saini2_tracking = {}
    for r in range(4, sheet.max_row + 1):
        b = str(sheet.cell(r, 2).value or '').strip().upper()
        t = str(sheet.cell(r, 16).value or '').strip()
        if b and t and t.lower() not in ['none', 'null', 'nan', '-', '']:
            saini2_tracking[b] = t

    # Now let's analyze by proof category:
    # 1. proofStatus == 'APPROVED'
    approved_regs = [r for r in rows if r["proof_status"] == 'APPROVED']
    appr_dispatched = [r for r in approved_regs if r["tracking_number"]]
    appr_pending = [r for r in approved_regs if not r["tracking_number"]]

    appr_in_saini2 = [r for r in appr_pending if r['bib'].upper() in saini2_tracking]
    appr_not_in_saini2 = [r for r in appr_pending if r['bib'].upper() not in saini2_tracking]

    print(f"\n==========================================")
    print(f"CATEGORY 1: PROOF APPROVED (Total: {len(approved_regs)})")
    print(f"==========================================")
    print(f"  ✅ Already Dispatched in DB (Tracking present): {len(appr_dispatched)}")
    print(f"  ⏳ Medal Pending in DB (No tracking yet): {len(appr_pending)}")
    print(f"     ├── Covered in SAINI 2.xlsx (Ready in Batch 2): {len(appr_in_saini2)}")
    print(f"     └── Still NOT in SAINI 2.xlsx (Completely pending dispatch): {len(appr_not_in_saini2)}")

    if appr_not_in_saini2:
        print(f"\nDetails of {len(appr_not_in_saini2)} Approved Runners NOT in SAINI 2 or with no tracking in sheet:")
        for i, r in enumerate(appr_not_in_saini2, 1):
            print(f"  {i:02d}. BIB: {r['bib']} | Name: {r['shipping_name'] or r['user_name']} | Phone: {r['shipping_phone'] or r['user_phone']} | City: {r['city']}")

    # 2. proof submitted but status is SUBMITTED or PENDING or UNDER_REVIEW
    submitted_regs = [r for r in rows if r["proof_status"] in ['SUBMITTED', 'PENDING'] or (r["proof_count"] > 0 and r["proof_status"] not in ['APPROVED', 'REJECTED'])]
    print(f"\n==========================================")
    print(f"CATEGORY 2: PROOF SUBMITTED BUT NOT APPROVED (Total: {len(submitted_regs)})")
    print(f"==========================================")
    for r in submitted_regs:
        print(f"  BIB: {r['bib']} | Name: {r['shipping_name'] or r['user_name']} | ProofStatus: {r['proof_status']} | ProofCount: {r['proof_count']} | LatestProofStatus: {r['latest_proof_status']} | MedalStatus: {r['medal_status']}")

    # 3. proofStatus == 'REJECTED'
    rejected_regs = [r for r in rows if r["proof_status"] == 'REJECTED']
    print(f"\n==========================================")
    print(f"CATEGORY 3: PROOF REJECTED (Total: {len(rejected_regs)})")
    print(f"==========================================")
    for r in rejected_regs:
        print(f"  BIB: {r['bib']} | Name: {r['shipping_name'] or r['user_name']} | ProofStatus: {r['proof_status']}")

    # 4. proof NOT submitted at all (NONE or empty proofStatus and 0 ProofUpload)
    not_submitted = [r for r in rows if not r["proof_status"] or r["proof_status"] in ['NONE', 'NOT_SUBMITTED'] and r["proof_count"] == 0]
    print(f"\n==========================================")
    print(f"CATEGORY 4: PROOF NOT SUBMITTED AT ALL: {len(not_submitted)}")
    print(f"==========================================")

if __name__ == "__main__":
    main()
