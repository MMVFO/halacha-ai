@echo off
echo ========================================
echo   Halacha AI - Enqueue Embedding Jobs
echo ========================================
echo.
echo This will queue all chunks with NULL embeddings for processing.
echo Make sure the worker is running (start.bat or pnpm worker).
echo.

cd /d %~dp0
call pnpm --filter @halacha-ai/worker enqueue
echo.
pause
