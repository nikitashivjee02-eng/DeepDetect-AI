@echo off
setlocal
title AI Deepfake Detection Project

set "ROOT=%~dp0"

echo ==========================================
echo       AI DEEPFAKE DETECTION PROJECT
echo ==========================================
echo.

echo Starting Authentication Backend on port 5003...
start "AUTH - 5003" cmd /k "cd /d ""%ROOT%backend\auth"" ^&^& python app.py"
timeout /t 2 /nobreak >nul

echo Starting Image Detector on port 5002...
start "IMAGE - 5002" cmd /k "cd /d ""%ROOT%backend\image-detector"" ^&^& python app.py"
timeout /t 2 /nobreak >nul

echo Starting Video Detector on port 5000...
start "VIDEO - 5000" cmd /k "cd /d ""%ROOT%backend\video-detector\AI-Video-Detector"" ^&^& python app.py"
timeout /t 2 /nobreak >nul

echo Starting Audio Detector on port 5001...
start "AUDIO - 5001" cmd /k "cd /d ""%ROOT%backend\audio-detector"" ^&^& python app.py"
timeout /t 2 /nobreak >nul

echo Starting Frontend on port 3000...
start "FRONTEND - 3000" cmd /k "cd /d ""%ROOT%frontend"" ^&^& npm run dev"

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
endlocal
