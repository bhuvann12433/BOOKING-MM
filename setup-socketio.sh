#!/bin/bash
# Socket.io Installation & Setup Script
# Run this to get Socket.io working with your project

echo "🚀 Socket.io Real-Time Seat Booking Setup"
echo "=========================================="

# ============================================
# 1. BACKEND SETUP
# ============================================

echo ""
echo "📦 Installing Backend Dependencies..."
cd backend

# Check if package.json exists
if [ ! -f "package.json" ]; then
  echo "❌ package.json not found in backend/"
  exit 1
fi

# Install Socket.io
npm install socket.io

# Verify installation
if npm list socket.io > /dev/null 2>&1; then
  echo "✅ Socket.io installed successfully"
else
  echo "❌ Socket.io installation failed"
  exit 1
fi

# ============================================
# 2. FRONTEND SETUP
# ============================================

echo ""
echo "📦 Installing Frontend Dependencies..."
cd ../frontend

# Check if package.json exists
if [ ! -f "package.json" ]; then
  echo "❌ package.json not found in frontend/"
  exit 1
fi

# Install Socket.io Client
npm install socket.io-client

# Verify installation
if npm list socket.io-client > /dev/null 2>&1; then
  echo "✅ Socket.io-client installed successfully"
else
  echo "❌ Socket.io-client installation failed"
  exit 1
fi

# ============================================
# 3. VERIFY FILES EXIST
# ============================================

echo ""
echo "📁 Verifying Socket.io Files..."

cd ..

# Backend socket handler
if [ -f "backend/socket/socketHandlers.js" ]; then
  echo "✅ backend/socket/socketHandlers.js exists"
else
  echo "❌ backend/socket/socketHandlers.js NOT FOUND"
  exit 1
fi

# Backend updated server.js (contains socket.io)
if grep -q "socket.io" backend/server.js; then
  echo "✅ server.js has Socket.io integration"
else
  echo "❌ server.js missing Socket.io integration"
  exit 1
fi

# Documentation files
if [ -f "SOCKET_IO_QUICK_START.md" ]; then
  echo "✅ SOCKET_IO_QUICK_START.md exists"
else
  echo "❌ SOCKET_IO_QUICK_START.md NOT FOUND"
fi

if [ -f "backend/SOCKET_IO_BACKEND_GUIDE.md" ]; then
  echo "✅ backend/SOCKET_IO_BACKEND_GUIDE.md exists"
else
  echo "❌ backend/SOCKET_IO_BACKEND_GUIDE.md NOT FOUND"
fi

if [ -f "frontend/SOCKET_IO_INTEGRATION.md" ]; then
  echo "✅ frontend/SOCKET_IO_INTEGRATION.md exists"
else
  echo "❌ frontend/SOCKET_IO_INTEGRATION.md NOT FOUND"
fi

# ============================================
# 4. ENVIRONMENT VERIFICATION
# ============================================

echo ""
echo "⚙️  Checking Environment Variables..."

# Check backend .env
if [ -f "backend/.env" ]; then
  if grep -q "MONGO_URI" backend/.env; then
    echo "✅ backend/.env has MONGO_URI"
  else
    echo "⚠️  backend/.env missing MONGO_URI (needed for MongoDB Atlas)"
  fi
  
  if grep -q "FRONTEND_URL" backend/.env; then
    echo "✅ backend/.env has FRONTEND_URL"
  else
    echo "⚠️  backend/.env missing FRONTEND_URL (will use default)"
    echo "   → Add: FRONTEND_URL=http://localhost:5173"
  fi
else
  echo "⚠️  backend/.env not found"
fi

# ============================================
# 5. QUICK START TEST
# ============================================

echo ""
echo "🧪 Ready to Test!"
echo ""
echo "To test Socket.io real-time updates:"
echo ""
echo "1️⃣  Start Backend:"
echo "   cd backend"
echo "   npm start"
echo ""
echo "2️⃣  Open Browser: http://localhost:5000"
echo "   Should see: '📡 Socket.io: Connected ✅'"
echo ""
echo "3️⃣  Start Frontend (new terminal):"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "4️⃣  Open Browser: http://localhost:5173"
echo "   Open 2 tabs and test seat locking!"
echo ""

# ============================================
# 6. FINAL STATUS
# ============================================

echo ""
echo "✅ Setup Complete!"
echo ""
echo "📚 Documentation:"
echo "   • SOCKET_IO_QUICK_START.md - Start here!"
echo "   • backend/SOCKET_IO_BACKEND_GUIDE.md - Backend reference"
echo "   • frontend/SOCKET_IO_INTEGRATION.md - React examples"
echo "   • SOCKET_IO_IMPLEMENTATION_SUMMARY.md - Full overview"
echo ""
echo "🎯 Next Steps:"
echo "   1. Update frontend Seating component with socket code"
echo "   2. Test with 2 browser tabs"
echo "   3. Deploy to production"
echo ""
