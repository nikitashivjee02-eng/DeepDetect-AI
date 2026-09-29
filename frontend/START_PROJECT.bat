@echo off
title AI Deepfake Detection Project

echo ==========================================
echo       AI DEEPFAKE DETECTION PROJECT
echo ==========================================
echo.

echo Starting Authentication Backend...
start "AUTH - 5003" cmd /k "cd /d C:\Users\HP\Desktop\COLLEGE NOTES\Git\Project\auth_backend && python app.py"

timeout /t 2 /nobreak >nul

echo Starting Image Detector...
start "IMAGE - 5002" cmd /k "cd /d C:\Users\HP\Desktop\COLLEGE NOTES\Git\Project\Image-detector && python app.py"

timeout /t 2 /nobreak >nul

echo Starting Video Detector...
start "VIDEO - 5000" cmd /k "cd /d C:\Users\HP\Desktop\COLLEGE NOTES\Git\Project\AI-Video-Detector\AI-Video-Detector && python app.py"

timeout /t 2 /nobreak >nul

echo Starting Audio Detector...
start "AUDIO - 5001" cmd /k "cd /d C:\Users\HP\Desktop\COLLEGE NOTES\Git\Project\Audio_detector && python app.py"

timeout /t 2 /nobreak >nul

echo Starting Frontend...
start "FRONTEND - 3000" cmd /k "cd /d C:\Users\HP\Desktop\COLLEGE NOTES\Git\Project\Frontend && npm run dev"

echo.
echo ==========================================
echo       ALL SERVICES STARTED
echo ==========================================
echo.
echo Frontend : http://localhost:3000
echo Auth     : http://127.0.0.1:5003
echo Image    : http://127.0.0.1:5002
echo Video    : http://127.0.0.1:5000
echo Audio    : http://127.0.0.1:5001
echo.
pause