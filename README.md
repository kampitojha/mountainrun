# Mountain Run

Mountain Run is split into a Next.js frontend and an Express/Prisma backend.

## Project structure

```text
frontend/  Next.js app (Clerk auth UI)
backend/   API server, Prisma, Clerk token verification
```

## Auth (Clerk)

Clerk is already integrated. Add API keys from [dashboard.clerk.com](https://dashboard.clerk.com):

1. Put `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY` in `frontend/.env`
2. Put the same `CLERK_SECRET_KEY` in `backend/.env`

## Frontend

```bash
cd frontend
npm install
npm run dev
```

## Backend

```bash
cd backend
npm install
npm run prisma:generate
npm run dev
```
