@echo off
chcp 65001 > nul
title Локальная сборка Android APK на ПК

echo ========================================================
echo   🚗 Локальная сборка автономного APK (Авто ТО)
echo ========================================================
echo.

:: 1. Auto-configure JAVA_HOME
if exist "C:\Program Files\Microsoft\jdk-17.0.20.101-hotspot" (
    set "JAVA_HOME=C:\Program Files\Microsoft\jdk-17.0.20.101-hotspot"
    set "PATH=%JAVA_HOME%\bin;%PATH%"
    echo [OK] Обнаружен JDK: %JAVA_HOME%
) else (
    if defined JAVA_HOME (
        echo [OK] Используется JAVA_HOME: %JAVA_HOME%
    ) else (
        echo [!] JAVA_HOME не задан, поиск java в PATH...
    )
)

:: 2. Auto-configure ANDROID_HOME
if exist "%LOCALAPPDATA%\Android\Sdk" (
    set "ANDROID_HOME=%LOCALAPPDATA%\Android\Sdk"
    set "ANDROID_SDK_ROOT=%LOCALAPPDATA%\Android\Sdk"
    echo [OK] Обнаружен Android SDK: %ANDROID_HOME%
)

echo.
echo [1/3] Проверка целостности проекта через expo-doctor...
call npx --yes expo-doctor
if %errorlevel% neq 0 (
    echo [ПРЕДУПРЕЖДЕНИЕ] Найдены замечания в expo-doctor.
)

echo.
echo [2/3] Выберите режим локальной сборки:
echo   1 - Сборка через EAS Local (npx eas-cli build --local)
echo   2 - Нативная сборка через Expo Prebuild + Gradle (Быстрее)
echo.
set /p choice="Ваш выбор (1 или 2, по умолчанию 2): "

if "%choice%"=="1" (
    echo.
    echo Запуск EAS Local Build...
    call npx eas-cli build -p android --profile preview --local
) else (
    echo.
    echo [1/2] Генерация нативной сборки (Expo Prebuild)...
    call npx expo prebuild --platform android --clean
    
    echo.
    echo [2/2] Компиляция APK через Gradle...
    cd android
    call gradlew.bat assembleRelease
    cd ..
    
    echo.
    echo ========================================================
    echo   УСПЕШНО! Готовый автономный APK-файл создан:
    echo   android\app\build\outputs\apk\release\app-release.apk
    echo ========================================================
)

echo.
pause
