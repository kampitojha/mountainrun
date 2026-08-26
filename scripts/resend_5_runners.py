#!/usr/bin/env python3
"""
One-off resend script for 5 runners whose emails failed yesterday due to rate limit.
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

# Reuse existing helpers
from scripts.medal_dispatch_manager import (
    get_backend_env, get_courier_info, build_medal_dispatch_html, send_resend_email
)

import time

ENV = get_backend_env()

if sys.platform.startswith("win"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

RUNNERS = [
    {
        "bibNumber": "IDVR-395412",
        "runnerName": "Sayan Sil",
        "email": "sayansil590@gmail.com",
        "courier": "DELHIVERY",
        "trackingNumber": "39879815977705",
        "eventTitle": "Independence Day Virtual Run 2026",
        "distance": "Virtual Run Finisher",
    },
    {
        "bibNumber": "IDVR-570834",
        "runnerName": "Om Tiwari",
        "email": "om20tiwari@gmail.com",
        "courier": "DELHIVERY",
        "trackingNumber": "42833510606244",
        "eventTitle": "Independence Day Virtual Run 2026",
        "distance": "Virtual Run Finisher",
    },
    {
        "bibNumber": "IDVR-449700",
        "runnerName": "Prakhar Singh Baghel",
        "email": "goblingamingpubg@gmail.com",
        "courier": "DELHIVERY",
        "trackingNumber": "39879815977716",
        "eventTitle": "Independence Day Virtual Run 2026",
        "distance": "Virtual Run Finisher",
    },
    {
        "bibNumber": "IDVR-217213",
        "runnerName": "Pankaj Bhendare",
        "email": "pankh2324@gmail.com",
        "courier": "DELHIVERY",
        "trackingNumber": "39879815977731",
        "eventTitle": "Independence Day Virtual Run 2026",
        "distance": "Virtual Run Finisher",
    },
    {
        "bibNumber": "IDVR-145725",
        "runnerName": "Sushil Boro",
        "email": "borosushil6@gmail.com",
        "courier": "DELHIVERY",
        "trackingNumber": "39879815977764",
        "eventTitle": "Independence Day Virtual Run 2026",
        "distance": "Virtual Run Finisher",
    },
]

print("\n=======================================================")
print("   MOUNTAIN RUN — RESEND FOR 5 RUNNERS (Rate-Limited)")
print("=======================================================\n")

sent = 0
failed = 0

for i, runner in enumerate(RUNNERS, 1):
    courier_info = get_courier_info(runner["courier"], runner["trackingNumber"])
    
    payload = {
        "runnerName": runner["runnerName"],
        "eventTitle": runner["eventTitle"],
        "distance": runner["distance"],
        "bibNumber": runner["bibNumber"],
        "courier": courier_info["name"],
        "trackingNumber": runner["trackingNumber"],
        "trackingUrl": courier_info["url"],
        "shippingLine1": None,
        "shippingCity": None,
        "shippingState": None,
        "shippingPincode": None,
    }

    subject = f"Your Finisher Medal is on the Way! 🏅 — {runner['eventTitle']}"
    html = build_medal_dispatch_html(payload)

    try:
        res = send_resend_email(runner["email"], subject, html)
        print(f"[{i}/5] ✅ SENT: {runner['bibNumber']} | {runner['runnerName']} <{runner['email']}> | Tracking: {runner['trackingNumber']} | Resend ID: {res.get('id')}")
        sent += 1
    except Exception as e:
        print(f"[{i}/5] ❌ FAILED: {runner['runnerName']} <{runner['email']}> | Error: {e}")
        failed += 1

    time.sleep(0.5)  # small gap between sends to avoid rate limit

print(f"\n-------------------------------------------------------")
print(f"📊 DONE: {sent} sent, {failed} failed")
print(f"-------------------------------------------------------\n")
