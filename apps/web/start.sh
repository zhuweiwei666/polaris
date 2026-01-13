#!/bin/sh
set -e

# Next.js standalone output location differs depending on monorepo layout.
# Try a few known paths and fail with a helpful directory listing.

if [ -f "/app/server.js" ]; then
  exec node /app/server.js
fi

if [ -f "/app/apps/web/server.js" ]; then
  exec node /app/apps/web/server.js
fi

if [ -f "/app/apps/web/.next/standalone/server.js" ]; then
  exec node /app/apps/web/.next/standalone/server.js
fi

echo "ERROR: Could not find Next.js standalone server.js in expected locations."
echo "Top-level /app contents:"
ls -la /app || true
echo ""
echo "First 200 entries under /app (recursive):"
find /app -maxdepth 4 -type f | head -n 200 || true
exit 1

