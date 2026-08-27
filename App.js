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
  Share
} from 'react-native';
import {
  loadDatabase,
  saveDatabase,
  resetDatabase,
  getActiveVehicle,
  calculateDashboardStatus,
  getTOGroups
} from './src/storage';

export default function App() {
  const [db, setDb] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'to-events', 'all-parts', 'settings', 'garage'
  const [theme, setTheme] = useState('dark');
  const [isAdmin, setIsAdmin] = useState(false);

  // Modals state
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [authPassword, setAuthPassword] = useState('');
  const [pendingAction, setPendingAction] = useState(null);

  // Mileage modal
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

  // Tracker / Regulation Modal
  const [trackerModalVisible, setTrackerModalVisible] = useState(false);
  const [editingTrackerId, setEditingTrackerId] = useState(null);
  const [trName, setTrName] = useState('');
  const [trCategory, setTrCategory] = useState('Двигатель');
  const [trMatch, setTrMatch] = useState('');
  const [trKm, setTrKm] = useState('7500');
  const [trHours, setTrHours] = useState('250');
  const [trWarnKm, setTrWarnKm] = useState('1500');
  const [trWarnHours, setTrWarnHours] = useState('30');
  const [trSpec, setTrSpec] = useState('');
  const [trBrand, setTrBrand] = useState('');
  const [trArticle, setTrArticle] = useState('');
  const [trIcon, setTrIcon] = useState('⚙️');

  // Backup Import Modal
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Password change
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');

  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    const loaded = await loadDatabase();
    setDb(loaded);
    if (loaded && loaded.theme) setTheme(loaded.theme);
  };

  const updateDb = async (newDb) => {
    setDb(newDb);
    await saveDatabase(newDb);
  };

  const requireAuth = (callback) => {
    if (isAdmin) {
      callback();
    } else {
      setPendingAction(() => callback);
      setAuthPassword('');
      setAuthModalVisible(true);
    }
  };

  const handleLogin = () => {
    const expected = db?.admin_password || 'admin';
    if (authPassword === expected) {
      setIsAdmin(true);
      setAuthModalVisible(false);
      if (pendingAction) {
        pendingAction();
        setPendingAction(null);
      }
    } else {
      Alert.alert('Ошибка', 'Неверный пароль! (По умолчанию: admin)');
    }
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    if (db) {
      updateDb({ ...db, theme: next });
    }
  };

  if (!db) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#fff', fontSize: 16 }}>Загрузка Авто ТО...</Text>
      </SafeAreaView>
    );
  }

  const isDark = theme === 'dark';
  const colors = {
    bg: isDark ? '#0b1120' : '#f8fafc',
    card: isDark ? '#1e293b' : '#ffffff',
    cardBorder: isDark ? '#334155' : '#e2e8f0',
    cardSecondary: isDark ? '#141e33' : '#f1f5f9',
    text: isDark ? '#f8fafc' : '#0f172a',
    textMuted: isDark ? '#94a3b8' : '#64748b',
    primary: '#3b82f6',
    primaryBg: isDark ? '#1e3a8a30' : '#dbeafe',
    inputBg: isDark ? '#0f172a' : '#ffffff',
    inputBorder: isDark ? '#334155' : '#cbd5e1',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444'
  };

  const activeVehicle = getActiveVehicle(db);
  const statusData = calculateDashboardStatus(db);
  const toGroups = getTOGroups(db);

  // --- MILEAGE MODAL HANDLERS ---
  const openMileageModal = () => {
    const records = (db.maintenance_records || []).filter(r => (r.vehicle_id || 'car_1') === activeVehicle?.id);
    const lastKm = records.reduce((max, r) => Math.max(max, Number(r.mileage) || 0), 0);
    const lastH = records.reduce((max, r) => Math.max(max, Number(r.engine_hours) || 0), 0);

    setInputKm(String(activeVehicle?.current_km || lastKm || 25340));
    setInputHours(String(activeVehicle?.current_engine_hours || lastH || 772));
    setMileageHint(null);
    setMileageModalVisible(true);
  };

  const onMileageInputChange = (val) => {
    setInputKm(val);
    const num = parseInt(val, 10) || 0;
    const records = (db.maintenance_records || []).filter(r => (r.vehicle_id || 'car_1') === activeVehicle?.id);
    const lastKm = records.reduce((max, r) => Math.max(max, Number(r.mileage) || 0), 0);

    if (lastKm > 0 && num > 0 && num < lastKm) {
      setMileageHint({ num, combined: lastKm + num, lastKm });
    } else {
      setMileageHint(null);
    }
  };

  const saveMileage = () => {
    requireAuth(() => {
      const km = parseInt(inputKm, 10) || 0;
      const hours = parseInt(inputHours, 10) || 0;

      const newVehicles = (db.vehicles || []).map(v => {
        if (v.id === activeVehicle.id) {
          return { ...v, current_km: km, current_engine_hours: hours };
        }
        return v;
      });

      updateDb({ ...db, vehicles: newVehicles });
      setMileageModalVisible(false);
      Alert.alert('Успешно', 'Пробег и моточасы обновлены');
    });
  };

  // --- TO EVENT HANDLERS ---
  const openNewTOModal = () => {
    requireAuth(() => {
      setEditingToTag('');
      const nextNum = toGroups.length + 1;
      setToTag(`ТО-${nextNum}`);
      setToDate(new Date().toISOString().split('T')[0]);
      setToKm(String(activeVehicle?.current_km || 25340));
      setToHours(String(activeVehicle?.current_engine_hours || 772));
      setToParts([
        {
          id: Date.now(),
          category: 'Двигатель',
          item_name: 'Масло моторное (0W-20)',
          brand: 'Лукойл Genesis JP',
          article: '1658134508',
          quantity: '4.5',
          unit: 'л',
          price_type: 'total', // 'total' (за позицию) или 'unit' (за 1 ед.)
          price: '3600',
          interval_km: '7500',
          interval_hours: '250',
          store: 'Ozon'
        }
      ]);
      setToModalVisible(true);
    });
  };

  const openEditTOModal = (group) => {
    requireAuth(() => {
      setEditingToTag(group.to_tag);
      setToTag(group.to_tag);
      setToDate(group.date);
      setToKm(String(group.mileage));
      setToHours(String(group.engine_hours));
      setToParts(group.parts.map((p, idx) => ({
        id: p.id || Date.now() + idx,
        category: p.category || 'Двигатель',
        item_name: p.item_name || '',
        brand: p.brand || '',
        article: p.article || '',
        quantity: String(p.quantity || 1),
        unit: p.unit || 'шт',
        price_type: p.price_type || 'total',
        price: String(p.price_type === 'unit' ? (p.price_per_unit || p.total_price) : (p.total_price || p.price_per_unit || 0)),
        interval_km: String(p.interval_km || 7500),
        interval_hours: String(p.interval_hours || 0),
        store: p.store || ''
      })));
      setToModalVisible(true);
    });
  };

  const addPartRow = () => {
    setToParts([
      ...toParts,
      {
        id: Date.now(),
        category: 'Фильтры',
        item_name: '',
        brand: '',
        article: '',
        quantity: '1',
        unit: 'шт',
        price_type: 'total',
        price: '',
        interval_km: '7500',
        interval_hours: '250',
        store: 'Ozon'
      }
    ]);
  };

  const removePartRow = (id) => {
    setToParts(toParts.filter(p => p.id !== id));
  };

  const updatePartField = (id, field, val) => {
    setToParts(toParts.map(p => p.id === id ? { ...p, [field]: val } : p));
  };

  const populatePartFromTracker = (partId, tracker) => {
    setToParts(toParts.map(p => {
      if (p.id === partId) {
        return {
          ...p,
          category: tracker.category,
          item_name: tracker.name,
          brand: tracker.brand || '',
          article: tracker.article || '',
          interval_km: String(tracker.interval_km || 7500),
          interval_hours: String(tracker.interval_hours || 0)
        };
      }
      return p;
    }));
  };

  const calculateLiveTOTotal = () => {
    return toParts.reduce((sum, p) => {
      const qty = parseFloat(p.quantity) || 1;
      const pr = parseFloat(p.price) || 0;
      const rowTotal = p.price_type === 'unit' ? (pr * qty) : pr;
      return sum + rowTotal;
    }, 0);
  };

  const saveTOEvent = () => {
    if (!toTag.trim()) {
      Alert.alert('Ошибка', 'Введите название ТО (например: ТО-4)');
      return;
    }
    if (toParts.length === 0) {
      Alert.alert('Ошибка', 'Добавьте хотя бы одну деталь в ТО');
      return;
    }

    const mileageNum = parseInt(toKm, 10) || 0;
    const hoursNum = parseInt(toHours, 10) || 0;
    const vId = activeVehicle.id;

    let currentRecords = (db.maintenance_records || []);
    if (editingToTag) {
      currentRecords = currentRecords.filter(r => !(r.vehicle_id === vId && r.to_tag === editingToTag));
    }

    let maxId = currentRecords.reduce((max, r) => Math.max(max, Number(r.id) || 0), 0);

    const newRecords = toParts.map(p => {
      maxId += 1;
      const qty = parseFloat(p.quantity) || 1;
      const pr = parseFloat(p.price) || 0;
      const pType = p.price_type || 'total';
      const rowTotal = pType === 'unit' ? (pr * qty) : pr;
      const intKm = parseInt(p.interval_km, 10) || 7500;
      const intH = parseInt(p.interval_hours, 10) || 0;

      return {
        id: maxId,
        vehicle_id: vId,
        to_tag: toTag.trim(),
        date: toDate.trim(),
        mileage: mileageNum,
        engine_hours: hoursNum,
        category: p.category || 'Двигатель',
        item_name: p.item_name || 'Деталь',
        brand: p.brand || '',
        article: p.article || '',
        quantity: qty,
        unit: p.unit || 'шт',
        price_type: pType,
        price_per_unit: pType === 'unit' ? pr : (qty > 0 ? Math.round((pr / qty) * 100) / 100 : pr),
        total_price: rowTotal,
        interval_km: intKm,
        interval_hours: intH,
        next_km: mileageNum + intKm,
        next_hours: intH > 0 ? (hoursNum + intH) : 0,
        store: p.store || '',
        note: 'Плановая замена'
      };
    });

    const updatedVehicles = (db.vehicles || []).map(v => {
      if (v.id === vId) {
        return {
          ...v,
          current_km: Math.max(Number(v.current_km) || 0, mileageNum),
          current_engine_hours: Math.max(Number(v.current_engine_hours) || 0, hoursNum)
        };
      }
      return v;
    });

    updateDb({
      ...db,
      vehicles: updatedVehicles,
      maintenance_records: [...currentRecords, ...newRecords]
    });

    setToModalVisible(false);
    Alert.alert('Успешно', `Событие ${toTag} сохранено!`);
  };

  const deleteTOEvent = (tag) => {
    requireAuth(() => {
      Alert.alert('Удаление ТО', `Вы уверены, что хотите удалить ${tag} и все детали внутри?`, [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: () => {
            const vId = activeVehicle.id;
            const updated = (db.maintenance_records || []).filter(r => !(r.vehicle_id === vId && r.to_tag === tag));
            updateDb({ ...db, maintenance_records: updated });
            Alert.alert('Удалено', `Событие ${tag} удалено`);
          }
        }
      ]);
    });
  };

  // --- GARAGE HANDLERS ---
  const fillCarForm = (v) => {
    if (v) {
      setEditCarId(v.id);
      setCarBrand(v.brand || '');
      setCarModel(v.model || '');
      setCarPlate(v.plate || '');
      setCarEngine(v.engine || '');
      setCarYear(v.year ? String(v.year) : '');
      setCarVin(v.vin || '');
      setCarOil(v.oil_spec || '');
    } else {
      setEditCarId(null);
      setCarBrand('');
      setCarModel('');
      setCarPlate('');
      setCarEngine('');
      setCarYear('');
      setCarVin('');
      setCarOil('');
    }
  };

  const saveCarProfile = () => {
    requireAuth(() => {
      if (!carBrand.trim() || !carModel.trim()) {
        Alert.alert('Ошибка', 'Укажите марку и модель автомобиля');
        return;
      }

      let vehicles = [...(db.vehicles || [])];
      if (editCarId) {
        vehicles = vehicles.map(v => v.id === editCarId ? {
          ...v,
          brand: carBrand.trim(),
          model: carModel.trim(),
          name: `${carBrand.trim()} ${carModel.trim()}`,
          plate: carPlate.trim(),
          engine: carEngine.trim(),
          year: parseInt(carYear, 10) || null,
          vin: carVin.trim(),
          oil_spec: carOil.trim()
        } : v);
      } else {
        const newId = `car_${Date.now()}`;
        const newCar = {
          id: newId,
          brand: carBrand.trim(),
          model: carModel.trim(),
          name: `${carBrand.trim()} ${carModel.trim()}`,
          plate: carPlate.trim(),
          engine: carEngine.trim(),
          year: parseInt(carYear, 10) || null,
          vin: carVin.trim(),
          oil_spec: carOil.trim(),
          current_km: 0,
          current_engine_hours: 0
        };
        vehicles.push(newCar);
        db.active_vehicle_id = newId;
      }

      updateDb({ ...db, vehicles });
      setGarageModalVisible(false);
      Alert.alert('Успешно', 'Автомобиль сохранен в гараже');
    });
  };

  const switchCar = (id) => {
    updateDb({ ...db, active_vehicle_id: id });
  };

  const deleteCar = (id) => {
    requireAuth(() => {
      if ((db.vehicles || []).length <= 1) {
        Alert.alert('Ошибка', 'Нельзя удалить единственный автомобиль');
        return;
      }
      Alert.alert('Удаление авто', 'Удалить этот автомобиль и его историю ТО?', [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: () => {
            const nextVehicles = (db.vehicles || []).filter(v => v.id !== id);
            const nextActive = id === db.active_vehicle_id ? nextVehicles[0].id : db.active_vehicle_id;
            const nextRecords = (db.maintenance_records || []).filter(r => r.vehicle_id !== id);
            updateDb({
              ...db,
              active_vehicle_id: nextActive,
              vehicles: nextVehicles,
              maintenance_records: nextRecords
            });
            Alert.alert('Удалено', 'Автомобиль удален из гаража');
          }
        }
      ]);
    });
  };

  // --- TRACKERS / REGULATIONS HANDLERS ---
  const openEditTrackerModal = (tr) => {
    requireAuth(() => {
      if (tr) {
        setEditingTrackerId(tr.id);
        setTrName(tr.name || '');
        setTrCategory(tr.category || 'Двигатель');
        setTrMatch(tr.match || '');
        setTrKm(String(tr.interval_km || 7500));
        setTrHours(String(tr.interval_hours || 0));
        setTrWarnKm(String(tr.warn_km || 1500));
        setTrWarnHours(String(tr.warn_hours || 0));
        setTrSpec(tr.spec || '');
        setTrBrand(tr.brand || '');
        setTrArticle(tr.article || '');
        setTrIcon(tr.icon || '⚙️');
      } else {
        setEditingTrackerId(null);
        setTrName('');
        setTrCategory('Двигатель');
        setTrMatch('');
        setTrKm('7500');
        setTrHours('0');
        setTrWarnKm('1500');
        setTrWarnHours('0');
        setTrSpec('');
        setTrBrand('');
        setTrArticle('');
        setTrIcon('⚙️');
      }
      setTrackerModalVisible(true);
    });
  };

  const saveTracker = () => {
    requireAuth(() => {
      if (!trName.trim()) {
        Alert.alert('Ошибка', 'Введите наименование регламента');
        return;
      }

      let trackers = [...(db.trackers || [])];
      const kmNum = parseInt(trKm, 10) || 7500;
      const hoursNum = parseInt(trHours, 10) || 0;
      const warnKmNum = parseInt(trWarnKm, 10) || 1500;
      const warnHoursNum = parseInt(trWarnHours, 10) || 0;

      if (editingTrackerId) {
        trackers = trackers.map(t => t.id === editingTrackerId ? {
          ...t,
          name: trName.trim(),
          category: trCategory.trim(),
          match: trMatch.trim() || trName.trim().toLowerCase(),
          interval_km: kmNum,
          interval_hours: hoursNum,
          warn_km: warnKmNum,
          warn_hours: warnHoursNum,
          spec: trSpec.trim(),
          brand: trBrand.trim(),
          article: trArticle.trim(),
          icon: trIcon.trim() || '⚙️'
        } : t);
      } else {
        trackers.push({
          id: `tr_${Date.now()}`,
          name: trName.trim(),
          category: trCategory.trim(),
          match: trMatch.trim() || trName.trim().toLowerCase(),
          interval_km: kmNum,
          interval_hours: hoursNum,
          warn_km: warnKmNum,
          warn_hours: warnHoursNum,
          spec: trSpec.trim(),
          brand: trBrand.trim(),
          article: trArticle.trim(),
          icon: trIcon.trim() || '⚙️',
          enabled: true
        });
      }

      updateDb({ ...db, trackers });
      setTrackerModalVisible(false);
      Alert.alert('Успешно', 'Регламент сохранен');
    });
  };

  const deleteTracker = (id) => {
    requireAuth(() => {
      Alert.alert('Удаление регламента', 'Вы уверены, что хотите удалить этот регламент?', [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: () => {
            const nextTrackers = (db.trackers || []).filter(t => t.id !== id);
            updateDb({ ...db, trackers: nextTrackers });
            Alert.alert('Удалено', 'Регламент удален');
          }
        }
      ]);
    });
  };

  // --- BACKUP EXPORT & IMPORT ---
  const exportBackup = async () => {
    try {
      const jsonStr = JSON.stringify(db, null, 2);
      await Share.share({
        message: jsonStr,
        title: `car_maintenance_backup_${new Date().toISOString().split('T')[0]}.json`
      });
    } catch (e) {
      Alert.alert('Ошибка экспорта', e.message);
    }
  };

  const handleImportBackup = () => {
    requireAuth(() => {
      try {
        const parsed = JSON.parse(importJsonText);
        if (!parsed.vehicles || !parsed.trackers) {
          Alert.alert('Ошибка', 'Некорректная структура файла бэкапа JSON');
          return;
        }
        updateDb(parsed);
        setImportModalVisible(false);
        setImportJsonText('');
        Alert.alert('Успешно', 'База данных успешно восстановлена из бэкапа!');
      } catch (e) {
        Alert.alert('Ошибка парсинга', 'Введен некорректный JSON текст');
      }
    });
  };

  const handleResetDb = () => {
    requireAuth(() => {
      Alert.alert('Сброс базы данных', 'Сбросить все данные к исходным заводским настройкам (Changan CS55 Plus, ТО-2, ТО-3)?', [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Сбросить',
          style: 'destructive',
          onPress: async () => {
            const fresh = await resetDatabase();
            setDb(fresh);
            Alert.alert('Сброшено', 'База данных сброшена к исходным значениям');
          }
        }
      ]);
    });
  };

  const changePassword = () => {
    requireAuth(() => {
      const current = db.admin_password || 'admin';
      if (oldPwd !== current) {
        Alert.alert('Ошибка', 'Текущий пароль неверен');
        return;
      }
      if (!newPwd || newPwd.length < 3) {
        Alert.alert('Ошибка', 'Пароль должен содержать минимум 3 символа');
        return;
      }
      updateDb({ ...db, admin_password: newPwd });
      setOldPwd('');
      setNewPwd('');
      Alert.alert('Успешно', 'Пароль администратора изменен!');
    });
  };

  // Filtered parts for Tab 3
  const records = (db.maintenance_records || []).filter(r => (r.vehicle_id || 'car_1') === activeVehicle?.id);
  const categoriesList = ['Все', 'Двигатель', 'Фильтры', 'Зажигание', 'Охлаждение', 'Тормоза', 'Трансмиссия', 'Прочее'];
  const filteredRecords = records.filter(r => {
    const matchCat = !categoryFilter || categoryFilter === 'Все' || r.category === categoryFilter;
    const matchSearch = !searchTerm ||
      (r.item_name && r.item_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.brand && r.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.article && r.article.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.to_tag && r.to_tag.toLowerCase().includes(searchTerm.toLowerCase()));
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
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[styles.carNameText, { color: colors.text }]} numberOfLines={1}>{activeVehicle?.name || 'Автомобиль'}</Text>
              {activeVehicle?.plate ? (
                <View style={styles.plateBadge}>
                  <Text style={styles.plateBadgeText}>{activeVehicle.plate}</Text>
                </View>
              ) : null}
            </View>
            <Text style={[styles.carSubText, { color: colors.textMuted }]}>
              {activeVehicle?.engine || '1.5T 7DCT'} • {Number(activeVehicle?.current_km || 0).toLocaleString('ru-RU')} км
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.headerRight}>
          <TouchableOpacity onPress={toggleTheme} style={[styles.iconButton, { backgroundColor: colors.cardSecondary, borderColor: colors.cardBorder }]}>
            <Text style={{ fontSize: 15 }}>{isDark ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              if (isAdmin) {
                setIsAdmin(false);
                Alert.alert('Выход', 'Сессия администратора завершена');
              } else {
                setAuthPassword('');
                setAuthModalVisible(true);
              }
            }}
            style={[styles.authButton, { backgroundColor: isAdmin ? '#10b98120' : colors.cardSecondary, borderColor: isAdmin ? '#10b981' : colors.cardBorder }]}
          >
            <Text style={{ fontSize: 11, fontWeight: 'bold', color: isAdmin ? '#10b981' : colors.textMuted }}>
              {isAdmin ? '🔓 Режим: Админ' : '🔒 Войти'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* --- MAIN TAB CONTENT --- */}
      <ScrollView style={styles.mainScrollView} contentContainerStyle={{ paddingBottom: 95 }} showsVerticalScrollIndicator={false}>
        {/* ======================================================== */}
        {/* TAB 1: DASHBOARD & TRAFFIC LIGHT                         */}
        {/* ======================================================== */}
        {activeTab === 'dashboard' && (
          <View style={styles.tabContent}>
            {/* KPI Cards Grid */}
            <View style={styles.kpiGrid}>
              {/* Mileage & Hours */}
              <View style={[styles.kpiCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <View style={styles.kpiHeader}>
                  <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>ПРОБЕГ</Text>
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

              {/* Total Expenses */}
              <View style={[styles.kpiCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>ЗАТРАТЫ НА ТО</Text>
                <Text style={[styles.kpiValue, { color: colors.success }]}>
                  {Number(statusData.kpi.total_spent).toLocaleString('ru-RU')} ₽
                </Text>
                <Text style={[styles.kpiSub, { color: colors.textMuted }]}>
                  📊 {statusData.kpi.cost_per_km} ₽/км • {toGroups.length} ТО
                </Text>
              </View>
            </View>

            {/* Vehicle Oil Spec & Info Banner */}
            {activeVehicle?.oil_spec ? (
              <View style={[styles.infoBanner, { backgroundColor: colors.cardSecondary, borderColor: colors.cardBorder }]}>
                <Text style={{ fontSize: 13 }}>🛢️ <Text style={{ fontWeight: 'bold', color: colors.text }}>Масло:</Text> <Text style={{ color: colors.textMuted }}>{activeVehicle.oil_spec}</Text></Text>
              </View>
            ) : null}

            {/* Traffic-Light Status Section Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 6 }}>
              <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>
                Ресурс расходников («Светофор»)
              </Text>
              <View style={styles.attentionPill}>
                <Text style={styles.attentionPillText}>
                  {statusData.kpi.attention_count > 0 ? `⚠️ Внимание: ${statusData.kpi.attention_count}` : '✅ Всё в норме'}
                </Text>
              </View>
            </View>

            {/* Consumables Traffic-Light Cards */}
            {statusData.consumables.map(c => {
              const isWarning = c.status_code === 'warning';
              const isDanger = c.status_code === 'danger';
              const badgeBg = isDanger ? '#ef444420' : isWarning ? '#f59e0b20' : '#10b98120';
              const badgeColor = isDanger ? '#ef4444' : isWarning ? '#f59e0b' : '#10b981';
              const barColor = isDanger ? '#ef4444' : isWarning ? '#f59e0b' : '#10b981';

              return (
                <View key={c.id} style={[styles.consumableCard, { backgroundColor: colors.card, borderColor: isDanger ? '#ef444460' : colors.cardBorder }]}>
                  <View style={styles.consumableHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                      <Text style={{ fontSize: 24 }}>{c.icon}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.consumableTitle, { color: colors.text }]}>{c.name}</Text>
                        <Text style={[styles.consumableSub, { color: colors.textMuted }]}>
                          {c.brand} {c.article ? `• ${c.article}` : ''}
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: badgeBg, borderColor: badgeColor }]}>
                      <Text style={[styles.statusBadgeText, { color: badgeColor }]}>
                        {isDanger ? '🔴 ' : isWarning ? '🟡 ' : '🟢 '}{c.status_text}
                      </Text>
                    </View>
                  </View>

                  {/* Progress bar */}
                  <View style={styles.progressContainer}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ fontSize: 11, color: colors.textMuted }}>
                        Износ ресурса ({c.interval_km} км {c.interval_hours > 0 ? `/ ${c.interval_hours} ч` : ''}):
                      </Text>
                      <Text style={{ fontSize: 12, fontWeight: 'bold', color: badgeColor }}>{c.wear_percent}%</Text>
                    </View>
                    <View style={[styles.progressBarBg, { backgroundColor: isDark ? '#0b1120' : '#e2e8f0' }]}>
                      <View style={[styles.progressBarFill, { width: `${Math.min(100, c.wear_percent)}%`, backgroundColor: barColor }]} />
                    </View>
                  </View>

                  {/* Details grid */}
                  <View style={[styles.consumableDetails, { borderTopColor: colors.cardBorder }]}>
                    <View>
                      <Text style={{ fontSize: 10, color: colors.textMuted }}>Осталось до замены:</Text>
                      <Text style={{ fontSize: 13, fontWeight: 'bold', color: badgeColor }}>
                        {Number(c.rem_km).toLocaleString('ru-RU')} км {c.rem_hours !== null ? `(${c.rem_hours} м/ч)` : ''}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={{ fontSize: 10, color: colors.textMuted }}>Замена на одометре:</Text>
                      <Text style={{ fontSize: 12, fontWeight: '600', color: colors.text }}>
                        {Number(c.next_km).toLocaleString('ru-RU')} км {c.next_hours ? `(${c.next_hours} м/ч)` : ''}
                      </Text>
                    </View>
                  </View>

                  {/* Last replaced info */}
                  {c.last_km > 0 ? (
                    <View style={styles.lastReplacedRow}>
                      <Text style={{ fontSize: 10, color: colors.textMuted }}>
                        Заменено на {c.to_tag} ({c.last_date} • {Number(c.last_km).toLocaleString('ru-RU')} км)
                      </Text>
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        )}

        {/* ======================================================== */}
        {/* TAB 2: TO EVENTS                                         */}
        {/* ======================================================== */}
        {activeTab === 'to-events' && (
          <View style={styles.tabContent}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>
                Журнал ТО ({toGroups.length})
              </Text>
              <TouchableOpacity onPress={openNewTOModal} style={styles.addBtn}>
                <Text style={styles.addBtnText}>+ Добавить ТО</Text>
              </TouchableOpacity>
            </View>

            {toGroups.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <Text style={{ fontSize: 28, marginBottom: 8 }}>🛠️</Text>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: colors.text }}>Записей ТО пока нет</Text>
                <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 4, textAlign: 'center' }}>
                  Нажмите кнопку «+ Добавить ТО», чтобы внести проведенное обслуживание.
                </Text>
              </View>
            ) : null}

            {toGroups.map(group => (
              <View key={group.to_tag} style={[styles.toCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <View style={styles.toCardHeader}>
                  <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <View style={styles.toTagBadge}>
                        <Text style={styles.toTagBadgeText}>{group.to_tag}</Text>
                      </View>
                      <Text style={[styles.toMileageText, { color: colors.text }]}>
                        {Number(group.mileage).toLocaleString('ru-RU')} км
                      </Text>
                    </View>
                    <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 3 }}>
                      📅 {group.date} • ⏱ {group.engine_hours} м/ч
                    </Text>
                  </View>

                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 10, color: colors.textMuted }}>Сумма ТО:</Text>
                    <Text style={{ fontSize: 16, fontWeight: 'bold', color: colors.success }}>
                      {Number(group.total_cost).toLocaleString('ru-RU')} ₽
                    </Text>
                  </View>
                </View>

                {/* Parts list inside TO */}
                <View style={[styles.toPartsList, { borderTopColor: colors.cardBorder }]}>
                  {group.parts.map((p, idx) => (
                    <View key={p.id || idx} style={styles.toPartRow}>
                      <View style={{ flex: 1, paddingRight: 8 }}>
                        <Text style={[styles.toPartName, { color: colors.text }]}>• {p.item_name}</Text>
                        <Text style={{ fontSize: 10, color: colors.textMuted }}>
                          {p.brand} {p.article ? `[${p.article}]` : ''} • {p.quantity} {p.unit}
                        </Text>
                      </View>
                      <Text style={[styles.toPartPrice, { color: colors.success }]}>
                        {Number(p.total_price).toLocaleString('ru-RU')} ₽
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Actions */}
                <View style={[styles.toCardActions, { borderTopColor: colors.cardBorder }]}>
                  <TouchableOpacity onPress={() => openEditTOModal(group)} style={styles.actionBtn}>
                    <Text style={{ fontSize: 12, color: '#3b82f6', fontWeight: '600' }}>✏️ Редактировать</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteTOEvent(group.to_tag)} style={styles.actionBtn}>
                    <Text style={{ fontSize: 12, color: '#ef4444', fontWeight: '600' }}>🗑️ Удалить</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ======================================================== */}
        {/* TAB 3: ALL PARTS JOURNAL                                 */}
        {/* ======================================================== */}
        {activeTab === 'all-parts' && (
          <View style={styles.tabContent}>
            {/* Search Input */}
            <TextInput
              style={[styles.searchInput, { backgroundColor: colors.card, borderColor: colors.cardBorder, color: colors.text }]}
              placeholder="🔍 Поиск по названию, бренду (Лукойл, VIC, ZIC), артикулу..."
              placeholderTextColor={colors.textMuted}
              value={searchTerm}
              onChangeText={setSearchTerm}
            />

            {/* Category Filter Pills */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {categoriesList.map(cat => {
                  const isSel = (!categoryFilter && cat === 'Все') || categoryFilter === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      onPress={() => setCategoryFilter(cat === 'Все' ? '' : cat)}
                      style={[
                        styles.catPill,
                        {
                          backgroundColor: isSel ? '#3b82f6' : colors.card,
                          borderColor: isSel ? '#3b82f6' : colors.cardBorder
                        }
                      ]}
                    >
                      <Text style={{ fontSize: 11, fontWeight: '600', color: isSel ? '#ffffff' : colors.textMuted }}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 10 }}>
              Найдено позиций: {filteredRecords.length}
            </Text>

            {filteredRecords.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <Text style={{ fontSize: 14, color: colors.textMuted }}>Ничего не найдено по вашему запросу</Text>
              </View>
            ) : null}

            {filteredRecords.map(r => (
              <View key={r.id} style={[styles.partCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <Text style={styles.partToTag}>{r.to_tag || 'ТО'}</Text>
                      <Text style={[styles.partName, { color: colors.text }]}>{r.item_name}</Text>
                    </View>
                    <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 4 }}>
                      Бренд: <Text style={{ color: colors.text, fontWeight: '500' }}>{r.brand || '—'}</Text>
                      {r.article ? ` • Арт: ${r.article}` : ''}
                    </Text>
                    <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
                      📅 {r.date} • 🚗 {Number(r.mileage).toLocaleString('ru-RU')} км • {r.quantity} {r.unit}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 15, fontWeight: 'bold', color: colors.success }}>
                      {Number(r.total_price).toLocaleString('ru-RU')} ₽
                    </Text>
                    {r.price_type === 'unit' ? (
                      <Text style={{ fontSize: 10, color: colors.textMuted }}>
                        ({Number(r.price_per_unit).toLocaleString('ru-RU')} ₽/{r.unit})
                      </Text>
                    ) : null}
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ======================================================== */}
        {/* TAB 4: SETTINGS & REGULATIONS                            */}
        {/* ======================================================== */}
        {activeTab === 'settings' && (
          <View style={styles.tabContent}>
            {/* Regulations / Trackers Section */}
            <View style={[styles.settingsCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <Text style={[styles.settingsTitle, { color: colors.text }]}>⚙️ Справочник регламентов</Text>
                <TouchableOpacity onPress={() => openEditTrackerModal(null)} style={styles.smallAddBtn}>
                  <Text style={{ fontSize: 11, color: '#fff', fontWeight: 'bold' }}>+ Регламент</Text>
                </TouchableOpacity>
              </View>
              <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 12 }}>
                Настройка интервалов замены (км и м/ч) и порогов предупреждения для расчета светофора.
              </Text>

              {(db.trackers || []).map((tr, idx) => (
                <View key={tr.id || idx} style={[styles.trackerRow, { borderTopColor: colors.cardBorder }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                    <Text style={{ fontSize: 18 }}>{tr.icon || '⚙️'}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 12, fontWeight: 'bold', color: colors.text }}>{tr.name}</Text>
                      <Text style={{ fontSize: 10, color: colors.textMuted }}>
                        Интервал: {tr.interval_km} км {tr.interval_hours > 0 ? `/ ${tr.interval_hours} ч` : ''} • Порог: {tr.warn_km} км
                      </Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <TouchableOpacity onPress={() => openEditTrackerModal(tr)} style={{ padding: 4 }}>
                      <Text style={{ fontSize: 14 }}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteTracker(tr.id)} style={{ padding: 4 }}>
                      <Text style={{ fontSize: 14 }}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

            {/* Password Change Card */}
            <View style={[styles.settingsCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Text style={[styles.settingsTitle, { color: colors.text }]}>🔐 Пароль администратора</Text>
              <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 10 }}>
                Защищает редактирование записей ТО, регламентов и гаража.
              </Text>
              <TextInput
                style={[styles.settingInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                placeholder="Текущий пароль (по умолч.: admin)..."
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                value={oldPwd}
                onChangeText={setOldPwd}
              />
              <TextInput
                style={[styles.settingInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                placeholder="Новый пароль..."
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                value={newPwd}
                onChangeText={setNewPwd}
              />
              <TouchableOpacity onPress={changePassword} style={styles.saveBtn}>
                <Text style={styles.saveBtnText}>Сменить пароль</Text>
              </TouchableOpacity>
            </View>

            {/* Backup & Export / Import Card */}
            <View style={[styles.settingsCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Text style={[styles.settingsTitle, { color: colors.text }]}>💾 Резервное копирование и Восстановление</Text>
              <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 12 }}>
                100% автономное сохранение: экспортируйте базу в файл JSON или восстановите данные на любом устройстве.
              </Text>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity onPress={exportBackup} style={[styles.saveBtn, { flex: 1, backgroundColor: '#10b981' }]}>
                  <Text style={styles.saveBtnText}>📤 Экспорт JSON</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setImportModalVisible(true)} style={[styles.saveBtn, { flex: 1, backgroundColor: '#3b82f6' }]}>
                  <Text style={styles.saveBtnText}>📥 Импорт JSON</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={handleResetDb} style={[styles.saveBtn, { backgroundColor: '#ef444415', borderWidth: 1, borderColor: '#ef4444', marginTop: 12 }]}>
                <Text style={[styles.saveBtnText, { color: '#ef4444' }]}>🔄 Сбросить к заводским данным</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ======================================================== */}
        {/* TAB 5: GARAGE & MULTI-VEHICLE                            */}
        {/* ======================================================== */}
        {activeTab === 'garage' && (
          <View style={styles.tabContent}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>
                Мой Гараж ({(db.vehicles || []).length})
              </Text>
              <TouchableOpacity onPress={() => { fillCarForm(null); setGarageModalVisible(true); }} style={styles.addBtn}>
                <Text style={styles.addBtnText}>+ Добавить авто</Text>
              </TouchableOpacity>
            </View>

            {(db.vehicles || []).map(v => {
              const isActive = v.id === activeVehicle?.id;
              const vRecords = (db.maintenance_records || []).filter(r => (r.vehicle_id || 'car_1') === v.id);
              const vSpent = vRecords.reduce((sum, r) => sum + (Number(r.total_price) || 0), 0);

              return (
                <TouchableOpacity
                  key={v.id}
                  onPress={() => switchCar(v.id)}
                  activeOpacity={0.8}
                  style={[
                    styles.garageCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: isActive ? '#3b82f6' : colors.cardBorder,
                      borderWidth: isActive ? 2 : 1
                    }
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <Text style={[styles.carNameText, { color: colors.text, fontSize: 16 }]}>{v.name}</Text>
                      {isActive ? (
                        <View style={styles.activeCarBadge}><Text style={styles.activeCarBadgeText}>АКТИВЕН</Text></View>
                      ) : null}
                    </View>

                    <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 4 }}>
                      Госномер: <Text style={{ color: colors.text, fontWeight: 'bold' }}>{v.plate || 'Не указан'}</Text>
                      {v.engine ? ` • ДВС: ${v.engine}` : ''} {v.year ? ` • ${v.year} г.` : ''}
                    </Text>
                    <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
                      Пробег: <Text style={{ color: colors.text, fontWeight: '600' }}>{Number(v.current_km || 0).toLocaleString('ru-RU')} км</Text>
                      {v.current_engine_hours ? ` • ${v.current_engine_hours} м/ч` : ''} • Затраты: {Number(vSpent).toLocaleString('ru-RU')} ₽
                    </Text>
                    {v.oil_spec ? (
                      <Text style={{ fontSize: 10, color: '#f59e0b', marginTop: 3 }}>
                        🛢️ Допуск масла: {v.oil_spec}
                      </Text>
                    ) : null}
                  </View>

                  <View style={{ flexDirection: 'column', gap: 8, marginLeft: 8 }}>
                    <TouchableOpacity onPress={() => { fillCarForm(v); setGarageModalVisible(true); }} style={styles.circleIconBtn}>
                      <Text style={{ fontSize: 14 }}>✏️</Text>
                    </TouchableOpacity>
                    {(db.vehicles || []).length > 1 ? (
                      <TouchableOpacity onPress={() => deleteCar(v.id)} style={styles.circleIconBtn}>
                        <Text style={{ fontSize: 14 }}>🗑️</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* --- BOTTOM NAVIGATION BAR (5 TABS) --- */}
      <View style={[styles.bottomNav, { backgroundColor: colors.card, borderTopColor: colors.cardBorder }]}>
        <TouchableOpacity onPress={() => setActiveTab('dashboard')} style={styles.navItem} activeOpacity={0.7}>
          <Text style={{ fontSize: 18 }}>📊</Text>
          <Text style={[styles.navText, { color: activeTab === 'dashboard' ? '#3b82f6' : colors.textMuted }]}>Статус</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setActiveTab('to-events')} style={styles.navItem} activeOpacity={0.7}>
          <Text style={{ fontSize: 18 }}>🛠️</Text>
          <Text style={[styles.navText, { color: activeTab === 'to-events' ? '#3b82f6' : colors.textMuted }]}>
            ТО ({toGroups.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setActiveTab('all-parts')} style={styles.navItem} activeOpacity={0.7}>
          <Text style={{ fontSize: 18 }}>📋</Text>
          <Text style={[styles.navText, { color: activeTab === 'all-parts' ? '#3b82f6' : colors.textMuted }]}>Детали</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setActiveTab('settings')} style={styles.navItem} activeOpacity={0.7}>
          <Text style={{ fontSize: 18 }}>⚙️</Text>
          <Text style={[styles.navText, { color: activeTab === 'settings' ? '#3b82f6' : colors.textMuted }]}>Настройки</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setActiveTab('garage')} style={styles.navItem} activeOpacity={0.7}>
          <Text style={{ fontSize: 18 }}>🚗</Text>
          <Text style={[styles.navText, { color: activeTab === 'garage' ? '#3b82f6' : colors.textMuted }]}>Гараж</Text>
        </TouchableOpacity>
      </View>

      {/* --- MODAL: ADMIN PASSWORD --- */}
      <Modal visible={authModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>🔒 Режим администратора</Text>
            <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 14 }}>
              Введите пароль для внесения изменений (по умолчанию: <Text style={{ fontWeight: 'bold' }}>admin</Text>):
            </Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
              placeholder="Пароль администратора..."
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              value={authPassword}
              onChangeText={setAuthPassword}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setAuthModalVisible(false)} style={styles.modalCancelBtn}>
                <Text style={{ color: colors.textMuted, fontWeight: 'bold' }}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleLogin} style={styles.modalConfirmBtn}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Войти</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- MODAL: UPDATE MILEAGE (SMART PROTECTION) --- */}
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
                <Text style={{ fontSize: 11, color: '#b45309', marginTop: 2 }}>
                  Если вы ввели суточный пробег после ТО, общий одометр = {mileageHint.combined} км ({mileageHint.lastKm} + {mileageHint.num}).
                </Text>
                <TouchableOpacity
                  onPress={() => { setInputKm(String(mileageHint.combined)); setMileageHint(null); }}
                  style={styles.hintBtn}
                >
                  <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#92400e' }}>
                    ➔ Подставить {mileageHint.combined} км
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

      {/* --- MODAL: ADD / EDIT TO EVENT (DYNAMIC PARTS & PRICE MODES) --- */}
      <Modal visible={toModalVisible} transparent animationType="slide">
        <SafeAreaView style={[styles.fullModalOverlay, { backgroundColor: colors.bg }]}>
          <View style={[styles.fullModalHeader, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }]}>
            <View>
              <Text style={[styles.modalTitle, { color: colors.text, marginBottom: 0 }]}>
                {editingToTag ? `Редактирование ${editingToTag}` : 'Новое Событие ТО'}
              </Text>
              <Text style={{ fontSize: 11, color: colors.success, fontWeight: 'bold' }}>
                Итого ТО: {Number(calculateLiveTOTotal()).toLocaleString('ru-RU')} ₽
              </Text>
            </View>
            <TouchableOpacity onPress={() => setToModalVisible(false)} style={{ padding: 6 }}>
              <Text style={{ fontSize: 20, color: colors.textMuted }}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1, padding: 14 }} showsVerticalScrollIndicator={false}>
            {/* Header info: Tag, Date, Mileage, Hours */}
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 2 }}>Метка ТО:</Text>
                <TextInput
                  style={[styles.modalInput, { backgroundColor: colors.card, borderColor: colors.cardBorder, color: colors.text }]}
                  value={toTag}
                  onChangeText={setToTag}
                  placeholder="ТО-4..."
                  placeholderTextColor={colors.textMuted}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 2 }}>Дата (ГГГГ-ММ-ДД):</Text>
                <TextInput
                  style={[styles.modalInput, { backgroundColor: colors.card, borderColor: colors.cardBorder, color: colors.text }]}
                  value={toDate}
                  onChangeText={setToDate}
                  placeholder="2026-08-27"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 2 }}>Пробег проведения (км):</Text>
                <TextInput
                  style={[styles.modalInput, { backgroundColor: colors.card, borderColor: colors.cardBorder, color: colors.text }]}
                  keyboardType="numeric"
                  value={toKm}
                  onChangeText={setToKm}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 2 }}>Моточасы (м/ч):</Text>
                <TextInput
                  style={[styles.modalInput, { backgroundColor: colors.card, borderColor: colors.cardBorder, color: colors.text }]}
                  keyboardType="numeric"
                  value={toHours}
                  onChangeText={setToHours}
                />
              </View>
            </View>

            {/* Dynamic parts list header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: colors.text }}>Замененные детали ({toParts.length}):</Text>
              <TouchableOpacity onPress={addPartRow} style={styles.smallAddBtn}>
                <Text style={{ fontSize: 11, color: '#fff', fontWeight: 'bold' }}>+ Добавить строку</Text>
              </TouchableOpacity>
            </View>

            {toParts.map((p, idx) => {
              const qty = parseFloat(p.quantity) || 1;
              const pr = parseFloat(p.price) || 0;
              const rowSum = p.price_type === 'unit' ? (pr * qty) : pr;

              return (
                <View key={p.id} style={[styles.partEditCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#3b82f6' }}>Позиция #{idx + 1}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <Text style={{ fontSize: 12, fontWeight: 'bold', color: colors.success }}>
                        = {Number(rowSum).toLocaleString('ru-RU')} ₽
                      </Text>
                      <TouchableOpacity onPress={() => removePartRow(p.id)}>
                        <Text style={{ fontSize: 11, color: '#ef4444', fontWeight: 'bold' }}>✕ Удалить</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Quick Select from Trackers */}
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      {(db.trackers || []).slice(0, 6).map(tr => (
                        <TouchableOpacity
                          key={tr.id}
                          onPress={() => populatePartFromTracker(p.id, tr)}
                          style={[styles.miniChip, { backgroundColor: colors.cardSecondary, borderColor: colors.cardBorder }]}
                        >
                          <Text style={{ fontSize: 10, color: colors.text }}>{tr.icon} {tr.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>

                  <TextInput
                    style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text, marginBottom: 6 }]}
                    placeholder="Наименование детали (например: Масло моторное)..."
                    placeholderTextColor={colors.textMuted}
                    value={p.item_name}
                    onChangeText={(val) => updatePartField(p.id, 'item_name', val)}
                  />

                  <View style={{ flexDirection: 'row', gap: 6, marginBottom: 6 }}>
                    <TextInput
                      style={[styles.modalInput, { flex: 1, backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                      placeholder="Бренд / Марка..."
                      placeholderTextColor={colors.textMuted}
                      value={p.brand}
                      onChangeText={(val) => updatePartField(p.id, 'brand', val)}
                    />
                    <TextInput
                      style={[styles.modalInput, { flex: 1, backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                      placeholder="Артикул..."
                      placeholderTextColor={colors.textMuted}
                      value={p.article}
                      onChangeText={(val) => updatePartField(p.id, 'article', val)}
                    />
                  </View>

                  {/* Price mode toggle */}
                  <View style={{ flexDirection: 'row', gap: 6, marginBottom: 6, alignItems: 'center' }}>
                    <TouchableOpacity
                      onPress={() => updatePartField(p.id, 'price_type', 'total')}
                      style={[
                        styles.priceTypeBtn,
                        {
                          backgroundColor: p.price_type === 'total' ? '#3b82f6' : colors.inputBg,
                          borderColor: p.price_type === 'total' ? '#3b82f6' : colors.inputBorder
                        }
                      ]}
                    >
                      <Text style={{ fontSize: 10, fontWeight: 'bold', color: p.price_type === 'total' ? '#fff' : colors.textMuted }}>
                        За всю позицию (комплект)
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => updatePartField(p.id, 'price_type', 'unit')}
                      style={[
                        styles.priceTypeBtn,
                        {
                          backgroundColor: p.price_type === 'unit' ? '#3b82f6' : colors.inputBg,
                          borderColor: p.price_type === 'unit' ? '#3b82f6' : colors.inputBorder
                        }
                      ]}
                    >
                      <Text style={{ fontSize: 10, fontWeight: 'bold', color: p.price_type === 'unit' ? '#fff' : colors.textMuted }}>
                        За 1 ед. (литр / шт)
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <TextInput
                      style={[styles.modalInput, { flex: 1, backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                      placeholder="Кол-во"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="numeric"
                      value={String(p.quantity)}
                      onChangeText={(val) => updatePartField(p.id, 'quantity', val)}
                    />
                    <TextInput
                      style={[styles.modalInput, { flex: 1, backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                      placeholder="Ед. (л, шт)"
                      placeholderTextColor={colors.textMuted}
                      value={p.unit}
                      onChangeText={(val) => updatePartField(p.id, 'unit', val)}
                    />
                    <TextInput
                      style={[styles.modalInput, { flex: 1.5, backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text, fontWeight: 'bold' }]}
                      placeholder="Цена (₽)"
                      placeholderTextColor={colors.textMuted}
                      keyboardType="numeric"
                      value={String(p.price)}
                      onChangeText={(val) => updatePartField(p.id, 'price', val)}
                    />
                  </View>
                </View>
              );
            })}

            <View style={{ height: 30 }} />
          </ScrollView>

          <View style={[styles.fullModalFooter, { backgroundColor: colors.card, borderTopColor: colors.cardBorder }]}>
            <TouchableOpacity onPress={() => setToModalVisible(false)} style={styles.modalCancelBtn}>
              <Text style={{ color: colors.textMuted, fontWeight: 'bold' }}>Отмена</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={saveTOEvent} style={styles.modalConfirmBtn}>
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Сохранить ТО</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* --- MODAL: GARAGE & VEHICLE EDIT --- */}
      <Modal visible={garageModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.card, maxHeight: '85%' }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editCarId ? 'Редактировать автомобиль' : 'Добавить автомобиль в гараж'}
            </Text>

            <ScrollView style={{ marginVertical: 10 }} showsVerticalScrollIndicator={false}>
              <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 2 }}>Марка:</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text, marginBottom: 8 }]}
                value={carBrand}
                onChangeText={setCarBrand}
                placeholder="Changan..."
                placeholderTextColor={colors.textMuted}
              />

              <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 2 }}>Модель:</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text, marginBottom: 8 }]}
                value={carModel}
                onChangeText={setCarModel}
                placeholder="CS55 Plus..."
                placeholderTextColor={colors.textMuted}
              />

              <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 2 }}>Госномер / Рег. знак:</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text, marginBottom: 8 }]}
                value={carPlate}
                onChangeText={setCarPlate}
                placeholder="А 777 АА 777"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 2 }}>Двигатель / Модификация:</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text, marginBottom: 8 }]}
                value={carEngine}
                onChangeText={setCarEngine}
                placeholder="1.5T 7DCT"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 2 }}>Год выпуска:</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text, marginBottom: 8 }]}
                keyboardType="numeric"
                value={carYear}
                onChangeText={setCarYear}
                placeholder="2023"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 2 }}>VIN номер (необязательно):</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text, marginBottom: 8 }]}
                value={carVin}
                onChangeText={setCarVin}
                placeholder="LS6A2..."
                placeholderTextColor={colors.textMuted}
              />

              <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 2 }}>Допуск масла / Объем:</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text, marginBottom: 8 }]}
                value={carOil}
                onChangeText={setCarOil}
                placeholder="SAE 0W-20 SP / C5 (4.2-4.5 л)"
                placeholderTextColor={colors.textMuted}
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setGarageModalVisible(false)} style={styles.modalCancelBtn}>
                <Text style={{ color: colors.textMuted, fontWeight: 'bold' }}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveCarProfile} style={styles.modalConfirmBtn}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Сохранить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- MODAL: TRACKER / REGULATION EDIT --- */}
      <Modal visible={trackerModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.card, maxHeight: '85%' }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editingTrackerId ? 'Редактировать регламент' : 'Добавить регламент'}
            </Text>

            <ScrollView style={{ marginVertical: 10 }} showsVerticalScrollIndicator={false}>
              <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 2 }}>Иконка (эмодзи):</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text, marginBottom: 8 }]}
                value={trIcon}
                onChangeText={setTrIcon}
                placeholder="🛢️"
                placeholderTextColor={colors.textMuted}
              />

              <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 2 }}>Наименование:</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text, marginBottom: 8 }]}
                value={trName}
                onChangeText={setTrName}
                placeholder="Масло моторное (0W-20)..."
                placeholderTextColor={colors.textMuted}
              />

              <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 2 }}>Категория:</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text, marginBottom: 8 }]}
                value={trCategory}
                onChangeText={setTrCategory}
                placeholder="Двигатель / Фильтры..."
                placeholderTextColor={colors.textMuted}
              />

              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 2 }}>Интервал (км):</Text>
                  <TextInput
                    style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                    keyboardType="numeric"
                    value={trKm}
                    onChangeText={setTrKm}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 2 }}>Интервал (м/ч):</Text>
                  <TextInput
                    style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                    keyboardType="numeric"
                    value={trHours}
                    onChangeText={setTrHours}
                  />
                </View>
              </View>

              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 2 }}>Порог желтого (км):</Text>
                  <TextInput
                    style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                    keyboardType="numeric"
                    value={trWarnKm}
                    onChangeText={setTrWarnKm}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 2 }}>Порог (м/ч):</Text>
                  <TextInput
                    style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                    keyboardType="numeric"
                    value={trWarnHours}
                    onChangeText={setTrWarnHours}
                  />
                </View>
              </View>

              <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 2 }}>Бренд по умолчанию:</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text, marginBottom: 8 }]}
                value={trBrand}
                onChangeText={setTrBrand}
                placeholder="Лукойл Genesis JP..."
                placeholderTextColor={colors.textMuted}
              />

              <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 2 }}>Артикул:</Text>
              <TextInput
                style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text, marginBottom: 8 }]}
                value={trArticle}
                onChangeText={setTrArticle}
                placeholder="1658134508"
                placeholderTextColor={colors.textMuted}
              />
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setTrackerModalVisible(false)} style={styles.modalCancelBtn}>
                <Text style={{ color: colors.textMuted, fontWeight: 'bold' }}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveTracker} style={styles.modalConfirmBtn}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Сохранить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- MODAL: IMPORT JSON BACKUP --- */}
      <Modal visible={importModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.card, maxHeight: '85%' }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>📥 Импорт базы данных JSON</Text>
            <Text style={{ fontSize: 12, color: colors.textMuted, marginBottom: 10 }}>
              Вставьте текст резервной копии JSON ниже для восстановления базы данных:
            </Text>

            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: colors.inputBg,
                  borderColor: colors.inputBorder,
                  color: colors.text,
                  height: 150,
                  textAlignVertical: 'top',
                  fontFamily: 'monospace',
                  fontSize: 11
                }
              ]}
              multiline
              placeholder='{"active_vehicle_id": "car_1", "vehicles": [...] ...}'
              placeholderTextColor={colors.textMuted}
              value={importJsonText}
              onChangeText={setImportJsonText}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setImportModalVisible(false)} style={styles.modalCancelBtn}>
                <Text style={{ color: colors.textMuted, fontWeight: 'bold' }}>Отмена</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleImportBackup} style={[styles.modalConfirmBtn, { backgroundColor: '#10b981' }]}>
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>Восстановить</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  carIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  carNameText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  carSubText: {
    fontSize: 11,
    marginTop: 1,
  },
  plateBadge: {
    backgroundColor: '#fef08a',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#fde047',
  },
  plateBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#854d0e',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    padding: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  authButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  mainScrollView: {
    flex: 1,
  },
  tabContent: {
    padding: 14,
  },
  kpiGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  kpiCard: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  kpiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  kpiEditBtn: {
    backgroundColor: '#2563eb15',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  kpiValue: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  kpiSub: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
  infoBanner: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  attentionPill: {
    backgroundColor: '#f59e0b15',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f59e0b40',
  },
  attentionPillText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#f59e0b',
  },
  consumableCard: {
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
  },
  consumableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  consumableTitle: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  consumableSub: {
    fontSize: 11,
    marginTop: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginBottom: 10,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 6,
    borderRadius: 3,
  },
  consumableDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
  },
  lastReplacedRow: {
    marginTop: 6,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  navItem: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  navText: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    padding: 20,
  },
  modalBox: {
    borderRadius: 18,
    padding: 18,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 14,
  },
  modalCancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modalConfirmBtn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  hintBox: {
    backgroundColor: '#fef3c7',
    padding: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  hintBtn: {
    backgroundColor: '#fde68a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  addBtn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  toCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 12,
  },
  toCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  toTagBadge: {
    backgroundColor: '#2563eb20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  toTagBadgeText: {
    color: '#3b82f6',
    fontWeight: 'bold',
    fontSize: 12,
  },
  toMileageText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  toPartsList: {
    paddingTop: 8,
    borderTopWidth: 1,
    gap: 6,
  },
  toPartRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toPartName: {
    fontSize: 12,
    fontWeight: '600',
  },
  toPartPrice: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  toCardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    marginTop: 10,
    borderTopWidth: 1,
  },
  actionBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  partCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  partToTag: {
    backgroundColor: '#2563eb15',
    color: '#2563eb',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  partName: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  catPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    marginBottom: 10,
  },
  settingsCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  settingsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  settingInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    marginBottom: 8,
  },
  saveBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  garageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  activeCarBadge: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  activeCarBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
  },
  fullModalOverlay: {
    flex: 1,
  },
  fullModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  fullModalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  smallAddBtn: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  partEditCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  miniChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  priceTypeBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
  },
  trackerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  circleIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563eb15',
  },
  emptyCard: {
    padding: 24,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }
});

