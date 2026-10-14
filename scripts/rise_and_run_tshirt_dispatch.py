#!/usr/bin/env python3
"""
Mountain Run — Rise and Run 2026 Top 3 Winners T-Shirt Claim System
Handles:
1. Fetching podium finishers directly from DB
2. Generating preview HTML
3. Sending test email or broadcasting to all 15 winners via Resend
4. Checking real-time database submission status (tshirtSize, address)
"""

import os
import sys
import json
import time
import datetime
import argparse
import urllib.request
import urllib.error
import psycopg2
from psycopg2.extras import RealDictCursor

sys.path.insert(0, os.path.abspath("scripts"))
from tshirt_list_manager import get_backend_env

ENV = get_backend_env()
RESEND_API_KEY = ENV.get("RESEND_API_KEY")
RESEND_FROM = ENV.get("RESEND_FROM_EMAIL", "Mountain Run <onboarding@mountainrun.in>")
DB_URL = ENV.get("DATABASE_URL")
TSHIRT_IMAGE_URL = "https://res.cloudinary.com/yppcqzt6/image/upload/v1788010023/mountainrun/newsletter/ng4hz1fuxpkipsauk2rc.png"


def get_db():
    for attempt in range(5):
        try:
            return psycopg2.connect(DB_URL, connect_timeout=10)
        except Exception as e:
            if attempt == 4:
                raise e
            time.sleep(2)


def get_rise_and_run_top3_winners():
    conn = get_db()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute('''
        SELECT id, title, slug, distances
        FROM "Event"
        WHERE slug = 'rise-and-run' OR title ILIKE '%Rise%Run%'
        LIMIT 1
    ''')
    event = cur.fetchone()
    if not event:
        conn.close()
        raise ValueError("Rise and Run event not found!")

    target_distances = ['1.6 km', '3.2 km', '5 km', '10 km', '21 km']

    winners = []
    for dist in target_distances:
        # Match registrations
        cur.execute('''
            SELECT 
                r.id as registration_id,
                r."bibNumber" as bib_number,
                r."userId" as user_id,
                u.name as user_name,
                u.email as email,
                COALESCE(r."shippingPhone", u.phone) as phone,
                r.distance as distance,
                r."finishTimeSeconds" as finish_time_seconds,
                r."tshirtSize" as tshirt_size,
                r."tshirtSubmittedAt" as tshirt_submitted_at,
                r."shippingName" as shipping_name,
                r."shippingLine1" as address_line1,
                COALESCE(r."shippingLine2", '') as address_line2,
                r."shippingCity" as city,
                r."shippingState" as state,
                r."shippingPincode" as pincode
            FROM "Registration" r
            JOIN "User" u ON r."userId" = u.id
            WHERE r."eventId" = %s 
              AND r."proofStatus" = 'APPROVED'
              AND (r.distance = %s OR r.distance = %s)
            ORDER BY r."finishTimeSeconds" ASC
            LIMIT 3
        ''', (event['id'], dist, dist.replace(" ", "")))

        rows = cur.fetchall()
        rank_labels = ["🥇 1st Place (Winner)", "🥈 2nd Place", "🥉 3rd Place"]

        for idx, row in enumerate(rows):
            sec = row['finish_time_seconds'] or 0
            h = sec // 3600
            m = (sec % 3600) // 60
            s = sec % 60
            f_time = f"{h:02d}:{m:02d}:{s:02d}" if h > 0 else f"{m:02d}:{s:02d}"

            addr = f"{row['address_line1'] or ''}, {row['address_line2'] or ''}, {row['city'] or ''}, {row['state'] or ''} - {row['pincode'] or ''}".strip().strip(', ')

            winners.append({
                "category": f"{dist} Challenge",
                "cat_raw": dist,
                "rank": rank_labels[idx] if idx < 3 else f"#{idx+1}",
                "bib": row['bib_number'],
                "name": row['shipping_name'] or row['user_name'],
                "email": row['email'],
                "phone": row['phone'],
                "finish_time": f_time,
                "shipping_address": addr,
                "tshirt_size": row['tshirt_size'],
                "tshirt_submitted_at": str(row['tshirt_submitted_at']) if row['tshirt_submitted_at'] else None,
                "claim_url": f"https://mountainrun.in/claim-jersey?bib={row['bib_number']}"
            })

    conn.close()
    return winners


def build_email_html(winner, event_name="Rise and Run 2026"):
    claim_link = winner["claim_url"]
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Congratulations Podium Winner - Submit T-Shirt Size</title>
</head>
<body style="margin: 0; padding: 0; background-color: #070a0d; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9; -webkit-font-smoothing: antialiased;">

  <!-- Outer Wrapper -->
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #070a0d; padding: 24px 12px;">
    <tr>
      <td align="center">

        <!-- Card Container (Max 600px) -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #0f1722; border: 1px solid #1e293b; border-radius: 20px; overflow: hidden; box-shadow: 0 25px 60px rgba(0,0,0,0.65);">

          <!-- Top Urgency Ribbon -->
          <tr>
            <td style="background: linear-gradient(90deg, #f59e0b, #eab308, #10b981); padding: 8px 16px; text-align: center;">
              <p style="margin: 0; font-size: 11px; font-weight: 800; color: #000000; letter-spacing: 1.5px; text-transform: uppercase;">
                🏆 OFFICIAL PODIUM WINNER &bull; {event_name.upper()}
              </p>
            </td>
          </tr>

          <!-- Header Logo Bar -->
          <tr>
            <td style="padding: 24px 24px 18px; text-align: center; border-bottom: 1px solid #1e293b;">
              <table border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                <tr>
                  <td style="vertical-align: middle; padding-right: 10px;">
                    <img src="https://mountainrun.in/logo-mark.svg" alt="Mountain Run" width="34" height="34" style="display: block; width: 34px; height: 34px;">
                  </td>
                  <td style="vertical-align: middle;">
                    <span style="font-size: 22px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff;">
                      Mountain <span style="color: #10b981;">Run</span>
                    </span>
                  </td>
                </tr>
              </table>
              <p style="margin: 4px 0 0; font-size: 10px; font-weight: 700; letter-spacing: 2.5px; text-transform: uppercase; color: #64748b;">
                National Virtual Marathon Series
              </p>
            </td>
          </tr>

          <!-- Hero Greeting & Trophy Header -->
          <tr>
            <td style="padding: 32px 24px 16px; text-align: center;">
              <div style="display: inline-block; background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.35); border-radius: 50px; padding: 6px 16px; margin-bottom: 16px;">
                <span style="font-size: 11px; font-weight: 800; color: #fbbf24; letter-spacing: 1px; text-transform: uppercase;">
                  🎉 Congratulations Podium Finisher!
                </span>
              </div>
              <h1 style="margin: 0 0 12px; font-size: 26px; font-weight: 900; line-height: 1.25; color: #ffffff; letter-spacing: -0.5px;">
                You Placed in the <span style="color: #fbbf24;">Top 3</span> of <br>{event_name}!
              </h1>
              <p style="margin: 0 auto; max-width: 480px; font-size: 14px; line-height: 1.6; color: #94a3b8;">
                Dear <strong>{winner['name']}</strong>, your verified race submission has secured an official podium rank on the National Leaderboard. You have won an official <strong>Mountain Run DRI-FIT Running Jersey</strong>!
              </p>
            </td>
          </tr>

          <!-- Winner Standing Card -->
          <tr>
            <td style="padding: 0 24px 24px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #131d2a 0%, #0d1520 100%); border: 1px solid #334155; border-radius: 14px; padding: 18px 20px;">
                <tr>
                  <td width="50%" style="vertical-align: top; padding-right: 12px;">
                    <p style="margin: 0 0 4px; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Category & Rank</p>
                    <p style="margin: 0; font-size: 16px; font-weight: 800; color: #fbbf24;">
                      {winner['category']} &bull; {winner['rank']}
                    </p>
                  </td>
                  <td width="50%" style="vertical-align: top; padding-left: 12px; text-align: right;">
                    <p style="margin: 0 0 4px; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">BIB & Official Time</p>
                    <p style="margin: 0; font-size: 15px; font-weight: 800; color: #38bdf8; font-family: monospace;">
                      {winner['bib']} &bull; {winner['finish_time']}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- T-Shirt Image Showcase -->
          <tr>
            <td style="padding: 0 24px 24px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0b1119; border: 1px solid #243447; border-radius: 16px; overflow: hidden;">
                <tr>
                  <td style="padding: 20px 16px; text-align: center;">
                    <span style="font-size: 11px; font-weight: 800; color: #34d399; text-transform: uppercase; letter-spacing: 1.5px;">
                      👕 Your Exclusive Winner Reward
                    </span>
                    <h3 style="margin: 6px 0 14px; font-size: 17px; font-weight: 800; color: #ffffff;">
                      Official Mountain Run DRI-FIT Running Jersey
                    </h3>
                    <img src="{TSHIRT_IMAGE_URL}" alt="Mountain Run Official Jersey" width="100%" style="max-width: 380px; height: auto; border-radius: 12px; display: block; margin: 0 auto; box-shadow: 0 10px 30px rgba(0,0,0,0.6);">
                    <p style="margin: 12px auto 0; max-width: 440px; font-size: 12px; line-height: 1.5; color: #94a3b8;">
                      Ultra-lightweight moisture-wicking technical fabric &bull; Anti-chafing active fit &bull; Signature Mountain Run athlete print
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Size Selection Chart -->
          <tr>
            <td style="padding: 0 24px 24px;">
              <div style="background-color: #121b27; border: 1px solid #1e293b; border-radius: 14px; padding: 18px 20px;">
                <p style="margin: 0 0 12px; font-size: 12px; font-weight: 800; color: #e2e8f0; text-transform: uppercase; letter-spacing: 1px; text-align: center;">
                  📏 T-Shirt Size Measurement Guide (Chest in Inches)
                </p>
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 12px; text-align: center;">
                  <tr style="background-color: #1a2738;">
                    <th style="padding: 8px; border-radius: 6px 0 0 6px; color: #94a3b8; font-weight: 700;">Size</th>
                    <th style="padding: 8px; color: #94a3b8; font-weight: 700;">Chest (Inches)</th>
                    <th style="padding: 8px; border-radius: 0 6px 6px 0; color: #94a3b8; font-weight: 700;">Fit Type</th>
                  </tr>
                  <tr>
                    <td style="padding: 7px; font-weight: 800; color: #f8fafc; border-bottom: 1px solid #1e293b;">S</td>
                    <td style="padding: 7px; color: #cbd5e1; border-bottom: 1px solid #1e293b;">36" &ndash; 38"</td>
                    <td style="padding: 7px; color: #64748b; border-bottom: 1px solid #1e293b;">Slim / Regular</td>
                  </tr>
                  <tr>
                    <td style="padding: 7px; font-weight: 800; color: #f8fafc; border-bottom: 1px solid #1e293b;">M</td>
                    <td style="padding: 7px; color: #cbd5e1; border-bottom: 1px solid #1e293b;">38" &ndash; 40"</td>
                    <td style="padding: 7px; color: #64748b; border-bottom: 1px solid #1e293b;">Standard Active</td>
                  </tr>
                  <tr style="background-color: rgba(16, 185, 129, 0.08);">
                    <td style="padding: 7px; font-weight: 800; color: #34d399; border-bottom: 1px solid #1e293b;">L</td>
                    <td style="padding: 7px; color: #34d399; font-weight: 700; border-bottom: 1px solid #1e293b;">40" &ndash; 42"</td>
                    <td style="padding: 7px; color: #34d399; font-weight: 700; border-bottom: 1px solid #1e293b;">Most Popular Fit</td>
                  </tr>
                  <tr>
                    <td style="padding: 7px; font-weight: 800; color: #f8fafc; border-bottom: 1px solid #1e293b;">XL</td>
                    <td style="padding: 7px; color: #cbd5e1; border-bottom: 1px solid #1e293b;">42" &ndash; 44"</td>
                    <td style="padding: 7px; color: #64748b; border-bottom: 1px solid #1e293b;">Comfort Relaxed</td>
                  </tr>
                  <tr>
                    <td style="padding: 7px; font-weight: 800; color: #f8fafc;">XXL</td>
                    <td style="padding: 7px; color: #cbd5e1;">44" &ndash; 46"</td>
                    <td style="padding: 7px; color: #64748b;">Plus Comfort</td>
                  </tr>
                </table>
              </div>
            </td>
          </tr>

          <!-- Action Step: 1-Click Online Size Selection -->
          <tr>
            <td style="padding: 0 24px 28px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background: linear-gradient(180deg, #182333 0%, #111a26 100%); border: 2px solid #10b981; border-radius: 16px; padding: 24px 20px;">
                <tr>
                  <td style="text-align: center;">
                    <span style="display: inline-block; background-color: #10b981; color: #041f16; font-size: 10px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase; padding: 3px 12px; border-radius: 20px; margin-bottom: 12px;">
                      ⚡ ACTION REQUIRED &bull; 1-CLICK INSTANT CLAIM
                    </span>
                    <h2 style="margin: 0 0 8px; font-size: 21px; font-weight: 900; color: #ffffff;">
                      Select Your Jersey Size Online:
                    </h2>
                    <p style="margin: 0 auto 20px; max-width: 440px; font-size: 13px; color: #cbd5e1; line-height: 1.5;">
                      Click the button below to choose your size (S, M, L, XL, XXL) and confirm your shipping address in seconds:
                    </p>

                    <!-- Big CTA Button -->
                    <table border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto 16px;">
                      <tr>
                        <td align="center" style="border-radius: 12px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);">
                          <a href="{claim_link}" target="_blank" style="display: inline-block; padding: 15px 32px; font-size: 15px; font-weight: 900; color: #022c22; text-decoration: none; border-radius: 12px; letter-spacing: 0.5px; text-transform: uppercase;">
                            Select T-Shirt Size &amp; Claim Jersey &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin: 0 auto; max-width: 380px; font-size: 11px; color: #94a3b8; line-height: 1.4;">
                      Or open this link directly: <br>
                      <a href="{claim_link}" style="color: #38bdf8; text-decoration: underline; word-break: break-all;">{claim_link}</a>
                    </p>

                    <p style="margin: 16px 0 0; font-size: 11px; color: #64748b; font-style: italic;">
                      Note: Once submitted, your custom jersey will be packed and dispatched with live courier tracking!
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Dispatch Destination Preview -->
          <tr>
            <td style="padding: 0 24px 28px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0d141e; border: 1px solid #1e293b; border-radius: 14px; padding: 16px 18px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 4px; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">
                      📦 Shipping Address on Record:
                    </p>
                    <p style="margin: 0; font-size: 13px; font-weight: 600; color: #cbd5e1; line-height: 1.4;">
                      {winner['name']} &bull; {winner['shipping_address']}
                    </p>
                    <p style="margin: 6px 0 0; font-size: 11px; color: #64748b;">
                      (If you need to update your delivery address, you can edit it directly on the claim page.)
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #090e15; padding: 24px; text-align: center; border-top: 1px solid #1e293b;">
              <p style="margin: 0 0 8px; font-size: 12px; color: #64748b;">
                Need help or have questions? WhatsApp us at <a href="https://wa.me/917518418960" style="color: #10b981; text-decoration: none; font-weight: 700;">+91 75184 18960</a>
              </p>
              <p style="margin: 0 0 12px; font-size: 11px; color: #475569;">
                Mountain Run &bull; India's Premier Virtual Marathon Community<br>
                Official Website: <a href="https://mountainrun.in" style="color: #38bdf8; text-decoration: none;">mountainrun.in</a> &bull; Instagram: <a href="https://instagram.com/mountainrunofficial" style="color: #f43f5e; text-decoration: none;">@mountainrunofficial</a>
              </p>
              <p style="margin: 0; font-size: 10px; color: #334155;">
                &copy; 2026 Mountain Run. All rights reserved.
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


def send_resend_email(to_email, subject, html_content):
    if not RESEND_API_KEY:
        raise ValueError("RESEND_API_KEY missing in backend/.env")
    url = "https://api.resend.com/emails"
    headers = {
        "Authorization": f"Bearer {RESEND_API_KEY}",
        "Content-Type": "application/json",
        "User-Agent": "MountainRunWinnerNotifier/1.0",
    }
    payload = {
        "from": RESEND_FROM,
        "to": [to_email] if isinstance(to_email, str) else to_email,
        "reply_to": "mountainrunofficial@gmail.com",
        "subject": subject,
        "html": html_content,
    }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers=headers, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            resp_body = resp.read().decode("utf-8")
            return json.loads(resp_body)
    except urllib.error.HTTPError as e:
        err = e.read().decode("utf-8")
        return {"error": err}
    except Exception as e:
        return {"error": str(e)}


def main():
    parser = argparse.ArgumentParser(description="Rise and Run Top 3 T-Shirt Winner Claim Manager")
    parser.add_argument("--preview", action="store_true", help="Generate local HTML preview file")
    parser.add_argument("--status", action="store_true", help="Check database status of winner sizes")
    parser.add_argument("--test", type=str, help="Send test email to specified email address")
    parser.add_argument("--dry-run", action="store_true", help="Simulate email sending without calling Resend API")
    parser.add_argument("--live", action="store_true", help="LIVE SEND emails to all 15 winners via Resend")
    parser.add_argument("--yes", action="store_true", help="Skip confirmation prompt for live dispatch")

    args = parser.parse_args()

    winners = get_rise_and_run_top3_winners()

    if args.preview or (not args.status and not args.test and not args.dry_run and not args.live):
        preview_html = build_email_html(winners[0], "Rise and Run 2026")
        out_file = "rise-and-run-winner-tshirt-preview.html"
        with open(out_file, "w", encoding="utf-8") as f:
            f.write(preview_html)
        print(f"[✓] Generated email preview file: {out_file}")
        print(f"Sample recipient: {winners[0]['name']} ({winners[0]['bib']}) - {winners[0]['category']}")

    if args.status:
        print("\n" + "=" * 80)
        print("RISE AND RUN — TOP 3 WINNERS T-SHIRT SIZE STATUS (FROM DB)")
        print("=" * 80)
        submitted = 0
        pending = 0
        for w in winners:
            size_str = f"Confirmed: {w['tshirt_size']}" if w['tshirt_size'] else "⏳ Pending"
            if w['tshirt_size']:
                submitted += 1
            else:
                pending += 1
            print(f"BIB: {w['bib']:12s} | {w['category']:16s} | {w['rank']:24s} | {w['name']:24s} | {size_str}")

        print("\n" + "-" * 80)
        print(f"Total Winners: {len(winners)} | Sizes Confirmed: {submitted} | Sizes Pending: {pending}")
        return

    if args.test:
        test_email = args.test.strip()
        print(f"\n[*] Sending single test email to: {test_email}")
        sample_winner = winners[0]
        html = build_email_html(sample_winner, "Rise and Run 2026")
        subject = "🏆 Congratulations! You Won an Official Mountain Run T-Shirt | Submit Your Size"
        res = send_resend_email(test_email, subject, html)
        print("Resend response:", json.dumps(res, indent=2))
        return

    if args.dry_run:
        print("\n" + "=" * 80)
        print(f"DRY RUN — SIMULATING BROADCAST TO {len(winners)} WINNERS")
        print("=" * 80)
        for idx, w in enumerate(winners, 1):
            print(f"[{idx:02d}/{len(winners)}] To: {w['name']} <{w['email']}> | BIB: {w['bib']} | {w['category']} | {w['rank']}")
            print(f"      Claim Link: {w['claim_url']}")
        print(f"\n[✓] Dry run completed. No emails were actually dispatched.")
        return

    if args.live:
        print("\n" + "=" * 80)
        print(f"LIVE DISPATCH — SENDING EMAILS TO ALL {len(winners)} WINNERS")
        print("=" * 80)

        if not args.yes:
            confirm = input(f"Are you sure you want to send emails to {len(winners)} athletes? Type 'YES' to proceed: ")
            if confirm.strip() != "YES":
                print("[!] Dispatch cancelled by user.")
                return

        results = []
        sent_count = 0
        failed_count = 0

        for idx, w in enumerate(winners, 1):
            print(f"[{idx:02d}/{len(winners)}] Sending to {w['name']} ({w['email']}) - {w['bib']}...")
            html = build_email_html(w, "Rise and Run 2026")
            subject = "🏆 Congratulations! You Won an Official Mountain Run T-Shirt | Submit Your Size"
            res = send_resend_email(w['email'], subject, html)

            status = "SENT" if "id" in res else "FAILED"
            if status == "SENT":
                sent_count += 1
                print(f"  [✓] Sent! Resend ID: {res.get('id')}")
            else:
                failed_count += 1
                print(f"  [✗] Failed! {res.get('error')}")

            results.append({
                **w,
                "status": status,
                "resend_response": res,
                "sent_at": datetime.datetime.now().isoformat()
            })

            time.sleep(0.6)  # Safety delay between Resend calls

        out_results = "rise_and_run_tshirt_email_results.json"
        with open(out_results, "w", encoding="utf-8") as f:
            json.dump(results, f, indent=2, ensure_ascii=False)

        print("\n" + "=" * 80)
        print(f"Broadcast Summary: Total: {len(winners)} | Sent: {sent_count} | Failed: {failed_count}")
        print(f"Results saved to: {out_results}")


if __name__ == "__main__":
    main()
