#!/usr/bin/env bash
set -e

ROOT=$(dirname "$(realpath "$0")")

# Load nvm and switch to Node 18 if current version is too old
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
if node -e "process.exit(parseInt(process.version.slice(1)) < 14 ? 1 : 0)" 2>/dev/null; then
  :
else
  echo "  Switching to Node 18 via nvm..."
  nvm use 18
fi

echo ""
echo "  FinPulse AI — Starting Platform"
echo "  ───────────────────────────────"

# Copy .env if not present
if [ ! -f "$ROOT/backend/.env" ]; then
  cp "$ROOT/backend/.env.example" "$ROOT/backend/.env"
  echo "  Created backend/.env (add your OPENAI_API_KEY for real AI)"
fi

# Start backend in background
echo "  Starting backend on :3001 ..."
cd "$ROOT/backend"
node server.js &
BACKEND_PID=$!
echo "  Backend PID: $BACKEND_PID"

# Wait for backend to be ready
sleep 2

# Start frontend
echo "  Starting frontend on :5173 ..."
cd "$ROOT/frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "  ✓ Backend  → http://localhost:3001"
echo "  ✓ Frontend → http://localhost:5173"
echo ""
echo "  Press Ctrl+C to stop both services."
echo ""

# Trap Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Stopped.'; exit 0" INT TERM

wait
