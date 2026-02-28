@echo off
echo ========================================
echo   Halacha AI - Stop All Services
echo ========================================
echo.

echo Stopping Docker containers...
docker compose down
echo.

echo Killing any running Node processes for this project...
taskkill /FI "WINDOWTITLE eq Halacha AI Worker" >nul 2>&1
echo.

echo All services stopped.
pause
