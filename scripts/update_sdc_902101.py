import psycopg2
from psycopg2.extras import RealDictCursor
from tshirt_list_manager import get_backend_env

conn = psycopg2.connect(get_backend_env()['DATABASE_URL'])
cur = conn.cursor(cursor_factory=RealDictCursor)

cur.execute("""
    SELECT 
        r.id as registration_id,
        r."bibNumber",
        r.distance,
        r.status,
        r."proofStatus",
        r."shippingName",
        r."shippingPhone",
        r."shippingLine1",
        r."shippingCity",
        r."shippingState",
        r."shippingPincode",
        u.id as user_id,
        u.name as user_name,
        u.email as email,
        u.phone as user_phone,
        e.title as event_title,
        e.slug as event_slug,
        p.status as payment_status,
        p."amountInPaise"
    FROM "Registration" r
    JOIN "User" u ON r."userId" = u.id
    JOIN "Event" e ON r."eventId" = e.id
    LEFT JOIN "Payment" p ON p."registrationId" = r.id
    WHERE r."bibNumber" ILIKE '%902101%'
""")
row = cur.fetchone()
if not row:
    print("Runner SDC-902101 not found!")
else:
    print("Found runner:")
    for k, v in row.items():
        print(f"  {k}: {v}")
    
    # Update distance to 10 km
    cur.execute("""
        UPDATE "Registration"
        SET distance = '10 km'
        WHERE id = %s
    """, (row['registration_id'],))
    conn.commit()
    print("\n✓ Successfully updated distance to '10 km'!")

conn.close()
