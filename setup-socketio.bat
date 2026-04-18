@echo off
REM Socket.io Installation & Setup for Windows
REM Run this command prompt script to set up Socket.io

echo.
echo 🚀 Socket.io Real-Time Seat Booking Setup (Windows)
echo ==================================================
echo.

REM ============================================
REM 1. BACKEND SETUP
REM ============================================

echo 📦 Installing Backend Dependencies...
cd backend

REM Check if package.json exists
if not exist "package.json" (
  echo ❌ package.json not found in backend/
  pause
  exit /b 1
)

REM Install Socket.io
echo Installing socket.io...
call npm install socket.io

if %errorlevel% neq 0 (
  echo ❌ Socket.io installation failed
  pause
  exit /b 1
)
echo ✅ Socket.io installed successfully

REM ============================================
REM 2. FRONTEND SETUP
REM ============================================

echo.
echo 📦 Installing Frontend Dependencies...
cd ..\frontend

REM Check if package.json exists
if not exist "package.json" (
  echo ❌ package.json not found in frontend/
  pause
  exit /b 1
)

REM Install Socket.io Client
echo Installing socket.io-client...
call npm install socket.io-client

if %errorlevel% neq 0 (
  echo ❌ Socket.io-client installation failed
  pause
  exit /b 1
)
echo ✅ Socket.io-client installed successfully

REM ============================================
REM 3. VERIFY FILES EXIST
REM ============================================

echo.
echo 📁 Verifying Socket.io Files...

cd ..

REM Backend socket handler
if exist "backend\socket\socketHandlers.js" (
  echo ✅ backend\socket\socketHandlers.js exists
) else (
  echo ❌ backend\socket\socketHandlers.js NOT FOUND
  pause
  exit /b 1
)

REM Backend updated server.js
findstr /c:"socket.io" backend\server.js >nul
if %errorlevel% equ 0 (
  echo ✅ server.js has Socket.io integration
) else (
  echo ❌ server.js missing Socket.io integration
  pause
  exit /b 1
)

REM Documentation files
if exist "SOCKET_IO_QUICK_START.md" (
  echo ✅ SOCKET_IO_QUICK_START.md exists
) else (
  echo ❌ SOCKET_IO_QUICK_START.md NOT FOUND
)

if exist "backend\SOCKET_IO_BACKEND_GUIDE.md" (
  echo ✅ backend\SOCKET_IO_BACKEND_GUIDE.md exists
) else (
  echo ❌ backend\SOCKET_IO_BACKEND_GUIDE.md NOT FOUND
)

if exist "frontend\SOCKET_IO_INTEGRATION.md" (
  echo ✅ frontend\SOCKET_IO_INTEGRATION.md exists
) else (
  echo ❌ frontend\SOCKET_IO_INTEGRATION.md NOT FOUND
)

REM ============================================
REM 4. ENVIRONMENT VERIFICATION
REM ============================================

echo.
echo ⚙️  Checking Environment Variables...

if exist "backend\.env" (
  findstr /c:"MONGO_URI" backend\.env >nul
  if %errorlevel% equ 0 (
    echo ✅ backend\.env has MONGO_URI
  ) else (
    echo ⚠️  backend\.env missing MONGO_URI
  )
) else (
  echo ⚠️  backend\.env not found
)

REM ============================================
REM 5. QUICK START TEST
REM ============================================

echo.
echo 🧪 Ready to Test!
echo.
echo To test Socket.io real-time updates:
echo.
echo 1️⃣  Start Backend (open new Command Prompt):
echo    cd backend
echo    npm start
echo.
echo 2️⃣  Browser: http://localhost:5000
echo    Should show: '📡 Socket.io: Connected ✅'
echo.
echo 3️⃣  Start Frontend (open new Command Prompt):
echo    cd frontend
echo    npm run dev
echo.
echo 4️⃣  Browser: http://localhost:5173
echo    Open 2 tabs - test seat locking!
echo.

REM ============================================
REM 6. FINAL STATUS
REM ============================================

echo.
echo ✅ Setup Complete!
echo.
echo 📚 Documentation:
echo    - SOCKET_IO_QUICK_START.md
echo    - backend\SOCKET_IO_BACKEND_GUIDE.md
echo    - frontend\SOCKET_IO_INTEGRATION.md
echo.
echo 🎯 Next: Update Seating component with socket code
echo.
pause
