"""
send_tshirt_tracking_emails.py - Sports Day Winner T-Shirt Tracking Emails

Usage:
  python -m scripts.send_tshirt_tracking_emails --test   # test to itskampitojha@gmail.com
  python -m scripts.send_tshirt_tracking_emails --all    # send to all winners
"""
import os, sys, json, time, datetime, urllib.request, urllib.error, openpyxl, argparse

sys.stdout.reconfigure(encoding="utf-8")
sys.path.insert(0, os.path.abspath("."))
from scripts.medal_dispatch_manager import get_backend_env

ENV = get_backend_env()
RESEND_API_KEY = ENV.get("RESEND_API_KEY")
RESEND_FROM = ENV.get("RESEND_FROM_EMAIL", "Mountain Run <onboarding@mountainrun.in>")

TEST_EMAIL  = "itskampitojha@gmail.com"
EXCEL_PATH  = "Mountain_Run_Tshirt_Dispatched_List_Updated.xlsx"
EVENT_TITLE = "Sports Day Celebration 2026"

COURIER_URLS = {
    "Trackon":                "https://www.trackon.in/tracking/{awb}",
    "JAINA Courier Services": "https://tracking.jainacourier.com/?docketno={awb}",
    "Akash Ganga":            "https://www.akashganga.co.in/tracking?awbnumber={awb}",
    "Shree Tirupati Courier": "https://www.shreeTirupati.com/tracking/{awb}",
    "DTDC":                   "https://www.dtdc.in/tracking/tracking-result.asp?Ttype=awb&strCnno={awb}",
    "Delhivery":              "https://www.delhivery.com/track/package/{awb}",
}
COURIER_HINT = {
    "Trackon":                'Search "Trackon courier tracking" on Google and enter AWB at trackon.in',
    "JAINA Courier Services": 'Search "JAINA courier tracking" on Google and enter AWB at jainacourier.com',
    "Akash Ganga":            'Search "Akash Ganga courier tracking" on Google and enter AWB at akashganga.co.in',
    "Shree Tirupati Courier": 'Search "Shree Tirupati courier tracking" on Google and enter AWB at shreeTirupati.com',
    "DTDC":                   'Search "DTDC courier tracking" on Google and enter AWB at dtdc.in',
    "Delhivery":              'Search "Delhivery tracking" on Google and enter AWB at delhivery.com',
}

def get_tracking_url(courier, awb):
    t = COURIER_URLS.get(courier)
    return t.replace("{awb}", str(awb)) if t else f"https://www.google.com/search?q={courier.replace(' ','+')}+courier+tracking+{awb}"

def get_search_hint(courier):
    return COURIER_HINT.get(courier, f'Search "{courier} courier tracking" on Google and enter your AWB number')

def build_html(p):
    DG=p.get("dg","#1a3a2e"); GOLD="#c9a227"; LINE="#e8dfc8"; MUTED="#8a7a5a"; CREAM="#fcfaf5"
    name=p["runnerName"]; awb=p["trackingNumber"]; courier=p["courier"]
    url=p["trackingUrl"]; hint=p["searchHint"]; cat=p.get("category","Sports Day"); place=p.get("place","")
    medals={"1st Place":"1st Place (Gold)","2nd Place":"2nd Place (Silver)","3rd Place":"3rd Place (Bronze)"}
    badge=""
    if place:
        badge=f'<div style="display:inline-block;background:linear-gradient(135deg,#c9a22710,#c9a22730);border:1.5px solid {GOLD};border-radius:50px;padding:7px 22px;margin-bottom:18px;"><span style="font-size:13px;font-weight:800;letter-spacing:0.15em;text-transform:uppercase;color:{GOLD};">{medals.get(place,place)} -- {cat}</span></div>'

    return f"""<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Your Winner T-Shirt is on the Way -- Mountain Run Sports Day</title></head>
<body style="margin:0;padding:0;background:#f0ede5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<div style="display:none;font-size:1px;color:#f0ede5;max-height:0;overflow:hidden;">{name}, your Sports Day Winner T-Shirt is dispatched! {courier} | AWB: {awb}</div>
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f0ede5;padding:32px 12px;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:{CREAM};border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(26,58,46,0.12);border:1px solid {LINE};">
  <!-- Header -->
  <tr><td style="background:#1a3a2e;padding:0;">
    <table width="100%" cellpadding="0" cellspacing="0"><tr>
      <td width="33.3%" height="4" style="background:#FF9933;"></td>
      <td width="33.4%" height="4" style="background:#fff;"></td>
      <td width="33.3%" height="4" style="background:#138808;"></td>
    </tr></table>
    <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:22px 32px 18px;text-align:center;">
      <div style="display:inline-block;background:rgba(255,255,255,0.08);border:1px solid rgba(201,162,39,0.4);border-radius:50px;padding:5px 18px;margin-bottom:6px;">
        <span style="font-size:11px;font-weight:800;letter-spacing:0.2em;text-transform:uppercase;color:{GOLD};">MOUNTAIN RUN</span>
      </div>
      <p style="margin:0;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.65);">Sports Day Celebration 2026 &middot; Winner T-Shirt Dispatch</p>
    </td></tr></table>
  </td></tr>
  <!-- Hero -->
  <tr><td style="padding:34px 36px 18px;text-align:center;">
    <div style="display:inline-block;width:68px;height:68px;line-height:68px;background:#fbf6e8;border:2px solid {GOLD};border-radius:50%;font-size:34px;margin-bottom:14px;">&#128089;</div>
    {badge}
    <h1 style="margin:0 0 6px;font-size:23px;font-weight:800;color:#1a3a2e;font-family:Georgia,serif;">Your Winner T-Shirt is on the Way!</h1>
    <p style="margin:0 0 20px;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:{GOLD};">-- Sports Day Celebration 2026 --</p>
    <p style="margin:0;font-size:15px;color:#444;line-height:1.75;text-align:left;">
      Hi <strong style="color:#1a3a2e;">{name}</strong>,<br/><br/>
      Congratulations on your outstanding performance at the <strong>Sports Day Celebration 2026</strong>!
      As a <strong>Top 3 finisher</strong>, you have earned an exclusive <strong>Mountain Run Winner T-Shirt</strong>.
      We are excited to let you know that your T-Shirt has been carefully packed and handed over to our courier partner.
    </p>
  </td></tr>
  <!-- Tracking Card -->
  <tr><td style="padding:0 36px 22px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border:1.5px solid {LINE};border-radius:12px;overflow:hidden;">
      <tr><td colspan="2" style="background:#f6f1e5;padding:12px 18px;border-bottom:1px solid {LINE};">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          <td><span style="font-size:11px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:#1a3a2e;">Consignment Details</span></td>
          <td align="right"><span style="background:#e6f4ea;color:#137333;font-size:10px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;padding:3px 10px;border-radius:20px;border:1px solid #b7e1cd;">Dispatched</span></td>
        </tr></table>
      </td></tr>
      <tr>
        <td style="padding:13px 18px;width:38%;background:#faf8f3;border-bottom:1px solid #f0ede5;"><p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:{MUTED};">Courier Partner</p></td>
        <td style="padding:13px 18px;background:#fff;border-bottom:1px solid #f0ede5;"><p style="margin:0;font-size:14px;font-weight:700;color:#1a3a2e;">{courier}</p></td>
      </tr>
      <tr>
        <td style="padding:13px 18px;background:#faf8f3;border-bottom:1px solid #f0ede5;"><p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:{MUTED};">Tracking / AWB No.</p></td>
        <td style="padding:13px 18px;background:#fff;border-bottom:1px solid #f0ede5;"><p style="margin:0;font-size:18px;font-weight:900;color:#1a3a2e;letter-spacing:0.06em;font-family:Consolas,Monaco,monospace;">{awb}</p></td>
      </tr>
      <tr>
        <td style="padding:13px 18px;background:#faf8f3;"><p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:{MUTED};">Category</p></td>
        <td style="padding:13px 18px;background:#fff;"><p style="margin:0;font-size:14px;font-weight:700;color:#1a3a2e;">{cat}</p></td>
      </tr>
    </table>
  </td></tr>
  <!-- CTA -->
  <tr><td style="padding:0 36px 22px;text-align:center;">
    <a href="{url}" target="_blank" style="display:inline-block;background:#1a3a2e;color:#fff;font-size:13px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;text-decoration:none;padding:15px 36px;border-radius:10px;box-shadow:0 6px 18px rgba(26,58,46,0.25);border:1px solid {GOLD};">
      Track Your T-Shirt &rarr;
    </a>
    <p style="margin:10px 0 0;font-size:11px;color:#777;">Direct Link: <a href="{url}" target="_blank" style="color:#1a3a2e;font-weight:600;word-break:break-all;">{url}</a></p>
  </td></tr>
  <!-- Search Hint -->
  <tr><td style="padding:0 36px 22px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff8e8;border:1.5px solid #f0d080;border-radius:10px;">
      <tr><td style="padding:16px 20px;">
        <p style="margin:0 0 8px;font-size:12px;font-weight:800;letter-spacing:0.05em;text-transform:uppercase;color:#8a6a00;">If the tracking link does not open:</p>
        <p style="margin:0;font-size:13px;color:#555;line-height:1.7;">
          Simply <strong>open Google</strong> and search for:<br/>
          <span style="display:inline-block;background:#fff;border:1px solid #e0cc80;border-radius:6px;padding:5px 14px;font-family:Consolas,Monaco,monospace;font-size:13px;font-weight:700;color:#1a3a2e;margin-top:6px;">{hint}</span><br/>
          Then enter your AWB number: <strong style="font-family:Consolas,Monaco,monospace;color:#1a3a2e;">{awb}</strong>
        </p>
      </td></tr>
    </table>
  </td></tr>
  <!-- Notes -->
  <tr><td style="padding:0 36px 28px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #ebe5d8;border-radius:10px;">
      <tr><td style="padding:18px 20px;">
        <p style="margin:0 0 10px;font-size:12px;font-weight:800;letter-spacing:0.05em;text-transform:uppercase;color:#1a3a2e;">Important Delivery Notes:</p>
        <ul style="margin:0;padding-left:18px;font-size:13px;color:#555;line-height:1.9;">
          <li><strong>Delivery Timeline:</strong> Typically arrives in <strong>4 to 7 working days</strong>.</li>
          <li><strong>Tracking Activation:</strong> Status usually updates within <strong>24 hours</strong> of dispatch.</li>
          <li><strong>Stay Reachable:</strong> Ensure your registered contact number is reachable for the delivery agent.</li>
          <li><strong>If tracking not live yet:</strong> Wait 24-48 hours before raising a concern.</li>
        </ul>
      </td></tr>
    </table>
  </td></tr>
  <!-- Footer -->
  <tr><td style="background:#1a3a2e;border-radius:0 0 16px 16px;padding:0;">
    <div style="height:2px;background:linear-gradient(90deg,transparent,{GOLD},transparent);"></div>
    <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:24px 32px;text-align:center;">
      <p style="margin:0 0 4px;font-size:16px;color:rgba(255,255,255,0.95);font-family:Georgia,serif;font-style:italic;">Keep Running, Keep Inspiring!</p>
      <p style="margin:0 0 14px;font-size:10px;color:{GOLD};letter-spacing:0.2em;text-transform:uppercase;">-- Every Finish Has a Story --</p>
      <p style="margin:0;font-size:13px;font-weight:700;color:#fff;">Mountain Run Team</p>
      <p style="margin:0 0 14px;font-size:11px;color:rgba(255,255,255,0.45);">Official Virtual Marathon Platform &middot; <a href="https://mountainrun.in" style="color:{GOLD};text-decoration:none;">mountainrun.in</a></p>
      <table width="180" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;"><tr>
        <td width="60" height="3" style="background:#FF9933;border-radius:2px 0 0 2px;"></td>
        <td width="60" height="3" style="background:#fff;"></td>
        <td width="60" height="3" style="background:#138808;border-radius:0 2px 2px 0;"></td>
      </tr></table>
    </td></tr></table>
  </td></tr>
  <tr><td style="padding:16px;text-align:center;">
    <p style="margin:0;font-size:10px;color:#94a3b8;line-height:1.6;">
      Need help? Email us at <a href="mailto:mountainrunofficial@gmail.com" style="color:#64748b;">mountainrunofficial@gmail.com</a><br/>
      &copy; 2026 Mountain Run. All rights reserved.
    </p>
  </td></tr>
</table></td></tr></table></body></html>"""


def send_resend_email(to_email, subject, html_content):
    if not RESEND_API_KEY:
        raise ValueError("RESEND_API_KEY not found in backend/.env")
    url = "https://api.resend.com/emails"
    headers = {
        "Authorization": f"Bearer {RESEND_API_KEY}",
        "Content-Type": "application/json",
        "User-Agent": "MountainRunDispatch/1.0",
    }
    body = {
        "from": RESEND_FROM,
        "to": [to_email] if isinstance(to_email, str) else to_email,
        "subject": subject,
        "html": html_content,
        "reply_to": "mountainrunofficial@gmail.com",
    }
    req = urllib.request.Request(url, data=json.dumps(body).encode("utf-8"), headers=headers, method="POST")
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode("utf-8"))


def load_dispatch_list():
    wb = openpyxl.load_workbook(EXCEL_PATH)
    ws = wb["Mountain Run Dispatch"]

    # Build winner info map from leaderboard
    lb_wb = openpyxl.load_workbook("SPORTS_DAY_LEADERBOARD_TSHIRT_WINNERS.xlsx")
    ws_w = lb_wb["Top 3 T-Shirt Winners"]
    winner_map = {}
    for i, row in enumerate(ws_w.iter_rows(values_only=True)):
        if i == 0 or not any(c is not None for c in row):
            continue
        try: int(row[0])
        except: continue
        email_lb = str(row[7]).strip().lower() if row[7] else ""
        phone_lb = str(row[6]).strip().replace("+91","").replace(" ","") if row[6] else ""
        info = {"category": str(row[1]).strip() if row[1] else "", "place": str(row[2]).strip() if row[2] else "", "bib": str(row[3]).strip() if row[3] else ""}
        if email_lb: winner_map[email_lb] = info
        if phone_lb: winner_map[phone_lb] = info

    runners = []
    for i, row in enumerate(ws.iter_rows(values_only=True)):
        if i < 4: continue
        sr = row[0]; name = str(row[1]).strip() if row[1] else ""
        phone = str(row[2]).strip() if row[2] else ""; email = str(row[3]).strip().lower() if row[3] else ""
        awb = str(row[4]).strip() if row[4] else ""; courier = str(row[5]).strip() if row[5] else ""
        link = str(row[6]).strip() if row[6] else ""
        if name.lower() == "name" or not awb or not courier: continue
        tracking_url = get_tracking_url(courier, awb) if ("Open Tracking" in link or "Search Tracking" in link or not link.startswith("http")) else link
        phone_clean = phone.replace("+91","").replace(" ","")
        info = winner_map.get(email) or winner_map.get(phone_clean) or {}
        runners.append({
            "sr": sr, "name": name, "phone": phone, "email": email, "awb": awb,
            "courier": courier, "trackingUrl": tracking_url, "searchHint": get_search_hint(courier),
            "category": info.get("category","Sports Day"), "place": info.get("place",""), "bib": info.get("bib",""),
        })
    return runners


def run(mode="test"):
    runners = load_dispatch_list()
    print(f"Loaded {len(runners)} runners from dispatch list.")

    if mode == "test":
        sample = runners[0] if runners else {"name":"Test","awb":"100468115460","courier":"Trackon","email":"","category":"1.6 km","place":"1st Place","bib":"SDC-TEST"}
        payload = {
            "runnerName": "Kampit (TEST)", "bibNumber": sample.get("bib","SDC-TEST"),
            "courier": sample["courier"], "trackingNumber": sample["awb"],
            "trackingUrl": sample.get("trackingUrl", get_tracking_url(sample["courier"], sample["awb"])),
            "searchHint": sample.get("searchHint", get_search_hint(sample["courier"])),
            "category": sample.get("category","Sports Day"), "place": sample.get("place","1st Place"),
        }
        subject = f"[TEST] Your Sports Day Winner T-Shirt is on the Way! -- {EVENT_TITLE}"
        html = build_html(payload)
        with open("winner-tshirt-email-preview.html","w",encoding="utf-8") as f:
            f.write(html)
        print("Saved preview -> winner-tshirt-email-preview.html")
        print(f"\nSending TEST email to {TEST_EMAIL}...")
        result = send_resend_email(TEST_EMAIL, subject, html)
        print("Resend Response:", json.dumps(result, indent=2))
        print("\nTest email sent! Check inbox and confirm before running --all")
        return

    # SEND ALL
    sent=0; failed=0; skipped=0; results=[]
    for idx, r in enumerate(runners, 1):
        if not r["email"]:
            print(f"[{idx:2d}/{len(runners)}] SKIPPED (no email): {r['name']} | AWB: {r['awb']}")
            skipped+=1; results.append({**r,"status":"SKIPPED","reason":"no email"}); continue

        payload = {
            "runnerName": r["name"], "bibNumber": r["bib"],
            "courier": r["courier"], "trackingNumber": r["awb"],
            "trackingUrl": r["trackingUrl"], "searchHint": r["searchHint"],
            "category": r["category"], "place": r["place"],
        }
        subject = f"Your Sports Day Winner T-Shirt is on the Way! -- {EVENT_TITLE}"
        html = build_html(payload)
        print(f"[{idx:2d}/{len(runners)}] Sending to {r['name']} <{r['email']}> | {r['courier']}: {r['awb']}...", end=" ", flush=True)
        try:
            res = send_resend_email(r["email"], subject, html)
            res_id = res.get("id","?"); sent+=1
            print(f"SENT (ID:{res_id})")
            results.append({**r,"status":"SENT","resendId":res_id})
        except Exception as ex:
            failed+=1; print(f"FAILED: {ex}")
            results.append({**r,"status":"FAILED","error":str(ex)})
        time.sleep(0.8)

    log="sportsday_tshirt_email_results.json"
    with open(log,"w",encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    print(f"\nDONE -- Sent:{sent} | Failed:{failed} | Skipped:{skipped}")
    print(f"Results saved to: {log}")
    if failed:
        print("\nFailed:")
        for r in results:
            if r["status"]=="FAILED": print(f"  {r['name']} <{r['email']}> -- {r.get('error','')}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Send Sports Day T-Shirt tracking emails")
    g = parser.add_mutually_exclusive_group(required=True)
    g.add_argument("--test", action="store_true", help="Send test email to itskampitojha@gmail.com")
    g.add_argument("--all",  action="store_true", help="Send to ALL recipients in dispatch list")
    args = parser.parse_args()
    run(mode="test" if args.test else "all")
