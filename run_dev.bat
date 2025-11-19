@echo off
chcp 65001 > nul
REM ========================================
REM Spckit AI 통합 개발 서버 실행 스크립트
REM ========================================
REM
REM 이 스크립트는 백엔드 API 서버와 프론트엔드 개발 서버를 모두 실행합니다.
REM 벡터 DB가 없으면 자동으로 초기화됩니다.
REM

echo.
echo ========================================
echo   Spckit AI 개발 서버 시작
echo ========================================
echo.

REM 프로젝트 루트로 이동 (이미 루트에 있음)
cd /d "%~dp0"

REM 가상 환경 확인
if not exist "backend\.venv\Scripts\activate.bat" (
    echo.
    echo [오류] 가상 환경이 없습니다.
    echo.
    echo 먼저 setup_dev.bat을 실행해주세요.
    echo.
    pause
    exit /b 1
)

REM .env 파일 확인
if not exist "backend\.env" (
    echo.
    echo [경고] .env 파일이 없습니다.
    echo.
    echo setup_dev.bat을 실행하여 환경 변수를 설정해주세요.
    echo.
    pause
    exit /b 1
)

REM Node.js 확인
node --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo [경고] Node.js가 설치되어 있지 않습니다.
    echo.
    echo 프론트엔드 서버를 실행하려면 Node.js가 필요합니다.
    echo 설치: https://nodejs.org/
    echo.
    echo 백엔드만 실행하시겠습니까? (y/n)
    set /p backend_only="> "
    if /i not "%backend_only%"=="y" (
        pause
        exit /b 1
    )
    set FRONTEND_SKIP=1
)

REM 프론트엔드 의존성 확인
if not defined FRONTEND_SKIP (
    if not exist "node_modules" (
        echo.
        echo [정보] 프론트엔드 의존성이 설치되지 않았습니다.
        echo [정보] npm install을 실행합니다...
        echo.
        call npm install
        if errorlevel 1 (
            echo.
            echo [경고] npm install 실패. 프론트엔드 없이 진행합니다.
            set FRONTEND_SKIP=1
        )
    )
)

echo.
echo ========================================
echo   서버 시작 중...
echo ========================================
echo.

REM 가상 환경 활성화
echo [1/3] 백엔드 가상 환경 활성화 중...
call backend\.venv\Scripts\activate.bat

if errorlevel 1 (
    echo.
    echo [오류] 가상 환경 활성화 실패
    pause
    exit /b 1
)

REM 프론트엔드 서버 시작 (새 창에서)
if not defined FRONTEND_SKIP (
    echo [2/3] 프론트엔드 개발 서버 시작 중...
    echo.
    echo [정보] 프론트엔드 서버를 새 창에서 시작합니다...
    REM 프로젝트 루트 경로 저장 (이미 루트로 이동했으므로 %CD% 사용)
    set "PROJECT_ROOT=%CD%"
    start "Spckit AI - Frontend Server" cmd /k "chcp 65001 >nul && cd /d "%PROJECT_ROOT%" && echo. && echo ======================================== && echo   프론트엔드 개발 서버 && echo ======================================== && echo. && echo [정보] 프론트엔드 서버가 시작되었습니다. && echo [정보] 웹 페이지: http://localhost:3000 && echo. && echo 서버를 중지하려면 이 창을 닫거나 Ctrl+C를 누르세요. && echo. && npm run dev"
    timeout /t 3 /nobreak >nul
    echo [완료] 프론트엔드 서버가 새 창에서 시작되었습니다.
    echo.
)

REM 백엔드 API 서버 실행
echo [3/3] 백엔드 API 서버 시작 중...
echo.
echo ========================================
echo   서버 정보
echo ========================================
if not defined FRONTEND_SKIP (
    echo   🌐 웹 페이지: http://localhost:3000
    echo.
)
echo   🔧 백엔드 API: http://localhost:8000
echo   📚 API 문서: http://localhost:8000/docs
echo   💚 헬스 체크: http://localhost:8000/health
echo   📊 통계: http://localhost:8000/stats
echo ========================================
echo.
if not defined FRONTEND_SKIP (
    echo 💡 프론트엔드 서버는 별도 창에서 실행 중입니다.
    echo.
)
echo ⚠️  벡터 DB가 없으면 자동으로 초기화됩니다.
echo    초기화에는 약 10-15분이 소요될 수 있습니다.
echo.
echo 서버를 중지하려면 Ctrl+C를 누르세요.
echo.
echo ========================================
echo.

REM 백엔드 API 서버 실행
python -m uvicorn backend.api.main:app --host 0.0.0.0 --port 8000 --reload

REM 서버 종료 시 프론트엔드도 종료 안내
if not defined FRONTEND_SKIP (
    echo.
    echo [정보] 프론트엔드 서버 창도 닫아주세요.
)

pause

