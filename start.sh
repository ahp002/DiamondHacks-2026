#!/bin/bash

echo "Setting up browser profiles..."
for dir in /tmp/chrome-doordash /tmp/chrome-grubhub /tmp/chrome-ubereats; do
  mkdir -p "$dir/Default"
  cp "$HOME/Library/Application Support/Google/Chrome/Default/Cookies" "$dir/Default/" 2>/dev/null || true
done

echo "Starting Chrome instances..."
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9222 --user-data-dir="/tmp/chrome-doordash" &

/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9223 --user-data-dir="/tmp/chrome-grubhub" &

/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --remote-debugging-port=9224 --user-data-dir="/tmp/chrome-ubereats" &

echo "Waiting for Chrome instances to start..."
sleep 4

echo "Starting Next.js dev server..."
cd "$(dirname "$0")/cheapr-delivery" && npm run dev
