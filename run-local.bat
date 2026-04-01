@echo off
title VietNet Interior - Local Development
color 0A
setlocal enabledelayedexpansion

echo ============================================
echo   VietNet Interior - Local Development
echo ============================================
echo.

:: ── Check Docker installed ──
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker chua duoc cai dat!
    echo Vui long cai Docker Desktop: https://docker.com/products/docker-desktop
    pause
    exit /b 1
)

:: ── Check Docker running, auto-start if not ──
docker info >nul 2>&1
if errorlevel 1 (
    echo [INFO] Docker Desktop chua khoi dong. Dang mo...
    start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    echo Cho Docker khoi dong...
    set /a _retries=0
    :wait_docker
    set /a _retries+=1
    if !_retries! gtr 30 (
        echo [ERROR] Docker khong khoi dong duoc sau 60 giay.
        pause
        exit /b 1
    )
    timeout /t 2 /nobreak >nul
    docker info >nul 2>&1
    if errorlevel 1 goto wait_docker
    echo   Docker: OK
)

:: ── Check .env files exist ──
if not exist "backend\.env" (
    echo [WARN] backend\.env khong ton tai! Tao tu .env.example...
    if exist "backend\.env.example" (
        copy "backend\.env.example" "backend\.env" >nul
        echo   Da tao backend\.env - HAY CAP NHAT TRUOC KHI CHAY PRODUCTION
    ) else (
        echo [ERROR] Khong tim thay backend\.env va .env.example
        pause
        exit /b 1
    )
)
if not exist "frontend\.env" (
    echo [WARN] frontend\.env khong ton tai!
    echo   Tao file mac dinh...
    (
        echo NEXT_PUBLIC_API_URL=http://localhost:4000/api
        echo NEXT_PUBLIC_SITE_URL=http://localhost:3000
    ) > "frontend\.env"
    echo   Da tao frontend\.env
)

:: ── Stop old containers ──
echo.
echo [1/4] Dung containers cu...
docker-compose down --remove-orphans 2>nul

:: ── Build with latest code (always rebuild) ──
echo.
echo [2/4] Build voi code moi nhat...
echo   - Backend NestJS
echo   - Frontend Next.js
echo.
docker-compose build --parallel 2>&1
if errorlevel 1 (
    echo.
    echo [ERROR] Build that bai! Chi tiet:
    echo.
    docker-compose build 2>&1 | findstr /i "error"
    echo.
    echo Thu chay: docker-compose build 2>&1
    pause
    exit /b 1
)

:: ── Start services ──
echo.
echo [3/4] Khoi dong services...
echo   - MySQL 8      (port 3306)
echo   - Redis 7      (port 6379)
echo   - Backend      (port 4000)
echo   - Frontend     (port 3000)
echo   - Nginx proxy  (port 8080)
echo.

docker-compose up -d
if errorlevel 1 (
    echo.
    echo [ERROR] Khoi dong that bai!
    echo.
    echo Kiem tra logs:
    docker-compose logs --tail=20 2>&1
    echo.
    pause
    exit /b 1
)

:: ── Wait for health checks with timeout ──
echo.
echo [4/4] Cho services san sang...

:: MySQL
set /a _retries=0
:wait_mysql
set /a _retries+=1
if !_retries! gtr 30 (
    echo   [WARN] MySQL chua san sang sau 60s - kiem tra logs
    goto check_redis
)
docker-compose exec -T mysql mysqladmin ping -h localhost >nul 2>&1
if errorlevel 1 (
    timeout /t 2 /nobreak >nul
    goto wait_mysql
)
echo   MySQL:    OK

:: Redis
:check_redis
set /a _retries=0
:wait_redis
set /a _retries+=1
if !_retries! gtr 15 (
    echo   [WARN] Redis chua san sang sau 30s
    goto check_backend
)
docker-compose exec -T redis redis-cli ping >nul 2>&1
if errorlevel 1 (
    timeout /t 2 /nobreak >nul
    goto wait_redis
)
echo   Redis:    OK

:: Backend
:check_backend
set /a _retries=0
:wait_backend
set /a _retries+=1
if !_retries! gtr 20 (
    echo   [WARN] Backend chua san sang sau 60s
    echo   Kiem tra: docker-compose logs backend
    goto check_frontend
)
curl -sf http://localhost:4000/api/health >nul 2>&1
if errorlevel 1 (
    timeout /t 3 /nobreak >nul
    goto wait_backend
)
echo   Backend:  OK

:: Frontend
:check_frontend
set /a _retries=0
:wait_frontend
set /a _retries+=1
if !_retries! gtr 20 (
    echo   [WARN] Frontend chua san sang sau 60s
    echo   Kiem tra: docker-compose logs frontend
    goto done
)
curl -sf http://localhost:3000 >nul 2>&1
if errorlevel 1 (
    timeout /t 3 /nobreak >nul
    goto wait_frontend
)
echo   Frontend: OK

:done
echo.
echo ============================================
echo   KHOI DONG HOAN TAT!
echo ============================================
echo.
echo   Frontend:  http://localhost:8080
echo   Backend:   http://localhost:4000/api
echo   Health:    http://localhost:4000/api/health
echo.
echo   Xem logs:  docker-compose logs -f
echo   Dung:      docker-compose down
echo ============================================
echo.

:: Open browser
start http://localhost:8080

echo Nhan phim bat ky de xem logs (Ctrl+C de thoat)...
pause >nul
docker-compose logs -f
