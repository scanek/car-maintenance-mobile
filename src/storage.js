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
  version: "2.6",
  app: "car-maintenance-app",
  active_vehicle_id: "car_1",
  theme: "dark",
  is_onboarded: false,
  notification_settings: {
    enabled: true,
    default_warn_km: 1000,
    default_warn_hours: 30,
    default_warn_days: 30
  },
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
      purchase_date: new Date().toISOString().split('T')[0],
      purchase_price: 0,
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
      interval_months: 12,
      warn_km: 1000,
      warn_hours: 30,
      warn_days: 30,
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
      interval_months: 12,
      warn_km: 1000,
      warn_hours: 30,
      warn_days: 30,
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
      interval_months: 12,
      warn_km: 1000,
      warn_hours: 30,
      warn_days: 30,
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
      interval_months: 12,
      warn_km: 1000,
      warn_hours: 30,
      warn_days: 30,
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
      interval_months: 36,
      warn_km: 3000,
      warn_hours: 0,
      warn_days: 30,
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
      interval_months: 36,
      warn_km: 5000,
      warn_hours: 0,
      warn_days: 45,
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
      interval_months: 24,
      warn_km: 3000,
      warn_hours: 0,
      warn_days: 30,
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
      interval_months: 48,
      warn_km: 5000,
      warn_hours: 0,
      warn_days: 60,
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
      interval_months: 12,
      warn_km: 1000,
      warn_hours: 30,
      warn_days: 30,
      spec: "",
      brand: "",
      article: "",
      icon: "🔘",
      enabled: true
    }
  ],
  maintenance_records: [],
  fuel_records: [],
  other_expenses: [],
  tyre_sets: [
    {
      id: "tyre_summer_1",
      vehicle_id: "car_1",
      season: "summer",
      name: "Летний комплект",
      brand_model: "",
      size: "225/55 R19",
      current_km: 0,
      tread_depth_mm: 8.0,
      is_active: true,
      install_date: new Date().toISOString().split('T')[0],
      install_mileage: 0
    },
    {
      id: "tyre_winter_1",
      vehicle_id: "car_1",
      season: "winter",
      type: "stud",
      name: "Зимний комплект (Шипы)",
      brand_model: "",
      size: "225/55 R19",
      current_km: 0,
      tread_depth_mm: 9.0,
      is_active: false,
      install_date: null,
      install_mileage: 0
    }
  ],
  reference_intervals: []
};

// --- DEMO DATABASE (Changan CS55 Plus with TO-2, TO-3, Fuel & Insurances) ---
export const DEMO_DB = {
  version: "2.6",
  app: "car-maintenance-app",
  active_vehicle_id: "car_1",
  theme: "dark",
  is_onboarded: true,
  notification_settings: {
    enabled: true,
    default_warn_km: 1000,
    default_warn_hours: 30,
    default_warn_days: 30
  },
  vehicles: [
    {
      id: "car_1",
      name: "Changan CS55 Plus",
      brand: "Changan",
      model: "CS55 Plus",
      plate: "А 777 АА 777",
      engine: "1.5T 7DCT (181 л.с.)",
      year: 2023,
      vin: "LS5A1234567890",
      purchase_date: "2023-05-15",
      purchase_price: 2650000,
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
      interval_months: 12,
      warn_km: 1000,
      warn_hours: 30,
      warn_days: 30,
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
      interval_months: 12,
      warn_km: 1000,
      warn_hours: 30,
      warn_days: 30,
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
      interval_months: 12,
      warn_km: 1000,
      warn_hours: 30,
      warn_days: 30,
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
      interval_months: 12,
      warn_km: 1000,
      warn_hours: 30,
      warn_days: 30,
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
      interval_months: 36,
      warn_km: 3000,
      warn_hours: 0,
      warn_days: 45,
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
      interval_months: 36,
      warn_km: 5000,
      warn_hours: 0,
      warn_days: 60,
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
      interval_months: 24,
      warn_km: 3000,
      warn_hours: 0,
      warn_days: 30,
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
      interval_months: 48,
      warn_km: 5000,
      warn_hours: 0,
      warn_days: 60,
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
      interval_months: 12,
      warn_km: 1000,
      warn_hours: 30,
      warn_days: 30,
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
  fuel_records: [
    {
      id: 1,
      vehicle_id: "car_1",
      date: "2026-08-10",
      mileage: 24650,
      liters: 48.5,
      price_per_liter: 58.9,
      total_price: 2856,
      fuel_type: "АИ-95",
      is_full_tank: true,
      station: "Газпромнефть",
      note: "Трасса М-11"
    },
    {
      id: 2,
      vehicle_id: "car_1",
      date: "2026-08-26",
      mileage: 25300,
      liters: 52.0,
      price_per_liter: 59.2,
      total_price: 3078,
      fuel_type: "АИ-95",
      is_full_tank: true,
      station: "Лукойл",
      note: "Городской режим"
    }
  ],
  other_expenses: [
    {
      id: 1,
      vehicle_id: "car_1",
      date: "2026-05-10",
      mileage: 21500,
      category: "Страховка",
      title: "Полис ОСАГО (Ингосстрах)",
      total_price: 8400,
      expiry_date: "2027-05-09",
      note: "Неограниченная страховка"
    },
    {
      id: 2,
      vehicle_id: "car_1",
      date: "2026-08-12",
      mileage: 24700,
      category: "Платные дороги",
      title: "Транспондер T-Pass (Пополнение)",
      total_price: 3000,
      expiry_date: "",
      note: "Поездка в Санкт-Петербург"
    },
    {
      id: 3,
      vehicle_id: "car_1",
      date: "2026-08-20",
      mileage: 25100,
      category: "Мойка/Уход",
      title: "Комплексная трехфазная мойка + воск",
      total_price: 1800,
      expiry_date: "",
      note: "Детейлинг студия"
    }
  ],
  tyre_sets: [
    {
      id: "tyre_summer_1",
      vehicle_id: "car_1",
      season: "summer",
      name: "Летний комплект Continental",
      brand_model: "Continental PremiumContact 6",
      size: "225/55 R19 99V",
      current_km: 17800,
      tread_depth_mm: 6.8,
      is_active: true,
      install_date: "2026-04-15",
      install_mileage: 19500
    },
    {
      id: "tyre_winter_1",
      vehicle_id: "car_1",
      season: "winter",
      type: "stud",
      name: "Зимний комплект Nokian (Шипы)",
      brand_model: "Nokian Hakkapeliitta 10 SUV",
      size: "225/55 R19 103T XL",
      current_km: 7540,
      tread_depth_mm: 8.5,
      is_active: false,
      install_date: null,
      install_mileage: 0
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

// --- ENGINE HOURS HELPER (INTEGER HOURS ONLY) ---
export function parseEngineHours(val) {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'string' && val.includes(':')) {
    const parts = val.split(':');
    return Math.round(Number(parts[0]) || 0);
  }
  const num = Number(val);
  return isNaN(num) ? 0 : Math.round(num);
}

// Smart matching helper for trackers imported without explicit 'match' field
function deriveSmartTrackerMatch(name) {
  if (!name || typeof name !== 'string') return '';
  const lower = name.toLowerCase();
  if (lower.includes('масл') && (lower.includes('мотор') || lower.includes('двиг') || lower.includes('двс') || (!lower.includes('коробк') && !lower.includes('кпп') && !lower.includes('трансмисс') && !lower.includes('вариатор') && !lower.includes('диффер') && !lower.includes('редуктор')))) {
    return 'масло';
  }
  if (lower.includes('маслян') || (lower.includes('фильтр') && lower.includes('масл'))) {
    return 'масляный';
  }
  if (lower.includes('воздушн')) return 'воздушный';
  if (lower.includes('салон')) return 'салон';
  if (lower.includes('свеч')) return 'свеч';
  if (lower.includes('тормозн')) return 'тормозн';
  if (lower.includes('антифриз') || lower.includes('охлажд')) return 'антифриз';
  if (lower.includes('коробк') || lower.includes('кпп') || lower.includes('трансмисс') || lower.includes('вариатор')) return 'коробк';

  const cleaned = lower.replace(/^(замена|смена|проверка|обслуживание|регулировка)\s+/i, '').trim();
  return cleaned || lower;
}

// --- FULL SYNC & UNIFIED BACKUP NORMALIZER ---
export function normalizeImportedBackup(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Пустой или некорректный файл бэкапа');
  }

  // 1. Определение типа бэкапа:
  // - Полный гаражный бэкап AutoTracker (type: "user_garage_backup" или массив data с машинами)
  // - Одиночный бэкап автомобиля AutoTracker (root vehicle + service_records/fuel_logs/documents...)
  // - Родной формат car-maintenance-mobile / car-maintenance-app (массив vehicles)
  const isAutoTrackerGarage = (payload.type === 'user_garage_backup' || Array.isArray(payload.data)) && Array.isArray(payload.data) && payload.data.length > 0;
  const isAutoTrackerSingle = Boolean(
    payload.vehicle && typeof payload.vehicle === 'object' &&
    (payload.service_records || payload.fuel_logs || payload.documents || payload.app === 'Бортовой Журнал' || !Array.isArray(payload.vehicles))
  );

  let rawVehiclesData = [];
  let isNativeFormat = false;

  if (isAutoTrackerGarage) {
    rawVehiclesData = payload.data;
  } else if (isAutoTrackerSingle) {
    rawVehiclesData = [payload];
  } else if (Array.isArray(payload.vehicles) && payload.vehicles.length > 0) {
    isNativeFormat = true;
  } else {
    throw new Error('В файле бэкапа не найдены данные автомобиля');
  }

  const vehicles = [];
  const allMaintenanceRecords = [];
  const allFuelRecords = [];
  const allOtherExpenses = [];
  const allTyreSets = [];
  const trackerMap = new Map();

  let recordCounter = 1;
  let fuelCounter = 1;
  let expenseCounter = 1;

  if (!isNativeFormat) {
    rawVehiclesData.forEach((item, carIdx) => {
      const v = item.vehicle || item;
      const carId = String(v.id || ('car_' + (carIdx + 1)));

      // Нормализация автомобиля
      const brandName = (v.brand || v.make || '').trim();
      const modelName = (v.model || '').trim();
      const fallbackName = (brandName + ' ' + modelName).trim() || 'Автомобиль';

      vehicles.push({
        id: carId,
        name: v.name || fallbackName,
        brand: brandName,
        model: modelName,
        plate: v.plate || v.license_plate || '',
        engine: v.engine || '',
        year: v.year ? Number(v.year) : null,
        vin: v.vin || '',
        purchase_date: v.purchase_date ? String(v.purchase_date).split('T')[0] : new Date().toISOString().split('T')[0],
        purchase_price: Number(v.purchase_price) || 0,
        current_km: Number(v.current_km ?? v.current_odometer ?? v.starting_odometer ?? 0),
        current_engine_hours: parseEngineHours(v.current_engine_hours),
        oil_spec: v.oil_spec || ''
      });

      // Нормализация записей ТО (AutoTracker: service_records; CarMaintenance: maintenance_records)
      const rawServices = Array.isArray(item.service_records) 
        ? item.service_records 
        : (Array.isArray(item.maintenance_records) ? item.maintenance_records : []);

      rawServices.forEach((s) => {
        const sDate = s.date ? String(s.date).split('T')[0] : new Date().toISOString().split('T')[0];
        const sMileage = Number(s.odometer ?? s.mileage ?? 0);
        const sHours = parseEngineHours(s.engine_hours);
        const sTag = s.to_tag || s.title || 'ТО';
        const sStore = s.store || '';
        const sNote = s.description || s.notes || s.note || '';
        const groupId = s.group_id || ('to_' + carId + '_' + sDate + '_' + sMileage);

        if (Array.isArray(s.items) && s.items.length > 0) {
          // Разворачиваем вложенные позиции деталей
          s.items.forEach((it) => {
            allMaintenanceRecords.push({
              id: recordCounter++,
              vehicle_id: carId,
              to_tag: sTag,
              group_id: groupId,
              date: sDate,
              mileage: sMileage,
              engine_hours: sHours,
              category: it.category || 'Расходники',
              item_name: it.name || 'Запчасть',
              brand: it.brand || '',
              article: it.part_number || it.article || '',
              quantity: Number(it.quantity) || 1,
              unit: it.unit || 'шт',
              price_type: 'total',
              price_per_unit: Number(it.unit_price) || Number(it.total_price) || 0,
              total_price: Number(it.total_price) || Math.round((Number(it.quantity) || 1) * (Number(it.unit_price) || 0)),
              interval_km: 7500,
              interval_hours: 0,
              next_km: sMileage + 7500,
              next_hours: sHours > 0 ? sHours + 250 : 0,
              note: sNote,
              store: it.store || sStore
            });
          });

          // Если были отдельно указаны работы сервиса
          if (Number(s.cost_labor) > 0) {
            allMaintenanceRecords.push({
              id: recordCounter++,
              vehicle_id: carId,
              to_tag: sTag,
              group_id: groupId,
              date: sDate,
              mileage: sMileage,
              engine_hours: sHours,
              category: 'Сервис',
              item_name: 'Работы / Услуги сервиса',
              brand: '',
              article: '',
              quantity: 1,
              unit: 'усл',
              price_type: 'total',
              price_per_unit: Number(s.cost_labor),
              total_price: Number(s.cost_labor),
              interval_km: 7500,
              interval_hours: 0,
              next_km: sMileage + 7500,
              next_hours: 0,
              note: sNote,
              store: sStore
            });
          }
        } else {
          // Одиночная запись без разбивки по запчастям
          allMaintenanceRecords.push({
            id: recordCounter++,
            vehicle_id: carId,
            to_tag: sTag,
            group_id: groupId,
            date: sDate,
            mileage: sMileage,
            engine_hours: sHours,
            category: s.category || 'Обслуживание',
            item_name: s.item_name || s.title || 'ТО / Ремонт',
            brand: s.brand || '',
            article: s.article || '',
            quantity: Number(s.quantity) || 1,
            unit: s.unit || 'шт',
            price_type: 'total',
            price_per_unit: Number(s.total_cost ?? s.total_price ?? ((Number(s.cost_parts) || 0) + (Number(s.cost_labor) || 0))),
            total_price: Number(s.total_cost ?? s.total_price ?? ((Number(s.cost_parts) || 0) + (Number(s.cost_labor) || 0))),
            interval_km: Number(s.interval_km) || 7500,
            interval_hours: parseEngineHours(s.interval_hours),
            next_km: Number(s.next_km) || (sMileage + (Number(s.interval_km) || 7500)),
            next_hours: 0,
            note: sNote,
            store: sStore
          });
        }
      });

      // Нормализация заправок (AutoTracker: fuel_logs; CarMaintenance: fuel_records)
      const rawFuels = Array.isArray(item.fuel_logs) 
        ? item.fuel_logs 
        : (Array.isArray(item.fuel_records) ? item.fuel_records : []);

      rawFuels.forEach((f) => {
        const fLiters = Number(f.fuel_amount ?? f.liters ?? 0);
        const fUnitPrice = Number(f.unit_price ?? f.price_per_liter ?? 0);
        const fTotal = Number(f.total_cost ?? f.total_price ?? Math.round(fLiters * fUnitPrice));

        allFuelRecords.push({
          id: fuelCounter++,
          vehicle_id: carId,
          date: f.date ? String(f.date).split('T')[0] : new Date().toISOString().split('T')[0],
          mileage: Number(f.odometer ?? f.mileage ?? 0),
          liters: fLiters,
          price_per_liter: fUnitPrice,
          total_price: fTotal,
          fuel_type: f.fuel_grade || f.fuel_type || 'АИ-95',
          is_full_tank: f.is_full_tank !== false,
          station: f.gas_station || f.station || '',
          note: f.notes || f.note || ''
        });
      });

      // Нормализация документов / прочих расходов (AutoTracker: documents; CarMaintenance: other_expenses)
      const rawDocs = Array.isArray(item.documents) 
        ? item.documents 
        : (Array.isArray(item.other_expenses) ? item.other_expenses : []);

      rawDocs.forEach((d) => {
        let docTitle = d.title || d.document_number || 'Расход';
        if (d.document_number && !docTitle.includes(d.document_number)) {
          docTitle += ` (${d.document_number})`;
        }

        allOtherExpenses.push({
          id: expenseCounter++,
          vehicle_id: carId,
          date: d.issue_date ? String(d.issue_date).split('T')[0] : (d.date ? String(d.date).split('T')[0] : new Date().toISOString().split('T')[0]),
          mileage: Number(d.mileage) || 0,
          category: d.doc_type === 'insurance' ? 'Страховка' : (d.category || 'Документы'),
          title: docTitle,
          total_price: Number(d.price ?? d.total_price ?? 0),
          expiry_date: d.expiration_date ? String(d.expiration_date).split('T')[0] : (d.expiry_date ? String(d.expiry_date).split('T')[0] : ''),
          note: d.notes || d.note || (d.company ? `Компания: ${d.company}` : '')
        });
      });

      // Нормализация комплектов шин
      const rawTyres = Array.isArray(item.tyre_sets) ? item.tyre_sets : [];
      rawTyres.forEach((t, tIdx) => {
        allTyreSets.push({
          id: String(t.id || ('tyre_' + carId + '_' + (tIdx + 1))),
          vehicle_id: carId,
          season: t.season || 'summer',
          type: t.type || (t.season === 'winter' ? 'stud' : 'road'),
          name: t.name || (t.season === 'winter' ? 'Зимний комплект' : 'Летний комплект'),
          brand_model: t.brand_model || '',
          size: t.size || '225/55 R19',
          current_km: Number(t.current_km) || 0,
          tread_depth_mm: Number(t.tread_depth_mm) || 8.0,
          is_active: Boolean(t.is_active),
          install_date: t.install_date ? String(t.install_date).split('T')[0] : null,
          install_mileage: Number(t.install_mileage) || 0
        });
      });

      // Нормализация регламентов (trackers)
      if (Array.isArray(item.trackers)) {
        item.trackers.forEach((t) => {
          if (!t || !t.name) return;
          const key = (t.name || '').trim().toLowerCase();
          if (!trackerMap.has(key)) {
            let iconEmoji = t.icon || '⚙️';
            if (ICON_MAP[iconEmoji]) iconEmoji = ICON_MAP[iconEmoji];

            const smartMatch = deriveSmartTrackerMatch(t.name);
            const matchTerm = t.match || smartMatch || (t.name || '').toLowerCase();

            trackerMap.set(key, {
              id: String(t.id || ('tr_' + (trackerMap.size + 1))),
              name: t.name || 'Регламент',
              category: t.category || 'Двигатель',
              match: matchTerm,
              interval_km: Number(t.interval_km ?? t.interval_distance ?? 7500),
              interval_hours: parseEngineHours(t.interval_hours),
              interval_months: Number(t.interval_months) || 12,
              warn_km: Number(t.warn_km ?? t.notify_before_distance ?? 1000),
              warn_hours: parseEngineHours(t.warn_hours ?? t.notify_before_hours ?? 30),
              warn_days: Number(t.warn_days ?? t.notify_before_days ?? 30),
              spec: t.spec || '',
              brand: t.brand || '',
              article: t.article || '',
              icon: iconEmoji,
              enabled: t.enabled !== false
            });
          }
        });
      }
    });
  } else {
    // Родной формат (массив vehicles)
    payload.vehicles.forEach((v, carIdx) => {
      const brandName = (v.brand || v.make || '').trim();
      const modelName = (v.model || '').trim();
      const fallbackName = (brandName + ' ' + modelName).trim() || 'Автомобиль';
      vehicles.push({
        id: String(v.id || ('car_' + (carIdx + 1))),
        name: v.name || fallbackName,
        brand: brandName,
        model: modelName,
        plate: v.plate || v.license_plate || '',
        engine: v.engine || '',
        year: v.year ? Number(v.year) : null,
        vin: v.vin || '',
        purchase_date: v.purchase_date ? String(v.purchase_date).split('T')[0] : new Date().toISOString().split('T')[0],
        purchase_price: Number(v.purchase_price) || 0,
        current_km: Number(v.current_km ?? v.current_odometer ?? v.starting_odometer ?? 0),
        current_engine_hours: parseEngineHours(v.current_engine_hours),
        oil_spec: v.oil_spec || ''
      });
    });

    const defaultCarId = vehicles[0]?.id || 'car_1';

    const rawServices = Array.isArray(payload.maintenance_records) 
      ? payload.maintenance_records 
      : (Array.isArray(payload.service_records) ? payload.service_records : []);

    rawServices.forEach((s) => {
      const sCarId = String(s.vehicle_id || defaultCarId);
      const sDate = s.date ? String(s.date).split('T')[0] : new Date().toISOString().split('T')[0];
      const sMileage = Number(s.odometer ?? s.mileage ?? 0);
      const sHours = parseEngineHours(s.engine_hours);
      const sTag = s.to_tag || s.title || 'ТО';
      const sStore = s.store || '';
      const sNote = s.description || s.notes || s.note || '';
      const groupId = s.group_id || ('to_' + sCarId + '_' + sDate + '_' + sMileage);

      if (Array.isArray(s.items) && s.items.length > 0) {
        s.items.forEach((it) => {
          allMaintenanceRecords.push({
            id: recordCounter++,
            vehicle_id: sCarId,
            to_tag: sTag,
            group_id: groupId,
            date: sDate,
            mileage: sMileage,
            engine_hours: sHours,
            category: it.category || 'Расходники',
            item_name: it.name || 'Запчасть',
            brand: it.brand || '',
            article: it.part_number || it.article || '',
            quantity: Number(it.quantity) || 1,
            unit: it.unit || 'шт',
            price_type: 'total',
            price_per_unit: Number(it.unit_price) || Number(it.total_price) || 0,
            total_price: Number(it.total_price) || Math.round((Number(it.quantity) || 1) * (Number(it.unit_price) || 0)),
            interval_km: 7500,
            interval_hours: 0,
            next_km: sMileage + 7500,
            next_hours: sHours > 0 ? sHours + 250 : 0,
            note: sNote,
            store: it.store || sStore
          });
        });

        if (Number(s.cost_labor) > 0) {
          allMaintenanceRecords.push({
            id: recordCounter++,
            vehicle_id: sCarId,
            to_tag: sTag,
            group_id: groupId,
            date: sDate,
            mileage: sMileage,
            engine_hours: sHours,
            category: 'Сервис',
            item_name: 'Работы / Услуги сервиса',
            brand: '',
            article: '',
            quantity: 1,
            unit: 'усл',
            price_type: 'total',
            price_per_unit: Number(s.cost_labor),
            total_price: Number(s.cost_labor),
            interval_km: 7500,
            interval_hours: 0,
            next_km: sMileage + 7500,
            next_hours: 0,
            note: sNote,
            store: sStore
          });
        }
      } else {
        allMaintenanceRecords.push({
          id: recordCounter++,
          vehicle_id: sCarId,
          to_tag: sTag,
          group_id: groupId,
          date: sDate,
          mileage: sMileage,
          engine_hours: sHours,
          category: s.category || 'Обслуживание',
          item_name: s.item_name || s.title || 'ТО / Ремонт',
          brand: s.brand || '',
          article: s.article || '',
          quantity: Number(s.quantity) || 1,
          unit: s.unit || 'шт',
          price_type: 'total',
          price_per_unit: Number(s.total_cost ?? s.total_price ?? ((Number(s.cost_parts) || 0) + (Number(s.cost_labor) || 0))),
          total_price: Number(s.total_cost ?? s.total_price ?? ((Number(s.cost_parts) || 0) + (Number(s.cost_labor) || 0))),
          interval_km: Number(s.interval_km) || 7500,
          interval_hours: parseEngineHours(s.interval_hours),
          next_km: Number(s.next_km) || (sMileage + (Number(s.interval_km) || 7500)),
          next_hours: 0,
          note: sNote,
          store: sStore,
          url: s.url || ''
        });
      }
    });

    const rawFuels = Array.isArray(payload.fuel_records) 
      ? payload.fuel_records 
      : (Array.isArray(payload.fuel_logs) ? payload.fuel_logs : []);

    rawFuels.forEach((f) => {
      const fCarId = String(f.vehicle_id || defaultCarId);
      const fLiters = Number(f.liters ?? f.fuel_amount ?? 0);
      const fUnitPrice = Number(f.price_per_liter ?? f.unit_price ?? 0);
      const fTotal = Number(f.total_price ?? f.total_cost ?? Math.round(fLiters * fUnitPrice));

      allFuelRecords.push({
        id: fuelCounter++,
        vehicle_id: fCarId,
        date: f.date ? String(f.date).split('T')[0] : new Date().toISOString().split('T')[0],
        mileage: Number(f.mileage ?? f.odometer ?? 0),
        liters: fLiters,
        price_per_liter: fUnitPrice,
        total_price: fTotal,
        fuel_type: f.fuel_type || f.fuel_grade || 'АИ-95',
        is_full_tank: f.is_full_tank !== false,
        station: f.station || f.gas_station || '',
        note: f.note || f.notes || ''
      });
    });

    const rawExpenses = Array.isArray(payload.other_expenses) 
      ? payload.other_expenses 
      : (Array.isArray(payload.documents) ? payload.documents : []);

    rawExpenses.forEach((e) => {
      const eCarId = String(e.vehicle_id || defaultCarId);
      let docTitle = e.title || e.document_number || 'Расход';
      if (e.document_number && !docTitle.includes(e.document_number)) {
        docTitle += ` (${e.document_number})`;
      }

      allOtherExpenses.push({
        id: expenseCounter++,
        vehicle_id: eCarId,
        date: e.date ? String(e.date).split('T')[0] : (e.issue_date ? String(e.issue_date).split('T')[0] : new Date().toISOString().split('T')[0]),
        mileage: Number(e.mileage) || 0,
        category: e.doc_type === 'insurance' ? 'Страховка' : (e.category || 'Прочее'),
        title: docTitle,
        total_price: Number(e.total_price ?? e.price ?? 0),
        expiry_date: e.expiry_date ? String(e.expiry_date).split('T')[0] : (e.expiration_date ? String(e.expiration_date).split('T')[0] : ''),
        note: e.note || e.notes || (e.company ? `Компания: ${e.company}` : '')
      });
    });

    const rawTyres = Array.isArray(payload.tyre_sets) ? payload.tyre_sets : [];
    rawTyres.forEach((t, tIdx) => {
      const tCarId = String(t.vehicle_id || defaultCarId);
      allTyreSets.push({
        id: String(t.id || ('tyre_' + tCarId + '_' + (tIdx + 1))),
        vehicle_id: tCarId,
        season: t.season || 'summer',
        type: t.type || (t.season === 'winter' ? 'stud' : 'road'),
        name: t.name || (t.season === 'winter' ? 'Зимний комплект' : 'Летний комплект'),
        brand_model: t.brand_model || '',
        size: t.size || '225/55 R19',
        current_km: Number(t.current_km) || 0,
        tread_depth_mm: Number(t.tread_depth_mm) || 8.0,
        is_active: Boolean(t.is_active),
        install_date: t.install_date ? String(t.install_date).split('T')[0] : null,
        install_mileage: Number(t.install_mileage) || 0
      });
    });

    if (Array.isArray(payload.trackers)) {
      payload.trackers.forEach((t) => {
        if (!t || !t.name) return;
        const key = (t.name || '').trim().toLowerCase();
        if (!trackerMap.has(key)) {
          let iconEmoji = t.icon || '⚙️';
          if (ICON_MAP[iconEmoji]) iconEmoji = ICON_MAP[iconEmoji];

          const smartMatch = deriveSmartTrackerMatch(t.name);
          const matchTerm = t.match || smartMatch || (t.name || '').toLowerCase();

          trackerMap.set(key, {
            id: String(t.id || ('tr_' + (trackerMap.size + 1))),
            name: t.name || 'Регламент',
            category: t.category || 'Двигатель',
            match: matchTerm,
            interval_km: Number(t.interval_km ?? t.interval_distance ?? 7500),
            interval_hours: Number(t.interval_hours) || 0,
            interval_months: Number(t.interval_months) || 12,
            warn_km: Number(t.warn_km ?? t.notify_before_distance ?? 1000),
            warn_hours: Number(t.warn_hours ?? t.notify_before_hours ?? 30),
            warn_days: Number(t.warn_days ?? t.notify_before_days ?? 30),
            spec: t.spec || '',
            brand: t.brand || '',
            article: t.article || '',
            icon: iconEmoji,
            enabled: t.enabled !== false
          });
        }
      });
    }
  }

  let mergedTrackers = Array.from(trackerMap.values());
  if (mergedTrackers.length === 0) {
    mergedTrackers = DEFAULT_CLEAN_DB.trackers;
  }

  // Гарантируем наличие хотя бы одного комплекта шин для каждого автомобиля
  vehicles.forEach((veh) => {
    const hasTyre = allTyreSets.some(t => String(t.vehicle_id) === String(veh.id));
    if (!hasTyre) {
      allTyreSets.push({
        id: 'tyre_summer_' + veh.id,
        vehicle_id: veh.id,
        season: 'summer',
        type: 'road',
        name: 'Летний комплект',
        brand_model: '',
        size: '225/55 R19',
        current_km: 0,
        tread_depth_mm: 8.0,
        is_active: true,
        install_date: new Date().toISOString().split('T')[0],
        install_mileage: 0
      });
    }
  });

  const active_vehicle_id = String(payload.active_vehicle_id || (payload.vehicle && payload.vehicle.id) || vehicles[0]?.id || 'car_1');

  return {
    version: "2.6",
    app: "car-maintenance-app",
    is_onboarded: payload.is_onboarded !== undefined ? payload.is_onboarded : true,
    theme: payload.theme || "dark",
    notification_settings: payload.notification_settings || {
      enabled: true,
      default_warn_km: 1000,
      default_warn_hours: 30,
      default_warn_days: 30
    },
    active_vehicle_id,
    vehicles,
    trackers: mergedTrackers,
    maintenance_records: allMaintenanceRecords,
    fuel_records: allFuelRecords,
    other_expenses: allOtherExpenses,
    tyre_sets: allTyreSets,
    reference_intervals: Array.isArray(payload.reference_intervals) ? payload.reference_intervals : []
  };
}

// --- CREATE UNIFIED BACKUP PAYLOAD (100% WEB & ANDROID COMPATIBLE) ---
export function createUnifiedBackup(db) {
  const vehicle = getActiveVehicle(db);
  const vehicles = db.vehicles || [];
  
  return {
    version: "2.6",
    app: "car-maintenance-app",
    exported_at: new Date().toISOString(),
    active_vehicle_id: db.active_vehicle_id || (vehicle && vehicle.id) || "car_1",
    vehicle: vehicle || (vehicles.length > 0 ? vehicles[0] : null),
    vehicles: vehicles,
    trackers: db.trackers || [],
    maintenance_records: db.maintenance_records || [],
    fuel_records: db.fuel_records || [],
    other_expenses: db.other_expenses || [],
    tyre_sets: db.tyre_sets || [],
    reference_intervals: db.reference_intervals || [],
    notification_settings: db.notification_settings || {
      enabled: true,
      default_warn_km: 1000,
      default_warn_hours: 30,
      default_warn_days: 30
    }
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
  const found = db.vehicles.find(v => String(v.id) === String(db.active_vehicle_id));
  return found || db.vehicles[0];
}

// --- SWITCH ACTIVE TYRE SET WITH MILEAGE TRACKING ---
export function switchActiveTyreSet(db, targetSeason) {
  const vehicle = getActiveVehicle(db);
  if (!vehicle) return db;
  const vId = String(vehicle.id);
  const currentKm = Number(vehicle.current_km) || 0;
  const today = new Date().toISOString().split('T')[0];

  const tyreSets = (db.tyre_sets || []).map(t => {
    if (String(t.vehicle_id) !== vId) return t;

    if (t.is_active) {
      // Currently active set being removed: add accumulated mileage
      const installKm = Number(t.install_mileage) || 0;
      const sessionKm = Math.max(0, currentKm - installKm);
      return {
        ...t,
        current_km: (Number(t.current_km) || 0) + sessionKm,
        is_active: false
      };
    } else if (t.season === targetSeason) {
      // Target set becoming active: record installation point
      return {
        ...t,
        is_active: true,
        install_date: today,
        install_mileage: currentKm
      };
    }
    return t;
  });

  return {
    ...db,
    tyre_sets: tyreSets
  };
}

// --- KPI, TCO & DASHBOARD CALCULATIONS ---
export function calculateDashboardStatus(db) {
  const vehicle = getActiveVehicle(db);
  if (!vehicle) {
    return {
      vehicle: null,
      kpi: {
        current_km: 0,
        current_hours: 0,
        total_spent: 0,
        to_spent: 0,
        fuel_spent: 0,
        expenses_spent: 0,
        cost_per_km: "0.00",
        cost_per_km_fuel: "0.00",
        cost_per_day: "0",
        avg_fuel_consumption: "0.0",
        avg_speed: "0.0",
        total_records: 0,
        attention_count: 0
      },
      consumables: [],
      active_tyre: null
    };
  }

  const vId = String(vehicle.id);
  const currentKm = Number(vehicle.current_km) || 0;
  const currentHours = parseEngineHours(vehicle.current_engine_hours);

  // 1. TO & Maintenance Expenses
  const toRecords = (db.maintenance_records || []).filter(r => String(r.vehicle_id || 'car_1') === vId);
  const toSpent = toRecords.reduce((sum, r) => sum + (Number(r.total_price) || 0), 0);

  // 2. Fuel Expenses & Consumption
  const fuelRecords = (db.fuel_records || []).filter(f => String(f.vehicle_id || 'car_1') === vId);
  fuelRecords.sort((a, b) => (Number(a.mileage) - Number(b.mileage)) || String(a.date).localeCompare(String(b.date)));
  
  const fuelSpent = fuelRecords.reduce((sum, f) => sum + (Number(f.total_price) || 0), 0);
  const totalLiters = fuelRecords.reduce((sum, f) => sum + (Number(f.liters) || 0), 0);

  // Calculate real fuel consumption between full tanks
  let avgFuelConsumption = "0.0";
  const fullTankRecords = fuelRecords.filter(f => f.is_full_tank !== false);
  if (fullTankRecords.length >= 2) {
    const first = fullTankRecords[0];
    const last = fullTankRecords[fullTankRecords.length - 1];
    const dist = (Number(last.mileage) - Number(first.mileage));
    // Liters consumed between first and last full tank
    const intermediateLiters = fullTankRecords.slice(1).reduce((s, r) => s + (Number(r.liters) || 0), 0);
    if (dist > 50 && intermediateLiters > 0) {
      avgFuelConsumption = ((intermediateLiters / dist) * 100).toFixed(1);
    }
  } else if (currentKm > 100 && totalLiters > 0) {
    avgFuelConsumption = ((totalLiters / currentKm) * 100).toFixed(1);
  }

  // 3. Other Expenses (Insurances, Taxes, Tolls, Washes)
  const otherExpenses = (db.other_expenses || []).filter(e => String(e.vehicle_id || 'car_1') === vId);
  const expensesSpent = otherExpenses.reduce((sum, e) => sum + (Number(e.total_price) || 0), 0);

  // 4. Total Cost of Ownership (TCO)
  const totalSpent = toSpent + fuelSpent + expensesSpent;
  const costPerKm = currentKm > 0 ? (totalSpent / currentKm).toFixed(2) : "0.00";
  const costPerKmFuel = currentKm > 0 ? (fuelSpent / currentKm).toFixed(2) : "0.00";
  const costPerKmTO = currentKm > 0 ? (toSpent / currentKm).toFixed(2) : "0.00";
  const avgSpeed = currentHours > 0 ? (currentKm / currentHours).toFixed(1) : "0.0";

  // Calculate days of ownership
  const pDate = vehicle.purchase_date ? new Date(vehicle.purchase_date) : new Date(new Date().getFullYear(), 0, 1);
  const now = new Date();
  const diffDays = Math.max(1, Math.round((now - pDate) / (1000 * 60 * 60 * 24)));
  const costPerDay = Math.round(totalSpent / diffDays);

  // 5. Active Tyre Set
  const tyreSets = (db.tyre_sets || []).filter(t => String(t.vehicle_id || 'car_1') === vId);
  const activeTyre = tyreSets.find(t => t.is_active) || (tyreSets.length > 0 ? tyreSets[0] : null);
  let liveTyreKm = 0;
  if (activeTyre) {
    const installKm = Number(activeTyre.install_mileage) || 0;
    const sessionKm = Math.max(0, currentKm - installKm);
    liveTyreKm = (Number(activeTyre.current_km) || 0) + sessionKm;
  }

  // 6. Dual-Trigger Consumables Calculations (Km + Engine Hours + Months)
  const enabledTrackers = (db.trackers || []).filter(t => t.enabled !== false);
  const consumables = [];

  enabledTrackers.forEach(tracker => {
    const matchTerm = (tracker.match || tracker.name).toLowerCase();
    const matching = toRecords.filter(r => {
      const name = (r.item_name || '').toLowerCase();
      const cat = (r.category || '').toLowerCase();
      const br = (r.brand || '').toLowerCase();
      return name.includes(matchTerm) || cat.includes(matchTerm) || br.includes(matchTerm);
    });

    matching.sort((a, b) => (Number(a.mileage) - Number(b.mileage)) || String(a.date).localeCompare(String(b.date)));
    const latest = matching.length > 0 ? matching[matching.length - 1] : null;

    const intervalKm = Number(tracker.interval_km) || 7500;
    const intervalH = parseEngineHours(tracker.interval_hours);
    const intervalMonths = Number(tracker.interval_months) || 12;

    const warnKm = Number(tracker.warn_km) || 1000;
    const warnH = parseEngineHours(tracker.warn_hours) || 30;
    const warnDays = Number(tracker.warn_days) || 30;

    const hasTrackerHistory = (tracker.last_service_odometer !== undefined && tracker.last_service_odometer !== null) || (tracker.last_km !== undefined && tracker.last_km !== null);

    if (latest || hasTrackerHistory) {
      const lastKm = latest ? (Number(latest.mileage) || 0) : (Number(tracker.last_km ?? tracker.last_service_odometer) || 0);
      const lastH = latest ? parseEngineHours(latest.engine_hours) : parseEngineHours(tracker.last_hours ?? tracker.last_service_hours);
      const rawDate = latest ? latest.date : (tracker.last_service_date || tracker.last_date);
      const lastDate = rawDate ? new Date(rawDate) : (vehicle.purchase_date ? new Date(vehicle.purchase_date) : new Date());

      const effCurrentKm = Math.max(currentKm, lastKm);
      const effCurrentH = Math.max(currentHours, lastH);

      // Distance remaining
      const nextKm = lastKm + intervalKm;
      const remKm = nextKm - effCurrentKm;

      // Hours remaining
      const nextH = intervalH > 0 ? (lastH + intervalH) : null;
      const remH = intervalH > 0 ? (nextH - effCurrentH) : null;

      // Days / Months remaining
      const daysPassed = Math.max(0, Math.round((now - lastDate) / (1000 * 60 * 60 * 24)));
      const intervalDays = Math.round(intervalMonths * 30.43);
      const remDays = Math.max(0, intervalDays - daysPassed);

      // Wear percentages
      const kmWear = Math.min(100, Math.round(((effCurrentKm - lastKm) / intervalKm) * 100));
      const hWear = (intervalH > 0) ? Math.min(100, Math.round(((effCurrentH - lastH) / intervalH) * 100)) : 0;
      const daysWear = (intervalMonths > 0) ? Math.min(100, Math.round((daysPassed / intervalDays) * 100)) : 0;

      const wearPercent = Math.max(kmWear, hWear, daysWear);

      let statusCode = 'ok';
      let statusText = 'В норме';

      if (remKm <= 0 || (remH !== null && remH <= 0) || (intervalMonths > 0 && remDays <= 0)) {
        statusCode = 'danger';
        statusText = 'Требуется замена';
      } else if (remKm <= warnKm || (remH !== null && warnH > 0 && remH <= warnH) || (intervalMonths > 0 && remDays <= warnDays)) {
        statusCode = 'warning';
        statusText = 'Скоро замена';
      }

      consumables.push({
        id: tracker.id,
        name: tracker.name,
        icon: tracker.icon || '⚙️',
        category: tracker.category || (latest && latest.category) || 'Двигатель',
        last_date: rawDate ? String(rawDate).split('T')[0] : '—',
        last_km: lastKm,
        last_hours: lastH,
        interval_km: intervalKm,
        interval_hours: intervalH,
        interval_months: intervalMonths,
        next_km: nextKm,
        next_hours: nextH,
        rem_km: remKm,
        rem_hours: remH !== null ? Math.round(remH) : null,
        rem_days: remDays,
        wear_percent: wearPercent,
        status_code: statusCode,
        status_text: statusText,
        brand: (latest && latest.brand) || tracker.brand || '',
        article: (latest && latest.article) || tracker.article || '',
        spec: tracker.spec || '',
        to_tag: (latest && latest.to_tag) || '—'
      });
    } else {
      const nextKm = currentKm + intervalKm;
      const remKm = intervalKm;
      const nextH = intervalH > 0 ? (currentHours + intervalH) : null;
      const remH = intervalH > 0 ? intervalH : null;
      const intervalDays = Math.round(intervalMonths * 30.43);

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
        interval_months: intervalMonths,
        next_km: nextKm,
        next_hours: nextH,
        rem_km: remKm,
        rem_hours: remH !== null ? Math.round(remH) : null,
        rem_days: intervalDays,
        wear_percent: 0,
        status_code: 'ok',
        status_text: 'В норме (новый)',
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
      to_spent: toSpent,
      fuel_spent: fuelSpent,
      expenses_spent: expensesSpent,
      cost_per_km: costPerKm,
      cost_per_km_fuel: costPerKmFuel,
      cost_per_km_to: costPerKmTO,
      cost_per_day: costPerDay,
      avg_fuel_consumption: avgFuelConsumption,
      avg_speed: avgSpeed,
      total_records: toRecords.length + fuelRecords.length + otherExpenses.length,
      attention_count: attentionCount
    },
    consumables,
    active_tyre: activeTyre ? { ...activeTyre, live_km: liveTyreKm } : null
  };
}

export function getTOGroups(db) {
  const vehicle = getActiveVehicle(db);
  if (!vehicle) return [];
  const vId = String(vehicle.id);
  const records = (db.maintenance_records || []).filter(r => String(r.vehicle_id || 'car_1') === vId);

  const groups = {};
  records.forEach(r => {
    const tag = r.to_tag || 'ТО';
    const sDate = r.date || '—';
    const sMileage = r.mileage !== undefined && r.mileage !== null ? r.mileage : '';
    const groupKey = r.group_id || `${tag}_${sDate}_${sMileage}`;

    if (!groups[groupKey]) {
      groups[groupKey] = {
        group_id: groupKey,
        to_tag: tag,
        date: r.date,
        mileage: r.mileage,
        engine_hours: parseEngineHours(r.engine_hours),
        total_cost: 0,
        parts: []
      };
    }
    groups[groupKey].total_cost += (Number(r.total_price) || 0);
    groups[groupKey].parts.push(r);
  });

  return Object.values(groups).sort((a, b) => (Number(b.mileage) - Number(a.mileage)) || String(b.date).localeCompare(String(a.date)));
}
