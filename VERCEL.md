# Vercel deploy checklist (Mountain Run)

## Error you saw

```text
@clerk/nextjs: Missing publishableKey
```

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

## 2. Root Directory (recommended)

Vercel → **Settings** → **General** → **Root Directory**

- Prefer: set to **`frontend`**
- Then clear custom Install/Build overrides (use defaults for Next.js)

If Root Directory is **empty** (repo root), repo `vercel.json` runs:

```text
cd frontend && npm install
cd frontend && npm run build
```

## 3. Redeploy after env change

Env change **does not** update a live deployment by itself.

**Deployments** → latest → **⋯** → **Redeploy**  
(check “Use existing Build Cache” **off** if still broken)

## 4. Clerk Dashboard

Add your Vercel domain under allowed origins / domains:

`https://mountainrun-ji6l.vercel.app`

## Verify

Open the site. If still 500, open Vercel **Runtime Logs** — if you still see `Missing publishableKey`, the env name is wrong or redeploy did not pick it up.
