#!/bin/bash
# Start both services for Render deployment

# Check if .next folder exists, if not build it
if [ ! -d ".next" ]; then
    echo ".next folder not found, building Next.js app..."
    npm run build
fi

echo "Starting Flask API on port 5000..."
python app.py &

echo "Starting Next.js server on port $PORT..."
HOST=0.0.0.0 PORT=$PORT NODE_ENV=production tsx server.ts

# If Next.js server exits, kill the Flask process
kill %1
