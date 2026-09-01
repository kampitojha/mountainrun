#!/usr/bin/env python3
"""
Send Medal Dispatch / Tracking Email to IDVR-242220 (Sheetal Gudmewar)
"""

import sys
import os
import json
import time

# Add root directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from scripts.medal_dispatch_manager import (
    get_backend_env, get_courier_info, build_medal_dispatch_html, send_resend_email
)

if sys.platform.startswith("win"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

def main():
    recipient_email = "sheetalgudmewar@gmail.com"
    payload = {
        "runnerName": "Sheetal Gudmewar",
        "eventTitle": "Independence Day Virtual Run 2026",
        "distance": "5 km Finisher",
        "bibNumber": "IDVR-242220",
        "courier": "DTDC Express",
        "trackingNumber": "7D136259434",
        "trackingUrl": "https://www.dtdc.com/track-your-shipment/",
        "shippingLine1": "43/76, Sai Chhaya,, Navasahyadri Society, Karve Nagar, Near Tol Hospital",
        "shippingCity": "Pune",
        "shippingState": "Maharashtra",
        "shippingPincode": "411052",
    }

    subject = f"Your Finisher Medal is on the Way! 🏅 — {payload['eventTitle']}"
    html_content = build_medal_dispatch_html(payload)

    print("==================================================")
    print("   SENDING TRACKING EMAIL TO IDVR-242220")
    print("==================================================")
    print(f"To: {recipient_email}")
    print(f"Subject: {subject}")
    print(f"Courier: {payload['courier']}")
    print(f"Tracking AWB: {payload['trackingNumber']}")
    print("--------------------------------------------------")

    try:
        res = send_resend_email(recipient_email, subject, html_content)
        print(f"✅ EMAIL SENT SUCCESSFULLY!")
        print(f"Resend Message ID: {res.get('id')}")
    except Exception as e:
        print(f"❌ FAILED TO SEND EMAIL: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
