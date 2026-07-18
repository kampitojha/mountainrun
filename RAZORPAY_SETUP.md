# Razorpay + Database Setup

## 1. Frontend env

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_API_URL="http://127.0.0.1:49154"
```

## 2. Backend env

Create `backend/.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/mountainrun?schema=public"
PORT=49154
FRONTEND_URL="http://127.0.0.1:49160"
RAZORPAY_KEY_ID="rzp_test_xxxxxxxxxx"
RAZORPAY_KEY_SECRET="xxxxxxxxxx"
RAZORPAY_WEBHOOK_SECRET="choose-a-strong-secret"
```

Use Razorpay **Test Mode** keys while developing. Replace with Live Mode keys only after test payments work.

## 3. Database

```bash
npm run api:prisma:migrate
npm run api:prisma:seed
```

The seed creates the demo events used by the frontend registration form.

## 4. Run locally

Frontend:

```bash
npm run dev -- --hostname 127.0.0.1 --port 49160
```

Backend:

```bash
npm run api:build
cd backend
$env:PORT="49154"; node dist/server.js
```

## 5. Razorpay webhook

For local testing, expose the backend with a tunnel such as ngrok and set the Razorpay webhook URL to:

```text
https://YOUR-TUNNEL-DOMAIN/api/payments/webhook
```

Recommended events:

```text
payment.captured
order.paid
```

Use the same `RAZORPAY_WEBHOOK_SECRET` in Razorpay Dashboard and `backend/.env`.

## Flow

1. User submits `/register`.
2. Backend creates registration.
3. Backend creates Razorpay Order.
4. Frontend opens Razorpay Checkout with **UPI first** (Intent on mobile, QR on desktop).
5. Checkout returns payment id, order id, and signature.
6. Backend verifies signature and marks payment as `PAID`.
7. Webhook is the backup confirmation path.

## UPI not showing? (checklist)

NPCI deprecated **UPI Collect** (manual VPA entry) from **28 Feb 2026**. Checkout must use **UPI Intent** (mobile) or **UPI QR** (desktop).

Our Checkout config:

- Orders methods: UPI → Card → Wallet → Netbanking
- Hides `upi` flow `collect` so Intent/QR is used

If UPI still missing:

1. Razorpay Dashboard → **Account & Settings → Payment methods** (or **Payment Configuration**)
2. Enable **UPI** for the same mode as your keys (`rzp_test_…` = Test, `rzp_live_…` = Live)
3. Confirm business is **India / INR** (UPI is India-only)
4. Hard-refresh the site after deploy so old `checkout.js` options are gone
5. Test mode: use real UPI apps on phone for Intent; desktop should show a QR

Recent payments on this account used **wallet** (e.g. Airtel Money) when UPI was not visible — that matches Collect deprecation / method order issues, not order creation.
