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
  getActiveVehicle,
  calculateDashboardStatus,
  getTOGroups
} from './src/storage';

export default function App() {
  const [db, setDb] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState('dark');
  const [isAdmin, setIsAdmin] = useState(false);

  // Modals state
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [authPassword, setAuthPassword] = useState('');
  const [pendingAction, setPendingAction] = useState(null);

  const [mileageModalVisible, setMileageModalVisible] = useState(false);
  const [inputKm, setInputKm] = useState('');
  const [inputHours, setInputHours] = useState('');
  const [mileageHint, setMileageHint] = useState(null);

  const [toModalVisible, setToModalVisible] = useState(false);
  const [editingToTag, setEditingToTag] = useState('');
  const [toTag, setToTag] = useState('');
  const [toDate, setToDate] = useState('');
  const [toKm, setToKm] = useState('');
  const [toHours, setToHours] = useState('');
  const [toParts, setToParts] = useState([]);

  const [garageModalVisible, setGarageModalVisible] = useState(false);
  const [editCarId, setEditCarId] = useState(null);
  const [carBrand, setCarBrand] = useState('');
  const [carModel, setCarModel] = useState('');
  const [carPlate, setCarPlate] = useState('');
  const [carEngine, setCarEngine] = useState('');
  const [carYear, setCarYear] = useState('');
  const [carVin, setCarVin] = useState('');
  const [carOil, setCarOil] = useState('');

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

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Password change state
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');

  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    const loaded = await loadDatabase();
    setDb(loaded);
    if (loaded.theme) setTheme(loaded.theme);
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
    const expected = db.admin_password || 'admin';
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
    bg: isDark ? '#0f172a' : '#f1f5f9',
    card: isDark ? '#1e293b' : '#ffffff',
    cardBorder: isDark ? '#334155' : '#e2e8f0',
    text: isDark ? '#f8fafc' : '#0f172a',
    textMuted: isDark ? '#94a3b8' : '#64748b',
    primary: '#2563eb',
    inputBg: isDark ? '#090d16' : '#f8fafc',
    inputBorder: isDark ? '#334155' : '#cbd5e1',
  };

  const activeVehicle = getActiveVehicle(db);
  const statusData = calculateDashboardStatus(db);
  const toGroups = getTOGroups(db);

  // --- MILEAGE MODAL HANDLERS ---
  const openMileageModal = () => {
    const lastKm = (db.maintenance_records || []).reduce((max, r) => Math.max(max, r.mileage || 0), 0);
    const lastH = (db.maintenance_records || []).reduce((max, r) => Math.max(max, r.engine_hours || 0), 0);

    setInputKm(String(activeVehicle?.current_km || lastKm || 25340));
    setInputHours(String(activeVehicle?.current_engine_hours || lastH || 772));
    setMileageHint(null);
    setMileageModalVisible(true);
  };

  const onMileageInputChange = (val) => {
    setInputKm(val);
    const num = parseInt(val, 10) || 0;
    const lastKm = (db.maintenance_records || []).reduce((max, r) => Math.max(max, r.mileage || 0), 0);
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

  // --- TO GROUP MODAL HANDLERS ---
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
          id: 1,
          category: 'Двигатель',
          item_name: 'Масло моторное',
          brand: 'Лукойл Genesis ARMORTECH JP 0W-20',
          article: '1658134508',
          quantity: 4.5,
          unit: 'л',
          price_type: 'total',
          price: 3600,
          interval_km: 7500,
          interval_hours: 250,
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
        id: idx + 1,
        category: p.category || 'Прочее',
        item_name: p.item_name,
        brand: p.brand || '',
        article: p.article || '',
        quantity: p.quantity || 1,
        unit: p.unit || 'шт',
        price_type: p.price_type || 'total',
        price: p.total_price || p.price_per_unit || 0,
        interval_km: p.interval_km || 7500,
        interval_hours: p.interval_hours || 0,
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
        quantity: 1,
        unit: 'шт',
        price_type: 'total',
        price: '',
        interval_km: 7500,
        interval_hours: 250,
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

    // Filter out old records if editing
    let currentRecords = (db.maintenance_records || []);
    if (editingToTag) {
      currentRecords = currentRecords.filter(r => !(r.vehicle_id === vId && r.to_tag === editingToTag));
    }

    let maxId = currentRecords.reduce((max, r) => Math.max(max, r.id || 0), 0);

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
        to_tag: toTag,
        date: toDate,
        mileage: mileageNum,
        engine_hours: hoursNum,
        category: p.category,
        item_name: p.item_name,
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
          current_km: Math.max(v.current_km || 0, mileageNum),
          current_engine_hours: Math.max(v.current_engine_hours || 0, hoursNum)
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
          }
        }
      ]);
    });
  };

  // --- GARAGE HANDLERS ---
  const openGarage = () => {
    fillCarForm(activeVehicle);
    setGarageModalVisible(true);
  };

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
        vehicles.push({
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
        });
        db.active_vehicle_id = newId;
      }

      updateDb({ ...db, vehicles });
      setGarageModalVisible(false);
      Alert.alert('Успешно', 'Гараж обновлен');
    });
  };

  const switchCar = (id) => {
    updateDb({ ...db, active_vehicle_id: id });
    setGarageModalVisible(false);
  };

  // --- BACKUP & EXPORT / IMPORT ---
  const exportBackup = async () => {
    try {
      const jsonStr = JSON.stringify(db, null, 2);
      await Share.share({
        message: jsonStr,
        title: 'car_maintenance_backup.json'
      });
    } catch (e) {
      Alert.alert('Ошибка экспорта', e.message);
    }
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
  const filteredRecords = records.filter(r => {
    const matchCat = !categoryFilter || r.category === categoryFilter;
    const matchSearch = !searchTerm ||
      (r.item_name && r.item_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.brand && r.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (r.article && r.article.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchCat && matchSearch;
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.card} />

      {/* --- TOP HEADER --- */}
      <View style={[styles.topHeader, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }]}>
        <TouchableOpacity style={styles.headerLeft} onPress={openGarage} activeOpacity={0.7}>
          <View style={styles.carIconBox}>
            <Text style={{ fontSize: 18 }}>🚗</Text>
          </View>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[styles.carNameText, { color: colors.text }]}>{activeVehicle?.name || 'Автомобиль'}</Text>
              {activeVehicle?.plate ? (
                <View style={styles.plateBadge}>
                  <Text style={styles.plateBadgeText}>{activeVehicle.plate}</Text>
                </View>
              ) : null}
            </View>
            <Text style={[styles.carSubText, { color: colors.textMuted }]}>
              {activeVehicle?.engine || '1.5T'} • Гараж
            </Text>
          </View>
        </TouchableOpacity>

        <View style={styles.headerRight}>
          <TouchableOpacity onPress={toggleTheme} style={[styles.iconButton, { backgroundColor: colors.inputBg, borderColor: colors.cardBorder }]}>
            <Text style={{ fontSize: 15 }}>{isDark ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              if (isAdmin) {
                setIsAdmin(false);
                Alert.alert('Выход', 'Режим редактирования отключен');
              } else {
                setAuthPassword('');
                setAuthModalVisible(true);
              }
            }}
            style={[styles.authButton, { backgroundColor: isAdmin ? '#10b98120' : colors.inputBg, borderColor: isAdmin ? '#10b981' : colors.cardBorder }]}
          >
            <Text style={{ fontSize: 12 }}>{isAdmin ? '🔓 Выйти' : '🔒 Войти'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* --- MAIN TAB CONTENT --- */}
      <ScrollView style={styles.mainScrollView} contentContainerStyle={{ paddingBottom: 90 }}>
        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <View style={styles.tabContent}>
            {/* KPI Cards Grid */}
            <View style={styles.kpiGrid}>
              <View style={[styles.kpiCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <View style={styles.kpiHeader}>
                  <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>ПРОБЕГ</Text>
                  <TouchableOpacity onPress={openMileageModal} style={styles.kpiEditBtn}>
                    <Text style={{ fontSize: 10, color: '#2563eb', fontWeight: 'bold' }}>Изменить</Text>
                  </TouchableOpacity>
                </View>
                <Text style={[styles.kpiValue, { color: colors.text }]}>
                  {Number(statusData.kpi.current_km).toLocaleString('ru-RU')} км
                </Text>
                <Text style={[styles.kpiSub, { color: '#f59e0b' }]}>
                  {statusData.kpi.current_hours} м/ч • {statusData.kpi.avg_speed} км/ч
                </Text>
              </View>

              <View style={[styles.kpiCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <Text style={[styles.kpiLabel, { color: colors.textMuted }]}>ЗАТРАТЫ НА ТО</Text>
                <Text style={[styles.kpiValue, { color: '#10b981' }]}>
                  {Number(statusData.kpi.total_spent).toLocaleString('ru-RU')} ₽
                </Text>
                <Text style={[styles.kpiSub, { color: colors.textMuted }]}>
                  {statusData.kpi.cost_per_km} ₽/км
                </Text>
              </View>
            </View>

            {/* Consumables Traffic-Light List */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Ресурс расходников («Светофор»):</Text>
            {statusData.consumables.map(c => {
              const isWarning = c.status_code === 'warning';
              const isDanger = c.status_code === 'danger';
              const badgeBg = isDanger ? '#ef444420' : isWarning ? '#f59e0b20' : '#10b98120';
              const badgeColor = isDanger ? '#ef4444' : isWarning ? '#f59e0b' : '#10b981';
              const barColor = isDanger ? '#ef4444' : isWarning ? '#f59e0b' : '#10b981';

              return (
                <View key={c.id} style={[styles.consumableCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                  <View style={styles.consumableHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                      <Text style={{ fontSize: 22 }}>{c.icon}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.consumableTitle, { color: colors.text }]}>{c.name}</Text>
                        <Text style={[styles.consumableSub, { color: colors.textMuted }]}>
                          {c.brand} {c.article ? '• ' + c.article : ''}
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: badgeBg, borderColor: badgeColor }]}>
                      <Text style={[styles.statusBadgeText, { color: badgeColor }]}>{c.status_text}</Text>
                    </View>
                  </View>

                  {/* Progress bar */}
                  <View style={styles.progressContainer}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text style={{ fontSize: 11, color: colors.textMuted }}>Износ ресурса:</Text>
                      <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.text }}>{c.wear_percent}%</Text>
                    </View>
                    <View style={[styles.progressBarBg, { backgroundColor: isDark ? '#0f172a' : '#e2e8f0' }]}>
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
                        {Number(c.next_km).toLocaleString('ru-RU')} км
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* TAB 2: TO EVENTS */}
        {activeTab === 'to-events' && (
          <View style={styles.tabContent}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>
                События ТО ({toGroups.length})
              </Text>
              <TouchableOpacity onPress={openNewTOModal} style={styles.addBtn}>
                <Text style={styles.addBtnText}>+ Добавить ТО</Text>
              </TouchableOpacity>
            </View>

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
                    <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
                      {group.date} • {group.engine_hours} м/ч
                    </Text>
                  </View>

                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 10, color: colors.textMuted }}>Сумма ТО:</Text>
                    <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#10b981' }}>
                      {Number(group.total_cost).toLocaleString('ru-RU')} ₽
                    </Text>
                  </View>
                </View>

                {/* Parts list */}
                <View style={[styles.toPartsList, { borderTopColor: colors.cardBorder }]}>
                  {group.parts.map(p => (
                    <View key={p.id} style={styles.toPartRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.toPartName, { color: colors.text }]}>{p.item_name}</Text>
                        <Text style={{ fontSize: 10, color: colors.textMuted }}>{p.brand} • {p.quantity} {p.unit}</Text>
                      </View>
                      <Text style={[styles.toPartPrice, { color: '#10b981' }]}>
                        {Number(p.total_price).toLocaleString('ru-RU')} ₽
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Actions */}
                <View style={[styles.toCardActions, { borderTopColor: colors.cardBorder }]}>
                  <TouchableOpacity onPress={() => openEditTOModal(group)} style={styles.actionBtn}>
                    <Text style={{ fontSize: 12, color: '#3b82f6', fontWeight: '600' }}>✏️ Редактировать ТО</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteTOEvent(group.to_tag)} style={styles.actionBtn}>
                    <Text style={{ fontSize: 12, color: '#ef4444', fontWeight: '600' }}>🗑️ Удалить</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* TAB 3: ALL PARTS */}
        {activeTab === 'all-parts' && (
          <View style={styles.tabContent}>
            <TextInput
              style={[styles.searchInput, { backgroundColor: colors.card, borderColor: colors.cardBorder, color: colors.text }]}
              placeholder="Поиск по деталям, брендам, артикулам..."
              placeholderTextColor={colors.textMuted}
              value={searchTerm}
              onChangeText={setSearchTerm}
            />

            {filteredRecords.map(r => (
              <View key={r.id} style={[styles.partCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.partToTag}>{r.to_tag || 'ТО'}</Text>
                      <Text style={[styles.partName, { color: colors.text }]}>{r.item_name}</Text>
                    </View>
                    <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
                      {r.brand || '-'} {r.article ? `• Арт: ${r.article}` : ''}
                    </Text>
                    <Text style={{ fontSize: 11, color: colors.textMuted }}>
                      {r.date} • {Number(r.mileage).toLocaleString('ru-RU')} км
                    </Text>
                  </View>
                  <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#10b981' }}>
                    {Number(r.total_price).toLocaleString('ru-RU')} ₽
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* TAB 4: SETTINGS */}
        {activeTab === 'settings' && (
          <View style={styles.tabContent}>
            {/* Password Change Card */}
            <View style={[styles.settingsCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Text style={[styles.settingsTitle, { color: colors.text }]}>🔐 Пароль администратора</Text>
              <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 10 }}>
                Защищает редактирование данных на устройстве
              </Text>
              <TextInput
                style={[styles.settingInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
                placeholder="Текущий пароль..."
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

            {/* Backup Export */}
            <View style={[styles.settingsCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Text style={[styles.settingsTitle, { color: colors.text }]}>💾 Резервное копирование</Text>
              <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 10 }}>
                Экспорт всей базы данных ТО в файл JSON для сохранения или переноса на другое устройство.
              </Text>
              <TouchableOpacity onPress={exportBackup} style={[styles.saveBtn, { backgroundColor: '#10b981' }]}>
                <Text style={styles.saveBtnText}>📤 Поделиться / Экспорт бэкапа</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* TAB 5: GARAGE */}
        {activeTab === 'garage' && (
          <View style={styles.tabContent}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>Автомобили в гараже</Text>
              <TouchableOpacity onPress={() => { fillCarForm(null); setGarageModalVisible(true); }} style={styles.addBtn}>
                <Text style={styles.addBtnText}>+ Добавить авто</Text>
              </TouchableOpacity>
            </View>

            {(db.vehicles || []).map(v => {
              const isActive = v.id === activeVehicle?.id;
              return (
                <TouchableOpacity
                  key={v.id}
                  onPress={() => switchCar(v.id)}
                  style={[styles.garageCard, { backgroundColor: colors.card, borderColor: isActive ? '#3b82f6' : colors.cardBorder }]}
                >
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={[styles.carNameText, { color: colors.text }]}>{v.name}</Text>
                      {isActive ? (
                        <View style={styles.activeCarBadge}><Text style={styles.activeCarBadgeText}>АКТИВЕН</Text></View>
                      ) : null}
                    </View>
                    <Text style={{ fontSize: 11, color: colors.textMuted, marginTop: 2 }}>
                      {v.plate || 'Без госномера'} • {Number(v.current_km || 0).toLocaleString('ru-RU')} км
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => { fillCarForm(v); setGarageModalVisible(true); }} style={{ padding: 6 }}>
                    <Text style={{ fontSize: 16 }}>✏️</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* --- BOTTOM NAVIGATION BAR --- */}
      <View style={[styles.bottomNav, { backgroundColor: colors.card, borderTopColor: colors.cardBorder }]}>
        <TouchableOpacity onPress={() => setActiveTab('dashboard')} style={styles.navItem}>
          <Text style={{ fontSize: 18 }}>📊</Text>
          <Text style={[styles.navText, { color: activeTab === 'dashboard' ? '#3b82f6' : colors.textMuted }]}>Статус</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setActiveTab('to-events')} style={styles.navItem}>
          <Text style={{ fontSize: 18 }}>🛠️</Text>
          <Text style={[styles.navText, { color: activeTab === 'to-events' ? '#3b82f6' : colors.textMuted }]}>ТО ({toGroups.length})</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setActiveTab('all-parts')} style={styles.navItem}>
          <Text style={{ fontSize: 18 }}>📋</Text>
          <Text style={[styles.navText, { color: activeTab === 'all-parts' ? '#3b82f6' : colors.textMuted }]}>Детали</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setActiveTab('settings')} style={styles.navItem}>
          <Text style={{ fontSize: 18 }}>⚙️</Text>
          <Text style={[styles.navText, { color: activeTab === 'settings' ? '#3b82f6' : colors.textMuted }]}>Настройки</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setActiveTab('garage')} style={styles.navItem}>
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
              Введите пароль для внесения изменений (по умолчанию: admin):
            </Text>
            <TextInput
              style={[styles.modalInput, { backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text }]}
              placeholder="Пароль..."
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

      {/* --- MODAL: UPDATE MILEAGE --- */}
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
                <Text style={{ fontSize: 11, color: '#d97706', fontWeight: 'bold' }}>⚠️ Внимание: пробег меньше ТО ({mileageHint.lastKm} км)</Text>
                <Text style={{ fontSize: 10, color: '#b45309', marginTop: 2 }}>
                  Если вы проехали {mileageHint.num} км после ТО, общий одометр = {mileageHint.combined} км.
                </Text>
                <TouchableOpacity
                  onPress={() => { setInputKm(String(mileageHint.combined)); setMileageHint(null); }}
                  style={styles.hintBtn}
                >
                  <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#92400e' }}>Подставить {mileageHint.combined} км</Text>
                </TouchableOpacity>
              </View>
            )}

            <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 4, marginTop: 10 }}>Текущие моточасы (м/ч):</Text>
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

      {/* --- MODAL: TO EVENT CREATION / EDITING --- */}
      <Modal visible={toModalVisible} transparent animationType="slide">
        <SafeAreaView style={[styles.fullModalOverlay, { backgroundColor: colors.bg }]}>
          <View style={[styles.fullModalHeader, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editingToTag ? `Редактирование ${editingToTag}` : 'Создать новое ТО'}
            </Text>
            <TouchableOpacity onPress={() => setToModalVisible(false)}>
              <Text style={{ fontSize: 18, color: colors.textMuted }}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1, padding: 14 }}>
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
                <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 2 }}>Дата:</Text>
                <TextInput
                  style={[styles.modalInput, { backgroundColor: colors.card, borderColor: colors.cardBorder, color: colors.text }]}
                  value={toDate}
                  onChangeText={setToDate}
                  placeholder="ГГГГ-ММ-ДД"
                  placeholderTextColor={colors.textMuted}
                />
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, color: colors.textMuted, marginBottom: 2 }}>Пробег (км):</Text>
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

            {/* Dynamic parts list */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <Text style={{ fontSize: 13, fontWeight: 'bold', color: colors.text }}>Заменяемые детали ({toParts.length}):</Text>
              <TouchableOpacity onPress={addPartRow} style={styles.smallAddBtn}>
                <Text style={{ fontSize: 11, color: '#fff', fontWeight: 'bold' }}>+ Добавить деталь</Text>
              </TouchableOpacity>
            </View>

            {toParts.map((p, idx) => (
              <View key={p.id} style={[styles.partEditCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#3b82f6' }}>Деталь #{idx + 1}</Text>
                  <TouchableOpacity onPress={() => removePartRow(p.id)}>
                    <Text style={{ fontSize: 11, color: '#ef4444', fontWeight: 'bold' }}>Удалить</Text>
                  </TouchableOpacity>
                </View>

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
                    style={[styles.modalInput, { flex: 1.5, backgroundColor: colors.inputBg, borderColor: colors.inputBorder, color: colors.text, fontWeight: 'bold' }]}
                    placeholder="Сумма (₽)"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    value={String(p.price)}
                    onChangeText={(val) => updatePartField(p.id, 'price', val)}
                  />
                </View>
              </View>
            ))}

            <View style={{ height: 20 }} />
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

            <ScrollView style={{ marginVertical: 10 }}>
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
                placeholder="1.5T 7DCT 181 л.с."
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
    width: 36,
    height: 36,
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
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#fde047',
  },
  plateBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#854d0e',
    fontFamily: 'monospace',
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
    marginBottom: 16,
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
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
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
    paddingHorizontal: 10,
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
    padding: 8,
    borderRadius: 8,
    marginTop: 6,
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
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  partName: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    marginBottom: 12,
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
    borderRadius: 12,
    borderWidth: 1.5,
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
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  }
});
