# Mountain Run Project Context

Last updated: 2026-07-14

## What This Project Is

Mountain Run is a virtual running event registration app. It has:

- A Next.js frontend in `frontend/`
- An Express + Prisma backend in `backend/`
- PostgreSQL as the database through Prisma
- Razorpay Checkout/order flow for payment

The main user-facing flow being debugged recently is:

1. User opens `http://localhost:3000/register`.
2. User fills runner, event, distance, and shipping details.
3. Frontend POSTs to backend `POST http://127.0.0.1:4000/api/registrations`.
4. Backend creates a user + registration.
5. Frontend POSTs to `POST /api/payments/create-order`.
6. Backend creates a Razorpay order.
7. Frontend opens Razorpay Checkout.

## Current Folder Structure

```text
frontend/  Next.js app
backend/   Express API, Prisma schema, migrations, seed
```

Important files:

- `frontend/src/app/register/payment-registration-form.tsx`
- `frontend/src/app/data/events.ts`
- `backend/src/app.ts`
- `backend/src/controllers/registration.controller.ts`
- `backend/src/controllers/payment.controller.ts`
- `backend/src/data/default-events.ts`
- `backend/prisma/schema.prisma`
- `backend/prisma/seed.ts`
- `backend/.env.example`
- `frontend/.env.local.example`

## Important Current State / Caveats

At the time this file was created, `git status` was clean and local branch `main` matched `origin/main`.

However, the current checkout does **not** have a root-level `package.json`, even though `README.md` still says root commands like `npm run dev` should work. Earlier work had added a root script runner, but a later remote change appears to have removed root `package.json`.

So, for now, use direct folder commands unless root scripts are restored:

```bash
cd backend
npm run dev
```

```bash
cd frontend
npm run dev
```

Recommended next cleanup: recreate a root `package.json` with scripts that forward to `frontend` and `backend`, or update `README.md` to match the current actual commands.

## Environment Variables

Frontend example:

```env
NEXT_PUBLIC_API_URL="http://127.0.0.1:4000"
```

Backend example:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/mountainrun?schema=public"
PORT=4000
FRONTEND_URL="http://localhost:3000"
RAZORPAY_KEY_ID=""
RAZORPAY_KEY_SECRET=""
RAZORPAY_WEBHOOK_SECRET=""
```

Backend requires a real `DATABASE_URL` to run registrations and seed data.

## Recent Debugging History

The user was getting registration submit errors on the `/register` page.

### 1. `Failed to fetch`

Initial problem: frontend was trying to call an API URL that did not match the backend dev server.

Fixes made:

- Frontend default API URL changed to `http://127.0.0.1:4000`.
- Backend default port changed to `4000`.
- Friendly frontend message added for fetch connection failure.

Relevant file:

- `frontend/src/app/register/payment-registration-form.tsx`

### 2. CORS Errors

The browser then showed CORS errors for `POST /api/registrations`.

Fixes made:

- Backend CORS allows:
  - configured `FRONTEND_URL`
  - `http://localhost:3000`
  - `http://127.0.0.1:3000`
  - `http://127.0.0.1:49154`
- In development, backend also allows `http://localhost:*` and `http://127.0.0.1:*`.

Relevant file:

- `backend/src/app.ts`

Verification that worked previously:

```bash
curl.exe -i -X OPTIONS "http://127.0.0.1:4000/api/registrations" ^
  -H "Origin: http://localhost:3000" ^
  -H "Access-Control-Request-Method: POST" ^
  -H "Access-Control-Request-Headers: content-type"
```

Expected:

```text
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: http://localhost:3000
```

### 3. `Event not found`

After CORS was fixed, API returned:

```text
404 Event not found
```

Reason: database did not have event rows matching frontend slugs.

Fixes made:

- Created `backend/src/data/default-events.ts` with the default events.
- `backend/prisma/seed.ts` now imports and seeds `defaultEvents`.
- `createRegistration` now auto-upserts a matching default event if missing.

Relevant files:

- `backend/src/data/default-events.ts`
- `backend/prisma/seed.ts`
- `backend/src/controllers/registration.controller.ts`

Default slugs:

- `monsoon-mountain-miles`
- `independence-endurance-run`
- `himalayan-winter-sprint`

## Recent Commits To Know

Recent `git log --oneline -8` when this file was written:

```text
c0022d8 Seeded data of events
f192ed9 Auto-create default registration events
dfd94d6 changed allowed origins
651fbd6 Start frontend and API together in dev
61b2bd6 Merge branch 'main' of https://github.com/kampitojha/mountainrun
755dc2a Migration changes
87b01f6 Allow local dev origins for API CORS
a56352c Fix local registration API connection
```

Note: because `c0022d8` is newer than the earlier AI work, inspect its changes before assuming root scripts still exist.

## How To Run Right Now

Backend:

```bash
cd backend
npm install
npm run prisma:generate
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Open:

```text
http://localhost:3000/register
```

Health check:

```bash
curl.exe http://127.0.0.1:4000/health
```

Expected:

```json
{"status":"ok","service":"mountainrun-api"}
```

## Verification Commands

Frontend:

```bash
cd frontend
npm run lint
npm run build
```

Backend:

```bash
cd backend
npm run build
```

Seed:

```bash
cd backend
npm run prisma:seed
```

Seed requires `DATABASE_URL`.

## Known Possible Next Error

Once registration works, payment order creation can fail if Razorpay credentials are missing.

Expected backend error if missing:

```text
Razorpay credentials are not configured
```

To fix, set in backend env:

```env
RAZORPAY_KEY_ID="..."
RAZORPAY_KEY_SECRET="..."
```

Then restart backend.

## Suggested Next Steps For Another AI

1. Check `git status --short --branch`.
2. Confirm whether root `package.json` should exist. If the user wants one-command dev, recreate root scripts.
3. Make sure backend has a real `.env` or environment variables, especially `DATABASE_URL`.
4. Run backend and check `GET /health`.
5. Submit `/register` form and watch Network tab.
6. If registration succeeds but payment fails, inspect Razorpay env and `backend/src/services/razorpay.service.ts`.
7. Keep changes scoped and push only after build/lint verification.

## User Preferences / Conversation Context

User mostly writes in Hinglish/Hindi. They want direct fixes and pushes, not long theory. They asked for this Markdown file so another AI can continue without losing context.

The user has repeatedly shared Chrome screenshots from a Google Meet screen share. The important browser findings were:

- Earlier: Network tab showed CORS error.
- Later: Network tab showed `POST http://127.0.0.1:4000/api/registrations` returning `404 Not Found`.
- Latest code changes were intended to fix event seeding / missing events.
