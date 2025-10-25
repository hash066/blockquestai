Write-Host "=== DAY 2 SERVICES STATUS ===" -ForegroundColor Cyan
Write-Host ""

# Sequencer 1
Write-Host "1. Checking Sequencer 1..." -ForegroundColor Yellow
try {
    $seq1 = Invoke-RestMethod http://localhost:8001/health
    Write-Host "   ✅ Sequencer 1: OK (Queue: $($seq1.queue_length))" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Sequencer 1: FAILED" -ForegroundColor Red
}

# Sequencer 2
Write-Host "2. Checking Sequencer 2..." -ForegroundColor Yellow
try {
    $seq2 = Invoke-RestMethod http://localhost:8002/health
    Write-Host "   ✅ Sequencer 2: OK (Queue: $($seq2.queue_length))" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Sequencer 2: NOT RUNNING" -ForegroundColor Red
}

# Sequencer 3
Write-Host "3. Checking Sequencer 3..." -ForegroundColor Yellow
try {
    $seq3 = Invoke-RestMethod http://localhost:8003/health
    Write-Host "   ✅ Sequencer 3: OK (Queue: $($seq3.queue_length))" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Sequencer 3: NOT RUNNING" -ForegroundColor Red
}

# Merkle Batcher
Write-Host "4. Checking Merkle Batcher..." -ForegroundColor Yellow
$batcherStatus = docker inspect merkle-batcher-1 --format='{{.State.Status}}'
if ($batcherStatus -eq "running") {
    Write-Host "   ✅ Merkle Batcher: Running" -ForegroundColor Green
} else {
    Write-Host "   ❌ Merkle Batcher: $batcherStatus" -ForegroundColor Red
}

# Hardhat Chain
Write-Host "5. Checking Hardhat..." -ForegroundColor Yellow
try {
    $hardhat = Invoke-RestMethod -Uri http://localhost:8545 -Method POST -Body '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' -ContentType "application/json"
    Write-Host "   ✅ Hardhat: Responding (ChainId: $($hardhat.result))" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Hardhat: NOT RESPONDING" -ForegroundColor Red
}

# Registrar APIs
Write-Host "6. Checking Registrar APIs..." -ForegroundColor Yellow
try {
    $reg = Invoke-RestMethod http://localhost:7001/health
    Write-Host "   ✅ Registrar-1: OK" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Registrar-1: FAILED" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== END STATUS CHECK ===" -ForegroundColor Cyan
