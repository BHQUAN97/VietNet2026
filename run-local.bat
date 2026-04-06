@echo off
title VietNet Interior - Local Development
color 0A
setlocal enabledelayedexpansion

echo ============================================
echo   VietNet Interior - Local Development.
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

:: ── Check if infra (MySQL, Redis) is already running ──
set INFRA_RUNNING=0
docker-compose ps mysql 2>nul | findstr /i "running healthy" >nul 2>&1
if not errorlevel 1 (
    docker-compose ps redis 2>nul | findstr /i "running healthy" >nul 2>&1
    if not errorlevel 1 set INFRA_RUNNING=1
)

:: ── Menu ──
echo.
if !INFRA_RUNNING!==1 (
    echo   [MySQL + Redis dang chay]
    echo.
    echo   1. Rebuild FE+BE only    ^(nhanh, ~30s^)
    echo   2. Rebuild FE only
    echo   3. Rebuild BE only
    echo   4. Full restart           ^(down tat ca, build lai tu dau^)
    echo   5. Chi restart FE+BE     ^(khong rebuild, dung image cu^)
    echo.
    set /p CHOICE="Chon [1-5, default=1]: "
    if "!CHOICE!"=="" set CHOICE=1
) else (
    echo   [Infra chua chay - can khoi dong day du]
    echo.
    echo   1. Khoi dong tat ca
    echo   2. Khoi dong infra only   ^(MySQL + Redis^)
    echo.
    set /p CHOICE="Chon [1-2, default=1]: "
    if "!CHOICE!"=="" set CHOICE=1
    if "!CHOICE!"=="2" goto start_infra_only
    set CHOICE=4
)

:: ── Execute based on choice ──

if "!CHOICE!"=="1" goto rebuild_fe_be
if "!CHOICE!"=="2" goto rebuild_fe
if "!CHOICE!"=="3" goto rebuild_be
if "!CHOICE!"=="4" goto full_restart
if "!CHOICE!"=="5" goto restart_fe_be
goto rebuild_fe_be

:: ────────────────────────────────────────────
:rebuild_fe_be
echo.
echo [1/2] Build Frontend + Backend...
docker-compose build --parallel frontend backend 2>&1
if errorlevel 1 goto build_error
echo.
echo [2/2] Restart Frontend + Backend + Nginx...
docker-compose up -d --no-deps backend
docker-compose up -d --no-deps frontend
:: Cho frontend healthy roi restart nginx (nginx depends on FE+BE)
echo   Cho backend + frontend san sang...
call :wait_for_backend
call :wait_for_frontend
docker-compose up -d --no-deps nginx
goto done

:: ────────────────────────────────────────────
:rebuild_fe
echo.
echo [1/2] Build Frontend...
docker-compose build frontend 2>&1
if errorlevel 1 goto build_error
echo.
echo [2/2] Restart Frontend + Nginx...
docker-compose up -d --no-deps frontend
call :wait_for_frontend
docker-compose up -d --no-deps nginx
goto done

:: ────────────────────────────────────────────
:rebuild_be
echo.
echo [1/2] Build Backend...
docker-compose build backend 2>&1
if errorlevel 1 goto build_error
echo.
echo [2/2] Restart Backend + Nginx...
docker-compose up -d --no-deps backend
call :wait_for_backend
docker-compose up -d --no-deps nginx
goto done

:: ────────────────────────────────────────────
:restart_fe_be
echo.
echo Restart Frontend + Backend (khong rebuild)...
docker-compose restart backend frontend
call :wait_for_backend
call :wait_for_frontend
docker-compose restart nginx
goto done

:: ────────────────────────────────────────────
:start_infra_only
echo.
echo Khoi dong MySQL + Redis...
docker-compose up -d mysql redis
call :wait_for_mysql
call :wait_for_redis
echo.
echo   MySQL:  OK (port 3306)
echo   Redis:  OK (port 6379)
echo.
echo Infra san sang. Chay lai script de build FE/BE.
pause
exit /b 0

:: ────────────────────────────────────────────
:full_restart
echo.
echo [1/4] Dung tat ca containers...
docker-compose down --remove-orphans 2>nul
echo.
echo [2/4] Build Frontend + Backend...
docker-compose build --parallel frontend backend 2>&1
if errorlevel 1 goto build_error
echo.
echo [3/4] Khoi dong tat ca services...
docker-compose up -d
echo.
echo [4/4] Cho services san sang...
call :wait_for_mysql
call :wait_for_redis
call :wait_for_backend
call :wait_for_frontend
goto done

:: ────────────────────────────────────────────
:build_error
echo.
echo [ERROR] Build that bai!
echo   Thu chay: docker-compose build 2>&1
pause
exit /b 1

:: ── Health check subroutines ──

:wait_for_mysql
set /a _r=0
:_wm
set /a _r+=1
if !_r! gtr 30 (
    echo   [WARN] MySQL chua san sang sau 60s
    goto :eof
)
docker-compose exec -T mysql mysqladmin ping -h localhost >nul 2>&1
if errorlevel 1 (
    timeout /t 2 /nobreak >nul
    goto _wm
)
echo   MySQL:    OK
goto :eof

:wait_for_redis
set /a _r=0
:_wr
set /a _r+=1
if !_r! gtr 15 (
    echo   [WARN] Redis chua san sang sau 30s
    goto :eof
)
docker-compose exec -T redis redis-cli ping >nul 2>&1
if errorlevel 1 (
    timeout /t 2 /nobreak >nul
    goto _wr
)
echo   Redis:    OK
goto :eof

:wait_for_backend
set /a _r=0
:_wb
set /a _r+=1
if !_r! gtr 20 (
    echo   [WARN] Backend chua san sang sau 60s
    echo   Kiem tra: docker-compose logs backend
    goto :eof
)
curl -sf http://localhost:4000/api/health >nul 2>&1
if errorlevel 1 (
    timeout /t 3 /nobreak >nul
    goto _wb
)
echo   Backend:  OK
goto :eof

:wait_for_frontend
set /a _r=0
:_wf
set /a _r+=1
if !_r! gtr 20 (
    echo   [WARN] Frontend chua san sang sau 60s
    echo   Kiem tra: docker-compose logs frontend
    goto :eof
)
curl -sf http://localhost:3000 >nul 2>&1
if errorlevel 1 (
    timeout /t 3 /nobreak >nul
    goto _wf
)
echo   Frontend: OK
goto :eof

:: ── Done ──
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
