import * as XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getActiveVehicle, calculateDashboardStatus } from './storage';

export async function exportToExcel(db) {
  if (!db) throw new Error('База данных пуста');

  const statusData = calculateDashboardStatus(db);
  const vehicle = statusData.vehicle || getActiveVehicle(db);
  const vId = vehicle ? vehicle.id : 'car_1';

  const wb = XLSX.utils.book_new();

  // -------------------------------------------------------------
  // SHEET 1: СВОДКА АВТО И TCO (ПОЛНАЯ СТОИМОСТЬ ВЛАДЕНИЯ)
  // -------------------------------------------------------------
  const summaryRows = [
    ['Разработчик приложения', 'Александр Щеголев (@scanek)'],
    ['Версия базы данных', db.version || '2.6'],
    ['Дата выгрузки отчета', new Date().toLocaleString('ru-RU')],
    [''],
    ['--- ОСНОВНЫЕ ДАННЫЕ АВТОМОБИЛЯ ---', ''],
    ['Автомобиль', vehicle?.name || '—'],
    ['Марка / Модель', (vehicle?.brand || '') + ' ' + (vehicle?.model || '')],
    ['Госномер', vehicle?.plate || '—'],
    ['Двигатель', vehicle?.engine || '—'],
    ['Год выпуска', vehicle?.year || '—'],
    ['VIN-номер', vehicle?.vin || '—'],
    ['Допуск масла', vehicle?.oil_spec || '—'],
    [''],
    ['--- ЭКСПЛУАТАЦИОННЫЕ ПОКАЗАТЕЛИ ---', ''],
    ['Текущий пробег (км)', Number(statusData.kpi.current_km)],
    ['Наработка моточасов (м/ч)', Number(statusData.kpi.current_hours)],
    ['Средняя скорость (км/ч)', Number(statusData.kpi.avg_speed)],
    ['Средний расход топлива (л/100 км)', Number(statusData.kpi.avg_fuel_consumption)],
    [''],
    ['--- ПОЛНАЯ СТОИМОСТЬ ВЛАДЕНИЯ (TCO) ---', ''],
    ['Общие затраты (руб)', Number(statusData.kpi.total_spent)],
    ['Затраты на ТО и запчасти (руб)', Number(statusData.kpi.to_spent)],
    ['Затраты на топливо (руб)', Number(statusData.kpi.fuel_spent)],
    ['Страховки и прочие расходы (руб)', Number(statusData.kpi.expenses_spent)],
    ['Стоимость 1 км пути (общая)', Number(statusData.kpi.cost_per_km)],
    ['Стоимость 1 км (топливо)', Number(statusData.kpi.cost_per_km_fuel)],
    ['Стоимость 1 дня владения (руб/день)', Number(statusData.kpi.cost_per_day)],
    ['Позиций, требующих внимания', Number(statusData.kpi.attention_count)]
  ];

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
  wsSummary['!cols'] = [{ wch: 36 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Сводка и TCO');

  // -------------------------------------------------------------
  // SHEET 2: СВЕТОФОР РАСХОДНИКОВ И РЕГЛАМЕНТЫ
  // -------------------------------------------------------------
  const consumableRows = [
    [
      'Расходник / Узел',
      'Категория',
      'Статус',
      'Износ (%)',
      'Остаток (км)',
      'Остаток (м/ч)',
      'Остаток (дн)',
      'Интервал (км)',
      'Интервал (м/ч)',
      'Интервал (мес)',
      'Посл. замена (км)',
      'Посл. дата',
      'Бренд / Артикул'
    ]
  ];

  statusData.consumables.forEach(c => {
    consumableRows.push([
      c.name,
      c.category,
      c.status_text,
      c.wear_percent,
      c.rem_km,
      c.rem_hours !== null ? c.rem_hours : '—',
      c.rem_days !== undefined ? c.rem_days : '—',
      c.interval_km,
      c.interval_hours > 0 ? c.interval_hours : '—',
      c.interval_months > 0 ? c.interval_months : '—',
      c.last_km > 0 ? c.last_km : '—',
      c.last_date,
      [c.brand, c.article].filter(Boolean).join(' / ') || '—'
    ]);
  });

  const wsConsumables = XLSX.utils.aoa_to_sheet(consumableRows);
  wsConsumables['!cols'] = [
    { wch: 30 }, { wch: 15 }, { wch: 18 }, { wch: 10 },
    { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 14 },
    { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 14 }, { wch: 25 }
  ];
  XLSX.utils.book_append_sheet(wb, wsConsumables, 'Светофор ТО');

  // -------------------------------------------------------------
  // SHEET 3: ЖУРНАЛ ВСЕХ ЗАПИСЕЙ ТО
  // -------------------------------------------------------------
  const toRecords = (db.maintenance_records || []).filter(r => (r.vehicle_id || 'car_1') === vId);
  const toLogRows = [
    [
      'Метка ТО',
      'Дата',
      'Пробег (км)',
      'Моточасы (м/ч)',
      'Категория',
      'Наименование детали / работы',
      'Бренд',
      'Артикул',
      'Кол-во',
      'Ед.',
      'Цена за ед.',
      'Сумма (руб)',
      'След. замена (км)',
      'Магазин / Сервис',
      'Заметки'
    ]
  ];

  toRecords.forEach(r => {
    toLogRows.push([
      r.to_tag || '—',
      r.date || '—',
      r.mileage || 0,
      r.engine_hours || '—',
      r.category || 'Двигатель',
      r.item_name || '—',
      r.brand || '—',
      r.article || '—',
      r.quantity || 1,
      r.unit || 'шт',
      r.price_per_unit || 0,
      r.total_price || 0,
      r.next_km || '—',
      r.store || '—',
      r.note || '—'
    ]);
  });

  const wsTOLog = XLSX.utils.aoa_to_sheet(toLogRows);
  wsTOLog['!cols'] = [
    { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 14 },
    { wch: 15 }, { wch: 32 }, { wch: 16 }, { wch: 16 },
    { wch: 8 }, { wch: 6 }, { wch: 12 }, { wch: 14 },
    { wch: 16 }, { wch: 16 }, { wch: 25 }
  ];
  XLSX.utils.book_append_sheet(wb, wsTOLog, 'Журнал ТО');

  // -------------------------------------------------------------
  // SHEET 4: ЗАПРАВКИ И ТОПЛИВО
  // -------------------------------------------------------------
  const fuelRecords = (db.fuel_records || []).filter(f => (f.vehicle_id || 'car_1') === vId);
  const fuelRows = [
    [
      'Дата',
      'Пробег (км)',
      'Объем (л)',
      'Цена за литр (руб)',
      'Сумма (руб)',
      'Тип топлива',
      'Полный бак',
      'АЗС / Сеть',
      'Заметки'
    ]
  ];

  fuelRecords.forEach(f => {
    fuelRows.push([
      f.date || '—',
      f.mileage || 0,
      f.liters || 0,
      f.price_per_liter || 0,
      f.total_price || 0,
      f.fuel_type || 'АИ-95',
      f.is_full_tank ? 'Да' : 'Нет',
      f.station || '—',
      f.note || '—'
    ]);
  });

  const wsFuel = XLSX.utils.aoa_to_sheet(fuelRows);
  wsFuel['!cols'] = [
    { wch: 12 }, { wch: 14 }, { wch: 12 }, { wch: 18 },
    { wch: 14 }, { wch: 14 }, { wch: 12 }, { wch: 18 }, { wch: 25 }
  ];
  XLSX.utils.book_append_sheet(wb, wsFuel, 'Заправки');

  // -------------------------------------------------------------
  // SHEET 5: ПРОЧИЕ РАСХОДЫ И СТРАХОВАНИЕ
  // -------------------------------------------------------------
  const otherExpenses = (db.other_expenses || []).filter(e => (e.vehicle_id || 'car_1') === vId);
  const expenseRows = [
    [
      'Дата',
      'Пробег (км)',
      'Категория',
      'Наименование / Описание',
      'Сумма (руб)',
      'Срок действия до',
      'Заметки'
    ]
  ];

  otherExpenses.forEach(e => {
    expenseRows.push([
      e.date || '—',
      e.mileage || 0,
      e.category || 'Прочее',
      e.title || '—',
      e.total_price || 0,
      e.expiry_date || '—',
      e.note || '—'
    ]);
  });

  const wsExpenses = XLSX.utils.aoa_to_sheet(expenseRows);
  wsExpenses['!cols'] = [
    { wch: 12 }, { wch: 14 }, { wch: 18 }, { wch: 32 },
    { wch: 14 }, { wch: 16 }, { wch: 25 }
  ];
  XLSX.utils.book_append_sheet(wb, wsExpenses, 'Прочие расходы');

  // -------------------------------------------------------------
  // SHEET 6: КОМПЛЕКТЫ ШИН И КОЛЕСА
  // -------------------------------------------------------------
  const tyreSets = (db.tyre_sets || []).filter(t => (t.vehicle_id || 'car_1') === vId);
  const tyreRows = [
    [
      'Комплект',
      'Сезон',
      'Тип',
      'Модель шины',
      'Размерность',
      'Пробег на комплекте (км)',
      'Остаток протектора (мм)',
      'Установлен сейчас'
    ]
  ];

  tyreSets.forEach(t => {
    tyreRows.push([
      t.name || '—',
      t.season === 'summer' ? 'Лето' : 'Зима',
      t.type === 'stud' ? 'Шипы' : (t.type === 'friction' ? 'Липучка' : 'Шоссе'),
      t.brand_model || '—',
      t.size || '—',
      t.current_km || 0,
      t.tread_depth_mm || 0,
      t.is_active ? 'Да (Активен)' : 'На хранении'
    ]);
  });

  const wsTyres = XLSX.utils.aoa_to_sheet(tyreRows);
  wsTyres['!cols'] = [
    { wch: 25 }, { wch: 10 }, { wch: 12 }, { wch: 28 },
    { wch: 18 }, { wch: 24 }, { wch: 22 }, { wch: 16 }
  ];
  XLSX.utils.book_append_sheet(wb, wsTyres, 'Шины и Колеса');

  // --- WRITE FILE AND SHARE ---
  const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
  const cleanBrand = (vehicle?.brand || 'auto').replace(/[^a-zA-Zа-яА-Я0-9_-]/g, '_');
  const cleanModel = (vehicle?.model || '').replace(/[^a-zA-Zа-яА-Я0-9_-]/g, '_');
  const filename = 'auto_to_report_' + cleanBrand + '_' + (cleanModel || 'car') + '.xlsx';
  const fileUri = FileSystem.documentDirectory + filename;

  await FileSystem.writeAsStringAsync(fileUri, wbout, {
    encoding: FileSystem.EncodingType.Base64
  });

  const isAvailable = await Sharing.isAvailableAsync();
  if (isAvailable) {
    await Sharing.shareAsync(fileUri, {
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      dialogTitle: 'Экспорт отчета по автомобилю: ' + filename,
      UTI: 'com.microsoft.excel.xlsx'
    });
    return { success: true, filename, fileUri };
  } else {
    return { success: true, filename, fileUri, shared: false };
  }
}
