import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';

const DB_KEY = '@car_maintenance_db_v1';

const ICON_MAP = {
  'droplet': '🛢️',
  'oil': '🛢️',
  'circle': '🔘',
  'wind': '💨',
  'air': '💨',
  'snowflake': '❄️',
  'fan': '❄️',
  'zap': '⚡',
  'spark': '⚡',
  'thermometer': '🧪',
  'coolant': '🧪',
  'shield-alert': '🛑',
  'shield': '🛡️',
  'brake': '🛑',
  'cog': '🔄',
  'gear': '🔄',
  'transmission': '🔄',
  'wrench': '⚙️',
  'tool': '🛠️',
  'disc': '💿',
  'battery': '🔋',
  'lightbulb': '💡'
};

// --- DEFAULT CLEAN DATABASE (START WITH ALL 0) ---
export const DEFAULT_CLEAN_DB = {
  version: "2.5",
  app: "car-maintenance-app",
  active_vehicle_id: "car_1",
  theme: "dark",
  is_onboarded: false,
  vehicles: [
    {
      id: "car_1",
      name: "Мой автомобиль",
      brand: "",
      model: "",
      plate: "",
      engine: "",
      year: new Date().getFullYear(),
      vin: "",
      current_km: 0,
      current_engine_hours: 0,
      oil_spec: ""
    }
  ],
  trackers: [
    {
      id: "engine_oil",
      name: "Масло моторное",
      category: "Двигатель",
      match: "масло",
      interval_km: 7500,
      interval_hours: 250,
      warn_km: 1500,
      warn_hours: 30,
      spec: "",
      brand: "",
      article: "",
      icon: "🛢️",
      enabled: true
    },
    {
      id: "oil_filter",
      name: "Фильтр масляный",
      category: "Фильтры",
      match: "масляный",
      interval_km: 7500,
      interval_hours: 250,
      warn_km: 1500,
      warn_hours: 30,
      spec: "",
      brand: "",
      article: "",
      icon: "⚙️",
      enabled: true
    },
    {
      id: "air_filter",
      name: "Фильтр воздушный ДВС",
      category: "Фильтры",
      match: "воздушный",
      interval_km: 10000,
      interval_hours: 250,
      warn_km: 1500,
      warn_hours: 30,
      spec: "",
      brand: "",
      article: "",
      icon: "💨",
      enabled: true
    },
    {
      id: "cabin_filter",
      name: "Фильтр салонный",
      category: "Фильтры",
      match: "салон",
      interval_km: 10000,
      interval_hours: 250,
      warn_km: 1500,
      warn_hours: 30,
      spec: "",
      brand: "",
      article: "",
      icon: "❄️",
      enabled: true
    },
    {
      id: "spark_plugs",
      name: "Свечи зажигания",
      category: "Зажигание",
      match: "свеч",
      interval_km: 30000,
      interval_hours: 0,
      warn_km: 3000,
      warn_hours: 0,
      spec: "",
      brand: "",
      article: "",
      icon: "⚡",
      enabled: true
    },
    {
      id: "antifreeze",
      name: "Антифриз (Охлаждающая жидкость)",
      category: "Охлаждение",
      match: "антифриз",
      interval_km: 50000,
      interval_hours: 0,
      warn_km: 5000,
      warn_hours: 0,
      spec: "",
      brand: "",
      article: "",
      icon: "🧪",
      enabled: true
    },
    {
      id: "brake_fluid",
      name: "Тормозная жидкость",
      category: "Тормоза",
      match: "тормозн",
      interval_km: 30000,
      interval_hours: 0,
      warn_km: 3000,
      warn_hours: 0,
      spec: "",
      brand: "",
      article: "",
      icon: "🛑",
      enabled: true
    },
    {
      id: "transmission_oil",
      name: "Масло в трансмиссии / КПП",
      category: "Трансмиссия",
      match: "коробк",
      interval_km: 60000,
      interval_hours: 0,
      warn_km: 5000,
      warn_hours: 0,
      spec: "",
      brand: "",
      article: "",
      icon: "🔄",
      enabled: true
    },
    {
      id: "drain_plug_ring",
      name: "Кольцо сливной пробки",
      category: "Двигатель",
      match: "пробк",
      interval_km: 7500,
      interval_hours: 250,
      warn_km: 1500,
      warn_hours: 30,
      spec: "",
      brand: "",
      article: "",
      icon: "🔘",
      enabled: true
    }
  ],
  maintenance_records: [],
  reference_intervals: []
};

// --- DEMO DATABASE (Changan CS55 Plus with TO-2 and TO-3 history) ---
export const DEMO_DB = {
  version: "2.5",
  app: "car-maintenance-app",
  active_vehicle_id: "car_1",
  theme: "dark",
  is_onboarded: true,
  vehicles: [
    {
      id: "car_1",
      name: "Changan CS55 Plus",
      brand: "Changan",
      model: "CS55 Plus",
      plate: "А 777 АА 777",
      engine: "1.5T 7DCT",
      year: 2023,
      vin: "",
      current_km: 25340,
      current_engine_hours: 772,
      oil_spec: "SAE 0W-20 SP / C5 (4.2-4.5 л)"
    }
  ],
  trackers: [
    {
      id: "engine_oil",
      name: "Масло моторное (0W-20)",
      category: "Двигатель",
      match: "масло",
      interval_km: 7500,
      interval_hours: 250,
      warn_km: 1500,
      warn_hours: 30,
      spec: "SAE 0W-20 SP / C5 (4.2-4.5 л)",
      brand: "Лукойл Genesis JP",
      article: "1658134508",
      icon: "🛢️",
      enabled: true
    },
    {
      id: "oil_filter",
      name: "Фильтр масляный",
      category: "Фильтры",
      match: "масляный",
      interval_km: 7500,
      interval_hours: 250,
      warn_km: 1500,
      warn_hours: 30,
      spec: "M20x1.5 / Уплотнение 62x54",
      brand: "VIC / Changan",
      article: "16510-61A31 / C-933",
      icon: "⚙️",
      enabled: true
    },
    {
      id: "air_filter",
      name: "Фильтр воздушный ДВС",
      category: "Фильтры",
      match: "воздушный",
      interval_km: 9000,
      interval_hours: 250,
      warn_km: 1500,
      warn_hours: 30,
      spec: "Панельный фильтрующий элемент",
      brand: "OEM / Changan",
      article: "1415671763 / AF162",
      icon: "💨",
      enabled: true
    },
    {
      id: "cabin_filter",
      name: "Фильтр салонный угольный",
      category: "Фильтры",
      match: "салон",
      interval_km: 9000,
      interval_hours: 250,
      warn_km: 1500,
      warn_hours: 30,
      spec: "Антибактериальный угольный CN1305K",
      brand: "Changan CS55 Plus",
      article: "2220140563",
      icon: "❄️",
      enabled: true
    },
    {
      id: "spark_plugs",
      name: "Свечи зажигания (Иридий)",
      category: "Зажигание",
      match: "свеч",
      interval_km: 30000,
      interval_hours: 0,
      warn_km: 3000,
      warn_hours: 0,
      spec: "Иридиевые свечи HU10A80P",
      brand: "CHANGAN OEM",
      article: "3707010-NE01",
      icon: "⚡",
      enabled: true
    },
    {
      id: "antifreeze",
      name: "Антифриз (Охлаждающая жидкость)",
      category: "Охлаждение",
      match: "антифриз",
      interval_km: 50000,
      interval_hours: 0,
      warn_km: 5000,
      warn_hours: 0,
      spec: "G12+ Dragon FELIX Pink",
      brand: "FELIX DRAGON G12+",
      article: "58888973218",
      icon: "🧪",
      enabled: true
    },
    {
      id: "brake_fluid",
      name: "Тормозная жидкость",
      category: "Тормоза",
      match: "тормозн",
      interval_km: 30000,
      interval_hours: 0,
      warn_km: 3000,
      warn_hours: 0,
      spec: "DOT 4 / DOT 4 Class 6 (1.0 л)",
      brand: "Rosdot / Castrol",
      article: "DOT4-05",
      icon: "🛑",
      enabled: true
    },
    {
      id: "transmission_oil",
      name: "Масло в роботе 7DCT",
      category: "Трансмиссия",
      match: "робот",
      interval_km: 60000,
      interval_hours: 0,
      warn_km: 5000,
      warn_hours: 0,
      spec: "DCTF Dual Clutch Fluid (4.0 л)",
      brand: "Changan DCTF",
      article: "DCT-F01",
      icon: "🔄",
      enabled: true
    },
    {
      id: "drain_plug_ring",
      name: "Кольцо сливной пробки",
      category: "Двигатель",
      match: "пробк",
      interval_km: 7500,
      interval_hours: 250,
      warn_km: 1500,
      warn_hours: 30,
      spec: "Алюминиевая/медная шайба 14мм",
      brand: "HYUNDAI-KIA / Changan",
      article: "2151323001",
      icon: "🔘",
      enabled: true
    }
  ],
  maintenance_records: [
    {
      id: 1,
      vehicle_id: "car_1",
      to_tag: "ТО-2",
      date: "2026-02-28",
      engine_hours: 601,
      mileage: 18378,
      category: "Двигатель",
      item_name: "Масло ZIC ZERO 20 0W-20",
      brand: "ZIC ZERO 20",
      article: "376802873",
      quantity: 4.2,
      unit: "л",
      price_type: "total",
      price_per_unit: 4204,
      total_price: 4204,
      interval_km: 7500,
      interval_hours: 250,
      next_km: 25878,
      next_hours: 851,
      note: "Плановая замена",
      store: "Ozon"
    },
    {
      id: 2,
      vehicle_id: "car_1",
      to_tag: "ТО-2",
      date: "2026-02-28",
      engine_hours: 601,
      mileage: 18378,
      category: "Фильтры",
      item_name: "Фильтр масляный",
      brand: "Changan",
      article: "1012010MK01",
      quantity: 1.0,
      unit: "шт",
      price_type: "total",
      price_per_unit: 540,
      total_price: 540,
      interval_km: 7500,
      interval_hours: 250,
      next_km: 25878,
      next_hours: 851,
      note: "Плановая замена",
      store: "Дилер"
    },
    {
      id: 3,
      vehicle_id: "car_1",
      to_tag: "ТО-2",
      date: "2026-02-28",
      engine_hours: 601,
      mileage: 18378,
      category: "Фильтры",
      item_name: "Фильтр воздушный",
      brand: "AF162",
      article: "1415671763",
      quantity: 1.0,
      unit: "шт",
      price_type: "total",
      price_per_unit: 803,
      total_price: 803,
      interval_km: 9000,
      interval_hours: 250,
      next_km: 27378,
      next_hours: 851,
      note: "Плановая замена",
      store: "Ozon"
    },
    {
      id: 4,
      vehicle_id: "car_1",
      to_tag: "ТО-2",
      date: "2026-02-28",
      engine_hours: 601,
      mileage: 18378,
      category: "Двигатель",
      item_name: "Кольцо сливной пробки",
      brand: "HYUNDAI-KIA",
      article: "2151323001",
      quantity: 1.0,
      unit: "шт",
      price_type: "total",
      price_per_unit: 84,
      total_price: 84,
      interval_km: 7500,
      interval_hours: 250,
      next_km: 25878,
      next_hours: 851,
      note: "Плановая замена",
      store: "Ozon"
    },
    {
      id: 5,
      vehicle_id: "car_1",
      to_tag: "ТО-2",
      date: "2026-02-28",
      engine_hours: 601,
      mileage: 18378,
      category: "Фильтры",
      item_name: "Фильтр салонный угольный",
      brand: "Changan",
      article: "2220140563",
      quantity: 1.0,
      unit: "шт",
      price_type: "total",
      price_per_unit: 798,
      total_price: 798,
      interval_km: 9000,
      interval_hours: 250,
      next_km: 27378,
      next_hours: 851,
      note: "Плановая замена",
      store: "Ozon"
    },
    {
      id: 6,
      vehicle_id: "car_1",
      to_tag: "ТО-3",
      date: "2026-08-27",
      engine_hours: 772,
      mileage: 25340,
      category: "Двигатель",
      item_name: "Масло Лукойл Genesis JP 0W-20",
      brand: "Лукойл",
      article: "1658134508",
      quantity: 4.5,
      unit: "л",
      price_type: "total",
      price_per_unit: 4570,
      total_price: 4570,
      interval_km: 7500,
      interval_hours: 250,
      next_km: 32840,
      next_hours: 1022,
      note: "Плановая замена на пробеге 25 340 км",
      store: "Ozon"
    },
    {
      id: 7,
      vehicle_id: "car_1",
      to_tag: "ТО-3",
      date: "2026-08-27",
      engine_hours: 772,
      mileage: 25340,
      category: "Фильтры",
      item_name: "Фильтр масляный VIC C-933",
      brand: "VIC",
      article: "C-933",
      quantity: 1.0,
      unit: "шт",
      price_type: "total",
      price_per_unit: 620,
      total_price: 620,
      interval_km: 7500,
      interval_hours: 250,
      next_km: 32840,
      next_hours: 1022,
      note: "Японский качественный фильтр",
      store: "Ozon"
    },
    {
      id: 8,
      vehicle_id: "car_1",
      to_tag: "ТО-3",
      date: "2026-08-27",
      engine_hours: 772,
      mileage: 25340,
      category: "Фильтры",
      item_name: "Фильтр воздушный ДВС",
      brand: "Changan",
      article: "1415671763",
      quantity: 1.0,
      unit: "шт",
      price_type: "total",
      price_per_unit: 980,
      total_price: 980,
      interval_km: 9000,
      interval_hours: 250,
      next_km: 34340,
      next_hours: 1022,
      note: "Оригинальный воздушный фильтр",
      store: "Дилер"
    },
    {
      id: 9,
      vehicle_id: "car_1",
      to_tag: "ТО-3",
      date: "2026-08-27",
      engine_hours: 772,
      mileage: 25340,
      category: "Фильтры",
      item_name: "Фильтр салонный антибактериальный",
      brand: "Changan",
      article: "2220140563",
      quantity: 1.0,
      unit: "шт",
      price_type: "total",
      price_per_unit: 1091,
      total_price: 1091,
      interval_km: 9000,
      interval_hours: 250,
      next_km: 34340,
      next_hours: 1022,
      note: "Антибактериальный салонник",
      store: "Ozon"
    }
  ],
  reference_intervals: []
};

export const INITIAL_DB = DEFAULT_CLEAN_DB;

// --- DATABASE OPERATIONS ---
export async function loadDatabase() {
  try {
    const raw = await AsyncStorage.getItem(DB_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return normalizeImportedBackup(parsed);
    }
    await AsyncStorage.setItem(DB_KEY, JSON.stringify(DEFAULT_CLEAN_DB));
    return DEFAULT_CLEAN_DB;
  } catch (e) {
    console.error('Error loading database:', e);
    return DEFAULT_CLEAN_DB;
  }
}

export async function saveDatabase(db) {
  try {
    await AsyncStorage.setItem(DB_KEY, JSON.stringify(db));
    return true;
  } catch (e) {
    console.error('Error saving database:', e);
    return false;
  }
}

export async function resetDatabase(mode = 'clean') {
  try {
    const selected = mode === 'demo' ? DEMO_DB : DEFAULT_CLEAN_DB;
    await AsyncStorage.setItem(DB_KEY, JSON.stringify(selected));
    return selected;
  } catch (e) {
    console.error('Error resetting database:', e);
    return DEFAULT_CLEAN_DB;
  }
}

// --- FULL SYNC & UNIFIED BACKUP NORMALIZER ---
export function normalizeImportedBackup(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Пустой или некорректный файл бэкапа');
  }

  let vehicles = [];
  if (Array.isArray(payload.vehicles) && payload.vehicles.length > 0) {
    vehicles = payload.vehicles.map(v => ({
      id: v.id || 'car_1',
      name: v.name || ((v.brand || '') + ' ' + (v.model || '')).trim() || 'Автомобиль',
      brand: v.brand || '',
      model: v.model || '',
      plate: v.plate || '',
      engine: v.engine || '',
      year: v.year || null,
      vin: v.vin || '',
      current_km: Number(v.current_km) || 0,
      current_engine_hours: Number(v.current_engine_hours) || 0,
      oil_spec: v.oil_spec || ''
    }));
  } else if (payload.vehicle && typeof payload.vehicle === 'object') {
    const v = payload.vehicle;
    vehicles = [{
      id: v.id || 'car_1',
      name: v.name || ((v.brand || '') + ' ' + (v.model || '')).trim() || 'Автомобиль',
      brand: v.brand || '',
      model: v.model || '',
      plate: v.plate || '',
      engine: v.engine || '',
      year: v.year || null,
      vin: v.vin || '',
      current_km: Number(v.current_km) || 0,
      current_engine_hours: Number(v.current_engine_hours) || 0,
      oil_spec: v.oil_spec || ''
    }];
  } else {
    vehicles = DEFAULT_CLEAN_DB.vehicles;
  }

  const active_vehicle_id = payload.active_vehicle_id || (payload.vehicle && payload.vehicle.id) || vehicles[0].id;

  const rawRecords = Array.isArray(payload.maintenance_records) ? payload.maintenance_records : [];
  const maintenance_records = rawRecords.map((r, idx) => ({
    id: r.id || (idx + 1),
    vehicle_id: r.vehicle_id || active_vehicle_id,
    to_tag: r.to_tag || 'ТО',
    date: r.date || new Date().toISOString().split('T')[0],
    mileage: Number(r.mileage) || 0,
    engine_hours: Number(r.engine_hours) || 0,
    category: r.category || 'Двигатель',
    item_name: r.item_name || 'Деталь',
    brand: r.brand || '',
    article: r.article || '',
    quantity: Number(r.quantity) || 1,
    unit: r.unit || 'шт',
    price_type: r.price_type || 'total',
    price_per_unit: Number(r.price_per_unit) || Number(r.total_price) || 0,
    total_price: Number(r.total_price) || Number(r.price_per_unit) || 0,
    interval_km: Number(r.interval_km) || 7500,
    interval_hours: Number(r.interval_hours) || 0,
    next_km: Number(r.next_km) || (Number(r.mileage) || 0) + (Number(r.interval_km) || 7500),
    next_hours: Number(r.next_hours) || 0,
    note: r.note || '',
    store: r.store || '',
    url: r.url || ''
  }));

  const rawTrackers = (Array.isArray(payload.trackers) && payload.trackers.length > 0) ? payload.trackers : DEFAULT_CLEAN_DB.trackers;
  const trackers = rawTrackers.map((t, idx) => {
    let icon = t.icon || '⚙️';
    if (ICON_MAP[icon]) icon = ICON_MAP[icon];
    return {
      id: t.id || ('tr_' + (idx + 1)),
      name: t.name || 'Регламент',
      category: t.category || 'Двигатель',
      match: t.match || (t.name || '').toLowerCase(),
      interval_km: Number(t.interval_km) || 7500,
      interval_hours: Number(t.interval_hours) || 0,
      warn_km: Number(t.warn_km) || 1500,
      warn_hours: Number(t.warn_hours) || 30,
      spec: t.spec || '',
      brand: t.brand || '',
      article: t.article || '',
      icon: icon,
      enabled: t.enabled !== false
    };
  });

  return {
    version: "2.5",
    app: "car-maintenance-app",
    is_onboarded: payload.is_onboarded !== undefined ? payload.is_onboarded : true,
    theme: payload.theme || "dark",
    active_vehicle_id,
    vehicles,
    trackers,
    maintenance_records,
    reference_intervals: Array.isArray(payload.reference_intervals) ? payload.reference_intervals : []
  };
}

// --- CREATE UNIFIED BACKUP PAYLOAD (100% WEB & ANDROID COMPATIBLE) ---
export function createUnifiedBackup(db) {
  const vehicle = getActiveVehicle(db);
  const vehicles = db.vehicles || [];
  
  return {
    version: "2.5",
    app: "car-maintenance-app",
    exported_at: new Date().toISOString(),
    active_vehicle_id: db.active_vehicle_id || (vehicle && vehicle.id) || "car_1",
    vehicle: vehicle || (vehicles.length > 0 ? vehicles[0] : null),
    vehicles: vehicles,
    trackers: db.trackers || [],
    maintenance_records: db.maintenance_records || [],
    reference_intervals: db.reference_intervals || []
  };
}

// --- EXPORT BACKUP AS REAL JSON FILE ---
export async function exportBackupFile(db) {
  try {
    const backupData = createUnifiedBackup(db);
    const vehicle = getActiveVehicle(db);
    const jsonStr = JSON.stringify(backupData, null, 2);

    const cleanBrand = (vehicle?.brand || 'auto').replace(/[^a-zA-Zа-яА-Я0-9_-]/g, '_');
    const cleanModel = (vehicle?.model || '').replace(/[^a-zA-Zа-яА-Я0-9_-]/g, '_');
    const filename = 'backup_' + cleanBrand + '_' + (cleanModel || 'vehicle') + '.json';
    const fileUri = FileSystem.documentDirectory + filename;

    await FileSystem.writeAsStringAsync(fileUri, jsonStr, {
      encoding: FileSystem.EncodingType.UTF8
    });

    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/json',
        dialogTitle: 'Резервная копия: ' + filename,
        UTI: 'public.json'
      });
      return { success: true, filename, fileUri };
    } else {
      return { success: true, filename, fileUri, shared: false };
    }
  } catch (error) {
    console.error('Failed to export backup file:', error);
    throw error;
  }
}

// --- PICK AND IMPORT BACKUP JSON FILE ---
export async function pickAndImportBackupFile() {
  try {
    const res = await DocumentPicker.getDocumentAsync({
      type: ['application/json', 'text/plain', '*/*'],
      copyToCacheDirectory: true
    });

    if (res.canceled || !res.assets || res.assets.length === 0) {
      return { canceled: true };
    }

    const fileAsset = res.assets[0];
    const content = await FileSystem.readAsStringAsync(fileAsset.uri, {
      encoding: FileSystem.EncodingType.UTF8
    });

    const parsed = JSON.parse(content);
    const normalized = normalizeImportedBackup(parsed);
    return { success: true, db: normalized, filename: fileAsset.name };
  } catch (error) {
    console.error('Failed to pick and import backup file:', error);
    throw error;
  }
}

export function getActiveVehicle(db) {
  if (!db || !db.vehicles || db.vehicles.length === 0) return null;
  const found = db.vehicles.find(v => v.id === db.active_vehicle_id);
  return found || db.vehicles[0];
}

// --- KPI & DASHBOARD CALCULATIONS ---
export function calculateDashboardStatus(db) {
  const vehicle = getActiveVehicle(db);
  if (!vehicle) {
    return {
      vehicle: null,
      kpi: {
        current_km: 0,
        current_hours: 0,
        total_spent: 0,
        cost_per_km: "0.00",
        avg_speed: "0.0",
        total_records: 0,
        attention_count: 0
      },
      consumables: []
    };
  }

  const vId = vehicle.id;
  const currentKm = Number(vehicle.current_km) || 0;
  const currentHours = Number(vehicle.current_engine_hours) || 0;

  const records = (db.maintenance_records || []).filter(r => (r.vehicle_id || 'car_1') === vId);
  const totalSpent = records.reduce((sum, r) => sum + (Number(r.total_price) || 0), 0);
  const costPerKm = currentKm > 0 ? (totalSpent / currentKm).toFixed(2) : "0.00";
  const avgSpeed = currentHours > 0 ? (currentKm / currentHours).toFixed(1) : "0.0";

  const enabledTrackers = (db.trackers || []).filter(t => t.enabled !== false);
  const consumables = [];

  enabledTrackers.forEach(tracker => {
    const matchTerm = (tracker.match || tracker.name).toLowerCase();
    const matching = records.filter(r => {
      const name = (r.item_name || '').toLowerCase();
      const cat = (r.category || '').toLowerCase();
      const br = (r.brand || '').toLowerCase();
      return name.includes(matchTerm) || cat.includes(matchTerm) || br.includes(matchTerm);
    });

    matching.sort((a, b) => (a.mileage - b.mileage) || String(a.date).localeCompare(String(b.date)));
    const latest = matching.length > 0 ? matching[matching.length - 1] : null;

    const intervalKm = Number(tracker.interval_km) || 7500;
    const intervalH = Number(tracker.interval_hours) || 0;
    const warnKm = Number(tracker.warn_km) || 1500;
    const warnH = Number(tracker.warn_hours) || 0;

    if (latest) {
      const lastKm = Number(latest.mileage) || 0;
      const lastH = Number(latest.engine_hours) || 0;
      const effCurrentKm = Math.max(currentKm, lastKm);
      const effCurrentH = Math.max(currentHours, lastH);

      const nextKm = lastKm + intervalKm;
      const remKm = nextKm - effCurrentKm;

      const nextH = intervalH > 0 ? (lastH + intervalH) : null;
      const remH = intervalH > 0 ? (nextH - effCurrentH) : null;

      const kmWear = Math.min(100, Math.round(((effCurrentKm - lastKm) / intervalKm) * 100));
      const hWear = (intervalH > 0) ? Math.min(100, Math.round(((effCurrentH - lastH) / intervalH) * 100)) : 0;
      const wearPercent = Math.max(kmWear, hWear);

      let statusCode = 'ok';
      let statusText = 'В норме';

      if (remKm <= 0 || (remH !== null && remH <= 0)) {
        statusCode = 'danger';
        statusText = 'Требуется замена';
      } else if (remKm <= warnKm || (remH !== null && warnH > 0 && remH <= warnH)) {
        statusCode = 'warning';
        statusText = 'Скоро замена';
      }

      consumables.push({
        id: tracker.id,
        name: tracker.name,
        icon: tracker.icon || '⚙️',
        category: tracker.category || latest.category || 'Двигатель',
        last_date: latest.date || '—',
        last_km: lastKm,
        last_hours: lastH,
        interval_km: intervalKm,
        interval_hours: intervalH,
        next_km: nextKm,
        next_hours: nextH,
        rem_km: remKm,
        rem_hours: remH,
        wear_percent: wearPercent,
        status_code: statusCode,
        status_text: statusText,
        brand: latest.brand || tracker.brand || '',
        article: latest.article || tracker.article || '',
        spec: tracker.spec || '',
        to_tag: latest.to_tag || ''
      });
    } else {
      const nextKm = currentKm + intervalKm;
      const remKm = intervalKm;
      const nextH = intervalH > 0 ? (currentHours + intervalH) : null;
      const remH = intervalH > 0 ? intervalH : null;

      const wearPercent = 0;
      let statusCode = 'ok';
      let statusText = 'В норме (новый)';

      consumables.push({
        id: tracker.id,
        name: tracker.name,
        icon: tracker.icon || '⚙️',
        category: tracker.category || 'Двигатель',
        last_date: '—',
        last_km: 0,
        last_hours: 0,
        interval_km: intervalKm,
        interval_hours: intervalH,
        next_km: nextKm,
        next_hours: nextH,
        rem_km: remKm,
        rem_hours: remH,
        wear_percent: 0,
        status_code: statusCode,
        status_text: statusText,
        brand: tracker.brand || '',
        article: tracker.article || '',
        spec: tracker.spec || '',
        to_tag: '—'
      });
    }
  });

  const attentionCount = consumables.filter(c => c.status_code !== 'ok').length;

  return {
    vehicle,
    kpi: {
      current_km: currentKm,
      current_hours: currentHours,
      total_spent: totalSpent,
      cost_per_km: costPerKm,
      avg_speed: avgSpeed,
      total_records: records.length,
      attention_count: attentionCount
    },
    consumables
  };
}

export function getTOGroups(db) {
  const vehicle = getActiveVehicle(db);
  if (!vehicle) return [];
  const vId = vehicle.id;
  const records = (db.maintenance_records || []).filter(r => (r.vehicle_id || 'car_1') === vId);

  const groups = {};
  records.forEach(r => {
    const tag = r.to_tag || 'Без метки';
    if (!groups[tag]) {
      groups[tag] = {
        to_tag: tag,
        date: r.date,
        mileage: r.mileage,
        engine_hours: r.engine_hours,
        total_cost: 0,
        parts: []
      };
    }
    groups[tag].total_cost += (Number(r.total_price) || 0);
    groups[tag].parts.push(r);
  });

  return Object.values(groups).sort((a, b) => (b.mileage - a.mileage) || String(b.date).localeCompare(String(a.date)));
}
