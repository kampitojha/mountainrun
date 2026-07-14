# Mountain Run

Mountain Run is split into a Next.js frontend and an Express/Prisma backend.

## Project structure

```text
frontend/  Next.js app
backend/   API server and Prisma schema
```

## Frontend

Run from the repository root:

```bash
npm run dev
npm run build
npm run lint
```

You can also run the same commands directly inside `frontend/`.

## Backend

Run API commands from the repository root:

```bash
npm run api:dev
npm run api:build
npm run api:prisma:generate
npm run api:prisma:migrate
npm run api:prisma:seed
```
