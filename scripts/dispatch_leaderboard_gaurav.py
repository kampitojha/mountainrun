#!/usr/bin/env python3
"""
dispatch_leaderboard_gaurav.py - Send Tracking Emails to Athletes in Leaderboard Gaurav.xlsx

Usage:
  python scripts/dispatch_leaderboard_gaurav.py --dry-run
  python scripts/dispatch_leaderboard_gaurav.py --test
  python scripts/dispatch_leaderboard_gaurav.py --live
"""

import os
import sys
import json
import time
import datetime
import urllib.request
import urllib.error
import openpyxl
import psycopg2
from psycopg2.extras import RealDictCursor

sys.stdout.reconfigure(encoding="utf-8")
sys.path.insert(0, os.path.abspath("."))
from scripts.medal_dispatch_manager import get_backend_env

ENV = get_backend_env()
RESEND_API_KEY = ENV.get("RESEND_API_KEY")
RESEND_FROM = ENV.get("RESEND_FROM_EMAIL", "Mountain Run <onboarding@mountainrun.in>")
DB_URL = ENV.get("DATABASE_URL")
EXCEL_FILE = "Leaderboard Gaurav.xlsx"
EVENT_TITLE = "Gandhi Jayanti Victory Run 2026"
TEST_EMAIL = "itskampitojha@gmail.com"

COURIER_URLS = {
    "DTDC": "https://www.dtdc.in/tracking/tracking-result.asp?Ttype=awb&strCnno={awb}",
    "DELHIVERY": "https://www.delhivery.com/track/package/{awb}",
    "Delhivery": "https://www.delhivery.com/track/package/{awb}",
}

COURIER_HINT = {
    "DTDC": 'Search "DTDC courier tracking" on Google and enter your AWB number',
    "DELHIVERY": 'Search "Delhivery tracking" on Google and enter your AWB number',
    "Delhivery": 'Search "Delhivery tracking" on Google and enter your AWB number',
}


def get_tracking_url(courier, awb):
    courier_upper = (courier or "").strip().upper()
    if "DELHIV" in courier_upper:
        return f"https://www.delhivery.com/track/package/{awb}"
    elif "DTDC" in courier_upper:
        return f"https://www.dtdc.in/tracking/tracking-result.asp?Ttype=awb&strCnno={awb}"
    return f"https://www.google.com/search?q={courier}+courier+tracking+{awb}"


def get_search_hint(courier):
    courier_upper = (courier or "").strip().upper()
    if "DELHIV" in courier_upper:
        return COURIER_HINT["DELHIVERY"]
    return COURIER_HINT["DTDC"]


def build_dispatch_html(p):
    DARK_GREEN = "#1a3a2e"
    GOLD = "#c9a227"
    CREAM = "#fcfaf5"
    MUTED = "#8a7a5a"
    LINE = "#e8dfc8"

    name = p["runnerName"]
    awb = p["trackingNumber"]
    courier = p["courier"]
    url = p["trackingUrl"]
    hint = p["searchHint"]
    category = p.get("category", "")
    rank = p.get("rank", "")
    address = p.get("shippingAddress", "")
    phone = p.get("phone", "")

    # Determine if winner or podium finisher
    is_winner = "1st" in rank or "Winner" in rank
    package_item = (
        "Official Winner T-Shirt & Podium Package 👕🏅"
        if is_winner
        else "Official Podium Finisher Package 🏅"
    )
    headline = (
        "Your Winner T-Shirt & Package is on the Way!"
        if is_winner
        else "Your Podium Finisher Package is on the Way!"
    )

    badge_html = f"""
    <div style="display:inline-block;background:linear-gradient(135deg,#c9a22718,#c9a22735);border:1.5px solid {GOLD};border-radius:50px;padding:7px 22px;margin-bottom:18px;">
      <span style="font-size:13px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:{GOLD};">{rank} &middot; {category}</span>
    </div>
    """

    congrats_text = (
        f"Congratulations on emerging as the <strong>{rank} Champion</strong> in the <strong>{category}</strong> category at <strong>{EVENT_TITLE}</strong>!<br/><br/>"
        "Your official <strong>Winner T-Shirt & Podium Package</strong> has been carefully prepared, packed, and handed over to our courier partner."
        if is_winner
        else f"Congratulations on securing an outstanding <strong>{rank} finish</strong> in the <strong>{category}</strong> category at <strong>{EVENT_TITLE}</strong>!<br/><br/>"
        "Your official <strong>Podium Finisher Package</strong> has been carefully packed and handed over to our courier partner."
    )

    address_section = ""
    if address:
        address_section = f"""
        <tr>
          <td style="padding:0 36px 22px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#faf8f3;border:1px dashed {LINE};border-radius:10px;padding:14px 18px;">
              <tr>
                <td>
                  <p style="margin:0 0 4px;font-size:11px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;color:{MUTED};">📍 Shipping Address Provided</p>
                  <p style="margin:0;font-size:13px;color:#444444;line-height:1.5;">{address}</p>
                  {f'<p style="margin:6px 0 0;font-size:12px;color:#666666;">📞 Contact: <strong>{phone}</strong></p>' if phone else ''}
                </td>
              </tr>
            </table>
          </td>
        </tr>
        """

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>{headline} — Mountain Run</title>
</head>
<body style="margin:0;padding:0;background-color:#f0ede5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <div style="display:none;font-size:1px;color:#f0ede5;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    Great news {name}! Your official consignment for {EVENT_TITLE} ({rank}) is dispatched via {courier}. Tracking AWB: {awb} 🏅
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0ede5;padding:32px 12px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:{CREAM};border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(26,58,46,0.12);border:1px solid {LINE};">

          <!-- Header Ribbon -->
          <tr>
            <td style="background-color:{DARK_GREEN};padding:0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="33.3%" height="4" style="background-color:#FF9933;"></td>
                  <td width="33.4%" height="4" style="background-color:#ffffff;"></td>
                  <td width="33.3%" height="4" style="background-color:#138808;"></td>
                </tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:22px 32px 18px;text-align:center;">
                    <div style="display:inline-block;background:rgba(255,255,255,0.08);border:1px solid rgba(201,162,39,0.4);border-radius:50px;padding:5px 18px;margin-bottom:6px;">
                      <span style="font-size:11px;font-weight:800;letter-spacing:0.2em;text-transform:uppercase;color:{GOLD};">⛰️ MOUNTAIN RUN</span>
                    </div>
                    <p style="margin:0;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.7);">Official Podium Logistics &middot; Dispatch Update</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Hero Greeting -->
          <tr>
            <td style="padding:34px 36px 18px;text-align:center;">
              <div style="display:inline-block;width:68px;height:68px;line-height:68px;background-color:#fbf6e8;border:2px solid {GOLD};border-radius:50%;font-size:34px;margin-bottom:14px;">
                {'👕' if is_winner else '🏅'}
              </div>
              <br/>
              {badge_html}
              <h1 style="margin:0 0 6px;font-size:23px;font-weight:800;color:{DARK_GREEN};font-family:Georgia,serif;letter-spacing:-0.01em;">
                {headline}
              </h1>
              <p style="margin:0 0 20px;font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:{GOLD};">
                ── {EVENT_TITLE} ──
              </p>
              <p style="margin:0;font-size:15px;color:#444444;line-height:1.75;text-align:left;">
                Hi <strong style="color:{DARK_GREEN};">{name}</strong>,<br/><br/>
                {congrats_text}
              </p>
            </td>
          </tr>

          <!-- Tracking Card -->
          <tr>
            <td style="padding:0 36px 22px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border:1.5px solid {LINE};border-radius:12px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.03);">
                <tr>
                  <td colspan="2" style="background-color:#f6f1e5;padding:12px 18px;border-bottom:1px solid {LINE};">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="left">
                          <span style="font-size:11px;font-weight:800;letter-spacing:0.12em;text-transform:uppercase;color:{DARK_GREEN};">📦 Consignment Details</span>
                        </td>
                        <td align="right">
                          <span style="display:inline-block;background-color:#e6f4ea;color:#137333;font-size:10px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;padding:3px 10px;border-radius:20px;border:1px solid #b7e1cd;">
                            ● Dispatched
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td style="padding:13px 18px;border-bottom:1px solid #f0ede5;width:38%;background-color:#faf8f3;">
                    <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:{MUTED};">Courier Partner</p>
                  </td>
                  <td style="padding:13px 18px;border-bottom:1px solid #f0ede5;background-color:#ffffff;">
                    <p style="margin:0;font-size:14px;font-weight:700;color:{DARK_GREEN};">{courier}</p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:13px 18px;border-bottom:1px solid #f0ede5;background-color:#faf8f3;">
                    <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:{MUTED};">Tracking / AWB No.</p>
                  </td>
                  <td style="padding:13px 18px;border-bottom:1px solid #f0ede5;background-color:#ffffff;">
                    <p style="margin:0;font-size:18px;font-weight:900;color:{DARK_GREEN};letter-spacing:0.06em;font-family:Consolas,Monaco,monospace;">
                      {awb}
                    </p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:13px 18px;border-bottom:1px solid #f0ede5;background-color:#faf8f3;">
                    <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:{MUTED};">Package Item</p>
                  </td>
                  <td style="padding:13px 18px;border-bottom:1px solid #f0ede5;background-color:#ffffff;">
                    <p style="margin:0;font-size:13px;font-weight:800;color:{DARK_GREEN};">{package_item}</p>
                  </td>
                </tr>

                <tr>
                  <td style="padding:13px 18px;background-color:#faf8f3;">
                    <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:{MUTED};">BIB & Distance</p>
                  </td>
                  <td style="padding:13px 18px;background-color:#ffffff;">
                    <p style="margin:0;font-size:13px;font-weight:700;color:{DARK_GREEN};">{p['bib']} &middot; {category}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding:0 36px 22px;text-align:center;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <a href="{url}" target="_blank" style="display:inline-block;background-color:{DARK_GREEN};color:#ffffff;font-size:13px;font-weight:800;letter-spacing:0.08em;text-transform:uppercase;text-decoration:none;padding:15px 36px;border-radius:10px;box-shadow:0 6px 18px rgba(26,58,46,0.25);border:1px solid {GOLD};">
                      🚚 Track Your Package Live &rarr;
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top:10px;">
                    <p style="margin:0;font-size:11px;color:#777777;">
                      Direct Link: <a href="{url}" target="_blank" style="color:{DARK_GREEN};font-weight:600;word-break:break-all;">{url}</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Search Hint -->
          <tr>
            <td style="padding:0 36px 22px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#fff8e8;border:1.5px solid #f0d080;border-radius:10px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0 0 8px;font-size:12px;font-weight:800;letter-spacing:0.05em;text-transform:uppercase;color:#8a6a00;">
                      💡 If the direct tracking link does not update immediately:
                    </p>
                    <p style="margin:0;font-size:13px;color:#555555;line-height:1.7;">
                      Simply <strong>open Google</strong> and search for:<br/>
                      <span style="display:inline-block;background-color:#ffffff;border:1px solid #e0cc80;border-radius:6px;padding:5px 14px;font-family:Consolas,Monaco,monospace;font-size:13px;font-weight:700;color:{DARK_GREEN};margin-top:6px;">{hint}</span><br/>
                      Then enter your AWB number: <strong style="font-family:Consolas,Monaco,monospace;color:{DARK_GREEN};">{awb}</strong>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          {address_section}

          <!-- Delivery Guidelines -->
          <tr>
            <td style="padding:0 36px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff;border:1px solid #ebe5d8;border-radius:10px;padding:18px 20px;">
                <tr>
                  <td>
                    <p style="margin:0 0 10px;font-size:12px;font-weight:800;letter-spacing:0.05em;text-transform:uppercase;color:{DARK_GREEN};">
                      Important Delivery Notes:
                    </p>
                    <ul style="margin:0;padding-left:18px;font-size:13px;color:#555555;line-height:1.8;">
                      <li><strong>Delivery Timeline:</strong> Typically arrives in <strong>4 to 7 working days</strong>.</li>
                      <li><strong>Tracking Activation:</strong> Courier status updates within <strong>24 hours</strong> of scan.</li>
                      <li><strong>Courier Contact:</strong> Please keep your registered contact reachable for courier delivery.</li>
                    </ul>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:{DARK_GREEN};border-radius:0 0 16px 16px;padding:0;">
              <div style="height:2px;background:linear-gradient(90deg,transparent,{GOLD},transparent);"></div>
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:24px 32px;text-align:center;">
                    <p style="margin:0 0 4px;font-size:16px;color:rgba(255,255,255,0.95);font-family:Georgia,serif;font-style:italic;">
                      Keep Running, Keep Inspiring!
                    </p>
                    <p style="margin:0 0 14px;font-size:10px;color:{GOLD};letter-spacing:0.2em;text-transform:uppercase;">
                      ── Every Finish Has a Story ──
                    </p>
                    <p style="margin:0 0 2px;font-size:13px;font-weight:700;color:#ffffff;">Mountain Run Team</p>
                    <p style="margin:0 0 14px;font-size:11px;color:rgba(255,255,255,0.45);">
                      Official Virtual Marathon Platform &middot; <a href="https://mountainrun.in" target="_blank" style="color:{GOLD};text-decoration:none;">mountainrun.in</a>
                    </p>
                    <table width="180" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;">
                      <tr>
                        <td width="60" height="3" style="background-color:#FF9933;border-radius:2px 0 0 2px;"></td>
                        <td width="60" height="3" style="background-color:#ffffff;"></td>
                        <td width="60" height="3" style="background-color:#138808;border-radius:0 2px 2px 0;"></td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Support Disclaimer -->
          <tr>
            <td style="padding:16px;text-align:center;">
              <p style="margin:0;font-size:10px;color:#94a3b8;line-height:1.6;">
                Need help with your shipment? Reach us at <a href="mailto:mountainrunofficial@gmail.com" style="color:#64748b;text-decoration:underline;">mountainrunofficial@gmail.com</a>.<br/>
                &copy; {datetime.datetime.now().year} Mountain Run. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""


def send_resend_email(to_email, subject, html_content, max_retries=4):
    if not RESEND_API_KEY:
        raise ValueError("RESEND_API_KEY not found in backend/.env")
    url = "https://api.resend.com/emails"
    headers = {
        "Authorization": f"Bearer {RESEND_API_KEY}",
        "Content-Type": "application/json",
        "User-Agent": "MountainRunDispatch/1.0",
    }
    payload = {
        "from": RESEND_FROM,
        "to": [to_email],
        "subject": subject,
        "html": html_content,
        "reply_to": "mountainrunofficial@gmail.com",
    }
    for attempt in range(max_retries):
        try:
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode("utf-8"),
                headers=headers,
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=20) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            if e.code == 429 and attempt < max_retries - 1:
                wait_s = (attempt + 1) * 3
                print(f"       ⏳ [429 Rate-Limit] Waiting {wait_s}s...")
                time.sleep(wait_s)
                continue
            err_msg = e.read().decode("utf-8") if e.fp else str(e)
            raise RuntimeError(f"HTTP {e.code}: {err_msg}")
        except (urllib.error.URLError, TimeoutError) as e:
            if attempt < max_retries - 1:
                wait_s = (attempt + 1) * 3
                print(f"       ⏳ [Network Glitch] Retrying in {wait_s}s ({e})...")
                time.sleep(wait_s)
                continue
            raise RuntimeError(f"Network error: {e}")


def load_athletes_with_tracking():
    excel_path = os.path.join(os.getcwd(), EXCEL_FILE)
    if not os.path.exists(excel_path):
        raise FileNotFoundError(f"{EXCEL_FILE} not found!")

    wb = openpyxl.load_workbook(excel_path, data_only=True)
    ws = wb["Top 3 Podium (Real Athletes)"]

    athletes = []
    for r in range(5, ws.max_row + 1):
        sno = ws.cell(r, 1).value
        cat = str(ws.cell(r, 2).value or "").strip()
        rank = str(ws.cell(r, 3).value or "").strip()
        bib = str(ws.cell(r, 6).value or "").strip()
        name = str(ws.cell(r, 7).value or "").strip()
        phone = str(ws.cell(r, 9).value or "").strip()
        email = str(ws.cell(r, 10).value or "").strip()
        address = str(ws.cell(r, 12).value or "").strip()
        tracking = ws.cell(r, 14).value
        courier = str(ws.cell(r, 15).value or "").strip()

        if tracking is None:
            continue

        tracking_clean = str(tracking).strip()
        if not tracking_clean or tracking_clean.lower() in [
            "none",
            "null",
            "-",
            "",
        ]:
            continue

        if not courier:
            courier = (
                "Delhivery" if tracking_clean.startswith("398") else "DTDC"
            )

        tracking_url = get_tracking_url(courier, tracking_clean)
        hint = get_search_hint(courier)

        athletes.append(
            {
                "row": r,
                "sno": sno,
                "bib": bib,
                "runnerName": name,
                "category": cat,
                "rank": rank,
                "email": email,
                "phone": phone,
                "shippingAddress": address,
                "trackingNumber": tracking_clean,
                "courier": courier,
                "trackingUrl": tracking_url,
                "searchHint": hint,
            }
        )

    return athletes


def run():
    mode = "--dry-run"
    if "--live" in sys.argv:
        mode = "--live"
    elif "--test" in sys.argv:
        mode = "--test"

    athletes = load_athletes_with_tracking()
    print("=" * 65)
    print(
        f"   MOUNTAIN RUN — LEADERBOARD DISPATCH EMAIL SERVICE ({len(athletes)} ATHLETES)"
    )
    print(f"   Mode: {mode.upper()}")
    print("=" * 65 + "\n")

    for idx, a in enumerate(athletes, 1):
        print(f"[{idx}] {a['runnerName']} ({a['bib']})")
        print(f"    Rank: {a['rank']} | Category: {a['category']}")
        print(f"    Email: {a['email']} | Phone: {a['phone']}")
        print(f"    Courier: {a['courier']} | AWB: {a['trackingNumber']}")
        print(f"    Tracking URL: {a['trackingUrl']}")
        print(f"    Address: {a['shippingAddress']}\n")

    if mode == "--dry-run":
        print(
            "✓ DRY-RUN complete. No emails were sent. Run with --test or --live."
        )
        return

    if mode == "--test":
        print(f"Sending 1 sample test email to {TEST_EMAIL}...")
        sample = athletes[0]
        subject = f"Your Finisher Consignment is on the Way! 🏅 — {EVENT_TITLE}"
        html = build_dispatch_html(sample)
        with open(
            "leaderboard_gaurav_preview.html", "w", encoding="utf-8"
        ) as f:
            f.write(html)
        print("✓ Saved HTML preview to leaderboard_gaurav_preview.html")
        res = send_resend_email(TEST_EMAIL, subject, html)
        print(f"✓ Test Email sent successfully! (Resend ID: {res.get('id')})")
        return

    if mode == "--live":
        print(f"🚀 BROADCASTING LIVE TO ALL {len(athletes)} ATHLETES...")
        results = []
        for idx, a in enumerate(athletes, 1):
            is_winner = "1st" in a["rank"] or "Winner" in a["rank"]
            item_name = (
                "Winner T-Shirt & Package"
                if is_winner
                else "Podium Finisher Package"
            )
            subject = f"Your {item_name} is on the Way! 🏅 — {EVENT_TITLE}"
            html = build_dispatch_html(a)

            print(
                f"[{idx}/{len(athletes)}] Sending to {a['runnerName']} <{a['email']}> [{a['courier']} {a['trackingNumber']}]...",
                end=" ",
                flush=True,
            )
            try:
                res = send_resend_email(a["email"], subject, html)
                res_id = res.get("id")
                print(f"✅ SENT! (ID: {res_id})", flush=True)
                results.append(
                    {
                        "bib": a["bib"],
                        "name": a["runnerName"],
                        "email": a["email"],
                        "tracking": a["trackingNumber"],
                        "courier": a["courier"],
                        "resend_id": res_id,
                        "status": "SENT",
                        "timestamp": datetime.datetime.now(
                            datetime.timezone.utc
                        ).isoformat(),
                    }
                )
            except Exception as e:
                print(f"❌ FAILED: {e}", flush=True)
                results.append(
                    {
                        "bib": a["bib"],
                        "name": a["runnerName"],
                        "email": a["email"],
                        "tracking": a["trackingNumber"],
                        "courier": a["courier"],
                        "error": str(e),
                        "status": "FAILED",
                        "timestamp": datetime.datetime.now(
                            datetime.timezone.utc
                        ).isoformat(),
                    }
                )
            time.sleep(1)

        log_file = "gandhi_jayanti_leaderboard_gaurav_dispatch_log.json"
        with open(log_file, "w", encoding="utf-8") as f:
            json.dump(results, f, indent=2)
        print(f"\n✓ Saved live dispatch log to {log_file}")
        print("\n" + "=" * 65)
        print("   ALL DISPATCH EMAILS PROCESSED SUCCESSFULLY!")
        print("=" * 65)


if __name__ == "__main__":
    run()
