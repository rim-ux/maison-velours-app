@echo off
echo === MAISON VELOURS - Backend Django ===
cd backend
if exist venv2\Scripts\activate (
    call venv2\Scripts\activate
) else (
    call venv\Scripts\activate
)
python manage.py migrate
python manage.py runserver
