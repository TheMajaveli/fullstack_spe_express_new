#!/bin/sh
# Run the API locally (use when Docker build fails or to test limit=12 fix).
# Requires: MySQL running (e.g. docker compose up -d mysql) and port 3307.

cd "$(dirname "$0")"
export PORT=4000
export DB_HOST=127.0.0.1
export DB_PORT=3307
export DB_USER=cinenoir
export DB_PASSWORD=cinenoir
export DB_NAME=cinenoir

npm run build 2>/dev/null || true
node dist/server.js
