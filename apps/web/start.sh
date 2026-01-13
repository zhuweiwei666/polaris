#!/bin/sh
set -e

# Next.js standalone output location in monorepo layout
SERVER=/app/apps/web/server.js

if [ -f "$SERVER" ]; then
  # cd so that cwd-relative .next/static + public are resolved
  cd /app/apps/web
  exec node "$SERVER"
fi

echo "ERROR: Could not find Next.js standalone server.js at $SERVER"
echo "Top-level /app contents:"
ls -la /app || true
echo "apps/web contents:"
ls -la /app/apps/web || true
exit 1

