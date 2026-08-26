# 🚗 Авто ТО — Мобильное приложение (React Native & Expo)

<p align="center">
  <img src="https://img.shields.io/badge/Expo-SDK_51-000020?logo=expo&logoColor=white" alt="Expo">
  <img src="https://img.shields.io/badge/React_Native-0.74-61DAFB?logo=react&logoColor=white" alt="React Native">
  <img src="https://img.shields.io/badge/Android-APK-3DDC84?logo=android&logoColor=white" alt="Android APK">
  <img src="https://img.shields.io/badge/EAS_Build-Cloud_Ready-blue" alt="EAS Build">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="MIT">
</p>

Официальное мобильное приложение на **React Native & Expo** для подключения к серверной панели мониторинга и учета обслуживания автомобиля.

---

## 🌟 Возможности мобильного приложения

* **📱 Нативный интерфейс Android:** Полная поддержка жестов, безопасных зон экрана (Safe Area) и системной темы оформления.
* **⚙️ Быстрое подключение к серверу:** При первом запуске приложение запрашивает адрес вашего сервера (например: `http://192.168.1.150:9595`) и сохраняет его в `AsyncStorage`.
* **🔄 Смена адреса в 1 клик:** Кнопка **«⚙️ Сервер»** в верхней панели позволяет изменить адрес подключения в любой момент.
* **👇 Pull-to-refresh:** Жест свайпа вниз по экрану обновляет данные и графики износа.
* **🔙 Аппаратная кнопка «Назад»:** Физическая кнопка возврата Android переключает историю внутри приложения, предотвращая случайное закрытие.
* **📡 Автономный экран ошибок:** При отсутствии связи с сервером отображается понятное уведомление с кнопками повтора и быстрой правки IP-адреса.

---

## 🚀 Сборка APK-файла (2 способа)

### Вариант 1: Сборка APK в облаке через Expo EAS (Самый быстрый)

Сборка происходит на мощных серверах Expo без нагрузки на ваш компьютер.

1. **Установите зависимости:**
   ```bash
   npm install
   ```

2. **Запустите облачную сборку APK:**
   ```bash
   npm run build:apk
   ```

3. **Скачайте готовый APK:**  
   По завершении сборки откройте ссылку в консоли или перейдите в панель сборок:  
   👉 **[https://expo.dev/accounts/scanek_dev/projects/car-maintenance-app/builds](https://expo.dev/accounts/scanek_dev/projects/car-maintenance-app/builds)**  
   и скачайте файл **`.apk`** на ваш Android-смартфон.

---

### Вариант 2: Сборка APK локально на вашем ПК (Windows)

Для локальной сборки на компьютере требуется **Java Development Kit (JDK 17)**:
```powershell
winget install Microsoft.OpenJDK.17
```

Затем выберите удобный способ:

* **В 1 клик через файл:**  
  Дважды кликните по файлу **`build_apk_local.bat`** в корне проекта.

* **Через консоль:**
  ```bash
  npm run build:apk:local
  ```

* **Через Expo Prebuild + Gradle:**
  ```bash
  # 1. Генерация нативной папки android
  npm run prebuild

  # 2. Компиляция APK
  cd android
  .\gradlew.bat assembleRelease
  ```
  Готовый APK появится по пути:  
  📁 **`android\app\build\outputs\apk\release\app-release.apk`**

---

## 🛠 Доступные NPM-команды

| Команда | Описание |
| :--- | :--- |
| `npm start` | Запуск локального Expo Dev Server |
| `npm run build:apk` | **Сборка готового APK в облаке Expo EAS** |
| `npm run build:apk:local` | Локальная сборка APK на вашем ПК |
| `npm run prebuild` | Генерация нативных исходников `./android` |

---

## 📁 Структура проекта

```text
car-maintenance-mobile/
├── App.js                  # Главный компонент (WebView, Server Config, Error Screen)
├── app.json                # Конфигурация Expo (иконки, пакет com.scanek.carmaintenance)
├── eas.json                # Конфигурация сборки APK (profiles preview / production)
├── package.json            # NPM скрипты и зависимости
├── build_apk_local.bat     # Скрипт сборки в 1 клик для Windows
└── assets/                 # Иконки и заставки приложения
    ├── icon.png
    ├── adaptive-icon.png
    └── splash.png
```

---

## 📜 Лицензия
MIT License © 2026
