#!/bin/sh
set -e

# Wait for MySQL (depends_on healthy + extra safety)
echo "Waiting for MySQL..."
node wait-db.js
echo "MySQL is up"

# Run schema migration
if [ "${RUN_MIGRATE:-true}" = "true" ]; then
  echo "Running database schema..."
  node dist/database/migrate.js
fi

exec "$@"
