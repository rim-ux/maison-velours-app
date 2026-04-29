@echo off
echo === MAISON VELOURS - Installation ===
echo.

echo Installation des dependances Python...
pip install Django djangorestframework djangorestframework-simplejwt django-cors-headers Pillow python-dotenv PyMySQL cryptography
if %errorlevel% neq 0 (
    echo Essai avec python -m pip...
    python -m pip install Django djangorestframework djangorestframework-simplejwt django-cors-headers Pillow python-dotenv PyMySQL cryptography
)

echo.
echo Migrations base de donnees MySQL...
cd backend
python manage.py makemigrations users menu tables delivery orders payments
python manage.py migrate

echo.
echo Chargement des donnees (menu, tables, zones, admin)...
python seed_data.py
cd ..

echo.
echo Installation des dependances React...
cd frontend
call npm install
cd ..

echo.
echo ========================================
echo  Installation terminee !
echo  Lancez maintenant : backend.bat  et  frontend.bat
echo ========================================
pause
