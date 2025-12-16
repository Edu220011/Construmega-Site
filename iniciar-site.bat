@echo off
cd /d "%~dp0backend"
start cmd /k "npm install && npm start"
cd /d "%~dp0frontend"
start cmd /k "npm install && npm start"
cd /d "%~dp0"
echo Backend e frontend iniciados em terminais separados.
pause
