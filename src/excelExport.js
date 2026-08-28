import * as XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { getActiveVehicle, calculateDashboardStatus, getTOGroups } from './storage';

export async function exportToExcel(db) {
  try {
    const vehicle = getActiveVehicle(db);
    const statusData = calculateDashboardStatus(db);
    const toGroups = getTOGroups(db);
    const records = (db.maintenance_records || []).filter(r => (r.vehicle_id || 'car_1') === vehicle?.id);

    const wb = XLSX.utils.book_new();

    // ==========================================
    // SHEET 1: СВОДКА И KPI
    // ==========================================
    const summaryRows = [
      ['ОТЧЕТ ПО АВТОМОБИЛЮ И ТЕХНИЧЕСКОМУ ОБСЛУЖИВАНИЮ (АВТО ТО)', ''],
      ['Дата формирования отчета', new Date().toLocaleString('ru-RU')],
      ['', ''],
      ['ПАРАМЕТРЫ АВТОМОБИЛЯ', ''],
      ['Наименование авто', vehicle?.name || 'Автомобиль'],
      ['Марка', vehicle?.brand || '—'],
      ['Модель', vehicle?.model || '—'],
      ['Госномер', vehicle?.plate || '—'],
      ['Год выпуска', vehicle?.year || '—'],
      ['Двигатель / КПП', vehicle?.engine || '—'],
      ['VIN номер', vehicle?.vin || '—'],
      ['Рекомендованное масло / Допуск', vehicle?.oil_spec || '—'],
      ['', ''],
      ['КЛЮЧЕВЫЕ ПОКАЗАТЕЛИ (KPI)', ''],
      ['Текущий пробег (км)', statusData.kpi.current_km || 0],
      ['Текущие моточасы (м/ч)', statusData.kpi.current_hours || 0],
      ['Средняя скорость (км/ч)', Number(statusData.kpi.avg_speed) || 0],
      ['Всего проведено ТО', toGroups.length],
      ['Всего заменено деталей (позиций)', records.length],
      ['Общая сумма затрат на ТО (₽)', statusData.kpi.total_spent || 0],
      ['Стоимость 1 км пробега (₽/км)', Number(statusData.kpi.cost_per_km) || 0],
      ['Позиций, требующих внимания', statusData.kpi.attention_count || 0]
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
    wsSummary['!cols'] = [{ wch: 35 }, { wch: 35 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Сводка авто');

    // ==========================================
    // SHEET 2: РЕСУРС РАСХОДНИКОВ («СВЕТОФОР»)
    // ==========================================
    const consumableRows = [
      [
        'Расходник / Узел',
        'Категория',
        'Статус',
        'Износ (%)',
        'Остаток ресурса (км)',
        'Остаток (м/ч)',
        'Замена на одометре (км)',
        'Интервал (км)',
        'Интервал (м/ч)',
        'Последняя замена (ТО)',
        'Дата посл. замены',
        'Пробег посл. замены (км)',
        'Бренд / Марка',
        'Артикул',
        'Спецификация / Допуск'
      ]
    ];

    statusData.consumables.forEach(c => {
      consumableRows.push([
        c.name,
        c.category,
        c.status_text,
        c.wear_percent + '%',
        c.rem_km,
        c.rem_hours !== null ? c.rem_hours : '—',
        c.next_km,
        c.interval_km,
        c.interval_hours > 0 ? c.interval_hours : '—',
        c.to_tag || '—',
        c.last_date || '—',
        c.last_km || 0,
        c.brand || '—',
        c.article || '—',
        c.spec || '—'
      ]);
    });

    const wsConsumables = XLSX.utils.aoa_to_sheet(consumableRows);
    wsConsumables['!cols'] = [
      { wch: 28 }, { wch: 16 }, { wch: 18 }, { wch: 12 },
      { wch: 22 }, { wch: 15 }, { wch: 24 }, { wch: 15 },
      { wch: 15 }, { wch: 22 }, { wch: 18 }, { wch: 24 },
      { wch: 20 }, { wch: 18 }, { wch: 30 }
    ];
    XLSX.utils.book_append_sheet(wb, wsConsumables, 'Светофор расходников');

    // ==========================================
    // SHEET 3: ИСТОРИЯ ТО (ГРУППЫ)
    // ==========================================
    const toRows = [
      [
        'Событие ТО',
        'Дата проведения',
        'Пробег (км)',
        'Моточасы (м/ч)',
        'Кол-во замененных деталей',
        'Итоговая стоимость ТО (₽)',
        'Список замененных деталей'
      ]
    ];

    toGroups.forEach(g => {
      const partsSummary = g.parts.map(p => p.item_name + ' (' + (p.brand || '') + ' ' + (p.article ? '[' + p.article + ']' : '') + ') - ' + p.total_price + ' ₽').join('; ');
      toRows.push([
        g.to_tag,
        g.date,
        g.mileage,
        g.engine_hours,
        g.parts.length,
        g.total_cost,
        partsSummary
      ]);
    });

    const wsTO = XLSX.utils.aoa_to_sheet(toRows);
    wsTO['!cols'] = [
      { wch: 15 }, { wch: 16 }, { wch: 14 }, { wch: 16 },
      { wch: 26 }, { wch: 24 }, { wch: 60 }
    ];
    XLSX.utils.book_append_sheet(wb, wsTO, 'Журнал ТО');

    // ==========================================
    // SHEET 4: ДЕТАЛЬНЫЙ РЕЕСТР ВСЕХ ЗАПЧАСТЕЙ
    // ==========================================
    const partsRows = [
      [
        'ID',
        'Событие ТО',
        'Дата',
        'Пробег (км)',
        'Моточасы (м/ч)',
        'Категория',
        'Наименование детали',
        'Бренд / Марка',
        'Артикул',
        'Количество',
        'Ед. изм.',
        'Тип цены',
        'Цена за ед. (₽)',
        'Сумма (₽)',
        'Магазин / Поставщик',
        'Примечание'
      ]
    ];

    records.forEach((r, idx) => {
      partsRows.push([
        r.id || (idx + 1),
        r.to_tag || '—',
        r.date || '—',
        r.mileage || 0,
        r.engine_hours || 0,
        r.category || '—',
        r.item_name || '—',
        r.brand || '—',
        r.article || '—',
        r.quantity || 1,
        r.unit || 'шт',
        r.price_type === 'unit' ? 'За 1 ед.' : 'За позицию',
        r.price_per_unit || r.total_price || 0,
        r.total_price || 0,
        r.store || '—',
        r.note || ''
      ]);
    });

    const wsParts = XLSX.utils.aoa_to_sheet(partsRows);
    wsParts['!cols'] = [
      { wch: 6 }, { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 16 },
      { wch: 16 }, { wch: 30 }, { wch: 20 }, { wch: 18 }, { wch: 12 },
      { wch: 10 }, { wch: 14 }, { wch: 16 }, { wch: 14 }, { wch: 20 }, { wch: 25 }
    ];
    XLSX.utils.book_append_sheet(wb, wsParts, 'Реестр запчастей');

    // Generate Excel base64 string
    const base64 = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });

    // Clean safe filename
    const carNameClean = (vehicle?.name || 'Auto').replace(/[^a-zA-Zа-яА-Я0-9_-]/g, '_');
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = 'AutoTO_Report_' + carNameClean + '_' + dateStr + '.xlsx';
    const fileUri = FileSystem.documentDirectory + filename;

    // Save to local device file
    await FileSystem.writeAsStringAsync(fileUri, base64, {
      encoding: FileSystem.EncodingType.Base64
    });

    // Check sharing availability and share
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dialogTitle: 'Отчет Excel: ' + filename,
        UTI: 'com.microsoft.excel.xlsx'
      });
      return { success: true, filename, fileUri };
    } else {
      return { success: true, filename, fileUri, shared: false };
    }
  } catch (error) {
    console.error('Failed to export Excel:', error);
    throw error;
  }
}
