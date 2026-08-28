import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { calculateDashboardStatus, getActiveVehicle } from './storage';

// Configure how notifications are presented when the app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request notification permissions from the user
 */
export async function requestNotificationPermissions() {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('maintenance_alerts', {
        name: 'Напоминания о ТО и расходниках',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#3b82f6',
        sound: 'default',
      });
    }

    return finalStatus === 'granted';
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

/**
 * Send an immediate test notification to verify sounds and banners
 */
export async function sendTestNotification(vehicleName = 'Мой автомобиль', warnKm = 1000, warnHours = 30) {
  try {
    const granted = await requestNotificationPermissions();
    if (!granted) {
      throw new Error('Разрешение на отправку уведомлений не предоставлено в настройках телефона.');
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🔔 Тест уведомлений: ' + vehicleName,
        body: 'Напоминания о ТО активны! Вы будете предупреждены за ' + warnKm + ' км или ' + warnHours + ' м/ч до замены расходников.',
        sound: true,
        channelId: 'maintenance_alerts',
        data: { type: 'test' }
      },
      trigger: null,
    });

    return true;
  } catch (error) {
    console.error('Failed to send test notification:', error);
    throw error;
  }
}

/**
 * Check if any consumables are approaching maintenance and trigger alerts
 */
export async function checkAndNotifyUpcomingTO(db) {
  try {
    if (!db) return;
    const notifSettings = db.notification_settings || { enabled: true, default_warn_km: 1000, default_warn_hours: 30 };
    if (notifSettings.enabled === false) return;

    const statusData = calculateDashboardStatus(db);
    const vehicle = statusData.vehicle || getActiveVehicle(db);
    if (!vehicle) return;

    const urgentItems = statusData.consumables.filter(c => c.status_code === 'danger' || c.status_code === 'warning');
    if (urgentItems.length === 0) return;

    const granted = await requestNotificationPermissions();
    if (!granted) return;

    const carName = vehicle.name || ((vehicle.brand || '') + ' ' + (vehicle.model || '')).trim() || 'Автомобиль';
    
    // Group urgent items
    const dangerItems = urgentItems.filter(c => c.status_code === 'danger');
    const warningItems = urgentItems.filter(c => c.status_code === 'warning');

    let title = '';
    let body = '';

    if (dangerItems.length > 0) {
      title = '🚨 Срочное ТО: ' + carName;
      const names = dangerItems.map(d => d.name).join(', ');
      body = 'Требуется замена расходников: ' + names + '!';
    } else if (warningItems.length > 0) {
      title = '⚠️ Скоро ТО: ' + carName;
      const first = warningItems[0];
      const remText = first.rem_km > 0 ? (first.rem_km + ' км') : '';
      const remHText = (first.rem_hours !== null && first.rem_hours > 0) ? (first.rem_hours + ' м/ч') : '';
      const remCombined = [remText, remHText].filter(Boolean).join(' / ');
      
      if (warningItems.length === 1) {
        body = 'До замены "' + first.name + '" осталось всего ' + remCombined + '!';
      } else {
        body = 'Скоро замена ' + warningItems.length + ' позиций: ' + first.name + ' (осталось ' + remCombined + ') и др.';
      }
    }

    if (title && body) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
          channelId: 'maintenance_alerts',
          data: { vehicle_id: vehicle.id, urgent_count: urgentItems.length }
        },
        trigger: null,
      });
    }
  } catch (error) {
    console.error('Failed to check and notify upcoming TO:', error);
  }
}
