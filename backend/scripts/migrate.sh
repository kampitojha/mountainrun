#!/bin/sh
# Retry prisma migrate deploy up to 5 times with 8s delay between attempts.
# Needed for Neon serverless Postgres which can have cold-start advisory lock timeouts.

MAX=5
i=1
until npx prisma migrate deploy; do
  if [ $i -ge $MAX ]; then
    echo "ERROR: prisma migrate deploy failed after $MAX attempts." >&2
    exit 1
  fi
  echo "Attempt $i failed. Retrying in 8s..."
  i=$((i + 1))
  sleep 8
done

echo "Migrations applied successfully."
