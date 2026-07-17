# Vercel deploy checklist (Mountain Run)

## Project setup (do this first)

This repo is a monorepo: the Next.js app lives in **`frontend/`**, not the repo root.

Vercel → **Settings** → **General** → **Root Directory** → set to **`frontend`**

Then Vercel → **Settings** → **General** → **Build & Development Settings**:

| Setting | Value |
|---------|--------|
| Framework Preset | Next.js |
| Root Directory | `frontend` |
| Install Command | *(leave empty — default `npm install`)* |
| Build Command | *(leave empty — default `next build`)* |
| Output Directory | *(leave empty — Next.js default)* |

**Do not** use `cd frontend && npm install` when Root Directory is already `frontend`. That causes:

```text
cd frontend: No such file or directory
```

There is **no** root `vercel.json` on purpose — deploy config comes from `frontend/vercel.json` only.

## Common errors

### `cd frontend: No such file or directory`

Root Directory is `frontend`, but Install/Build still run `cd frontend && ...` from an old root `vercel.json` or a manual override. Fix: Root Directory = `frontend`, clear custom Install/Build commands, redeploy.

### `@clerk/nextjs: Missing publishableKey`

Clerk keys are **not** on Vercel (or wrong name / no redeploy).

## 1. Environment variables (exact names)

Vercel → Project → **Settings** → **Environment Variables**

Add for **Production**, **Preview**, **Development**:

| Name (exact) | Example |
|--------------|---------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_test_...` |
| `CLERK_SECRET_KEY` | `sk_test_...` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | `/register` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | `/register` |
| `NEXT_PUBLIC_API_URL` | your live API URL |

**Important:** publishable key name must include `NEXT_PUBLIC_`.  
`CLERK_PUBLISHABLE_KEY` alone is **not** enough for Next.js (code now maps it as fallback, but use the correct name).

## 2. Redeploy after env change

Env change **does not** update a live deployment by itself.

**Deployments** → latest → **⋯** → **Redeploy**  
(check “Use existing Build Cache” **off** if still broken)

## 3. Clerk Dashboard

Add your Vercel domain under allowed origins / domains:

`https://mountainrun-ji6l.vercel.app`

## Verify

Open the site. If still 500, open Vercel **Runtime Logs** — if you still see `Missing publishableKey`, the env name is wrong or redeploy did not pick it up.
