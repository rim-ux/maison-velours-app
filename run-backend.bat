@echo off
cd /d "%~dp0backend"
if exist venv2\Scripts\python.exe (
  venv2\Scripts\python manage.py migrate
  venv2\Scripts\python manage.py runserver
) else (
  venv\Scripts\python manage.py migrate
  venv\Scripts\python manage.py runserver
)
