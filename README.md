# 🚗 Авто ТО — Мобильное приложение (React Native & Expo)

<p align="center">
  <img src="https://img.shields.io/badge/Expo-SDK_51-000020?logo=expo&logoColor=white" alt="Expo">
  <img src="https://img.shields.io/badge/React_Native-0.74-61DAFB?logo=react&logoColor=white" alt="React Native">
  <img src="https://img.shields.io/badge/EAS_Build-Ready-blue" alt="EAS">
</p>

Официальное мобильное приложение для подключения к вашей панели учета ТО и мониторинга состояния автомобиля.

---

## 📲 Как собрать APK через Expo EAS (в облаке):

1. **Установите зависимости:**
   ```bash
   npm install
   ```

2. **Запустите сборку готового APK-файла:**
   ```bash
   npx eas build -p android --profile preview
   ```

3. После завершения сборки перейдите по ссылке в консоли или откройте:  
   👉 **https://expo.dev/accounts/scanek_dev/projects/car-maintenance-app/builds**  
   и скачайте готовый файл **`.apk`** прямо на ваш смартфон!

---

## ⚙️ Настройка сервера в приложении:
При первом запуске приложение предложит ввести IP-адрес вашего сервера (например: `http://192.168.1.150:9595`).  
Вы всегда можете изменить адрес в любой момент, нажав кнопку **«⚙️ Сервер»** в верхней панели.
