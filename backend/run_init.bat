@echo off
chcp 65001 > nul
REM Windows용 초기화 스크립트
REM 가상 환경을 활성화하고 데이터베이스를 초기화합니다

echo ========================================
echo RAG 시스템 초기화 스크립트
echo ========================================
echo.

cd /d "%~dp0"
cd ..

echo [1/2] 가상 환경 활성화 중...
call backend\.venv\Scripts\activate.bat

if errorlevel 1 (
    echo 오류: 가상 환경을 찾을 수 없습니다.
    echo 먼저 'cd backend' 후 'uv venv' 실행 필요
    pause
    exit /b 1
)

echo [2/2] 데이터베이스 초기화 중...
python backend\scripts\init_database.py %*

if errorlevel 1 (
    echo.
    echo 오류: 데이터베이스 초기화 실패
    pause
    exit /b 1
)

echo.
echo ========================================
echo 초기화 완료!
echo ========================================
pause

