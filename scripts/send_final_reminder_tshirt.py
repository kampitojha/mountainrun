#!/usr/bin/env python3
"""
Mountain Run — Rise and Run 2026: Final Reminder Email for T-Shirt Size Submission
Sends a high-urgency, polished final reminder to the 5 winners whose sizes are still pending.
"""

import os
import sys
import json
import time
import datetime
import argparse
import urllib.request
import urllib.error

sys.path.insert(0, os.path.abspath("scripts"))
from tshirt_list_manager import get_backend_env
from rise_and_run_tshirt_dispatch import get_rise_and_run_top3_winners

ENV = get_backend_env()
RESEND_API_KEY = ENV.get("RESEND_API_KEY")
RESEND_FROM = ENV.get("RESEND_FROM_EMAIL", "Mountain Run <onboarding@mountainrun.in>")
TSHIRT_IMAGE_URL = "https://res.cloudinary.com/yppcqzt6/image/upload/v1788010023/mountainrun/newsletter/ng4hz1fuxpkipsauk2rc.png"


def build_final_reminder_html(winner, event_name="Rise and Run 2026"):
    claim_link = winner["claim_url"]
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Final Call: Claim Your Winner T-Shirt - {event_name}</title>
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
            <td style="background: linear-gradient(90deg, #dc2626, #ea580c, #f59e0b); padding: 10px 16px; text-align: center;">
              <p style="margin: 0; font-size: 11px; font-weight: 900; color: #ffffff; letter-spacing: 1.5px; text-transform: uppercase;">
                ⚠️ FINAL REMINDER &bull; T-SHIRT SIZE SELECTION CLOSING SOON
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

          <!-- Hero Greeting -->
          <tr>
            <td style="padding: 32px 24px 16px; text-align: center;">
              <div style="display: inline-block; background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.35); border-radius: 50px; padding: 6px 18px; margin-bottom: 16px;">
                <span style="font-size: 11px; font-weight: 800; color: #f87171; letter-spacing: 1px; text-transform: uppercase;">
                  ⏰ ACTION REQUIRED &bull; DISPATCH PENDING
                </span>
              </div>
              <h1 style="margin: 0 0 14px; font-size: 25px; font-weight: 900; line-height: 1.3; color: #ffffff; letter-spacing: -0.5px;">
                Final Call to Submit Your <span style="color: #fbbf24;">T-Shirt Size</span>!
              </h1>
              <p style="margin: 0 auto; max-width: 490px; font-size: 14px; line-height: 1.6; color: #cbd5e1;">
                Dear <strong>{winner['name']}</strong>,<br>
                We are currently finalizing the courier dispatch for all <strong>{event_name}</strong> podium winners. We noticed you have not selected your official <strong>Mountain Run DRI-FIT Running Jersey</strong> size yet.
              </p>
              <p style="margin: 10px auto 0; max-width: 490px; font-size: 13px; line-height: 1.5; color: #94a3b8;">
                To avoid any delays in shipping your winner jersey and medal, please choose your size in the next few minutes!
              </p>
            </td>
          </tr>

          <!-- Winner Standing Card -->
          <tr>
            <td style="padding: 0 24px 20px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, #131d2a 0%, #0d1520 100%); border: 1px solid #334155; border-radius: 14px; padding: 18px 20px;">
                <tr>
                  <td width="50%" style="vertical-align: top; padding-right: 12px;">
                    <p style="margin: 0 0 4px; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Podium Position</p>
                    <p style="margin: 0; font-size: 15px; font-weight: 800; color: #fbbf24;">
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

          <!-- Big Action Box: 1-Click Online Selection -->
          <tr>
            <td style="padding: 0 24px 24px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background: linear-gradient(180deg, #1a2738 0%, #111b27 100%); border: 2px solid #f59e0b; border-radius: 16px; padding: 24px 20px;">
                <tr>
                  <td style="text-align: center;">
                    <span style="display: inline-block; background-color: #f59e0b; color: #451a03; font-size: 10px; font-weight: 900; letter-spacing: 1px; text-transform: uppercase; padding: 3px 12px; border-radius: 20px; margin-bottom: 12px;">
                      ⚡ 10 SECONDS &bull; 1-CLICK INSTANT CLAIM
                    </span>
                    <h2 style="margin: 0 0 8px; font-size: 20px; font-weight: 900; color: #ffffff;">
                      Select Your Size Online Now:
                    </h2>
                    <p style="margin: 0 auto 20px; max-width: 440px; font-size: 13px; color: #cbd5e1; line-height: 1.5;">
                      Click the button below to choose your size (S, M, L, XL, XXL) and confirm your delivery address:
                    </p>

                    <!-- Big CTA Button -->
                    <table border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto 16px;">
                      <tr>
                        <td align="center" style="border-radius: 12px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); box-shadow: 0 8px 24px rgba(245, 158, 11, 0.4);">
                          <a href="{claim_link}" target="_blank" style="display: inline-block; padding: 15px 34px; font-size: 15px; font-weight: 900; color: #000000; text-decoration: none; border-radius: 12px; letter-spacing: 0.5px; text-transform: uppercase;">
                            Select T-Shirt Size Now &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>

                    <p style="margin: 0 auto; max-width: 380px; font-size: 11px; color: #94a3b8; line-height: 1.4;">
                      Or open this link directly: <br>
                      <a href="{claim_link}" style="color: #38bdf8; text-decoration: underline; word-break: break-all;">{claim_link}</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- T-Shirt Image Showcase -->
          <tr>
            <td style="padding: 0 24px 20px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0b1119; border: 1px solid #243447; border-radius: 16px; overflow: hidden;">
                <tr>
                  <td style="padding: 20px 16px; text-align: center;">
                    <span style="font-size: 11px; font-weight: 800; color: #34d399; text-transform: uppercase; letter-spacing: 1.5px;">
                      👕 Exclusive Podium Finisher Reward
                    </span>
                    <h3 style="margin: 6px 0 14px; font-size: 16px; font-weight: 800; color: #ffffff;">
                      Official Mountain Run DRI-FIT Running Jersey
                    </h3>
                    <img src="{TSHIRT_IMAGE_URL}" alt="Mountain Run Official Jersey" width="100%" style="max-width: 380px; height: auto; border-radius: 12px; display: block; margin: 0 auto; box-shadow: 0 10px 30px rgba(0,0,0,0.6);">
                    <p style="margin: 12px auto 0; max-width: 440px; font-size: 12px; line-height: 1.5; color: #94a3b8;">
                      Ultra-lightweight moisture-wicking technical fabric &bull; Anti-chafing active fit
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Size Guide -->
          <tr>
            <td style="padding: 0 24px 24px;">
              <div style="background-color: #121b27; border: 1px solid #1e293b; border-radius: 14px; padding: 16px 20px;">
                <p style="margin: 0 0 10px; font-size: 12px; font-weight: 800; color: #e2e8f0; text-transform: uppercase; letter-spacing: 1px; text-align: center;">
                  📏 Size Guide (Chest in Inches)
                </p>
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 12px; text-align: center;">
                  <tr style="background-color: #1a2738;">
                    <th style="padding: 8px; color: #94a3b8; font-weight: 700;">Size</th>
                    <th style="padding: 8px; color: #94a3b8; font-weight: 700;">Chest (Inches)</th>
                    <th style="padding: 8px; color: #94a3b8; font-weight: 700;">Fit Type</th>
                  </tr>
                  <tr>
                    <td style="padding: 6px; font-weight: 800; color: #f8fafc; border-bottom: 1px solid #1e293b;">S</td>
                    <td style="padding: 6px; color: #cbd5e1; border-bottom: 1px solid #1e293b;">36" &ndash; 38"</td>
                    <td style="padding: 6px; color: #64748b; border-bottom: 1px solid #1e293b;">Slim / Regular</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px; font-weight: 800; color: #f8fafc; border-bottom: 1px solid #1e293b;">M</td>
                    <td style="padding: 6px; color: #cbd5e1; border-bottom: 1px solid #1e293b;">38" &ndash; 40"</td>
                    <td style="padding: 6px; color: #64748b; border-bottom: 1px solid #1e293b;">Standard Active</td>
                  </tr>
                  <tr style="background-color: rgba(16, 185, 129, 0.08);">
                    <td style="padding: 6px; font-weight: 800; color: #34d399; border-bottom: 1px solid #1e293b;">L</td>
                    <td style="padding: 6px; color: #34d399; font-weight: 700; border-bottom: 1px solid #1e293b;">40" &ndash; 42"</td>
                    <td style="padding: 6px; color: #34d399; font-weight: 700; border-bottom: 1px solid #1e293b;">Most Popular</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px; font-weight: 800; color: #f8fafc; border-bottom: 1px solid #1e293b;">XL</td>
                    <td style="padding: 6px; color: #cbd5e1; border-bottom: 1px solid #1e293b;">42" &ndash; 44"</td>
                    <td style="padding: 6px; color: #64748b; border-bottom: 1px solid #1e293b;">Comfort Relaxed</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px; font-weight: 800; color: #f8fafc;">XXL</td>
                    <td style="padding: 6px; color: #cbd5e1;">44" &ndash; 46"</td>
                    <td style="padding: 6px; color: #64748b;">Plus Comfort</td>
                  </tr>
                </table>
              </div>
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
                      (Delivery address can also be reviewed/updated on the claim page.)
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
                Need help? WhatsApp support at <a href="https://wa.me/917518418960" style="color: #10b981; text-decoration: none; font-weight: 700;">+91 75184 18960</a>
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
    parser = argparse.ArgumentParser(description="Send Final Reminder Email to Pending Winners")
    parser.add_argument("--preview", action="store_true", help="Generate preview HTML")
    parser.add_argument("--live", action="store_true", help="Live send to pending winners")
    args = parser.parse_args()

    winners = get_rise_and_run_top3_winners()
    pending = [w for w in winners if not w.get("tshirt_size")]

    print(f"\nTotal Top 3 Winners: {len(winners)}")
    print(f"Pending Winners: {len(pending)}")

    for idx, p in enumerate(pending, 1):
        print(f"  {idx}. {p['name']} ({p['bib']}) - {p['email']} - {p['phone']}")

    if not pending:
        print("[✓] All winners have submitted their sizes! Nothing to send.")
        return

    # Always generate preview
    preview_html = build_final_reminder_html(pending[0], "Rise and Run 2026")
    preview_file = "rise-and-run-final-reminder-preview.html"
    with open(preview_file, "w", encoding="utf-8") as f:
        f.write(preview_html)
    print(f"\n[✓] Saved email preview to: {preview_file}")

    if not args.live:
        print("\n[NOTE] Run with --live to dispatch emails to all 5 pending athletes.")
        return

    print("\n" + "=" * 70)
    print("🚀 LIVE DISPATCH: SENDING FINAL REMINDER EMAILS")
    print("=" * 70)

    results = []
    sent_count = 0
    failed_count = 0

    for idx, p in enumerate(pending, 1):
        subject = f"⚠️ Final Reminder: Select Your T-Shirt Size to Dispatch Your Winner Jersey | Rise and Run 2026"
        html = build_final_reminder_html(p, "Rise and Run 2026")

        print(f"[{idx}/{len(pending)}] Sending to {p['name']} <{p['email']}> ({p['bib']})...")
        res = send_resend_email(p["email"], subject, html)

        status = "SENT" if "id" in res else "FAILED"
        if status == "SENT":
            sent_count += 1
            print(f"  [✓] Sent! Resend ID: {res.get('id')}")
        else:
            failed_count += 1
            print(f"  [✗] Failed! {res.get('error')}")

        results.append({
            **p,
            "status": status,
            "resend_response": res,
            "sent_at": datetime.datetime.now().isoformat()
        })

        time.sleep(0.8)

    out_file = "rise_and_run_final_reminder_results.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    print("\n" + "=" * 70)
    print(f"Summary: Total: {len(pending)} | Sent: {sent_count} | Failed: {failed_count}")
    print(f"Log saved to: {out_file}")


if __name__ == "__main__":
    main()
