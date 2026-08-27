import AsyncStorage from '@react-native-async-storage/async-storage';

const DB_KEY = '@car_maintenance_db_v1';

export const INITIAL_DB = {
  active_vehicle_id: "car_1",
  admin_password: "admin",
  theme: "dark",
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
      id: "coolant",
      name: "Охлаждающая жидкость (Антифриз)",
      category: "Охлаждение",
      match: "антифриз",
      interval_km: 50000,
      interval_hours: 0,
      warn_km: 5000,
      warn_hours: 0,
      spec: "G12+ / Лобридный OAT (5.5 - 6.0 л)",
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
      item_name: "Кольцо пробки",
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
      item_name: "Фильтр салона",
      brand: "CN1305K",
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
      date: "2026-07-22",
      engine_hours: 772,
      mileage: 25340,
      category: "Двигатель",
      item_name: "Масло Лукойл Genesis JP 0W-20",
      brand: "Лукойл Genesis JP",
      article: "1658134508",
      quantity: 4.5,
      unit: "л",
      price_type: "total",
      price_per_unit: 3634,
      total_price: 3634,
      interval_km: 7500,
      interval_hours: 250,
      next_km: 32840,
      next_hours: 1022,
      note: "Плановая замена",
      store: "Ozon"
    },
    {
      id: 7,
      vehicle_id: "car_1",
      to_tag: "ТО-3",
      date: "2026-07-22",
      engine_hours: 772,
      mileage: 25340,
      category: "Фильтры",
      item_name: "Фильтр масляный VIC",
      brand: "VIC C-933",
      article: "16510-61A31",
      quantity: 1.0,
      unit: "шт",
      price_type: "total",
      price_per_unit: 602,
      total_price: 602,
      interval_km: 7500,
      interval_hours: 250,
      next_km: 32840,
      next_hours: 1022,
      note: "Плановая замена",
      store: "Ozon"
    },
    {
      id: 8,
      vehicle_id: "car_1",
      to_tag: "ТО-3",
      date: "2026-07-22",
      engine_hours: 772,
      mileage: 25340,
      category: "Охлаждение",
      item_name: "Антифриз Felix G12+ (канистра 5 л)",
      brand: "Felix G12+",
      article: "58888973218",
      quantity: 5.0,
      unit: "л",
      price_type: "total",
      price_per_unit: 1625,
      total_price: 1625,
      interval_km: 50000,
      interval_hours: 0,
      next_km: 75340,
      next_hours: 0,
      note: "Плановая замена",
      store: "Ozon"
    },
    {
      id: 9,
      vehicle_id: "car_1",
      to_tag: "ТО-3",
      date: "2026-07-22",
      engine_hours: 772,
      mileage: 25340,
      category: "Зажигание",
      item_name: "Свечи зажигания (комплект 4 шт)",
      brand: "CHANGAN OEM",
      article: "3707010-NE01",
      quantity: 4.0,
      unit: "шт",
      price_type: "total",
      price_per_unit: 1400,
      total_price: 1400,
      interval_km: 30000,
      interval_hours: 0,
      next_km: 55340,
      next_hours: 0,
      note: "Плановая замена",
      store: "Дилер"
    }
  ]
};

export async function loadDatabase() {
  try {
    const jsonStr = await AsyncStorage.getItem(DB_KEY);
    if (!jsonStr) {
      await AsyncStorage.setItem(DB_KEY, JSON.stringify(INITIAL_DB));
      return INITIAL_DB;
    }
    const parsed = JSON.parse(jsonStr);
    return parsed;
  } catch (e) {
    console.error('Failed to load local database', e);
    return INITIAL_DB;
  }
}

export async function saveDatabase(db) {
  try {
    await AsyncStorage.setItem(DB_KEY, JSON.stringify(db));
    return true;
  } catch (e) {
    console.error('Failed to save local database', e);
    return false;
  }
}

export async function resetDatabase() {
  try {
    await AsyncStorage.setItem(DB_KEY, JSON.stringify(INITIAL_DB));
    return INITIAL_DB;
  } catch (e) {
    console.error('Failed to reset local database', e);
    return INITIAL_DB;
  }
}

export function getActiveVehicle(db) {
  if (!db || !db.vehicles || db.vehicles.length === 0) return null;
  const active = db.vehicles.find(v => v.id === db.active_vehicle_id);
  return active || db.vehicles[0];
}

export function calculateDashboardStatus(db) {
  const vehicle = getActiveVehicle(db);
  if (!vehicle) return { vehicle: {}, kpi: {}, consumables: [] };

  const vId = vehicle.id;
  const records = (db.maintenance_records || []).filter(r => (r.vehicle_id || 'car_1') === vId);
  const trackers = (db.trackers || []).filter(t => t.enabled !== false);

  const currentKm = Number(vehicle.current_km) || 0;
  const currentHours = Number(vehicle.current_engine_hours) || 0;

  const totalSpent = records.reduce((sum, r) => sum + (Number(r.total_price) || 0), 0);
  const costPerKm = currentKm > 0 ? Math.round((totalSpent / currentKm) * 100) / 100 : 0;
  const avgSpeed = currentHours > 0 ? Math.round((currentKm / currentHours) * 10) / 10 : 0;

  const consumables = [];

  trackers.forEach(tracker => {
    const keyword = (tracker.match || tracker.name || '').toLowerCase();
    const matching = records.filter(r => r.item_name && r.item_name.toLowerCase().includes(keyword));
    matching.sort((a, b) => (a.mileage - b.mileage) || String(a.date).localeCompare(String(b.date)));
    const latest = matching.length > 0 ? matching[matching.length - 1] : null;

    const intervalKm = Number(tracker.interval_km) || 7500;
    const intervalH = Number(tracker.interval_hours) || 0;
    const warnKm = Number(tracker.warn_km) || 1500;
    const warnH = Number(tracker.warn_hours) || 0;

    if (latest) {
      const lastKm = Number(latest.mileage) || 0;
      const lastH = Number(latest.engine_hours) || 0;
      const recIntKm = Number(latest.interval_km) || intervalKm;
      const recIntH = Number(latest.interval_hours) || intervalH;

      // Exact user formulas:
      // eff_current_km = max(current_km, last_km)
      // next_km = last_km + interval_km
      // rem_km = next_km - eff_current_km
      // wear_percent = min(100, (eff_current_km - last_km) / interval_km * 100)
      const effCurrentKm = Math.max(currentKm, lastKm);
      const nextKm = lastKm + recIntKm;
      const remKm = nextKm - effCurrentKm;
      const wearPercent = recIntKm > 0 ? Math.min(100, Math.max(0, Math.round(((effCurrentKm - lastKm) / recIntKm) * 1000) / 10)) : 0;

      // Engine hours wear
      let remH = null;
      let nextH = null;
      if (recIntH > 0) {
        const effCurrentH = Math.max(currentHours, lastH);
        nextH = lastH + recIntH;
        remH = nextH - effCurrentH;
      }

      // Statuses:
      // 🟢 В норме: rem_km > warn_km
      // 🟡 Скоро замена: rem_km <= warn_km
      // 🔴 Требуется замена: rem_km <= 0
      let statusCode = 'ok';
      let statusText = 'В норме';

      const isDangerKm = remKm <= 0;
      const isDangerH = remH !== null && remH <= 0;
      const isWarnKm = remKm <= warnKm;
      const isWarnH = remH !== null && warnH > 0 && remH <= warnH;

      if (isDangerKm || isDangerH) {
        statusCode = 'danger';
        statusText = 'Требуется замена';
      } else if (isWarnKm || isWarnH) {
        statusCode = 'warning';
        statusText = 'Скоро замена';
      }

      consumables.push({
        id: tracker.id,
        name: tracker.name,
        icon: tracker.icon || '⚙️',
        category: tracker.category || 'Двигатель',
        last_date: latest.date,
        last_km: lastKm,
        last_hours: lastH,
        interval_km: recIntKm,
        interval_hours: recIntH,
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
      // No replacement record yet
      const nextKm = intervalKm;
      const remKm = intervalKm - currentKm;
      const nextH = intervalH > 0 ? intervalH : null;
      const remH = intervalH > 0 ? intervalH - currentHours : null;

      let statusCode = 'ok';
      let statusText = 'Нет записей';
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

  // Sort groups by mileage descending (latest TO first)
  return Object.values(groups).sort((a, b) => (b.mileage - a.mileage) || String(b.date).localeCompare(String(a.date)));
}

