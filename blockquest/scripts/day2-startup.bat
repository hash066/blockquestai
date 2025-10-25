@echo off
echo ====================================
echo   DAY 2 DOCKER STARTUP
echo ====================================

cd %~dp0..\infra

echo [1/3] Building Docker images...
docker compose build merkle-batcher-1 sequencer-1 sequencer-2 sequencer-3

echo.
echo [2/3] Starting services...
docker compose up -d merkle-batcher-1 sequencer-1 sequencer-2 sequencer-3

echo.
echo [3/3] Waiting for health checks...
timeout /t 45 /nobreak

echo.
echo ====================================
echo   DAY 2 SERVICES READY!
echo ====================================
echo.
echo Check status:
echo   docker ps ^| findstr "merkle\|sequencer"
echo.
echo Test APIs:
echo   curl http://localhost:8001/api/health
echo   curl http://localhost:8002/api/health
echo   curl http://localhost:8003/api/health
echo.
pause
