# BlockQuest Comprehensive Validation Script
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "   BLOCKQUEST VALIDATION SCRIPT" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

Write-Host "`n[1/7] Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = & node --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ FAIL: Node.js not installed" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ FAIL: Node.js not installed" -ForegroundColor Red
}

Write-Host "`n[2/7] Checking Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = & docker --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Docker: $dockerVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ FAIL: Docker not installed" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ FAIL: Docker not installed" -ForegroundColor Red
}

Write-Host "`n[3/7] Checking running containers..." -ForegroundColor Yellow
try {
    $containers = & docker ps --filter "name=registrar" --format "table {{.Names}}\t{{.Status}}" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Containers running:" -ForegroundColor Green
        Write-Host $containers -ForegroundColor Gray
    } else {
        Write-Host "❌ FAIL: Containers not running" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ FAIL: Containers not running" -ForegroundColor Red
}

Write-Host "`n[4/7] Checking Hardhat blockchain..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri http://localhost:8545 -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Hardhat responding (Chain ID: $(($response.Content | ConvertFrom-Json).result))" -ForegroundColor Green
    } else {
        Write-Host "❌ FAIL: Hardhat not responding" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ FAIL: Hardhat not responding" -ForegroundColor Red
}

Write-Host "`n[5/7] Checking PostgreSQL..." -ForegroundColor Yellow
try {
    $result = & docker exec postgres-registrar-1 psql -U registrar -d registrar -c "SELECT 1;" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ PostgreSQL responding" -ForegroundColor Green
    } else {
        Write-Host "❌ FAIL: PostgreSQL issue" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ FAIL: PostgreSQL issue" -ForegroundColor Red
}

Write-Host "`n[6/7] Checking deployed contracts..." -ForegroundColor Yellow
if (Test-Path "..\smart-contracts\deployed-addresses.json") {
    Write-Host "✅ Contracts deployed" -ForegroundColor Green
    Write-Host "    Deployment addresses:" -ForegroundColor Gray
    $deployment = Get-Content "..\smart-contracts\deployed-addresses.json" | ConvertFrom-Json
    $deployment.contracts | Format-Table -AutoSize
} else {
    Write-Host "❌ FAIL: Contracts not deployed" -ForegroundColor Red
    Write-Host "    Run: cd ../smart-contracts && npm run deploy" -ForegroundColor Gray
}

Write-Host "`n[7/7] Checking registrar services..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri http://localhost:7001/health -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Registrar API responding" -ForegroundColor Green
        $health = $response.Content | ConvertFrom-Json
        Write-Host "    Status: $($health.status)" -ForegroundColor Gray
        Write-Host "    Service: $($health.service)" -ForegroundColor Gray
    } else {
        Write-Host "❌ FAIL: Registrar not responding" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ FAIL: Registrar not responding" -ForegroundColor Red
}

Write-Host "`n====================================" -ForegroundColor Cyan
Write-Host "   VALIDATION COMPLETE" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

Write-Host "`nQuick Commands:" -ForegroundColor Yellow
Write-Host "  Start services: cd ../infra && docker-compose up -d" -ForegroundColor Gray
Write-Host "  Deploy contracts: cd ../smart-contracts && npm run deploy" -ForegroundColor Gray
Write-Host "  Check logs: docker-compose logs [service-name]" -ForegroundColor Gray

Write-Host "`nPress any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
