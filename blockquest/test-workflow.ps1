Write-Host "=== TESTING DAY 2 COMPLETE WORKFLOW ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Submit test commits
Write-Host "Step 1: Submitting 5 test commits..." -ForegroundColor Yellow
$commits = @()

for ($i = 1; $i -le 5; $i++) {
    try {
        $response = Invoke-RestMethod -Uri http://localhost:7001/commit -Method POST -Body '{"did":"did:test:' + $i + '","signature":"0xsig' + $i + '","content":"Day 2 test commit ' + $i + '"}' -ContentType "application/json"
        $commits += $response.commit_id
        Write-Host "   ✅ Commit $i`: $($response.commit_id)" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ Commit $i failed" -ForegroundColor Red
    }
}

# Step 2: Wait for merkle batcher
Write-Host ""
Write-Host "Step 2: Waiting 30 seconds for merkle batcher..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Step 3: Check if bundle was created
Write-Host ""
Write-Host "Step 3: Checking for bundle creation..." -ForegroundColor Yellow
$bundleFiles = Get-ChildItem -Path "D:\blockquest\data\bundles" -ErrorAction SilentlyContinue
if ($bundleFiles) {
    Write-Host "   ✅ Found $($bundleFiles.Count) bundle file(s)" -ForegroundColor Green
    $bundleFiles | ForEach-Object { Write-Host "      - $($_.Name)" -ForegroundColor Cyan }
} else {
    Write-Host "   ⚠️  No bundles created yet" -ForegroundColor Yellow
}

# Step 4: Wait for sequencer
Write-Host ""
Write-Host "Step 4: Waiting 15 seconds for sequencer to anchor..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Step 5: Check if anchor was posted
Write-Host ""
Write-Host "Step 5: Checking for anchor records..." -ForegroundColor Yellow
$anchorFiles = Get-ChildItem -Path "D:\blockquest\data\anchors" -ErrorAction SilentlyContinue
if ($anchorFiles) {
    Write-Host "   ✅ Found $($anchorFiles.Count) anchor record(s)" -ForegroundColor Green
    $anchorFiles | ForEach-Object { Write-Host "      - $($_.Name)" -ForegroundColor Cyan }
} else {
    Write-Host "   ⚠️  No anchors posted yet" -ForegroundColor Yellow
}

# Step 6: Verify commit status
Write-Host ""
Write-Host "Step 6: Checking commit status..." -ForegroundColor Yellow
if ($commits.Count -gt 0) {
    try {
        $status = Invoke-RestMethod "http://localhost:7001/commit/$($commits[0])"
        Write-Host "   Status: $($status.status)" -ForegroundColor Cyan
        if ($status.status -eq "anchored") {
            Write-Host "   ✅ FULLY ANCHORED!" -ForegroundColor Green
        }
    } catch {
        Write-Host "   ⚠️  Could not check status" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=== WORKFLOW TEST COMPLETE ===" -ForegroundColor Cyan
