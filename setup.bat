@echo off
echo ========================================
echo   Halacha AI - First-Time Setup
echo ========================================
echo.

echo [1/5] Installing dependencies...
call pnpm install
echo.

echo [2/5] Copying environment file...
if not exist .env (
    copy .env.example .env
    echo Created .env from .env.example
    echo IMPORTANT: Edit .env and fill in your API keys before running!
) else (
    echo .env already exists - skipping.
)
echo.

echo [3/5] Starting Docker containers...
docker compose up -d
if errorlevel 1 (
    echo WARNING: Docker failed. Make sure Docker Desktop is running.
    echo You can retry this step with: docker compose up -d
)
echo.

echo [4/5] Running database migrations...
call pnpm db:migrate
echo.

echo [5/5] Downloading Sefaria-Export (this may take a while)...
if not exist data\Sefaria-Export (
    git clone https://github.com/Sefaria/Sefaria-Export.git data/Sefaria-Export
) else (
    echo Sefaria-Export already exists - skipping.
)
echo.

echo ========================================
echo   Setup complete!
echo ========================================
echo.
echo Next steps:
echo   1. Edit .env with your API keys (ANTHROPIC_API_KEY, EMBEDDING_API_KEY)
echo   2. Run ingest.bat to load halakhic texts
echo   3. Run start.bat to launch the app
echo.
pause
