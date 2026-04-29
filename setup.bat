@echo off
chcp 65001 >nul
echo.
echo =====================================================
echo    MAISON VELOURS — Installation du projet
echo =====================================================
echo.

:: ── Vérification Python ──────────────────────────────
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERREUR] Python n'est pas installe. Telechargez-le sur python.org
    pause & exit /b
)

:: ── Vérification Node ────────────────────────────────
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERREUR] Node.js n'est pas installe. Telechargez-le sur nodejs.org
    pause & exit /b
)

echo [1/6] Installation des dependances Python...
cd backend
pip install Django djangorestframework djangorestframework-simplejwt django-cors-headers Pillow python-dotenv mysqlclient

echo [2/6] Configuration de l'environnement...
if not exist .env (
    copy .env.example .env
    echo Fichier .env cree. Editez-le avec vos identifiants MySQL si necessaire.
)

echo.
echo =====================================================
echo  IMPORTANT — Configuration MySQL
echo =====================================================
echo  Assurez-vous que MySQL est demarré et que la base
echo  de données "maison_velours" existe.
echo.
echo  Commande SQL a executer dans MySQL :
echo  CREATE DATABASE maison_velours CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
echo =====================================================
echo.
pause

echo [3/6] Migrations de la base de donnees...
python manage.py makemigrations
python manage.py migrate

echo [4/6] Chargement des donnees initiales...
python seed_data.py

echo [5/6] Collection des fichiers statiques...
python manage.py collectstatic --no-input

echo [6/6] Installation des dependances React...
cd ..\frontend
call npm install

echo.
echo =====================================================
echo    Installation terminee !
echo    Lancez start.bat pour demarrer le projet.
echo =====================================================
echo.
pause
