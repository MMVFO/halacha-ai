@echo off
echo ========================================
echo   Halacha AI - Start All Services
echo ========================================
echo.

echo [1/4] Starting Docker containers (Postgres + Redis)...
docker compose up -d
if errorlevel 1 (
    echo ERROR: Docker failed. Is Docker Desktop running?
    echo Start Docker Desktop and try again.
    pause
    exit /b 1
)
echo OK.
echo.

echo [2/4] Running database migrations...
call pnpm db:migrate
if errorlevel 1 (
    echo WARNING: Migrations may have failed. Check output above.
)
echo.

echo [3/4] Starting embedding worker (background)...
start "Halacha AI Worker" cmd /c "cd /d %~dp0 && pnpm worker"
echo OK - Worker running in separate window.
echo.

echo [4/4] Starting Next.js dev server...
echo App will be available at: http://localhost:3000/halacha
echo.
call pnpm dev
