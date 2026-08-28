import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Dimensions
} from 'react-native';
import {
  loadDatabase,
  saveDatabase,
  resetDatabase,
  getActiveVehicle,
  calculateDashboardStatus,
  getTOGroups,
  DEFAULT_CLEAN_DB,
  DEMO_DB,
  exportBackupFile,
  pickAndImportBackupFile,
  normalizeImportedBackup,
  switchActiveTyreSet
} from './src/storage';
import { exportToExcel } from './src/excelExport';
import { requestNotificationPermissions, sendTestNotification, checkAndNotifyUpcomingTO } from './src/notifications';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function App() {
  const [db, setDb] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'timeline', 'parts', 'garage', 'settings'
  const [dashboardView, setDashboardView] = useState('all'); // 'all', 'traffic-light', 'fuel', 'tco', 'charts'
  const [timelineFilter, setTimelineFilter] = useState('all'); // 'all', 'to', 'fuel', 'expense'
  const [theme, setTheme] = useState('dark');
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  // Notification states
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [notifWarnKm, setNotifWarnKm] = useState('1000');
  const [notifWarnHours, setNotifWarnHours] = useState('30');
  const [notifWarnDays, setNotifWarnDays] = useState('30');

  // Onboarding Wizard Modal
  const [onboardingModalVisible, setOnboardingModalVisible] = useState(false);
  const [obBrand, setObBrand] = useState('');
  const [obModel, setObModel] = useState('');
  const [obPlate, setObPlate] = useState('');
  const [obYear, setObYear] = useState(String(new Date().getFullYear()));
  const [obEngine, setObEngine] = useState('');
  const [obKm, setObKm] = useState('0');
  const [obHours, setObHours] = useState('0');
  const [obOil, setObOil] = useState('');

  // Mileage Modal
  const [mileageModalVisible, setMileageModalVisible] = useState(false);
  const [inputKm, setInputKm] = useState('');
  const [inputHours, setInputHours] = useState('');
  const [mileageHint, setMileageHint] = useState(null);

  // TO Modal
  const [toModalVisible, setToModalVisible] = useState(false);
  const [editingToTag, setEditingToTag] = useState('');
  const [toTag, setToTag] = useState('');
  const [toDate, setToDate] = useState('');
  const [toKm, setToKm] = useState('');
  const [toHours, setToHours] = useState('');
  const [toParts, setToParts] = useState([]);

  // Fuel Modal
  const [fuelModalVisible, setFuelModalVisible] = useState(false);
  const [editingFuelId, setEditingFuelId] = useState(null);
  const [fuelDate, setFuelDate] = useState('');
  const [fuelKm, setFuelKm] = useState('');
  const [fuelLiters, setFuelLiters] = useState('');
  const [fuelPricePerLiter, setFuelPricePerLiter] = useState('');
  const [fuelTotalPrice, setFuelTotalPrice] = useState('');
  const [fuelType, setFuelType] = useState('АИ-95');
  const [fuelIsFullTank, setFuelIsFullTank] = useState(true);
  const [fuelStation, setFuelStation] = useState('');
  const [fuelNote, setFuelNote] = useState('');

  // Expense Modal (Insurances, Taxes, Washes, Tolls, etc.)
  const [expenseModalVisible, setExpenseModalVisible] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [expDate, setExpDate] = useState('');
  const [expKm, setExpKm] = useState('');
  const [expCategory, setExpCategory] = useState('Страховка');
  const [expTitle, setExpTitle] = useState('');
  const [expTotal, setExpTotal] = useState('');
  const [expExpiryDate, setExpExpiryDate] = useState('');
  const [expNote, setExpNote] = useState('');

  // Tyre Set Modal
  const [tyreModalVisible, setTyreModalVisible] = useState(false);
  const [editingTyreId, setEditingTyreId] = useState(null);
  const [tyreName, setTyreName] = useState('');
  const [tyreSeason, setTyreSeason] = useState('summer'); // 'summer', 'winter'
  const [tyreType, setTyreType] = useState('stud'); // 'stud', 'friction', 'road'
  const [tyreBrandModel, setTyreBrandModel] = useState('');
  const [tyreSize, setTyreSize] = useState('225/55 R19');
  const [tyreKm, setTyreKm] = useState('0');
  const [tyreTread, setTyreTread] = useState('8.0');

  // Garage Modal
  const [garageModalVisible, setGarageModalVisible] = useState(false);
  const [editCarId, setEditCarId] = useState(null);
  const [carBrand, setCarBrand] = useState('');
  const [carModel, setCarModel] = useState('');
  const [carPlate, setCarPlate] = useState('');
  const [carEngine, setCarEngine] = useState('');
  const [carYear, setCarYear] = useState('');
  const [carVin, setCarVin] = useState('');
  const [carOil, setCarOil] = useState('');
  const [carPurchasePrice, setCarPurchasePrice] = useState('');
  const [carPurchaseDate, setCarPurchaseDate] = useState('');

  // Tracker / Regulation Modal
  const [trackerModalVisible, setTrackerModalVisible] = useState(false);
  const [editingTrackerId, setEditingTrackerId] = useState(null);
  const [trName, setTrName] = useState('');
  const [trCategory, setTrCategory] = useState('Двигатель');
  const [trMatch, setTrMatch] = useState('');
  const [trKm, setTrKm] = useState('7500');
  const [trHours, setTrHours] = useState('250');
  const [trMonths, setTrMonths] = useState('12');
  const [trWarnKm, setTrWarnKm] = useState('1000');
  const [trWarnHours, setTrWarnHours] = useState('30');
  const [trWarnDays, setTrWarnDays] = useState('30');
  const [trSpec, setTrSpec] = useState('');
  const [trBrand, setTrBrand] = useState('');
  const [trArticle, setTrArticle] = useState('');
  const [trIcon, setTrIcon] = useState('⚙️');

  // Backup Import Modal
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    const loaded = await loadDatabase();
    setDb(loaded);
    if (loaded && loaded.theme) setTheme(loaded.theme);
    if (loaded && loaded.notification_settings) {
      setNotifEnabled(loaded.notification_settings.enabled !== false);
      setNotifWarnKm(String(loaded.notification_settings.default_warn_km || '1000'));
      setNotifWarnHours(String(loaded.notification_settings.default_warn_hours || '30'));
      setNotifWarnDays(String(loaded.notification_settings.default_warn_days || '30'));
    }

    // Onboarding if empty
    if (!loaded || loaded.is_onboarded === false) {
      const v = (loaded && loaded.vehicles && loaded.vehicles[0]) || {};
      setObBrand(v.brand || '');
      setObModel(v.model || '');
      setObPlate(v.plate || '');
      setObYear(v.year ? String(v.year) : String(new Date().getFullYear()));
      setObEngine(v.engine || '');
      setObKm(v.current_km ? String(v.current_km) : '0');
      setObHours(v.current_engine_hours ? String(v.current_engine_hours) : '0');
      setObOil(v.oil_spec || '');
      setOnboardingModalVisible(true);
    }

    // Auto-check upcoming alerts
    setTimeout(() => {
      checkAndNotifyUpcomingTO(loaded);
    }, 1500);
  };

  const updateDb = async (newDb) => {
    setDb(newDb);
    await saveDatabase(newDb);
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    if (db) {
      updateDb({ ...db, theme: next });
    }
  };

  // --- NOTIFICATION HANDLERS ---
  const handleSaveNotifSettings = (applyToAllTrackers = false) => {
    const km = Number(notifWarnKm) || 1000;
    const hours = Number(notifWarnHours) || 30;
    const days = Number(notifWarnDays) || 30;

    let updatedTrackers = db.trackers || [];
    if (applyToAllTrackers) {
      updatedTrackers = updatedTrackers.map(t => ({
        ...t,
        warn_km: km,
        warn_hours: t.interval_hours > 0 ? hours : 0,
        warn_days: days
      }));
    }

    const updatedDb = {
      ...db,
      trackers: updatedTrackers,
      notification_settings: {
        enabled: notifEnabled,
        default_warn_km: km,
        default_warn_hours: hours,
        default_warn_days: days
      }
    };

    updateDb(updatedDb);
    if (applyToAllTrackers) {
      Alert.alert('Настройки сохранены', 'Пороги предупреждения (' + km + ' км / ' + hours + ' м/ч / ' + days + ' дн.) применены ко всем регламентам ТО!');
    } else {
      Alert.alert('Успешно', 'Параметры уведомлений обновлены!');
    }

    checkAndNotifyUpcomingTO(updatedDb);
  };

  const handleTestNotification = async () => {
    try {
      const carName = activeVehicle?.name || 'Мой автомобиль';
      await sendTestNotification(carName, notifWarnKm, notifWarnHours);
      Alert.alert('Уведомление отправлено', 'Проверьте шторку уведомлений на вашем смартфоне 🔔');
    } catch (e) {
      Alert.alert('Ошибка отправки', e.message);
    }
  };

  // --- EXCEL EXPORT HANDLER ---
  const handleDownloadExcel = async () => {
    try {
      setIsExportingExcel(true);
      const result = await exportToExcel(db);
      setIsExportingExcel(false);
      if (result && result.shared === false) {
        Alert.alert('Файл сформирован', 'Отчет сохранен: ' + result.filename);
      }
    } catch (e) {
      setIsExportingExcel(false);
      Alert.alert('Ошибка экспорта', 'Не удалось сформировать Excel файл: ' + e.message);
    }
  };

  // --- BACKUP EXPORT & IMPORT ---
  const handleExportBackup = async () => {
    try {
      const res = await exportBackupFile(db);
      if (res && res.shared === false) {
        Alert.alert('Файл сохранен', 'Резервная копия сохранена в файл: ' + res.filename);
      }
    } catch (e) {
      Alert.alert('Ошибка экспорта', 'Не удалось экспортировать файл: ' + e.message);
    }
  };

  const handlePickAndImportBackup = async () => {
    try {
      const res = await pickAndImportBackupFile();
      if (res.canceled) return;
      if (res.success && res.db) {
        updateDb(res.db);
        setImportModalVisible(false);
        const carCount = res.db.vehicles?.length || 1;
        const recCount = res.db.maintenance_records?.length || 0;
        Alert.alert('Успешно', 'База данных успешно загружена из файла "' + res.filename + '"!\n\n🚗 Автомобилей: ' + carCount + '\n📋 Записей ТО: ' + recCount + '\n⛽ Заправок: ' + (res.db.fuel_records?.length || 0));
      }
    } catch (e) {
      Alert.alert('Ошибка импорта', 'Не удалось загрузить бэкап: ' + e.message);
    }
  };

  const handleImportBackupText = () => {
    if (!importJsonText.trim()) {
      Alert.alert('Внимание', 'Пожалуйста, вставьте текст JSON или выберите файл бэкапа');
      return;
    }
    try {
      const parsed = JSON.parse(importJsonText);
      const normalized = normalizeImportedBackup(parsed);
      updateDb(normalized);
      setImportModalVisible(false);
      setImportJsonText('');
      const carCount = normalized.vehicles?.length || 1;
      const recCount = normalized.maintenance_records?.length || 0;
      Alert.alert('Успешно', 'База данных успешно восстановлена!\n\n🚗 Автомобилей: ' + carCount + '\n📋 Записей ТО: ' + recCount);
    } catch (e) {
      Alert.alert('Ошибка парсинга', 'Некорректный JSON файл: ' + e.message);
    }
  };

  // --- THEME COLORS ---
  const isDark = theme === 'dark';
  const colors = {
    bg: isDark ? '#090d16' : '#f8fafc',
    card: isDark ? '#131b2e' : '#ffffff',
    cardSecondary: isDark ? '#1e293b' : '#f1f5f9',
    cardBorder: isDark ? '#27354f' : '#e2e8f0',
    text: isDark ? '#f8fafc' : '#0f172a',
    textMuted: isDark ? '#94a3b8' : '#64748b',
    primary: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    purple: '#8b5cf6',
    inputBg: isDark ? '#0f172a' : '#f8fafc',
    inputBorder: isDark ? '#334155' : '#cbd5e1',
    tabBarBg: isDark ? '#0d1322' : '#ffffff',
    tabBarBorder: isDark ? '#1e293b' : '#e2e8f0'
  };

  if (!db) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ marginTop: 14, color: colors.textMuted, fontSize: 13 }}>Загрузка базы данных Авто ТО...</Text>
      </SafeAreaView>
    );
  }

  const activeVehicle = getActiveVehicle(db);
  const statusData = calculateDashboardStatus(db);
  const toGroups = getTOGroups(db);
  const vId = activeVehicle?.id || 'car_1';

  // --- MILEAGE MODAL HANDLERS ---
  const openMileageModal = () => {
    setInputKm(String(activeVehicle?.current_km || '0'));
    setInputHours(String(activeVehicle?.current_engine_hours || '0'));
    setMileageHint(null);
    setMileageModalVisible(true);
  };

  const onMileageInputChange = (val) => {
    setInputKm(val);
    const num = Number(val);
    if (!isNaN(num) && num > 0) {
      const records = (db.maintenance_records || []).filter(r => (r.vehicle_id || 'car_1') === vId);
      const maxKm = records.reduce((m, r) => Math.max(m, Number(r.mileage) || 0), 0);
      if (maxKm > 0 && num < maxKm) {
        setMileageHint({ num, lastKm: maxKm, combined: maxKm + num });
      } else {
        setMileageHint(null);
      }
    } else {
      setMileageHint(null);
    }
  };

  const saveMileage = () => {
    const km = Number(inputKm);
    const hours = Number(inputHours);
    if (isNaN(km) || km < 0) {
      Alert.alert('Ошибка', 'Введите корректное число километров');
      return;
    }
    const updatedVehicles = (db.vehicles || []).map(v => {
      if (v.id === vId) {
        return { ...v, current_km: km, current_engine_hours: isNaN(hours) ? v.current_engine_hours : hours };
      }
      return v;
    });

    const newDb = { ...db, vehicles: updatedVehicles };
    updateDb(newDb);
    setMileageModalVisible(false);
    checkAndNotifyUpcomingTO(newDb);
  };

  // --- ONBOARDING SAVE ---
  const saveOnboarding = () => {
    const km = Number(obKm) || 0;
    const hours = Number(obHours) || 0;
    const year = Number(obYear) || new Date().getFullYear();
    const brandName = obBrand.trim() || 'Мой';
    const modelName = obModel.trim() || 'Автомобиль';
    const fullName = brandName + ' ' + modelName;

    const newVehicle = {
      id: 'car_1',
      name: fullName,
      brand: brandName,
      model: modelName,
      plate: obPlate.trim(),
      engine: obEngine.trim(),
      year: year,
      vin: '',
      purchase_date: new Date().toISOString().split('T')[0],
      purchase_price: 0,
      current_km: km,
      current_engine_hours: hours,
      oil_spec: obOil.trim()
    };

    const newDb = {
      ...DEFAULT_CLEAN_DB,
      is_onboarded: true,
      active_vehicle_id: 'car_1',
      vehicles: [newVehicle]
    };

    updateDb(newDb);
    setOnboardingModalVisible(false);
    Alert.alert('Готово!', 'Автомобиль "' + fullName + '" успешно настроен. Все показатели готовы к учету!');
  };

  const handleLoadDemo = () => {
    updateDb(DEMO_DB);
    setOnboardingModalVisible(false);
    Alert.alert('Загружено', 'Демо-данные Changan CS55 Plus (ТО-2, ТО-3, заправки и страховки) успешно загружены!');
  };

  // --- FUEL RECORD HANDLERS ---
  const openFuelModal = (fuel = null) => {
    if (fuel) {
      setEditingFuelId(fuel.id);
      setFuelDate(fuel.date || new Date().toISOString().split('T')[0]);
      setFuelKm(String(fuel.mileage || activeVehicle?.current_km || ''));
      setFuelLiters(String(fuel.liters || ''));
      setFuelPricePerLiter(String(fuel.price_per_liter || ''));
      setFuelTotalPrice(String(fuel.total_price || ''));
      setFuelType(fuel.fuel_type || 'АИ-95');
      setFuelIsFullTank(fuel.is_full_tank !== false);
      setFuelStation(fuel.station || '');
      setFuelNote(fuel.note || '');
    } else {
      setEditingFuelId(null);
      setFuelDate(new Date().toISOString().split('T')[0]);
      setFuelKm(String(activeVehicle?.current_km || ''));
      setFuelLiters('');
      setFuelPricePerLiter('59.5');
      setFuelTotalPrice('');
      setFuelType('АИ-95');
      setFuelIsFullTank(true);
      setFuelStation('');
      setFuelNote('');
    }
    setFuelModalVisible(true);
  };

  const onFuelLitersOrPriceChange = (litersStr, priceStr) => {
    setFuelLiters(litersStr);
    setFuelPricePerLiter(priceStr);
    const l = parseFloat(litersStr);
    const p = parseFloat(priceStr);
    if (!isNaN(l) && !isNaN(p) && l > 0 && p > 0) {
      setFuelTotalPrice(String(Math.round(l * p)));
    }
  };

  const saveFuelRecord = () => {
    const km = Number(fuelKm);
    const liters = parseFloat(fuelLiters);
    const pricePerL = parseFloat(fuelPricePerLiter);
    const totalP = parseFloat(fuelTotalPrice) || (liters * pricePerL);

    if (isNaN(km) || km <= 0) {
      Alert.alert('Ошибка', 'Укажите пробег на момент заправки');
      return;
    }
    if (isNaN(liters) || liters <= 0) {
      Alert.alert('Ошибка', 'Укажите количество заправленных литров');
      return;
    }

    const fuelRecords = db.fuel_records || [];
    let updatedFuel = [];

    if (editingFuelId) {
      updatedFuel = fuelRecords.map(f => f.id === editingFuelId ? {
        ...f,
        date: fuelDate,
        mileage: km,
        liters: liters,
        price_per_liter: pricePerL || 0,
        total_price: Math.round(totalP),
        fuel_type: fuelType,
        is_full_tank: fuelIsFullTank,
        station: fuelStation.trim(),
        note: fuelNote.trim()
      } : f);
    } else {
      const newId = (fuelRecords.length > 0 ? Math.max(...fuelRecords.map(f => f.id)) : 0) + 1;
      updatedFuel = [
        ...fuelRecords,
        {
          id: newId,
          vehicle_id: vId,
          date: fuelDate,
          mileage: km,
          liters: liters,
          price_per_liter: pricePerL || 0,
          total_price: Math.round(totalP),
          fuel_type: fuelType,
          is_full_tank: fuelIsFullTank,
          station: fuelStation.trim(),
          note: fuelNote.trim()
        }
      ];
    }

    // Auto-update car mileage if higher
    let updatedVehicles = db.vehicles || [];
    if (km > (activeVehicle?.current_km || 0)) {
      updatedVehicles = updatedVehicles.map(v => v.id === vId ? { ...v, current_km: km } : v);
    }

    const newDb = { ...db, fuel_records: updatedFuel, vehicles: updatedVehicles };
    updateDb(newDb);
    setFuelModalVisible(false);
    Alert.alert('Успешно', 'Заправка сохранена!');
  };

  const deleteFuelRecord = (id) => {
    Alert.alert('Удаление', 'Удалить эту запись о заправке?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: () => {
          const nextFuel = (db.fuel_records || []).filter(f => f.id !== id);
          updateDb({ ...db, fuel_records: nextFuel });
        }
      }
    ]);
  };

  // --- EXPENSE / INSURANCE HANDLERS ---
  const openExpenseModal = (exp = null) => {
    if (exp) {
      setEditingExpenseId(exp.id);
      setExpDate(exp.date || new Date().toISOString().split('T')[0]);
      setExpKm(String(exp.mileage || activeVehicle?.current_km || ''));
      setExpCategory(exp.category || 'Страховка');
      setExpTitle(exp.title || '');
      setExpTotal(String(exp.total_price || ''));
      setExpExpiryDate(exp.expiry_date || '');
      setExpNote(exp.note || '');
    } else {
      setEditingExpenseId(null);
      setExpDate(new Date().toISOString().split('T')[0]);
      setExpKm(String(activeVehicle?.current_km || ''));
      setExpCategory('Страховка');
      setExpTitle('');
      setExpTotal('');
      setExpExpiryDate('');
      setExpNote('');
    }
    setExpenseModalVisible(true);
  };

  const saveExpenseRecord = () => {
    const total = parseFloat(expTotal);
    if (!expTitle.trim()) {
      Alert.alert('Ошибка', 'Введите наименование расхода или полиса');
      return;
    }
    if (isNaN(total) || total < 0) {
      Alert.alert('Ошибка', 'Введите корректную сумму расхода');
      return;
    }

    const expenses = db.other_expenses || [];
    let updatedExpenses = [];
    const km = Number(expKm) || activeVehicle?.current_km || 0;

    if (editingExpenseId) {
      updatedExpenses = expenses.map(e => e.id === editingExpenseId ? {
        ...e,
        date: expDate,
        mileage: km,
        category: expCategory,
        title: expTitle.trim(),
        total_price: Math.round(total),
        expiry_date: expExpiryDate.trim(),
        note: expNote.trim()
      } : e);
    } else {
      const newId = (expenses.length > 0 ? Math.max(...expenses.map(e => e.id)) : 0) + 1;
      updatedExpenses = [
        ...expenses,
        {
          id: newId,
          vehicle_id: vId,
          date: expDate,
          mileage: km,
          category: expCategory,
          title: expTitle.trim(),
          total_price: Math.round(total),
          expiry_date: expExpiryDate.trim(),
          note: expNote.trim()
        }
      ];
    }

    const newDb = { ...db, other_expenses: updatedExpenses };
    updateDb(newDb);
    setExpenseModalVisible(false);
    checkAndNotifyUpcomingTO(newDb);
    Alert.alert('Успешно', 'Расход сохранен!');
  };

  const deleteExpenseRecord = (id) => {
    Alert.alert('Удаление', 'Удалить этот расход?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: () => {
          const nextExp = (db.other_expenses || []).filter(e => e.id !== id);
          updateDb({ ...db, other_expenses: nextExp });
        }
      }
    ]);
  };

  // --- TYRE SET HANDLERS ---
  const handleSeasonSwap = (targetSeason) => {
    const updatedDb = switchActiveTyreSet(db, targetSeason);
    updateDb(updatedDb);
    const sName = targetSeason === 'summer' ? '☀️ Летний комплект' : '❄️ Зимний комплект';
    Alert.alert('Переобувка выполнена!', 'Установлен ' + sName + '. Текущий пробег (' + (activeVehicle?.current_km || 0) + ' км) зафиксирован!');
  };

  const openTyreModal = (tyre = null) => {
    if (tyre) {
      setEditingTyreId(tyre.id);
      setTyreName(tyre.name || '');
      setTyreSeason(tyre.season || 'summer');
      setTyreType(tyre.type || 'stud');
      setTyreBrandModel(tyre.brand_model || '');
      setTyreSize(tyre.size || '225/55 R19');
      setTyreKm(String(tyre.current_km || 0));
      setTyreTread(String(tyre.tread_depth_mm || 8.0));
    } else {
      setEditingTyreId(null);
      setTyreName('');
      setTyreSeason('summer');
      setTyreType('road');
      setTyreBrandModel('');
      setTyreSize('225/55 R19');
      setTyreKm('0');
      setTyreTread('8.0');
    }
    setTyreModalVisible(true);
  };

  const saveTyreSet = () => {
    if (!tyreName.trim()) {
      Alert.alert('Ошибка', 'Введите название комплекта шин');
      return;
    }

    const tyres = db.tyre_sets || [];
    let updatedTyres = [];

    if (editingTyreId) {
      updatedTyres = tyres.map(t => t.id === editingTyreId ? {
        ...t,
        name: tyreName.trim(),
        season: tyreSeason,
        type: tyreType,
        brand_model: tyreBrandModel.trim(),
        size: tyreSize.trim(),
        current_km: Number(tyreKm) || 0,
        tread_depth_mm: parseFloat(tyreTread) || 8.0
      } : t);
    } else {
      const newId = 'tyre_' + Date.now();
      updatedTyres = [
        ...tyres,
        {
          id: newId,
          vehicle_id: vId,
          name: tyreName.trim(),
          season: tyreSeason,
          type: tyreType,
          brand_model: tyreBrandModel.trim(),
          size: tyreSize.trim(),
          current_km: Number(tyreKm) || 0,
          tread_depth_mm: parseFloat(tyreTread) || 8.0,
          is_active: false,
          install_date: null,
          install_mileage: 0
        }
      ];
    }

    updateDb({ ...db, tyre_sets: updatedTyres });
    setTyreModalVisible(false);
    Alert.alert('Успешно', 'Комплект шин сохранен!');
  };

  // --- TO GROUP MODAL HANDLERS ---
  const openAddTOModal = () => {
    setEditingToTag('');
    const nextNum = toGroups.length + 1;
    setToTag('ТО-' + nextNum);
    setToDate(new Date().toISOString().split('T')[0]);
    setToKm(String(activeVehicle?.current_km || ''));
    setToHours(String(activeVehicle?.current_engine_hours || ''));
    
    // Autofill default parts from enabled trackers
    const defaultParts = (db.trackers || []).filter(t => t.enabled !== false).map((t, idx) => ({
      temp_id: 'part_' + (idx + 1),
      item_name: t.name,
      category: t.category,
      brand: t.brand || '',
      article: t.article || '',
      quantity: 1,
      unit: 'шт',
      total_price: '',
      interval_km: t.interval_km || 7500,
      interval_hours: t.interval_hours || 0,
      store: 'Ozon',
      note: ''
    }));

    setToParts(defaultParts);
    setToModalVisible(true);
  };

  const openEditTOModal = (group) => {
    setEditingToTag(group.to_tag);
    setToTag(group.to_tag);
    setToDate(group.date || '');
    setToKm(String(group.mileage || ''));
    setToHours(String(group.engine_hours || ''));
    
    const parts = (group.parts || []).map(p => ({
      id: p.id,
      temp_id: 'part_' + p.id,
      item_name: p.item_name,
      category: p.category,
      brand: p.brand || '',
      article: p.article || '',
      quantity: p.quantity || 1,
      unit: p.unit || 'шт',
      total_price: String(p.total_price || p.price_per_unit || ''),
      interval_km: p.interval_km || 7500,
      interval_hours: p.interval_hours || 0,
      store: p.store || '',
      note: p.note || ''
    }));

    setToParts(parts);
    setToModalVisible(true);
  };

  const saveTOEvent = () => {
    const km = Number(toKm);
    const hours = Number(toHours) || 0;
    const tag = toTag.trim();

    if (!tag) {
      Alert.alert('Ошибка', 'Введите название события ТО (например, ТО-1)');
      return;
    }
    if (isNaN(km) || km < 0) {
      Alert.alert('Ошибка', 'Введите корректный пробег ТО');
      return;
    }
    if (toParts.length === 0) {
      Alert.alert('Ошибка', 'Добавьте хотя бы одну деталь или работу в ТО');
      return;
    }

    const allRecords = db.maintenance_records || [];
    let recordsWithoutGroup = editingToTag
      ? allRecords.filter(r => !( (r.vehicle_id || 'car_1') === vId && r.to_tag === editingToTag ))
      : [...allRecords];

    let maxId = recordsWithoutGroup.reduce((m, r) => Math.max(m, r.id || 0), 0);

    const newRecords = toParts.map(p => {
      maxId++;
      const price = Number(p.total_price) || 0;
      const intKm = Number(p.interval_km) || 7500;
      const intH = Number(p.interval_hours) || 0;
      return {
        id: p.id || maxId,
        vehicle_id: vId,
        to_tag: tag,
        date: toDate,
        mileage: km,
        engine_hours: hours,
        category: p.category || 'Двигатель',
        item_name: p.item_name || 'Деталь',
        brand: p.brand || '',
        article: p.article || '',
        quantity: Number(p.quantity) || 1,
        unit: p.unit || 'шт',
        price_type: 'total',
        price_per_unit: price,
        total_price: price,
        interval_km: intKm,
        interval_hours: intH,
        next_km: km + intKm,
        next_hours: intH > 0 ? (hours + intH) : 0,
        store: p.store || '',
        note: p.note || ''
      };
    });

    const updatedRecords = [...recordsWithoutGroup, ...newRecords];

    // Update vehicle mileage if higher
    let updatedVehicles = db.vehicles || [];
    if (km > (activeVehicle?.current_km || 0)) {
      updatedVehicles = updatedVehicles.map(v => v.id === vId ? {
        ...v,
        current_km: km,
        current_engine_hours: hours > (v.current_engine_hours || 0) ? hours : v.current_engine_hours
      } : v);
    }

    const newDb = { ...db, maintenance_records: updatedRecords, vehicles: updatedVehicles };
    updateDb(newDb);
    setToModalVisible(false);
    checkAndNotifyUpcomingTO(newDb);
    Alert.alert('Успешно', 'Запись ТО "' + tag + '" (' + newRecords.length + ' поз.) сохранена!');
  };

  const deleteTOEvent = (tag) => {
    Alert.alert('Удаление ТО', 'Удалить все позиции события "' + tag + '"?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: () => {
          const nextRecords = (db.maintenance_records || []).filter(r => !( (r.vehicle_id || 'car_1') === vId && r.to_tag === tag ));
          updateDb({ ...db, maintenance_records: nextRecords });
        }
      }
    ]);
  };

  // --- GARAGE / VEHICLES HANDLERS ---
  const switchVehicle = (vehicleId) => {
    updateDb({ ...db, active_vehicle_id: vehicleId });
  };

  const openGarageModal = (vehicle = null) => {
    if (vehicle) {
      setEditCarId(vehicle.id);
      setCarBrand(vehicle.brand || '');
      setCarModel(vehicle.model || '');
      setCarPlate(vehicle.plate || '');
      setCarEngine(vehicle.engine || '');
      setCarYear(vehicle.year ? String(vehicle.year) : '');
      setCarVin(vehicle.vin || '');
      setCarOil(vehicle.oil_spec || '');
      setCarPurchasePrice(vehicle.purchase_price ? String(vehicle.purchase_price) : '');
      setCarPurchaseDate(vehicle.purchase_date || '');
    } else {
      setEditCarId(null);
      setCarBrand('');
      setCarModel('');
      setCarPlate('');
      setCarEngine('');
      setCarYear(String(new Date().getFullYear()));
      setCarVin('');
      setCarOil('');
      setCarPurchasePrice('');
      setCarPurchaseDate(new Date().toISOString().split('T')[0]);
    }
    setGarageModalVisible(true);
  };

  const saveVehicle = () => {
    const brandName = carBrand.trim() || 'Автомобиль';
    const modelName = carModel.trim();
    const fullName = (brandName + ' ' + modelName).trim();
    const year = Number(carYear) || new Date().getFullYear();

    const vehicles = db.vehicles || [];
    let updatedVehicles = [];

    if (editCarId) {
      updatedVehicles = vehicles.map(v => v.id === editCarId ? {
        ...v,
        name: fullName,
        brand: brandName,
        model: modelName,
        plate: carPlate.trim(),
        engine: carEngine.trim(),
        year: year,
        vin: carVin.trim(),
        oil_spec: carOil.trim(),
        purchase_price: Number(carPurchasePrice) || 0,
        purchase_date: carPurchaseDate.trim()
      } : v);
    } else {
      const newId = 'car_' + (vehicles.length + 1);
      updatedVehicles = [
        ...vehicles,
        {
          id: newId,
          name: fullName,
          brand: brandName,
          model: modelName,
          plate: carPlate.trim(),
          engine: carEngine.trim(),
          year: year,
          vin: carVin.trim(),
          oil_spec: carOil.trim(),
          purchase_price: Number(carPurchasePrice) || 0,
          purchase_date: carPurchaseDate.trim() || new Date().toISOString().split('T')[0],
          current_km: 0,
          current_engine_hours: 0
        }
      ];
    }

    updateDb({ ...db, vehicles: updatedVehicles });
    setGarageModalVisible(false);
  };

  // --- TRACKER / REGULATION MODAL ---
  const openTrackerModal = (tracker = null) => {
    if (tracker) {
      setEditingTrackerId(tracker.id);
      setTrName(tracker.name || '');
      setTrCategory(tracker.category || 'Двигатель');
      setTrMatch(tracker.match || '');
      setTrKm(String(tracker.interval_km || '7500'));
      setTrHours(String(tracker.interval_hours || '250'));
      setTrMonths(String(tracker.interval_months || '12'));
      setTrWarnKm(String(tracker.warn_km || '1000'));
      setTrWarnHours(String(tracker.warn_hours || '30'));
      setTrWarnDays(String(tracker.warn_days || '30'));
      setTrSpec(tracker.spec || '');
      setTrBrand(tracker.brand || '');
      setTrArticle(tracker.article || '');
      setTrIcon(tracker.icon || '⚙️');
    } else {
      setEditingTrackerId(null);
      setTrName('');
      setTrCategory('Двигатель');
      setTrMatch('');
      setTrKm('7500');
      setTrHours('250');
      setTrMonths('12');
      setTrWarnKm('1000');
      setTrWarnHours('30');
      setTrWarnDays('30');
      setTrSpec('');
      setTrBrand('');
      setTrArticle('');
      setTrIcon('⚙️');
    }
    setTrackerModalVisible(true);
  };

  const saveTracker = () => {
    if (!trName.trim()) {
      Alert.alert('Ошибка', 'Введите название регламента');
      return;
    }

    const trackers = db.trackers || [];
    let updatedTrackers = [];
    const tData = {
      id: editingTrackerId || ('tr_' + Date.now()),
      name: trName.trim(),
      category: trCategory,
      match: trMatch.trim() || trName.trim().toLowerCase(),
      interval_km: Number(trKm) || 7500,
      interval_hours: Number(trHours) || 0,
      interval_months: Number(trMonths) || 12,
      warn_km: Number(trWarnKm) || 1000,
      warn_hours: Number(trWarnHours) || 30,
      warn_days: Number(trWarnDays) || 30,
      spec: trSpec.trim(),
      brand: trBrand.trim(),
      article: trArticle.trim(),
      icon: trIcon || '⚙️',
      enabled: true
    };

    if (editingTrackerId) {
      updatedTrackers = trackers.map(t => t.id === editingTrackerId ? tData : t);
    } else {
      updatedTrackers = [...trackers, tData];
    }

    const newDb = { ...db, trackers: updatedTrackers };
    updateDb(newDb);
    setTrackerModalVisible(false);
    checkAndNotifyUpcomingTO(newDb);
  };

  const deleteTracker = (id) => {
    Alert.alert('Удаление', 'Удалить этот регламент обслуживания?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: () => {
          const nextT = (db.trackers || []).filter(t => t.id !== id);
          updateDb({ ...db, trackers: nextT });
        }
      }
    ]);
  };

  // --- UNIFIED TIMELINE ENTRIES ---
  const allTimelineItems = [];
  toGroups.forEach(g => {
    allTimelineItems.push({
      type: 'to',
      id: 'to_' + g.to_tag,
      date: g.date || '—',
      mileage: Number(g.mileage) || 0,
      title: g.to_tag,
      subtitle: (g.parts?.length || 0) + ' позиций • ' + (g.parts?.map(p => p.item_name).slice(0, 2).join(', ') || '') + (g.parts?.length > 2 ? '...' : ''),
      cost: g.total_cost || 0,
      icon: '🔧',
      color: '#3b82f6',
      raw: g
    });
  });

  (db.fuel_records || []).filter(f => (f.vehicle_id || 'car_1') === vId).forEach(f => {
    allTimelineItems.push({
      type: 'fuel',
      id: 'fuel_' + f.id,
      date: f.date || '—',
      mileage: Number(f.mileage) || 0,
      title: 'Заправка ' + (f.fuel_type || 'АИ-95') + (f.station ? (' • ' + f.station) : ''),
      subtitle: f.liters + ' л по ' + f.price_per_liter + ' ₽/л' + (f.is_full_tank ? ' (Полный бак)' : ''),
      cost: f.total_price || 0,
      icon: '⛽',
      color: '#10b981',
      raw: f
    });
  });

  (db.other_expenses || []).filter(e => (e.vehicle_id || 'car_1') === vId).forEach(e => {
    allTimelineItems.push({
      type: 'expense',
      id: 'exp_' + e.id,
      date: e.date || '—',
      mileage: Number(e.mileage) || 0,
      title: e.title,
      subtitle: e.category + (e.expiry_date ? (' • До ' + e.expiry_date) : ''),
      cost: e.total_price || 0,
      icon: e.category === 'Страховка' ? '📄' : (e.category === 'Мойка/Уход' ? '🧼' : (e.category === 'Платные дороги' ? '🛣️' : '💳')),
      color: e.category === 'Страховка' ? '#8b5cf6' : '#f59e0b',
      raw: e
    });
  });

  // Sort timeline by mileage / date descending
  allTimelineItems.sort((a, b) => (b.mileage - a.mileage) || String(b.date).localeCompare(String(a.date)));

  const filteredTimeline = allTimelineItems.filter(item => {
    if (timelineFilter !== 'all' && item.type !== timelineFilter) return false;
    if (searchTerm) {
      const matchSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchSearch) return false;
    }
    return true;
  });

  // Filtered Parts for Tab 3
  const allParts = (db.maintenance_records || []).filter(r => (r.vehicle_id || 'car_1') === vId);
  const filteredParts = allParts.filter(p => {
    const matchCat = !categoryFilter || categoryFilter === 'Все' || p.category === categoryFilter;
    const matchSearch = !searchTerm ||
      (p.item_name && p.item_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.brand && p.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.article && p.article.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.to_tag && p.to_tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchCat && matchSearch;
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.card} />

      {/* --- TOP HEADER --- */}
      <View style={[styles.topHeader, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }]}>
        <TouchableOpacity style={styles.headerLeft} onPress={() => setActiveTab('garage')} activeOpacity={0.7}>
          <View style={styles.carIconBox}>
            <Text style={{ fontSize: 18 }}>🚗</Text>
          </View>
          <View style={styles.headerCarInfo}>
            <Text style={[styles.carNameText, { color: colors.text }]} numberOfLines={1} ellipsizeMode="tail">
              {activeVehicle?.name || 'Автомобиль'}
            </Text>
            <View style={styles.carSubRow}>
              {activeVehicle?.plate ? (
                <View style={styles.plateBadge}>
                  <Text style={styles.plateBadgeText}>{activeVehicle.plate}</Text>
                </View>
              ) : null}
              <Text style={[styles.carSubText, { color: colors.textMuted }]} numberOfLines={1}>
                {activeVehicle?.plate ? '• ' : ''}{Number(activeVehicle?.current_km || 0).toLocaleString('ru-RU')} км
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.headerRight}>
          {/* Excel Export */}
          <TouchableOpacity 
            onPress={handleDownloadExcel} 
            style={[styles.iconButton, { backgroundColor: '#10b98120', borderColor: '#10b981' }]}
            activeOpacity={0.7}
            disabled={isExportingExcel}
          >
            {isExportingExcel ? (
              <ActivityIndicator size="small" color="#10b981" />
            ) : (
              <Text style={{ fontSize: 14 }}>📊</Text>
            )}
          </TouchableOpacity>

          {/* Theme Toggle */}
          <TouchableOpacity 
            onPress={toggleTheme} 
            style={[styles.iconButton, { backgroundColor: colors.cardSecondary, borderColor: colors.cardBorder }]}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 14 }}>{isDark ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* --- MAIN SCROLL CONTENT --- */}
      <ScrollView style={styles.mainScrollView} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>

        {/* ======================================================== */}
        {/* TAB 1: DASHBOARD, TCO, TRAFFIC LIGHT & CHARTS            */}
        {/* ======================================================== */}
        {activeTab === 'dashboard' && (
          <View style={styles.tabContent}>

            {/* UPCOMING TO ALERT BANNER */}
            {statusData.kpi.attention_count > 0 && (
              <TouchableOpacity
                onPress={() => setDashboardView('traffic-light')}
                style={{
                  backgroundColor: '#ef444418',
                  borderColor: '#ef4444',
                  borderWidth: 1.5,
                  borderRadius: 14,
                  padding: 12,
                  marginBottom: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10
                }}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 24 }}>🚨</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#ef4444' }}>
                    Приближается срок ТО ({statusData.kpi.attention_count} поз.)
                  </Text>
                  <Text style={{ fontSize: 11, color: colors.text, marginTop: 2 }} numberOfLines={2}>
                    {statusData.consumables.filter(c => c.status_code !== 'ok').map(c => c.name + ' (' + (c.rem_km > 0 ? (c.rem_km + ' км') : (c.rem_days + ' дн.')) + ')').join(' • ')}
                  </Text>
                </View>
                <Text style={{ fontSize: 11, color: '#3b82f6', fontWeight: 'bold' }}>Смотреть ➔</Text>
              </TouchableOpacity>
            )}

            {/* KPI GRID */}
            <View style={styles.kpiGrid}>
              {/* Odometer & Hours */}
              <View style={[styles.kpiCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <View style={styles.kpiHeader}>
                  <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>ПРОБЕГ И М/Ч</Text>
                  <TouchableOpacity onPress={openMileageModal} style={styles.kpiEditBtn}>
                    <Text style={{ fontSize: 10, color: '#3b82f6', fontWeight: 'bold' }}>Изменить ✎</Text>
                  </TouchableOpacity>
                </View>
                <Text style={[styles.kpiValue, { color: colors.text }]}>
                  {Number(statusData.kpi.current_km).toLocaleString('ru-RU')} км
                </Text>
                <Text style={[styles.kpiSub, { color: colors.warning }]}>
                  ⏱ {statusData.kpi.current_hours} м/ч • ⌀ {statusData.kpi.avg_speed} км/ч
                </Text>
              </View>

              {/* Total TCO Spent */}
              <View style={[styles.kpiCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>ВСЕ ЗАТРАТЫ (TCO)</Text>
                <Text style={[styles.kpiValue, { color: '#10b981' }]}>
                  {Number(statusData.kpi.total_spent).toLocaleString('ru-RU')} ₽
                </Text>
                <Text style={[styles.kpiSub, { color: colors.textMuted }]}>
                  {statusData.kpi.cost_per_km} ₽/км • {statusData.kpi.cost_per_day} ₽/день
                </Text>
              </View>

              {/* Fuel Average Consumption */}
              <View style={[styles.kpiCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>РАСХОД ТОПЛИВА</Text>
                <Text style={[styles.kpiValue, { color: '#3b82f6' }]}>
                  {statusData.kpi.avg_fuel_consumption} л/100км
                </Text>
                <Text style={[styles.kpiSub, { color: colors.textMuted }]}>
                  ⛽ {Number(statusData.kpi.fuel_spent).toLocaleString('ru-RU')} ₽ ({statusData.kpi.cost_per_km_fuel} ₽/км)
                </Text>
              </View>

              {/* Active Tyres Set */}
              <View style={[styles.kpiCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <View style={styles.kpiHeader}>
                  <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>КОЛЕСА</Text>
                  <TouchableOpacity onPress={() => setActiveTab('garage')} style={styles.kpiEditBtn}>
                    <Text style={{ fontSize: 10, color: '#8b5cf6', fontWeight: 'bold' }}>Шины 🛞</Text>
                  </TouchableOpacity>
                </View>
                <Text style={[styles.kpiValue, { color: colors.text, fontSize: 13 }]} numberOfLines={1}>
                  {statusData.active_tyre ? (statusData.active_tyre.season === 'summer' ? '☀️ Лето' : '❄️ Зима') : 'Не указан'}
                </Text>
                <Text style={[styles.kpiSub, { color: colors.textMuted }]}>
                  Накат: {Number(statusData.active_tyre?.live_km || 0).toLocaleString('ru-RU')} км
                </Text>
              </View>
            </View>

            {/* Quick Action Floating Bar */}
            <View style={{ flexDirection: 'row', gap: 8, marginVertical: 12 }}>
              <TouchableOpacity
                onPress={openAddTOModal}
                style={[styles.quickActionBtn, { backgroundColor: '#3b82f6' }]}
                activeOpacity={0.8}
              >
                <Text style={styles.quickActionBtnText}>+ 🔧 Добавить ТО</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => openFuelModal()}
                style={[styles.quickActionBtn, { backgroundColor: '#10b981' }]}
                activeOpacity={0.8}
              >
                <Text style={styles.quickActionBtnText}>+ ⛽ Заправка</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => openExpenseModal()}
                style={[styles.quickActionBtn, { backgroundColor: '#8b5cf6' }]}
                activeOpacity={0.8}
              >
                <Text style={styles.quickActionBtnText}>+ 📄 Расход</Text>
              </TouchableOpacity>
            </View>

            {/* Sub-view switcher */}
            <View style={[styles.viewSwitcher, { backgroundColor: colors.cardSecondary, borderColor: colors.cardBorder }]}>
              <TouchableOpacity
                onPress={() => setDashboardView('all')}
                style={[styles.viewSwitchBtn, dashboardView === 'all' && { backgroundColor: colors.card, borderColor: '#3b82f6' }]}
              >
                <Text style={[styles.viewSwitchText, { color: dashboardView === 'all' ? colors.primary : colors.textMuted }]}>Светофор ТО</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setDashboardView('fuel')}
                style={[styles.viewSwitchBtn, dashboardView === 'fuel' && { backgroundColor: colors.card, borderColor: '#10b981' }]}
              >
                <Text style={[styles.viewSwitchText, { color: dashboardView === 'fuel' ? '#10b981' : colors.textMuted }]}>Топливо ⛽</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setDashboardView('tco')}
                style={[styles.viewSwitchBtn, dashboardView === 'tco' && { backgroundColor: colors.card, borderColor: '#8b5cf6' }]}
              >
                <Text style={[styles.viewSwitchText, { color: dashboardView === 'tco' ? '#8b5cf6' : colors.textMuted }]}>Финансы TCO 💰</Text>
              </TouchableOpacity>
            </View>

            {/* VIEW 1: TRAFFIC LIGHT CONSUMABLES */}
            {(dashboardView === 'all' || dashboardView === 'traffic-light') && (
              <View style={{ marginTop: 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>
                    🚦 Состояние расходников и Регламенты
                  </Text>
                  <TouchableOpacity onPress={() => openTrackerModal()} style={styles.smallAddBtn}>
                    <Text style={{ fontSize: 11, color: '#3b82f6', fontWeight: 'bold' }}>+ Регламент</Text>
                  </TouchableOpacity>
                </View>

                {statusData.consumables.map(c => {
                  const barColor = c.status_code === 'danger' ? '#ef4444' : (c.status_code === 'warning' ? '#f59e0b' : '#10b981');
                  return (
                    <View key={c.id} style={[styles.consumableCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                      <View style={styles.consumableHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                          <Text style={{ fontSize: 20 }}>{c.icon}</Text>
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.consumableName, { color: colors.text }]} numberOfLines={1}>{c.name}</Text>
                            <Text style={{ fontSize: 10, color: colors.textMuted }}>
                              {c.category} • Интервал: {Number(c.interval_km).toLocaleString('ru-RU')} км
                              {c.interval_hours > 0 ? (' / ' + c.interval_hours + ' м/ч') : ''}
                              {c.interval_months > 0 ? (' / ' + c.interval_months + ' мес') : ''}
                            </Text>
                          </View>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: barColor + '20', borderColor: barColor }]}>
                          <Text style={{ fontSize: 10, fontWeight: 'bold', color: barColor }}>{c.status_text}</Text>
                        </View>
                      </View>

                      {/* Wear Progress Bar */}
                      <View style={[styles.progressBarBg, { backgroundColor: colors.cardSecondary }]}>
                        <View style={[styles.progressBarFill, { width: Math.min(100, c.wear_percent) + '%', backgroundColor: barColor }]} />
                      </View>

                      {/* Remaining Stats Row */}
                      <View style={styles.consumableFooterRow}>
                        <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.text }}>
                          Остаток: {Number(c.rem_km).toLocaleString('ru-RU')} км
                          {c.rem_hours !== null ? (' • ' + c.rem_hours + ' м/ч') : ''}
                          {c.rem_days !== undefined ? (' • ' + c.rem_days + ' дн.') : ''}
                        </Text>
                        <Text style={{ fontSize: 10, color: colors.textMuted }}>
                          Износ: {c.wear_percent}%
                        </Text>
                      </View>

                      {c.brand || c.article ? (
                        <Text style={{ fontSize: 10, color: colors.textMuted, marginTop: 4 }}>
                          📌 Рекомендуется: {[c.brand, c.article].filter(Boolean).join(' • ')}
                        </Text>
                      ) : null}
                    </View>
                  );
                })}
              </View>
            )}

            {/* VIEW 2: FUEL ANALYTICS */}
            {dashboardView === 'fuel' && (
              <View style={{ marginTop: 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>
                    ⛽ Аналитика заправок и расход топлива
                  </Text>
                  <TouchableOpacity onPress={() => openFuelModal()} style={styles.smallAddBtn}>
                    <Text style={{ fontSize: 11, color: '#10b981', fontWeight: 'bold' }}>+ Заправка</Text>
                  </TouchableOpacity>
                </View>

                {/* Fuel Summary Card */}
                <View style={[styles.settingsCard, { backgroundColor: colors.card, borderColor: '#10b98140' }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={{ fontSize: 12, color: colors.textMuted }}>Всего потрачено на бензин:</Text>
                    <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#10b981' }}>{Number(statusData.kpi.fuel_spent).toLocaleString('ru-RU')} ₽</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={{ fontSize: 12, color: colors.textMuted }}>Средний расход:</Text>
                    <Text style={{ fontSize: 13, fontWeight: 'bold', color: colors.text }}>{statusData.kpi.avg_fuel_consumption} л / 100 км</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 12, color: colors.textMuted }}>Стоимость 1 км по топливу:</Text>
                    <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#3b82f6' }}>{statusData.kpi.cost_per_km_fuel} ₽ / км</Text>
                  </View>
                </View>

                {/* Fuel Records List */}
                {((db.fuel_records || []).filter(f => (f.vehicle_id || 'car_1') === vId)).map(f => (
                  <View key={f.id} style={[styles.consumableCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <Text style={{ fontSize: 13, fontWeight: 'bold', color: colors.text }}>
                        ⛽ {f.liters} л ({f.fuel_type || 'АИ-95'}) {f.is_full_tank ? '• Полный бак' : ''}
                      </Text>
                      <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#10b981' }}>
                        {Number(f.total_price).toLocaleString('ru-RU')} ₽
                      </Text>
                    </View>
                    <Text style={{ fontSize: 11, color: colors.textMuted }}>
                      📅 {f.date} • 🛣️ {Number(f.mileage).toLocaleString('ru-RU')} км • {f.price_per_liter} ₽/л {f.station ? ('• ' + f.station) : ''}
                    </Text>
                    {f.note ? <Text style={{ fontSize: 10, color: colors.textMuted, marginTop: 4 }}>💬 {f.note}</Text> : null}
                    
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
                      <TouchableOpacity onPress={() => openFuelModal(f)}>
                        <Text style={{ fontSize: 11, color: '#3b82f6', fontWeight: 'bold' }}>Изменить ✎</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => deleteFuelRecord(f.id)}>
                        <Text style={{ fontSize: 11, color: '#ef4444', fontWeight: 'bold' }}>Удалить ✕</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* VIEW 3: TCO FINANCIAL DASHBOARD */}
            {dashboardView === 'tco' && (
              <View style={{ marginTop: 10 }}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  💰 Структура затрат и себестоимость владения (TCO)
                </Text>

                <View style={[styles.settingsCard, { backgroundColor: colors.card, borderColor: '#8b5cf640' }]}>
                  <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 8 }}>РАСПРЕДЕЛЕНИЕ РАСХОДОВ:</Text>
                  
                  {/* Category Breakdown Bars */}
                  <View style={{ marginBottom: 10 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                      <Text style={{ fontSize: 12, color: colors.text }}>🔧 ТО и расходники</Text>
                      <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#3b82f6' }}>{Number(statusData.kpi.to_spent).toLocaleString('ru-RU')} ₽</Text>
                    </View>
                    <View style={[styles.progressBarBg, { backgroundColor: colors.cardSecondary }]}>
                      <View style={[styles.progressBarFill, { width: (statusData.kpi.total_spent > 0 ? (statusData.kpi.to_spent / statusData.kpi.total_spent * 100) : 0) + '%', backgroundColor: '#3b82f6' }]} />
                    </View>
                  </View>

                  <View style={{ marginBottom: 10 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                      <Text style={{ fontSize: 12, color: colors.text }}>⛽ Топливо</Text>
                      <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#10b981' }}>{Number(statusData.kpi.fuel_spent).toLocaleString('ru-RU')} ₽</Text>
                    </View>
                    <View style={[styles.progressBarBg, { backgroundColor: colors.cardSecondary }]}>
                      <View style={[styles.progressBarFill, { width: (statusData.kpi.total_spent > 0 ? (statusData.kpi.fuel_spent / statusData.kpi.total_spent * 100) : 0) + '%', backgroundColor: '#10b981' }]} />
                    </View>
                  </View>

                  <View style={{ marginBottom: 6 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                      <Text style={{ fontSize: 12, color: colors.text }}>📄 Страховки, налоги и прочее</Text>
                      <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#8b5cf6' }}>{Number(statusData.kpi.expenses_spent).toLocaleString('ru-RU')} ₽</Text>
                    </View>
                    <View style={[styles.progressBarBg, { backgroundColor: colors.cardSecondary }]}>
                      <View style={[styles.progressBarFill, { width: (statusData.kpi.total_spent > 0 ? (statusData.kpi.expenses_spent / statusData.kpi.total_spent * 100) : 0) + '%', backgroundColor: '#8b5cf6' }]} />
                    </View>
                  </View>
                </View>

                {/* Other Expenses List */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 8 }}>
                  <Text style={{ fontSize: 13, fontWeight: 'bold', color: colors.text }}>
                    Прочие расходы (Страховки, Мойки, Дороги)
                  </Text>
                  <TouchableOpacity onPress={() => openExpenseModal()} style={styles.smallAddBtn}>
                    <Text style={{ fontSize: 11, color: '#8b5cf6', fontWeight: 'bold' }}>+ Расход</Text>
                  </TouchableOpacity>
                </View>

                {((db.other_expenses || []).filter(e => (e.vehicle_id || 'car_1') === vId)).map(e => (
                  <View key={e.id} style={[styles.consumableCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <Text style={{ fontSize: 13, fontWeight: 'bold', color: colors.text }}>
                        {e.category === 'Страховка' ? '📄' : '💳'} {e.title}
                      </Text>
                      <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#8b5cf6' }}>
                        {Number(e.total_price).toLocaleString('ru-RU')} ₽
                      </Text>
                    </View>
                    <Text style={{ fontSize: 11, color: colors.textMuted }}>
                      📅 {e.date} • {e.category} {e.expiry_date ? ('• Срок до: ' + e.expiry_date) : ''}
                    </Text>
                    {e.note ? <Text style={{ fontSize: 10, color: colors.textMuted, marginTop: 4 }}>💬 {e.note}</Text> : null}

                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
                      <TouchableOpacity onPress={() => openExpenseModal(e)}>
                        <Text style={{ fontSize: 11, color: '#3b82f6', fontWeight: 'bold' }}>Изменить ✎</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => deleteExpenseRecord(e.id)}>
                        <Text style={{ fontSize: 11, color: '#ef4444', fontWeight: 'bold' }}>Удалить ✕</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ======================================================== */}
        {/* TAB 2: TIMELINE (CHRONOLOGICAL ALL-IN-ONE LOG)           */}
        {/* ======================================================== */}
        {activeTab === 'timeline' && (
          <View style={styles.tabContent}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>
                📋 Журнал всех операций ({filteredTimeline.length})
              </Text>
            </View>

            {/* Filter Pills */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {[
                  { key: 'all', label: 'Все' },
                  { key: 'to', label: '🔧 ТО' },
                  { key: 'fuel', label: '⛽ Заправки' },
                  { key: 'expense', label: '📄 Страховки и Прочее' }
                ].map(pill => (
                  <TouchableOpacity
                    key={pill.key}
                    onPress={() => setTimelineFilter(pill.key)}
                    style={[
                      styles.filterPill,
                      { backgroundColor: timelineFilter === pill.key ? colors.primary : colors.card, borderColor: colors.cardBorder }
                    ]}
                  >
                    <Text style={{ fontSize: 11, fontWeight: 'bold', color: timelineFilter === pill.key ? '#fff' : colors.textMuted }}>
                      {pill.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Search Input */}
            <TextInput
              style={[styles.searchInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
              placeholder="Поиск по журналу..."
              placeholderTextColor={colors.textMuted}
              value={searchTerm}
              onChangeText={setSearchTerm}
            />

            {/* Timeline Items */}
            {filteredTimeline.map(item => (
              <View key={item.id} style={[styles.timelineCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Text style={{ fontSize: 18 }}>{item.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: 'bold', color: colors.text }}>{item.title}</Text>
                    <Text style={{ fontSize: 11, color: colors.textMuted }}>{item.subtitle}</Text>
                  </View>
                  <Text style={{ fontSize: 13, fontWeight: 'bold', color: item.color }}>
                    {Number(item.cost).toLocaleString('ru-RU')} ₽
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, paddingTop: 4, borderTopWidth: 1, borderTopColor: colors.cardSecondary }}>
                  <Text style={{ fontSize: 10, color: colors.textMuted }}>
                    📅 {item.date} • 🛣️ {Number(item.mileage).toLocaleString('ru-RU')} км
                  </Text>
                  
                  {item.type === 'to' && (
                    <TouchableOpacity onPress={() => openEditTOModal(item.raw)}>
                      <Text style={{ fontSize: 11, color: '#3b82f6', fontWeight: 'bold' }}>Открыть ТО ➔</Text>
                    </TouchableOpacity>
                  )}
                  {item.type === 'fuel' && (
                    <TouchableOpacity onPress={() => openFuelModal(item.raw)}>
                      <Text style={{ fontSize: 11, color: '#10b981', fontWeight: 'bold' }}>Изменить ✎</Text>
                    </TouchableOpacity>
                  )}
                  {item.type === 'expense' && (
                    <TouchableOpacity onPress={() => openExpenseModal(item.raw)}>
                      <Text style={{ fontSize: 11, color: '#8b5cf6', fontWeight: 'bold' }}>Изменить ✎</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ======================================================== */}
        {/* TAB 3: PARTS & CATALOG                                   */}
        {/* ======================================================== */}
        {activeTab === 'parts' && (
          <View style={styles.tabContent}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              📦 Реестр замененных расходников и запчастей ({filteredParts.length})
            </Text>

            {/* Category Filter Pills */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {['Все', 'Двигатель', 'Фильтры', 'Зажигание', 'Охлаждение', 'Тормоза', 'Трансмиссия'].map(cat => (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setCategoryFilter(cat === 'Все' ? '' : cat)}
                    style={[
                      styles.filterPill,
                      { backgroundColor: (categoryFilter === cat || (!categoryFilter && cat === 'Все')) ? colors.primary : colors.card, borderColor: colors.cardBorder }
                    ]}
                  >
                    <Text style={{ fontSize: 11, fontWeight: 'bold', color: (categoryFilter === cat || (!categoryFilter && cat === 'Все')) ? '#fff' : colors.textMuted }}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {filteredParts.map(p => (
              <View key={p.id} style={[styles.consumableCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 13, fontWeight: 'bold', color: colors.text }}>{p.item_name}</Text>
                  <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#10b981' }}>{Number(p.total_price).toLocaleString('ru-RU')} ₽</Text>
                </View>
                <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
                  🏷️ {p.to_tag} • 📅 {p.date} • 🛣️ {Number(p.mileage).toLocaleString('ru-RU')} км • {p.category}
                </Text>
                {p.brand || p.article ? (
                  <Text style={{ fontSize: 11, color: colors.primary, marginTop: 4 }}>
                    Артикул: {[p.brand, p.article].filter(Boolean).join(' • ')} ({p.quantity} {p.unit})
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
        )}

        {/* ======================================================== */}
        {/* TAB 4: TYRE MANAGER & GARAGE                             */}
        {/* ======================================================== */}
        {activeTab === 'garage' && (
          <View style={styles.tabContent}>
            {/* 1. TYRES MANAGER CARD */}
            <View style={[styles.settingsCard, { backgroundColor: colors.card, borderColor: '#8b5cf650' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <Text style={{ fontSize: 24 }}>🛞</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingsTitle, { color: colors.text, marginBottom: 2 }]}>
                    Менеджер сезонных шин и колес
                  </Text>
                  <Text style={{ fontSize: 11, color: colors.textMuted }}>
                    Автоматический подсчет наката резины и сезонная смена колес.
                  </Text>
                </View>
              </View>

              {/* Season Swap Fast Buttons */}
              <View style={{ flexDirection: 'row', gap: 10, marginVertical: 8 }}>
                <TouchableOpacity
                  onPress={() => handleSeasonSwap('summer')}
                  style={[
                    styles.saveBtn,
                    { flex: 1, backgroundColor: statusData.active_tyre?.season === 'summer' ? '#10b981' : colors.cardSecondary }
                  ]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.saveBtnText, { color: statusData.active_tyre?.season === 'summer' ? '#fff' : colors.textMuted }]}>
                    ☀️ Установить Лето
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleSeasonSwap('winter')}
                  style={[
                    styles.saveBtn,
                    { flex: 1, backgroundColor: statusData.active_tyre?.season === 'winter' ? '#3b82f6' : colors.cardSecondary }
                  ]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.saveBtnText, { color: statusData.active_tyre?.season === 'winter' ? '#fff' : colors.textMuted }]}>
                    ❄️ Установить Зиму
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Tyre Sets List */}
              {((db.tyre_sets || []).filter(t => (t.vehicle_id || 'car_1') === vId)).map(t => (
                <View key={t.id} style={[styles.consumableCard, { backgroundColor: colors.cardSecondary, borderColor: colors.cardBorder }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 13, fontWeight: 'bold', color: colors.text }}>
                      {t.season === 'summer' ? '☀️' : '❄️'} {t.name}
                    </Text>
                    {t.is_active ? (
                      <View style={[styles.statusBadge, { backgroundColor: '#10b98120', borderColor: '#10b981' }]}>
                        <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#10b981' }}>АКТИВЕН</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
                    Размерность: {t.size} • {t.brand_model || 'Шины'}
                  </Text>
                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.primary, marginTop: 2 }}>
                    Накат: {Number(t.is_active ? statusData.active_tyre?.live_km : t.current_km).toLocaleString('ru-RU')} км • Протектор: {t.tread_depth_mm} мм
                  </Text>

                  <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
                    <TouchableOpacity onPress={() => openTyreModal(t)}>
                      <Text style={{ fontSize: 11, color: '#3b82f6', fontWeight: 'bold' }}>Редактировать ✎</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              <TouchableOpacity onPress={() => openTyreModal()} style={{ marginTop: 8, alignItems: 'center' }}>
                <Text style={{ fontSize: 11, color: '#3b82f6', fontWeight: 'bold' }}>+ Добавить еще комплект шин</Text>
              </TouchableOpacity>
            </View>

            {/* 2. MULTI-VEHICLE GARAGE */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 12 }}>
              <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>
                🚗 Гараж автомобилей ({(db.vehicles || []).length})
              </Text>
              <TouchableOpacity onPress={() => openGarageModal()} style={styles.smallAddBtn}>
                <Text style={{ fontSize: 11, color: '#3b82f6', fontWeight: 'bold' }}>+ Добавить авто</Text>
              </TouchableOpacity>
            </View>

            {(db.vehicles || []).map(v => (
              <View key={v.id} style={[styles.garageCard, { backgroundColor: colors.card, borderColor: v.id === vId ? '#3b82f6' : colors.cardBorder }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: 'bold', color: colors.text }}>{v.name}</Text>
                    <Text style={{ fontSize: 11, color: colors.textMuted }}>
                      {v.plate ? ('[' + v.plate + '] • ') : ''}{Number(v.current_km || 0).toLocaleString('ru-RU')} км • {v.engine || 'ДВС'}
                    </Text>
                  </View>
                  {v.id === vId ? (
                    <View style={[styles.statusBadge, { backgroundColor: '#3b82f620', borderColor: '#3b82f6' }]}>
                      <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#3b82f6' }}>ТЕКУЩИЙ</Text>
                    </View>
                  ) : (
                    <TouchableOpacity onPress={() => switchVehicle(v.id)} style={[styles.saveBtn, { paddingVertical: 4, paddingHorizontal: 8 }]}>
                      <Text style={{ fontSize: 11, color: '#fff', fontWeight: 'bold' }}>Выбрать</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ======================================================== */}
        {/* TAB 5: REGULATIONS, NOTIFICATIONS & SETTINGS             */}
        {/* ======================================================== */}
        {activeTab === 'settings' && (
          <View style={styles.tabContent}>
            {/* 1. UPCOMING TO NOTIFICATION SETTINGS */}
            <View style={[styles.settingsCard, { backgroundColor: colors.card, borderColor: '#3b82f650' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <Text style={{ fontSize: 24 }}>🔔</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingsTitle, { color: colors.text, marginBottom: 2 }]}>
                    Уведомления о предстоящем ТО и Страховках
                  </Text>
                  <Text style={{ fontSize: 11, color: colors.textMuted }}>
                    Автоматические push-напоминания при приближении срока ТО или полиса.
                  </Text>
                </View>
              </View>

              {/* Notification Toggle */}
              <TouchableOpacity
                onPress={() => setNotifEnabled(!notifEnabled)}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingVertical: 10,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.cardBorder,
                  marginBottom: 10
                }}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 13, fontWeight: 'bold', color: colors.text }}>
                  Push-уведомления на смартфоне:
                </Text>
                <View style={{
                  backgroundColor: notifEnabled ? '#10b98120' : colors.cardSecondary,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: notifEnabled ? '#10b981' : colors.cardBorder
                }}>
                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: notifEnabled ? '#10b981' : colors.textMuted }}>
                    {notifEnabled ? '🟢 ВКЛЮЧЕНЫ' : '⚪ ВЫКЛЮЧЕНЫ'}
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Threshold Inputs */}
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 10, color: colors.textMuted, marginBottom: 4 }}>Запас (км):</Text>
                  <TextInput
                    style={[styles.settingInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text, fontWeight: 'bold', marginBottom: 0 }]}
                    keyboardType="numeric"
                    placeholder="1000"
                    placeholderTextColor={colors.textMuted}
                    value={notifWarnKm}
                    onChangeText={setNotifWarnKm}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 10, color: colors.textMuted, marginBottom: 4 }}>Запас (м/ч):</Text>
                  <TextInput
                    style={[styles.settingInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text, fontWeight: 'bold', marginBottom: 0 }]}
                    keyboardType="numeric"
                    placeholder="30"
                    placeholderTextColor={colors.textMuted}
                    value={notifWarnHours}
                    onChangeText={setNotifWarnHours}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 10, color: colors.textMuted, marginBottom: 4 }}>Запас (дн):</Text>
                  <TextInput
                    style={[styles.settingInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text, fontWeight: 'bold', marginBottom: 0 }]}
                    keyboardType="numeric"
                    placeholder="30"
                    placeholderTextColor={colors.textMuted}
                    value={notifWarnDays}
                    onChangeText={setNotifWarnDays}
                  />
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity
                  onPress={() => handleSaveNotifSettings(true)}
                  style={[styles.saveBtn, { flex: 1, backgroundColor: '#3b82f6' }]}
                  activeOpacity={0.8}
                >
                  <Text style={styles.saveBtnText}>💾 Применить ко всем</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleTestNotification}
                  style={[styles.saveBtn, { flex: 1, backgroundColor: '#8b5cf6' }]}
                  activeOpacity={0.8}
                >
                  <Text style={styles.saveBtnText}>🔔 Тест сигнала</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 2. UNIFIED BACKUP & SYNC */}
            <View style={[styles.settingsCard, { backgroundColor: colors.card, borderColor: '#10b98150' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <Text style={{ fontSize: 24 }}>🔄</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingsTitle, { color: colors.text, marginBottom: 2 }]}>
                    Синхронизация и Бэкап (Web ↔ Android)
                  </Text>
                  <Text style={{ fontSize: 11, color: colors.textMuted }}>
                    Единый формат бэкапа JSON — 100% совместимость с веб-версией и мобильным приложением.
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
                <TouchableOpacity onPress={handleExportBackup} style={[styles.saveBtn, { flex: 1, backgroundColor: '#10b981' }]} activeOpacity={0.8}>
                  <Text style={styles.saveBtnText}>📤 Экспорт .JSON</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handlePickAndImportBackup} style={[styles.saveBtn, { flex: 1, backgroundColor: '#3b82f6' }]} activeOpacity={0.8}>
                  <Text style={styles.saveBtnText}>📂 Загрузить .JSON</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                onPress={() => setImportModalVisible(true)} 
                style={{ marginTop: 10, paddingVertical: 6, alignItems: 'center' }}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 11, color: '#3b82f6', textDecorationLine: 'underline' }}>
                  Или вставить JSON вручную текстом 📋
                </Text>
              </TouchableOpacity>
            </View>

            {/* 3. DEVELOPER CARD */}
            <View style={[styles.settingsCard, { backgroundColor: colors.card, borderColor: '#3b82f640' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <Text style={{ fontSize: 24 }}>👨‍💻</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.settingsTitle, { color: colors.text, marginBottom: 1 }]}>
                    О приложении и Разработчик
                  </Text>
                  <Text style={{ fontSize: 11, color: colors.textMuted }}>
                    Авто ТО v1.1.0 • 100% Offline-First
                  </Text>
                </View>
              </View>

              <View style={[styles.developerInfoBox, { backgroundColor: colors.cardSecondary, borderColor: colors.cardBorder }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                  <Text style={{ fontSize: 13, fontWeight: 'bold', color: colors.text }}>Разработчик:</Text>
                  <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#3b82f6' }}>Александр Щеголев</Text>
                  <View style={styles.devBadge}>
                    <Text style={styles.devBadgeText}>@scanek</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 11, color: colors.textMuted, lineHeight: 16 }}>
                  Полностью автономное мобильное приложение для комплексного учета авто: ТО, топлива, расходов TCO, шин и регламентов.
                </Text>
                <Text style={{ fontSize: 10, color: '#3b82f6', marginTop: 6, fontWeight: '600' }}>
                  ⭐ Репозиторий: github.com/scanek/car-maintenance-mobile
                </Text>
              </View>
            </View>
          </View>
        )}

      </ScrollView>

      {/* --- BOTTOM NAVIGATION BAR --- */}
      <View style={[styles.bottomNav, { backgroundColor: colors.tabBarBg, borderTopColor: colors.tabBarBorder }]}>
        <TouchableOpacity onPress={() => setActiveTab('dashboard')} style={styles.navItem} activeOpacity={0.7}>
          <Text style={{ fontSize: 20 }}>📊</Text>
          <Text style={[styles.navText, { color: activeTab === 'dashboard' ? colors.primary : colors.textMuted }]}>Дашборд</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setActiveTab('timeline')} style={styles.navItem} activeOpacity={0.7}>
          <Text style={{ fontSize: 20 }}>📋</Text>
          <Text style={[styles.navText, { color: activeTab === 'timeline' ? colors.primary : colors.textMuted }]}>Журнал</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setActiveTab('parts')} style={styles.navItem} activeOpacity={0.7}>
          <Text style={{ fontSize: 20 }}>📦</Text>
          <Text style={[styles.navText, { color: activeTab === 'parts' ? colors.primary : colors.textMuted }]}>Запчасти</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setActiveTab('garage')} style={styles.navItem} activeOpacity={0.7}>
          <Text style={{ fontSize: 20 }}>🛞</Text>
          <Text style={[styles.navText, { color: activeTab === 'garage' ? colors.primary : colors.textMuted }]}>Шины/Гараж</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setActiveTab('settings')} style={styles.navItem} activeOpacity={0.7}>
          <Text style={{ fontSize: 20 }}>⚙️</Text>
          <Text style={[styles.navText, { color: activeTab === 'settings' ? colors.primary : colors.textMuted }]}>Настройки</Text>
        </TouchableOpacity>
      </View>

      {/* ======================================================== */}
      {/* MODALS                                                   */}
      {/* ======================================================== */}

      {/* 1. ONBOARDING WIZARD MODAL */}
      <Modal visible={onboardingModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.card, maxHeight: '90%' }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>🚗 Настройка вашего автомобиля</Text>
              <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 14 }}>
                Укажите параметры машины для начала чистого учета:
              </Text>

              <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 2 }}>Марка авто:</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                placeholder="Changan, Haval, Geely, Kia..."
                placeholderTextColor={colors.textMuted}
                value={obBrand}
                onChangeText={setObBrand}
              />

              <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 2 }}>Модель авто:</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                placeholder="CS55 Plus, Jolion, Monjaro..."
                placeholderTextColor={colors.textMuted}
                value={obModel}
                onChangeText={setObModel}
              />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 2 }}>Госномер:</Text>
                  <TextInput
                    style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                    placeholder="А 777 АА 777"
                    placeholderTextColor={colors.textMuted}
                    value={obPlate}
                    onChangeText={setObPlate}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 2 }}>Год выпуска:</Text>
                  <TextInput
                    style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                    keyboardType="numeric"
                    placeholder="2023"
                    placeholderTextColor={colors.textMuted}
                    value={obYear}
                    onChangeText={setObYear}
                  />
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 2 }}>Текущий пробег (км):</Text>
                  <TextInput
                    style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text, fontWeight: 'bold' }]}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={colors.textMuted}
                    value={obKm}
                    onChangeText={setObKm}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 2 }}>Моточасы (м/ч):</Text>
                  <TextInput
                    style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text, fontWeight: 'bold' }]}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor={colors.textMuted}
                    value={obHours}
                    onChangeText={setObHours}
                  />
                </View>
              </View>

              <TouchableOpacity onPress={saveOnboarding} style={[styles.saveBtn, { backgroundColor: '#10b981', paddingVertical: 12, marginTop: 8 }]}>
                <Text style={[styles.saveBtnText, { fontSize: 14 }]}>🚀 Начать учет</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleLoadDemo} style={{ marginTop: 12, paddingVertical: 8, alignItems: 'center' }}>
                <Text style={{ fontSize: 11, color: '#3b82f6', textDecorationLine: 'underline' }}>
                  Или загрузить демо-данные (Changan CS55 Plus, ТО-2, ТО-3)
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 2. UPDATE MILEAGE MODAL */}
      <Modal visible={mileageModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>⏱️ Показатели автомобиля</Text>

            <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 4 }}>Полный пробег по одометру (км):</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text, fontSize: 16, fontWeight: 'bold' }]}
              keyboardType="numeric"
              value={inputKm}
              onChangeText={onMileageInputChange}
            />

            {mileageHint && (
              <View style={styles.hintBox}>
                <Text style={{ fontSize: 11, color: '#d97706', fontWeight: 'bold' }}>
                  ⚠️ Внимание: введенное значение ({mileageHint.num} км) меньше последнего ТО ({mileageHint.lastKm} км)
                </Text>
                <TouchableOpacity
                  onPress={() => { setInputKm(String(mileageHint.combined)); setMileageHint(null); }}
                  style={styles.hintBtn}
                >
                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#92400e' }}>
                    ➔ Подставить {mileageHint.combined} км ({mileageHint.lastKm} + {mileageHint.num})
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 4, marginTop: 12 }}>Текущие моточасы (м/ч):</Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text, fontSize: 16, fontWeight: 'bold' }]}
              keyboardType="numeric"
              value={inputHours}
              onChangeText={setInputHours}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setMileageModalVisible(false)} style={styles.modalCancelBtn}>
                <Text style={{ color: colors.textMuted, fontWeight: 'bold' }}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveMileage} style={styles.modalConfirmBtn}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Сохранить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 3. FUEL RECORD MODAL */}
      <Modal visible={fuelModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.card, maxHeight: '90%' }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {editingFuelId ? '⛽ Редактировать заправку' : '⛽ Новая заправка топлива'}
              </Text>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 2 }}>Дата:</Text>
                  <TextInput
                    style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                    value={fuelDate}
                    onChangeText={setFuelDate}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 2 }}>Пробег (км):</Text>
                  <TextInput
                    style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text, fontWeight: 'bold' }]}
                    keyboardType="numeric"
                    value={fuelKm}
                    onChangeText={setFuelKm}
                  />
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 2 }}>Объем (литров):</Text>
                  <TextInput
                    style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text, fontWeight: 'bold' }]}
                    keyboardType="numeric"
                    placeholder="45.0"
                    placeholderTextColor={colors.textMuted}
                    value={fuelLiters}
                    onChangeText={(val) => onFuelLitersOrPriceChange(val, fuelPricePerLiter)}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 2 }}>Цена за литр (₽):</Text>
                  <TextInput
                    style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                    keyboardType="numeric"
                    placeholder="59.5"
                    placeholderTextColor={colors.textMuted}
                    value={fuelPricePerLiter}
                    onChangeText={(val) => onFuelLitersOrPriceChange(fuelLiters, val)}
                  />
                </View>
              </View>

              <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 2 }}>Итоговая сумма (₽):</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: '#10b981', fontSize: 16, fontWeight: 'bold' }]}
                keyboardType="numeric"
                placeholder="2670"
                placeholderTextColor={colors.textMuted}
                value={fuelTotalPrice}
                onChangeText={setFuelTotalPrice}
              />

              {/* Fuel Type Pills */}
              <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 4 }}>Тип топлива:</Text>
              <View style={{ flexDirection: 'row', gap: 6, marginBottom: 10 }}>
                {['АИ-92', 'АИ-95', 'АИ-100', 'ДТ', 'Газ'].map(ft => (
                  <TouchableOpacity
                    key={ft}
                    onPress={() => setFuelType(ft)}
                    style={[
                      styles.filterPill,
                      { backgroundColor: fuelType === ft ? '#10b981' : colors.cardSecondary, borderColor: colors.cardBorder }
                    ]}
                  >
                    <Text style={{ fontSize: 11, fontWeight: 'bold', color: fuelType === ft ? '#fff' : colors.textMuted }}>{ft}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Full tank toggle */}
              <TouchableOpacity
                onPress={() => setFuelIsFullTank(!fuelIsFullTank)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 6 }}
              >
                <Text style={{ fontSize: 18 }}>{fuelIsFullTank ? '✅' : '⬜'}</Text>
                <Text style={{ fontSize: 12, color: colors.text, fontWeight: '600' }}>Заправка до полного бака (для расчета л/100км)</Text>
              </TouchableOpacity>

              <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 2, marginTop: 6 }}>АЗС / Сеть (необязательно):</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                placeholder="Газпромнефть, Лукойл, Teboil..."
                placeholderTextColor={colors.textMuted}
                value={fuelStation}
                onChangeText={setFuelStation}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity onPress={() => setFuelModalVisible(false)} style={styles.modalCancelBtn}>
                  <Text style={{ color: colors.textMuted, fontWeight: 'bold' }}>Отмена</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={saveFuelRecord} style={[styles.modalConfirmBtn, { backgroundColor: '#10b981' }]}>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Сохранить</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 4. OTHER EXPENSE / INSURANCE MODAL */}
      <Modal visible={expenseModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.card, maxHeight: '90%' }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {editingExpenseId ? '📄 Редактировать расход' : '📄 Новый расход / Страховка'}
              </Text>

              {/* Category Pills */}
              <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 4 }}>Категория:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 10 }}>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {['Страховка', 'Налоги', 'Штрафы', 'Мойка/Уход', 'Платные дороги', 'Парковка', 'Прочее'].map(cat => (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setExpCategory(cat)}
                      style={[
                        styles.filterPill,
                        { backgroundColor: expCategory === cat ? '#8b5cf6' : colors.cardSecondary, borderColor: colors.cardBorder }
                      ]}
                    >
                      <Text style={{ fontSize: 11, fontWeight: 'bold', color: expCategory === cat ? '#fff' : colors.textMuted }}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 2 }}>Наименование:</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                placeholder={expCategory === 'Страховка' ? 'Полис ОСАГО (Ингосстрах)' : 'Комплексная мойка, Транспондер...'}
                placeholderTextColor={colors.textMuted}
                value={expTitle}
                onChangeText={setExpTitle}
              />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 2 }}>Сумма (₽):</Text>
                  <TextInput
                    style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: '#8b5cf6', fontSize: 15, fontWeight: 'bold' }]}
                    keyboardType="numeric"
                    placeholder="8400"
                    placeholderTextColor={colors.textMuted}
                    value={expTotal}
                    onChangeText={setExpTotal}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 2 }}>Дата расхода:</Text>
                  <TextInput
                    style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                    value={expDate}
                    onChangeText={setExpDate}
                  />
                </View>
              </View>

              {expCategory === 'Страховка' && (
                <View style={{ marginTop: 4 }}>
                  <Text style={{ fontSize: 11, color: colors.warning, fontWeight: 'bold', marginBottom: 2 }}>
                    Срок действия полиса до (ГГГГ-ММ-ДД):
                  </Text>
                  <TextInput
                    style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.warning, color: colors.text }]}
                    placeholder="2027-05-10"
                    placeholderTextColor={colors.textMuted}
                    value={expExpiryDate}
                    onChangeText={setExpExpiryDate}
                  />
                  <Text style={{ fontSize: 10, color: colors.textMuted, marginBottom: 8 }}>
                    💡 Приложение автоматически напомнит о продлении за 30, 14 и 3 дня.
                  </Text>
                </View>
              )}

              <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 2 }}>Заметки (необязательно):</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                placeholder="Номер полиса, детали..."
                placeholderTextColor={colors.textMuted}
                value={expNote}
                onChangeText={setExpNote}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity onPress={() => setExpenseModalVisible(false)} style={styles.modalCancelBtn}>
                  <Text style={{ color: colors.textMuted, fontWeight: 'bold' }}>Отмена</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={saveExpenseRecord} style={[styles.modalConfirmBtn, { backgroundColor: '#8b5cf6' }]}>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Сохранить</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 5. TYRE SET MODAL */}
      <Modal visible={tyreModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.card }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>🛞 Комплект шин</Text>

              <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 2 }}>Название комплекта:</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                placeholder="Летний комплект Continental"
                placeholderTextColor={colors.textMuted}
                value={tyreName}
                onChangeText={setTyreName}
              />

              <View style={{ flexDirection: 'row', gap: 10, marginVertical: 6 }}>
                <TouchableOpacity
                  onPress={() => setTyreSeason('summer')}
                  style={[
                    styles.filterPill,
                    { flex: 1, alignItems: 'center', backgroundColor: tyreSeason === 'summer' ? '#10b981' : colors.cardSecondary }
                  ]}
                >
                  <Text style={{ fontSize: 12, fontWeight: 'bold', color: tyreSeason === 'summer' ? '#fff' : colors.textMuted }}>☀️ Лето</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setTyreSeason('winter')}
                  style={[
                    styles.filterPill,
                    { flex: 1, alignItems: 'center', backgroundColor: tyreSeason === 'winter' ? '#3b82f6' : colors.cardSecondary }
                  ]}
                >
                  <Text style={{ fontSize: 12, fontWeight: 'bold', color: tyreSeason === 'winter' ? '#fff' : colors.textMuted }}>❄️ Зима</Text>
                </TouchableOpacity>
              </View>

              <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 2 }}>Модель резины:</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                placeholder="Nokian Hakkapeliitta, Continental..."
                placeholderTextColor={colors.textMuted}
                value={tyreBrandModel}
                onChangeText={setTyreBrandModel}
              />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 2 }}>Размерность:</Text>
                  <TextInput
                    style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                    placeholder="225/55 R19"
                    placeholderTextColor={colors.textMuted}
                    value={tyreSize}
                    onChangeText={setTyreSize}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 2 }}>Протектор (мм):</Text>
                  <TextInput
                    style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                    keyboardType="numeric"
                    placeholder="8.0"
                    placeholderTextColor={colors.textMuted}
                    value={tyreTread}
                    onChangeText={setTyreTread}
                  />
                </View>
              </View>

              <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 2 }}>Накопленный пробег на резине (км):</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={colors.textMuted}
                value={tyreKm}
                onChangeText={setTyreKm}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity onPress={() => setTyreModalVisible(false)} style={styles.modalCancelBtn}>
                  <Text style={{ color: colors.textMuted, fontWeight: 'bold' }}>Отмена</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={saveTyreSet} style={[styles.modalConfirmBtn, { backgroundColor: '#8b5cf6' }]}>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Сохранить</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 6. TO EVENT MODAL */}
      <Modal visible={toModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.card, maxHeight: '92%' }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {editingToTag ? ('🔧 Редактирование ' + editingToTag) : '🔧 Новое событие ТО'}
              </Text>

              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={{ flex: 1.2 }}>
                  <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 2 }}>Метка (ТО-1, ТО-2):</Text>
                  <TextInput
                    style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text, fontWeight: 'bold' }]}
                    value={toTag}
                    onChangeText={setToTag}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 2 }}>Дата:</Text>
                  <TextInput
                    style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                    value={toDate}
                    onChangeText={setToDate}
                  />
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 2 }}>Пробег (км):</Text>
                  <TextInput
                    style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text, fontWeight: 'bold' }]}
                    keyboardType="numeric"
                    value={toKm}
                    onChangeText={setToKm}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 2 }}>Моточасы (м/ч):</Text>
                  <TextInput
                    style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                    keyboardType="numeric"
                    value={toHours}
                    onChangeText={setToHours}
                  />
                </View>
              </View>

              <Text style={{ fontSize: 12, fontWeight: 'bold', color: colors.text, marginVertical: 8 }}>
                Детали и работы ТО ({toParts.length}):
              </Text>

              {toParts.map((p, pIdx) => (
                <View key={p.temp_id || pIdx} style={[styles.consumableCard, { backgroundColor: colors.cardSecondary, borderColor: colors.cardBorder }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: colors.text, flex: 1 }}>{p.item_name}</Text>
                    <TouchableOpacity
                      onPress={() => {
                        const updated = toParts.filter((_, idx) => idx !== pIdx);
                        setToParts(updated);
                      }}
                    >
                      <Text style={{ fontSize: 12, color: '#ef4444', fontWeight: 'bold' }}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                    <TextInput
                      style={[styles.modalInput, { flex: 1, backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: '#10b981', fontWeight: 'bold', marginBottom: 0, paddingVertical: 4 }]}
                      keyboardType="numeric"
                      placeholder="Стоимость (₽)"
                      placeholderTextColor={colors.textMuted}
                      value={String(p.total_price || '')}
                      onChangeText={(val) => {
                        const updated = [...toParts];
                        updated[pIdx].total_price = val;
                        setToParts(updated);
                      }}
                    />
                    <TextInput
                      style={[styles.modalInput, { flex: 1, backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text, marginBottom: 0, paddingVertical: 4 }]}
                      placeholder="Артикул / Бренд"
                      placeholderTextColor={colors.textMuted}
                      value={p.article || p.brand || ''}
                      onChangeText={(val) => {
                        const updated = [...toParts];
                        updated[pIdx].article = val;
                        setToParts(updated);
                      }}
                    />
                  </View>
                </View>
              ))}

              <TouchableOpacity
                onPress={() => {
                  setToParts([
                    ...toParts,
                    {
                      temp_id: 'part_' + Date.now(),
                      item_name: 'Новая деталь / работа',
                      category: 'Прочее',
                      total_price: '',
                      interval_km: 7500,
                      interval_hours: 0
                    }
                  ]);
                }}
                style={{ paddingVertical: 8, alignItems: 'center', marginBottom: 12 }}
              >
                <Text style={{ fontSize: 12, color: '#3b82f6', fontWeight: 'bold' }}>+ Добавить еще позицию в ТО</Text>
              </TouchableOpacity>

              <View style={styles.modalActions}>
                <TouchableOpacity onPress={() => setToModalVisible(false)} style={styles.modalCancelBtn}>
                  <Text style={{ color: colors.textMuted, fontWeight: 'bold' }}>Отмена</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={saveTOEvent} style={[styles.modalConfirmBtn, { backgroundColor: '#3b82f6' }]}>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Сохранить ТО</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 7. TRACKER / REGULATION MODAL */}
      <Modal visible={trackerModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.card, maxHeight: '90%' }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {editingTrackerId ? '⚙️ Редактировать регламент' : '⚙️ Новый регламент ТО'}
              </Text>

              <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 2 }}>Наименование узла / расходника:</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                placeholder="Масло моторное, Тормозная жидкость..."
                placeholderTextColor={colors.textMuted}
                value={trName}
                onChangeText={setTrName}
              />

              <View style={{ flexDirection: 'row', gap: 6, marginBottom: 8 }}>
                {['🛢️', '⚙️', '💨', '❄️', '⚡', '🧪', '🛑', '🔄', '🔘'].map(emoji => (
                  <TouchableOpacity
                    key={emoji}
                    onPress={() => setTrIcon(emoji)}
                    style={{
                      padding: 6,
                      borderRadius: 8,
                      backgroundColor: trIcon === emoji ? '#3b82f630' : colors.cardSecondary,
                      borderWidth: 1,
                      borderColor: trIcon === emoji ? '#3b82f6' : colors.cardBorder
                    }}
                  >
                    <Text style={{ fontSize: 16 }}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 2 }}>Интервалы замены (комбинированные):</Text>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 10, color: colors.textMuted }}>Каждые (км):</Text>
                  <TextInput
                    style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                    keyboardType="numeric"
                    value={trKm}
                    onChangeText={setTrKm}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 10, color: colors.textMuted }}>Каждые (м/ч):</Text>
                  <TextInput
                    style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                    keyboardType="numeric"
                    value={trHours}
                    onChangeText={setTrHours}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 10, color: colors.textMuted }}>ИЛИ (месяцев):</Text>
                  <TextInput
                    style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                    keyboardType="numeric"
                    value={trMonths}
                    onChangeText={setTrMonths}
                  />
                </View>
              </View>

              <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 2 }}>Спецификация / Допуск:</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                placeholder="SAE 0W-20 SP / C5..."
                placeholderTextColor={colors.textMuted}
                value={trSpec}
                onChangeText={setTrSpec}
              />

              <View style={styles.modalActions}>
                <TouchableOpacity onPress={() => setTrackerModalVisible(false)} style={styles.modalCancelBtn}>
                  <Text style={{ color: colors.textMuted, fontWeight: 'bold' }}>Отмена</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={saveTracker} style={[styles.modalConfirmBtn, { backgroundColor: '#3b82f6' }]}>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Сохранить</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* 8. IMPORT BACKUP MODAL */}
      <Modal visible={importModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.card, maxHeight: '85%' }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>📥 Импорт бэкапа JSON</Text>
            <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 12 }}>
              Выберите файл бэкапа (.json), выгруженный из веб-версии или мобильного приложения, или вставьте его содержимое:
            </Text>

            <TouchableOpacity 
              onPress={handlePickAndImportBackup} 
              style={[styles.saveBtn, { backgroundColor: '#3b82f6', marginBottom: 14, paddingVertical: 12 }]}
              activeOpacity={0.8}
            >
              <Text style={[styles.saveBtnText, { fontSize: 13 }]}>📂 Выбрать файл .json с устройства</Text>
            </TouchableOpacity>

            <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 6 }}>Или вставьте текст JSON вручную:</Text>
            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: colors.inputBg,
                  borderColor: colors.inputBorder,
                  color: colors.text,
                  height: 120,
                  textAlignVertical: 'top',
                  fontFamily: 'monospace',
                  fontSize: 11
                }
              ]}
              multiline
              placeholder='{"version": "2.6", "app": "car-maintenance-app", "vehicle": {...}, "maintenance_records": [...] ...}'
              placeholderTextColor={colors.textMuted}
              value={importJsonText}
              onChangeText={setImportJsonText}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setImportModalVisible(false)} style={styles.modalCancelBtn}>
                <Text style={{ color: colors.textMuted, fontWeight: 'bold' }}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleImportBackupText} style={[styles.modalConfirmBtn, { backgroundColor: '#10b981' }]}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Восстановить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 9. GARAGE MODAL */}
      <Modal visible={garageModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.card, maxHeight: '90%' }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {editCarId ? '🚗 Редактировать автомобиль' : '🚗 Новый автомобиль в гараже'}
              </Text>

              <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 2 }}>Марка:</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                placeholder="Changan, Haval..."
                placeholderTextColor={colors.textMuted}
                value={carBrand}
                onChangeText={setCarBrand}
              />

              <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 2 }}>Модель:</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                placeholder="CS55 Plus..."
                placeholderTextColor={colors.textMuted}
                value={carModel}
                onChangeText={setCarModel}
              />

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 2 }}>Госномер:</Text>
                  <TextInput
                    style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                    placeholder="А 777 АА 777"
                    placeholderTextColor={colors.textMuted}
                    value={carPlate}
                    onChangeText={setCarPlate}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 2 }}>Год:</Text>
                  <TextInput
                    style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                    keyboardType="numeric"
                    placeholder="2023"
                    placeholderTextColor={colors.textMuted}
                    value={carYear}
                    onChangeText={setCarYear}
                  />
                </View>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity onPress={() => setGarageModalVisible(false)} style={styles.modalCancelBtn}>
                  <Text style={{ color: colors.textMuted, fontWeight: 'bold' }}>Отмена</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={saveVehicle} style={[styles.modalConfirmBtn, { backgroundColor: '#3b82f6' }]}>
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Сохранить</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1
  },
  carIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#3b82f620',
    alignItems: 'center',
    justifyContent: 'center'
  },
  headerCarInfo: {
    flex: 1
  },
  carNameText: {
    fontSize: 14,
    fontWeight: 'bold'
  },
  carSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2
  },
  plateBadge: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#475569'
  },
  plateBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#f8fafc',
    letterSpacing: 0.5
  },
  carSubText: {
    fontSize: 11
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  mainScrollView: {
    flex: 1
  },
  tabContent: {
    padding: 16
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  kpiCard: {
    width: (SCREEN_WIDTH - 42) / 2,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1
  },
  kpiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5
  },
  kpiEditBtn: {
    paddingHorizontal: 4,
    paddingVertical: 2
  },
  kpiValue: {
    fontSize: 15,
    fontWeight: 'bold',
    marginVertical: 4
  },
  kpiSub: {
    fontSize: 10,
    fontWeight: '600'
  },
  quickActionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  quickActionBtnText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#ffffff'
  },
  viewSwitcher: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 3,
    gap: 4,
    marginBottom: 6
  },
  viewSwitchBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 9,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent'
  },
  viewSwitchText: {
    fontSize: 11,
    fontWeight: 'bold'
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10
  },
  smallAddBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  consumableCard: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10
  },
  consumableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6
  },
  consumableName: {
    fontSize: 13,
    fontWeight: 'bold'
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginVertical: 6
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3
  },
  consumableFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2
  },
  timelineCard: {
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1
  },
  searchInput: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 12,
    marginBottom: 12
  },
  settingsCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 12
  },
  settingsTitle: {
    fontSize: 14,
    fontWeight: 'bold'
  },
  settingInput: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 12
  },
  saveBtn: {
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  saveBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff'
  },
  developerInfoBox: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1
  },
  devBadge: {
    backgroundColor: '#3b82f620',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#3b82f6'
  },
  devBadgeText: {
    fontSize: 10,
    color: '#3b82f6',
    fontWeight: 'bold'
  },
  garageCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    height: 65,
    borderTopWidth: 1,
    paddingBottom: 10
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 6
  },
  navText: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 2
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    padding: 16
  },
  modalBox: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#334155'
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10
  },
  modalInput: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    fontSize: 13,
    marginBottom: 10
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 12
  },
  modalCancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10
  },
  modalConfirmBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#3b82f6'
  },
  hintBox: {
    backgroundColor: '#fef3c7',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f59e0b'
  },
  hintBtn: {
    marginTop: 6,
    paddingVertical: 4
  }
});
