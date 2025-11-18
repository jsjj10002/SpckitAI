@echo off
chcp 65001 > nul
REM Windows용 테스트 스크립트

cd /d "%~dp0"
cd ..

echo ========================================
echo RAG 시스템 테스트
echo ========================================
echo.

call backend\.venv\Scripts\activate.bat
python backend\scripts\test_rag.py

pause

