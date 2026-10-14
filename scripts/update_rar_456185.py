import psycopg2
from psycopg2.extras import RealDictCursor
from tshirt_list_manager import get_backend_env

conn = psycopg2.connect(get_backend_env()['DATABASE_URL'])
cur = conn.cursor(cursor_factory=RealDictCursor)

bib = 'RAR-456185'

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
        r."shippingLine2",
        r."shippingCity",
        r."shippingState",
        r."shippingPincode",
        r."adminNote",
        u.id as user_id,
        u.name as user_name,
        u.email as email,
        u.phone as user_phone,
        e.title as event_title
    FROM "Registration" r
    JOIN "User" u ON r."userId" = u.id
    JOIN "Event" e ON r."eventId" = e.id
    WHERE r."bibNumber" = %s
""", (bib,))

row = cur.fetchone()
if not row:
    print(f"Runner {bib} not found!")
    conn.close()
    exit(1)

print("Before update:")
print(f"  BIB: {row['bibNumber']}")
print(f"  Name: {row['shippingName']}")
print(f"  Current Phone: {row['shippingPhone']}")
print(f"  Current Address Line 1: {row['shippingLine1']}")
print(f"  Current Address Line 2: {row['shippingLine2']}")
print(f"  City: {row['shippingCity']}")
print(f"  State: {row['shippingState']}")
print(f"  Pincode: {row['shippingPincode']}")
print(f"  User Phone: {row['user_phone']}")

new_line1 = "Shree Krishna Heights N-104, Katara Hills"
new_line2 = None
new_phone = "+919653258160"
note = "Address & phone updated on request (Old phone: +917977045043, Old address: katara hills)"

cur.execute("""
    UPDATE "Registration"
    SET 
        "shippingLine1" = %s,
        "shippingLine2" = %s,
        "shippingPhone" = %s,
        "adminNote" = %s
    WHERE id = %s
""", (new_line1, new_line2, new_phone, note, row['registration_id']))

conn.commit()

# Verify update
cur.execute("""
    SELECT 
        r."bibNumber",
        r."shippingName",
        r."shippingPhone",
        r."shippingLine1",
        r."shippingLine2",
        r."shippingCity",
        r."shippingState",
        r."shippingPincode",
        r."adminNote"
    FROM "Registration" r
    WHERE id = %s
""", (row['registration_id'],))

updated = cur.fetchone()
print("\n✓ After update:")
for k, v in updated.items():
    print(f"  {k}: {v}")

conn.close()
