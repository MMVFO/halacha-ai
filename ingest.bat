@echo off
echo ========================================
echo   Halacha AI - Ingest Halakhic Texts
echo ========================================
echo.

set EXPORT_PATH=./data/Sefaria-Export

if not exist "%EXPORT_PATH%" (
    echo ERROR: Sefaria-Export not found at %EXPORT_PATH%
    echo Run: git clone https://github.com/Sefaria/Sefaria-Export.git data/Sefaria-Export
    pause
    exit /b 1
)

echo [1/4] Ingesting Shulchan Arukh (all sections + Rema)...
call pnpm ingest:shulchan-arukh --path %EXPORT_PATH%
echo.

echo [2/4] Ingesting Mishnah Berurah...
call pnpm ingest:mishnah-berurah --path %EXPORT_PATH%
echo.

echo [3/4] Ingesting Responsa...
call pnpm ingest:responsa --path %EXPORT_PATH%
echo.

echo [4/4] Ingesting Apocrypha / Second Temple texts...
call pnpm ingest:apocrypha --path %EXPORT_PATH%
echo.

echo ========================================
echo   Ingestion complete!
echo ========================================
echo.
echo Next: Start the embedding worker to generate vector embeddings.
echo Run: pnpm worker
echo Or run start.bat which starts everything.
echo.
pause
