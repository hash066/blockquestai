@echo off
echo ====================================
echo   BLOCKQUEST VALIDATION SCRIPT
echo ====================================

echo.
echo [1/7] Checking Node.js...
node --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('node --version') do echo ✅ Node.js: %%i
) else (
    echo ❌ FAIL: Node.js not installed
)

echo.
echo [2/7] Checking Docker...
docker --version >nul 2>&1
if %errorlevel% equ 0 (
    for /f "tokens=*" %%i in ('docker --version') do echo ✅ Docker: %%i
) else (
    echo ❌ FAIL: Docker not installed
)

echo.
echo [3/7] Checking running containers...
docker ps --filter "name=registrar-1" --format "table {{.Names}}\t{{.Status}}" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Containers running
    docker ps --filter "name=registrar" --format "table {{.Names}}\t{{.Status}}" | findstr "registrar"
) else (
    echo ❌ FAIL: Containers not running
)

echo.
echo [4/7] Checking Hardhat blockchain...
powershell -Command "try { $response = Invoke-WebRequest -Uri http://localhost:8545 -Method POST -Headers @{'Content-Type'='application/json'} -Body '{\"jsonrpc\":\"2.0\",\"method\":\"eth_chainId\",\"params\":[],\"id\":1}' -UseBasicParsing; if ($response.StatusCode -eq 200) { Write-Host '✅ Hardhat responding' } else { Write-Host '❌ FAIL: Hardhat not responding' } } catch { Write-Host '❌ FAIL: Hardhat not responding' }"

echo.
echo [5/7] Checking PostgreSQL...
docker exec postgres-registrar-1 psql -U registrar -d registrar -c "SELECT 1;" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ PostgreSQL responding
) else (
    echo ❌ FAIL: PostgreSQL issue
)

echo.
echo [6/7] Checking deployed contracts...
if exist "..\smart-contracts\deployed-addresses.json" (
    echo ✅ Contracts deployed
    echo    Checking deployment file...
    powershell -Command "Get-Content '..\smart-contracts\deployed-addresses.json' | ConvertFrom-Json | Select-Object -ExpandProperty contracts | Format-Table"
) else (
    echo ❌ FAIL: Contracts not deployed
)

echo.
echo [7/7] Checking registrar services...
powershell -Command "try { $response = Invoke-WebRequest -Uri http://localhost:7001/health -UseBasicParsing; if ($response.StatusCode -eq 200) { Write-Host '✅ Registrar API responding' } else { Write-Host '❌ FAIL: Registrar not responding' } } catch { Write-Host '❌ FAIL: Registrar not responding' }"

echo.
echo ====================================
echo   VALIDATION COMPLETE
echo ====================================
echo.
echo Press any key to exit...
pause >nul
