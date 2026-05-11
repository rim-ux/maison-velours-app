@echo off
chcp 65001 >nul
echo.
echo =====================================================
echo    MAISON VELOURS — Demarrage
echo =====================================================
echo.
echo Demarrage du serveur Django (Backend)...
start "Django Backend" cmd /k "cd /d %~dp0backend && (if exist venv2\Scripts\activate (call venv2\Scripts\activate) else call venv\Scripts\activate) && python manage.py migrate && python manage.py runserver"

timeout /t 3 >nul

echo Demarrage de React (Frontend)...
start "React Frontend" cmd /k "cd /d %~dp0frontend && npm start"

echo.
echo =====================================================
echo  Application en cours de demarrage...
echo.
echo  Backend  : http://localhost:8000
echo  Frontend : http://localhost:3000
echo  Admin    : http://localhost:8000/admin
echo.
echo  Login admin : admin / Admin2024!
echo =====================================================
echo.
