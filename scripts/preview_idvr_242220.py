import sys
import os
import json
import psycopg2
from psycopg2.extras import RealDictCursor
from medal_dispatch_manager import get_backend_env, get_courier_info, build_medal_dispatch_html

ENV = get_backend_env()
DB_URL = ENV.get('DATABASE_URL')

conn = psycopg2.connect(DB_URL)
cur = conn.cursor(cursor_factory=RealDictCursor)

cur.execute("""
    SELECT 
        r.id as registration_id,
        r."bibNumber" as bib_number,
        r.distance,
        r."shippingName" as shipping_name,
        r."shippingPhone" as shipping_phone,
        r."shippingLine1" as shipping_line1,
        r."shippingLine2" as shipping_line2,
        r."shippingCity" as shipping_city,
        r."shippingState" as shipping_state,
        r."shippingPincode" as shipping_pincode,
        u.name as user_name,
        u.email as user_email,
        u.phone as user_phone,
        e.title as event_title,
        m.status as medal_status,
        m.courier as courier_raw,
        m."trackingNumber" as tracking_number,
        m."trackingUrl" as tracking_url
    FROM "Registration" r
    JOIN "User" u ON r."userId" = u.id
    JOIN "Event" e ON r."eventId" = e.id
    LEFT JOIN "MedalDelivery" m ON m."registrationId" = r.id
    WHERE r."bibNumber" ILIKE '%242220%'
""")

row = cur.fetchone()
conn.close()

if not row:
    print("Runner not found!")
    sys.exit(1)

runner_data = dict(row)
print("=== RUNNER DETAILS ===")
print(json.dumps(runner_data, default=str, indent=2))

courier_info = get_courier_info(runner_data.get("courier_raw"), runner_data.get("tracking_number"))
print("\n=== COURIER INFO ===")
print(json.dumps(courier_info, indent=2))

payload = {
    "runnerName": runner_data.get("shipping_name") or runner_data.get("user_name"),
    "eventTitle": "Independence Day Virtual Run 2026",
    "distance": f"{runner_data.get('distance')} Finisher" if runner_data.get('distance') else "Virtual Run Finisher",
    "bibNumber": runner_data.get("bib_number"),
    "courier": courier_info["name"],
    "trackingNumber": runner_data.get("tracking_number"),
    "trackingUrl": courier_info["url"],
    "shippingLine1": runner_data.get("shipping_line1"),
    "shippingCity": runner_data.get("shipping_city"),
    "shippingState": runner_data.get("shipping_state"),
    "shippingPincode": runner_data.get("shipping_pincode"),
}

subject = f"Your Finisher Medal is on the Way! 🏅 — {payload['eventTitle']}"
print(f"\nRecipient: {runner_data.get('user_email')}")
print(f"Subject: {subject}")
print(f"Payload:\n{json.dumps(payload, indent=2)}")
