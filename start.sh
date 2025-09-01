#!/bin/bash
# Start both services for Render deployment

# Exit on any error
set -e

# Check if .next folder exists, if not build it
if [ ! -d ".next" ]; then
    echo ".next folder not found, building Next.js app..."
    npm run build
fi

echo "Starting Flask API on port 5000..."
python app.py &
FLASK_PID=$!

echo "Starting Next.js server on port $PORT..."
# Use node loader instead of tsx command
HOST=0.0.0.0 PORT=$PORT NODE_ENV=production node --loader tsx server.ts

# Cleanup when Next.js exits
echo "Next.js server stopped, shutting down Flask..."
kill $FLASK_PID 2>/dev/null || true
exit 0
