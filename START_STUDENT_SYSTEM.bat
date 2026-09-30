@echo off
title Student Management System Launcher

echo.
echo ==========================================
echo   STUDENT MANAGEMENT SYSTEM
echo ==========================================
echo.

echo [1/4] Starting backend...
start "Student Backend" cmd /k "cd /d C:\Users\LENOVO\student-management-api && node server.js"

echo Waiting for backend...

:BACKEND_WAIT
powershell -NoProfile -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:3000/' -UseBasicParsing -TimeoutSec 2; if ($r.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }"

if errorlevel 1 (
    timeout /t 2 /nobreak >nul
    goto BACKEND_WAIT
)

echo Backend is ready!
echo.

echo [2/4] Starting frontend...
start "Student Frontend" cmd /k "cd /d C:\Users\LENOVO\student-management-api\frontend && npm run dev"

echo Waiting for frontend...

:FRONTEND_WAIT
powershell -NoProfile -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:5173/' -UseBasicParsing -TimeoutSec 2; if ($r.StatusCode -eq 200) { exit 0 } else { exit 1 } } catch { exit 1 }"

if errorlevel 1 (
    timeout /t 2 /nobreak >nul
    goto FRONTEND_WAIT
)

echo Frontend is ready!
echo.

echo [3/4] Opening website...
start "" "http://localhost:5173"

echo.
echo [4/4] Student Management System is ready!
echo.
echo You can close this launcher window.
echo Keep the Backend and Frontend windows running.
echo.

exit