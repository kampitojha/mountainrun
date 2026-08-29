import os
import psycopg2
import pandas as pd

# Load DATABASE_URL from backend/.env
db_url = None
with open("backend/.env", "r", encoding="utf-8") as f:
    for line in f:
        if line.startswith("DATABASE_URL="):
            db_url = line.strip().split("=", 1)[1].strip("\"'")

conn = psycopg2.connect(db_url)
cur = conn.cursor()

df = pd.read_excel("PENDING_MEDALS_DISPATCH (1).xlsx")
valid_rows = df[df["S.No"].notna()]

print(f"Total runners in Excel: {len(valid_rows)}")
matched_list = []

for idx, r in valid_rows.iterrows():
    s_no = int(r["S.No"])
    name = str(r["Runner Name"]).strip()
    recipient = str(r["Shipping Recipient"]).strip() if pd.notna(r["Shipping Recipient"]) else name
    mobile = str(int(r["Mobile Number"])) if pd.notna(r["Mobile Number"]) else ""
    courier = str(r["COURIER"]).strip()
    tracking = str(r["TRACKING"]).strip()
    if tracking.endswith(".0"):
        tracking = tracking[:-2]
    city = str(r["City"]).strip() if pd.notna(r["City"]) else ""
    state = str(r["State"]).strip() if pd.notna(r["State"]) else ""
    pincode = str(int(r["Pincode"])) if pd.notna(r["Pincode"]) else ""

    # Look up in DB by phone, name, or shipping recipient
    cur.execute("""
        SELECT u.id, u.name, u.email, u.phone, r.id, r."bibNumber", r.distance, e.title, e.slug, m.id, m.status, m."trackingNumber", m.courier
        FROM "Registration" r
        JOIN "User" u ON u.id = r."userId"
        JOIN "Event" e ON e.id = r."eventId"
        LEFT JOIN "MedalDelivery" m ON m."registrationId" = r.id
        WHERE u.phone LIKE %s 
           OR r."shippingPhone" LIKE %s
           OR u.name ILIKE %s 
           OR r."shippingRecipient" ILIKE %s
        ORDER BY r."registeredAt" DESC
        LIMIT 1
    """, (f"%{mobile[-10:]}%", f"%{mobile[-10:]}%", f"%{name}%", f"%{recipient}%"))
    
    match = cur.fetchone()
    if match:
        user_id, user_name, user_email, user_phone, reg_id, bib, distance, event_title, event_slug, medal_id, medal_status, existing_tracking, existing_courier = match
        matched_list.append({
            "s_no": s_no,
            "excel_name": name,
            "excel_recipient": recipient,
            "excel_mobile": mobile,
            "courier": courier,
            "tracking": tracking,
            "city": city,
            "state": state,
            "pincode": pincode,
            "db_user_name": user_name,
            "db_email": user_email,
            "db_phone": user_phone,
            "reg_id": reg_id,
            "bib": bib,
            "distance": distance,
            "event_title": event_title,
            "medal_id": medal_id,
            "medal_status": medal_status
        })
        print(f"[{s_no}] MATCHED: {name} -> {user_name} ({user_email}) | Bib: {bib} | {event_title} | Courier: {courier} | Track: {tracking}")
    else:
        print(f"[{s_no}] UNMATCHED: {name} (Phone: {mobile})")

print(f"\nTotal matched: {len(matched_list)} / {len(valid_rows)}")
