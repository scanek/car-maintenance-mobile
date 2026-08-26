@echo off
chcp 65001 > nul
title Сборка APK на локальном ПК

echo ========================================================
echo   🚗 Сборка Android APK для Changan Maintenance App
echo ========================================================
echo.

:: 1. Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ОШИБКА] Node.js не найден! Установите Node.js с https://nodejs.org
    pause
    exit /b 1
)

:: 2. Check Java / JDK
where javac >nul 2>nul
if %errorlevel% neq 0 (
    echo [ПРЕДУПРЕЖДЕНИЕ] JDK (Java Development Kit) не найден в PATH.
    echo Для локальной сборки на Windows можно установить JDK 17 командой:
    echo winget install Microsoft.OpenJDK.17
    echo.
)

echo [1/3] Проверка и установка зависимостей...
call npm install

echo.
echo [2/3] Выберите вариант сборки на ПК:
echo   1 - Сборка через EAS Local (npx eas build --local)
echo   2 - Сборка через Expo Prebuild + Gradle (gradlew assembleRelease)
echo.
set /p choice="Ваш выбор (1 или 2, Enter = 1): "

if "%choice%"=="2" (
    echo.
    echo Запуск Expo Prebuild...
    call npx expo prebuild --platform android
    echo.
    echo Сборка APK через Gradle...
    cd android
    call gradlew.bat assembleRelease
    cd ..
    echo.
    echo ========================================================
    echo   Готовый APK находится в:
    echo   android\app\build\outputs\apk\release\app-release.apk
    echo ========================================================
) else (
    echo.
    echo Запуск EAS Local Build...
    call npx eas-cli build -p android --profile preview --local
)

echo.
pause
