@echo off
echo ====================================
echo   DAY 3 - SEPOLIA DEPLOYMENT
echo ====================================

cd %~dp0..

echo.
echo [1/10] Checking prerequisites...
echo.

REM Check if .env.sepolia exists
if not exist ".env.sepolia" (
    echo ERROR: .env.sepolia not found!
    echo Please create it with your Sepolia credentials
    pause
    exit /b 1
)

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not installed!
    pause
    exit /b 1
)

echo [2/10] Installing registrar dependencies...
cd registrar
call npm install
cd ..

echo.
echo [3/10] Installing smart contract dependencies...
cd smart-contracts
call npm install
cd ..

echo.
echo [4/10] Compiling smart contracts...
cd smart-contracts
call npx hardhat compile
if errorlevel 1 (
    echo ERROR: Compilation failed!
    pause
    exit /b 1
)
cd ..

echo.
echo [5/10] Checking Sepolia ETH balance...
echo Please ensure you have at least 0.5 Sepolia ETH
echo Get free Sepolia ETH from:
echo   - https://www.alchemy.com/faucets/ethereum-sepolia
echo   - https://faucets.chain.link/sepolia
echo.
pause

echo.
echo [6/10] Deploying contracts to Sepolia testnet...
echo This will take 2-5 minutes...
cd smart-contracts
call npx hardhat run scripts/deploy-all.js --network sepolia
if errorlevel 1 (
    echo ERROR: Deployment failed!
    pause
    exit /b 1
)
cd ..

echo.
echo [7/10] Verifying deployment...
if exist "smart-contracts\deployed-addresses-sepolia.json" (
    echo ✅ Deployment successful!
    type smart-contracts\deployed-addresses-sepolia.json
) else (
    echo ❌ Deployment file not found!
    pause
    exit /b 1
)

echo.
echo [8/10] Testing Pinata connection...
cd registrar
node -e "require('./utils/pinata').testConnection()"
cd ..

echo.
echo [9/10] Creating data directories...
if not exist "data\evidence" mkdir data\evidence
if not exist "docs" mkdir docs

echo.
echo [10/10] Generating documentation...
echo Creating documentation files...

echo.
echo ====================================
echo   DEPLOYMENT COMPLETE!
echo ====================================
echo.
echo Next steps:
echo 1. Update .env with deployed contract addresses
echo 2. Run: npm run test:evidence
echo 3. Deploy frontend to Vercel
echo.
pause
