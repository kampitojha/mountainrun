import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from scripts.medal_dispatch_manager import build_medal_dispatch_html

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

html = build_medal_dispatch_html(payload)
with open("email-preview-idvr-242220.html", "w", encoding="utf-8") as f:
    f.write(html)
print("Preview HTML generated successfully!")
