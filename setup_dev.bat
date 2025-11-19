@echo off
chcp 65001 > nul
REM ========================================
REM Spckit AI 개발 환경 자동 설정 스크립트
REM ========================================
REM
REM 이 스크립트는 다음을 자동으로 수행합니다:
REM   1. uv 설치 확인 및 설치
REM   2. 가상 환경 생성
REM   3. 의존성 설치
REM   4. 환경 변수 파일 생성
REM   5. 벡터 DB 초기화 (선택사항)
REM

echo.
echo ========================================
echo   Spckit AI 개발 환경 자동 설정
echo ========================================
echo.
echo 이 스크립트는 개발 환경을 자동으로 설정합니다.
echo.

REM 프로젝트 루트로 이동
cd /d "%~dp0"

REM Python이 설치되어 있는지 확인
python --version >nul 2>&1
if errorlevel 1 (
    echo [오류] Python이 설치되어 있지 않습니다.
    echo Python 3.10 이상을 설치해주세요: https://www.python.org/downloads/
    pause
    exit /b 1
)

REM setup_dev.py 실행
echo [정보] Python 스크립트를 실행합니다...
echo.
python backend\scripts\setup_dev.py

if errorlevel 1 (
    echo.
    echo ========================================
    echo   설정 실패
    echo ========================================
    echo.
    echo 설정 중 오류가 발생했습니다.
    echo 위의 오류 메시지를 확인해주세요.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   설정 완료!
echo ========================================
echo.
pause

