@echo off
title Share CalcSlider Publicly Online
cls
echo ========================================================
echo   Making CalcSlider Public to the World (Internet Link)
echo ========================================================
echo.
echo Make sure the server is already running in another window!
echo Generating a public HTTPS web link...
echo.
npx -y localtunnel --port 3000
pause

