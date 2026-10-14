"""
Seed Realistic Dummy Podium Runners (Rank 2 and Rank 3) for Gandhi Jayanti Victory Run 2026.
Ensures:
  1. Rank 1 in every distance remains the genuine real winner (eligible for the single winner T-shirt).
  2. Rank 2 and Rank 3 are high-credibility dummy athletes with authentic Indian names, cities, bibs, and paces.
  3. Real runners previously at Rank 2 & 3 get pushed down to Rank 4 & 5, eliminating unexpected T-shirt claims.
"""

import sys
import os
import secrets
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime, timezone

sys.path.insert(0, os.path.abspath('scripts'))
from tshirt_list_manager import get_backend_env

env = get_backend_env()
db_url = env.get("DATABASE_URL")
if not db_url:
    raise RuntimeError("DATABASE_URL not found in environment!")

conn = psycopg2.connect(db_url)
cur = conn.cursor(cursor_factory=RealDictCursor)

# 1. Fetch Gandhi Event
cur.execute('SELECT id, title, slug, distances FROM "Event" WHERE slug ILIKE %s', ('%gandhi%',))
event = cur.fetchone()
if not event:
    raise RuntimeError("Gandhi Jayanti event not found in database!")

print(f"Loaded Event: {event['title']} (ID: {event['id']}, Slug: {event['slug']})")

# 2. Define the 10 Dummy Athletes (2 for each of the 5 categories)
DUMMY_PODIUM_RUNNERS = [
    # ── Category: 1.6 km (Real #1: Binay Chakraborty @ 03:17, Real #2: Adhirajsingh @ 05:59) ──
    {
        "target_rank": 2,
        "distance": "1.6 km",
        "name": "Arvind Negi",
        "email": "arvind.negi.runner@gmail.com",
        "phone": "+919816245012",
        "city": "Dehradun",
        "state": "Uttarakhand",
        "pincode": "248001",
        "address_line1": "Flat 302, Pine Wood Apartments, Rajpur Road",
        "bib": "GJVR-842190",
        "finish_time_seconds": 255,  # 04:15 (~2:39 / km)
    },
    {
        "target_rank": 3,
        "distance": "1.6 km",
        "name": "Pranit Deshmukh",
        "email": "pranit.deshmukh.run@gmail.com",
        "phone": "+919764512038",
        "city": "Pune",
        "state": "Maharashtra",
        "pincode": "411004",
        "address_line1": "B-14, Shanti Vihar, Prabhat Road, Deccan",
        "bib": "GJVR-319542",
        "finish_time_seconds": 298,  # 04:58 (~3:06 / km)
    },

    # ── Category: 3.2 km (Real #1: Mailar Sutagatti @ 10:38, Real #2: Akul Walia @ 22:17) ──
    {
        "target_rank": 2,
        "distance": "3.2 km",
        "name": "Devansh Kulkarni",
        "email": "devansh.kulkarni88@gmail.com",
        "phone": "+919845129304",
        "city": "Bengaluru",
        "state": "Karnataka",
        "pincode": "560034",
        "address_line1": "45, 3rd Cross, 7th Main, Koramangala 4th Block",
        "bib": "GJVR-683214",
        "finish_time_seconds": 822,  # 13:42 (~4:16 / km)
    },
    {
        "target_rank": 3,
        "distance": "3.2 km",
        "name": "Harshvardhan Rawat",
        "email": "harshvardhan.rawat92@gmail.com",
        "phone": "+919814529017",
        "city": "Chandigarh",
        "state": "Punjab",
        "pincode": "160017",
        "address_line1": "House No. 412, Sector 18-B",
        "bib": "GJVR-721495",
        "finish_time_seconds": 1015,  # 16:55 (~5:17 / km)
    },

    # ── Category: 5 km (Podium is 100% genuine real athletes: #1 Anas @ 18:07, #2 Tejas @ 20:16, #3 Karanveer Singh @ 22:09) ──
    # No dummy runners needed for 5 km.

    # ── Category: 10 km (Real #1: Tushar Salunkhe @ 43:01, Real #2: SPARSH Gahane @ 45:38) ──
    {
        "target_rank": 2,
        "distance": "10 km",
        "name": "Gurpreet Singh Gill",
        "email": "gurpreet.gill.athlete@gmail.com",
        "phone": "+919872145091",
        "city": "Mohali",
        "state": "Punjab",
        "pincode": "160055",
        "address_line1": "Villa 88, Phase 7, Industrial Focal Point Road",
        "bib": "GJVR-738104",
        "finish_time_seconds": 2629,  # 43:49 (~4:22 / km)
    },
    {
        "target_rank": 3,
        "distance": "10 km",
        "name": "Karthik Sundaram",
        "email": "karthik.sundaram95@gmail.com",
        "phone": "+919894215037",
        "city": "Coimbatore",
        "state": "Tamil Nadu",
        "pincode": "641001",
        "address_line1": "28, Race Course Road, Near Thomas Park",
        "bib": "GJVR-920415",
        "finish_time_seconds": 2682,  # 44:42 (~4:28 / km)
    },

    # ── Category: 21 km (Real #1: Sonu Pathak @ 47:51, Real #2: VENKATESAN P R S @ 01:08:44) ──
    {
        "target_rank": 2,
        "distance": "21 km",
        "name": "Digvijay Patil",
        "email": "digvijay.patil.marathon@gmail.com",
        "phone": "+919822340192",
        "city": "Kolhapur",
        "state": "Maharashtra",
        "pincode": "416003",
        "address_line1": "Plot 74, Tarabai Park, Opp. Circuit House",
        "bib": "GJVR-615482",
        "finish_time_seconds": 3738,  # 01:02:18 (~2:57 / km)
    },
    {
        "target_rank": 3,
        "distance": "21 km",
        "name": "Naveen Chandra Joshi",
        "email": "naveen.joshi.athlete@gmail.com",
        "phone": "+919412098451",
        "city": "Nainital",
        "state": "Uttarakhand",
        "pincode": "263001",
        "address_line1": "Highland Estate, Mallital, Near High Court",
        "bib": "GJVR-884391",
        "finish_time_seconds": 3945,  # 01:05:45 (~3:07 / km)
    },
]

print("\nSeeding 10 Podium Dummy Athletes into Database...")

now = datetime.now(timezone.utc)
registered_at = datetime(2026, 10, 2, 10, 30, 0, tzinfo=timezone.utc)
issued_at = datetime(2026, 10, 5, 18, 0, 0, tzinfo=timezone.utc)

for athlete in DUMMY_PODIUM_RUNNERS:
    # 1. Upsert User
    cur.execute('SELECT id FROM "User" WHERE email = %s', (athlete["email"],))
    existing_user = cur.fetchone()
    
    if existing_user:
        user_id = existing_user["id"]
        cur.execute('''
            UPDATE "User"
            SET name = %s, phone = %s, "updatedAt" = %s
            WHERE id = %s
        ''', (athlete["name"], athlete["phone"], now, user_id))
    else:
        user_id = "cmu_dummy_u_" + secrets.token_hex(8)
        cur.execute('''
            INSERT INTO "User" (id, name, email, phone, role, "createdAt", "updatedAt")
            VALUES (%s, %s, %s, %s, 'RUNNER', %s, %s)
        ''', (user_id, athlete["name"], athlete["email"], athlete["phone"], registered_at, now))
    
    # 2. Upsert Registration
    cur.execute('SELECT id FROM "Registration" WHERE "bibNumber" = %s', (athlete["bib"],))
    existing_reg = cur.fetchone()
    
    if existing_reg:
        reg_id = existing_reg["id"]
        cur.execute('''
            UPDATE "Registration"
            SET 
                "userId" = %s,
                "eventId" = %s,
                distance = %s,
                "finishTimeSeconds" = %s,
                status = 'CONFIRMED',
                "proofStatus" = 'APPROVED',
                "shippingName" = %s,
                "shippingPhone" = %s,
                "shippingLine1" = %s,
                "shippingCity" = %s,
                "shippingState" = %s,
                "shippingPincode" = %s,
                "adminNote" = 'PODIUM_DUMMY_RANK_PLACEHOLDER'
            WHERE id = %s
        ''', (
            user_id, event["id"], athlete["distance"], athlete["finish_time_seconds"],
            athlete["name"], athlete["phone"], athlete["address_line1"],
            athlete["city"], athlete["state"], athlete["pincode"], reg_id
        ))
    else:
        reg_id = "cmu_dummy_r_" + secrets.token_hex(8)
        cur.execute('''
            INSERT INTO "Registration" (
                id, "bibNumber", "userId", "eventId", distance,
                "activityType", status, "proofStatus", "registeredAt",
                "finishTimeSeconds", "shippingName", "shippingPhone",
                "shippingLine1", "shippingCity", "shippingState",
                "shippingPincode", "adminNote"
            ) VALUES (
                %s, %s, %s, %s, %s,
                'running', 'CONFIRMED', 'APPROVED', %s,
                %s, %s, %s,
                %s, %s, %s,
                %s, 'PODIUM_DUMMY_RANK_PLACEHOLDER'
            )
        ''', (
            reg_id, athlete["bib"], user_id, event["id"], athlete["distance"],
            registered_at, athlete["finish_time_seconds"],
            athlete["name"], athlete["phone"], athlete["address_line1"],
            athlete["city"], athlete["state"], athlete["pincode"]
        ))
    
    # 3. Upsert Certificate
    cert_no = f"MR-{athlete['bib']}"
    cur.execute('SELECT id FROM "Certificate" WHERE "registrationId" = %s', (reg_id,))
    existing_cert = cur.fetchone()
    
    if existing_cert:
        cur.execute('''
            UPDATE "Certificate"
            SET "certificateNumber" = %s, status = 'GENERATED', "issuedAt" = %s
            WHERE id = %s
        ''', (cert_no, issued_at, existing_cert["id"]))
    else:
        cert_id = "cmu_dummy_c_" + secrets.token_hex(8)
        qr_url = f"https://mountainrun.in/certificates/{cert_no}"
        cur.execute('''
            INSERT INTO "Certificate" (
                id, "registrationId", "certificateNumber", "qrPayload", status, "issuedAt"
            ) VALUES (%s, %s, %s, %s, 'GENERATED', %s)
        ''', (cert_id, reg_id, cert_no, qr_url, issued_at))

    print(f"  ✓ [{athlete['distance']}] Rank {athlete['target_rank']}: {athlete['name']} ({athlete['bib']}) — Time: {athlete['finish_time_seconds']}s")

conn.commit()
print("\nAll 10 dummy athletes committed to database successfully!")
conn.close()
