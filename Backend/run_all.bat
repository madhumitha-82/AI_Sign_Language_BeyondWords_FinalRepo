@echo off
echo ===================================================
echo Starting BeyondWords Consolidated Microservices...
echo ===================================================

echo Starting User Service (Port 8081)...
start "User Service" cmd /k "cd user-service && mvn spring-boot:run"
timeout /t 10

echo Starting Learning Service (Port 8082)...
start "Learning Service" cmd /k "cd learning-service && mvn spring-boot:run"
timeout /t 10

echo Starting Analytics Service (Port 8083)...
start "Analytics Service" cmd /k "cd analytics-service && mvn spring-boot:run"
timeout /t 10

echo All services launched!
echo ===================================================
