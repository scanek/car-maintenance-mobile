import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  BackHandler,
  ScrollView,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Alert
} from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@server_url';
const DEFAULT_URL = 'http://192.168.1.100:9595';

export default function App() {
  const [serverUrl, setServerUrl] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);

  const webViewRef = useRef(null);

  useEffect(() => {
    loadSavedUrl();
  }, []);

  useEffect(() => {
    const onBackPress = () => {
      if (canGoBack && webViewRef.current) {
        webViewRef.current.goBack();
        return true;
      }
      return false;
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => subscription.remove();
  }, [canGoBack]);

  const loadSavedUrl = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        setServerUrl(saved);
        setInputUrl(saved);
      } else {
        setInputUrl(DEFAULT_URL);
        setIsConfigOpen(true);
      }
    } catch (e) {
      setInputUrl(DEFAULT_URL);
      setIsConfigOpen(true);
    }
  };

  const saveUrl = async () => {
    let formatted = inputUrl.trim();
    if (!formatted) {
      Alert.alert('Ошибка', 'Введите адрес сервера');
      return;
    }
    if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
      formatted = 'http://' + formatted;
    }
    try {
      await AsyncStorage.setItem(STORAGE_KEY, formatted);
      setServerUrl(formatted);
      setIsConfigOpen(false);
      setHasError(false);
    } catch (e) {
      Alert.alert('Ошибка', 'Не удалось сохранить настройки');
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
    setTimeout(() => setRefreshing(false), 1500);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />

      {/* Top Bar with Server Switch */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <Text style={styles.topBarTitle}>🚗 Авто ТО & Мониторинг</Text>
          <Text style={styles.topBarSubtitle} numberOfLines={1}>
            {serverUrl || 'Сервер не указан'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => {
            setInputUrl(serverUrl || DEFAULT_URL);
            setIsConfigOpen(true);
          }}
        >
          <Text style={styles.settingsBtnText}>⚙️ Сервер</Text>
        </TouchableOpacity>
      </View>

      {/* Main WebView or Error View */}
      {hasError ? (
        <ScrollView
          contentContainerStyle={styles.errorContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />}
        >
          <Text style={styles.errorIcon}>📡</Text>
          <Text style={styles.errorTitle}>Ошибка подключения</Text>
          <Text style={styles.errorText}>
            Не удалось связаться с сервером:{'\n'}
            <Text style={styles.errorUrl}>{serverUrl}</Text>
          </Text>
          <Text style={styles.errorHint}>
            Убедитесь, что сервер включен, запущен docker compose, а телефон подключен к той же Wi-Fi сети (или VPN).
          </Text>

          <View style={styles.errorActions}>
            <TouchableOpacity style={styles.btnPrimary} onPress={() => { setHasError(false); onRefresh(); }}>
              <Text style={styles.btnPrimaryText}>🔄 Повторить попытку</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnSecondary} onPress={() => setIsConfigOpen(true)}>
              <Text style={styles.btnSecondaryText}>✏️ Изменить IP-адрес</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : serverUrl ? (
        <View style={styles.webWrapper}>
          <WebView
            ref={webViewRef}
            source={{ uri: serverUrl }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text style={styles.loadingText}>Загрузка данных ТО...</Text>
              </View>
            )}
            onNavigationStateChange={(navState) => {
              setCanGoBack(navState.canGoBack);
            }}
            onError={() => setHasError(true)}
            onHttpError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent;
              if (nativeEvent.statusCode >= 400 && nativeEvent.statusCode !== 401) {
                setHasError(true);
              }
            }}
            style={styles.webview}
          />
        </View>
      ) : (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Настройка приложения...</Text>
        </View>
      )}

      {/* Server Config Modal */}
      <Modal visible={isConfigOpen} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>⚙️ Адрес вашего сервера</Text>
            <Text style={styles.modalDesc}>
              Укажите IP-адрес и порт вашего сервера, где развернуто приложение (например: http://192.168.1.150:9595):
            </Text>

            <TextInput
              style={styles.input}
              placeholder="http://192.168.1.150:9595"
              placeholderTextColor="#64748b"
              value={inputUrl}
              onChangeText={setInputUrl}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />

            <View style={styles.modalButtons}>
              {serverUrl ? (
                <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setIsConfigOpen(false)}>
                  <Text style={styles.modalBtnCancelText}>Отмена</Text>
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity style={styles.modalBtnSave} onPress={saveUrl}>
                <Text style={styles.modalBtnSaveText}>Подключиться</Text>
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
    backgroundColor: '#0f172a',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1e293b',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  topBarLeft: {
    flex: 1,
    marginRight: 10,
  },
  topBarTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  topBarSubtitle: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 1,
  },
  settingsBtn: {
    backgroundColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  settingsBtnText: {
    color: '#f8fafc',
    fontSize: 12,
    fontWeight: '600',
  },
  webWrapper: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  webview: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
  },
  loadingText: {
    marginTop: 12,
    color: '#94a3b8',
    fontSize: 13,
  },
  errorContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorUrl: {
    color: '#60a5fa',
    fontWeight: 'bold',
  },
  errorHint: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18,
  },
  errorActions: {
    width: '100%',
    gap: 12,
  },
  btnPrimary: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnPrimaryText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  btnSecondary: {
    backgroundColor: '#1e293b',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  btnSecondaryText: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  modalDesc: {
    fontSize: 13,
    color: '#94a3b8',
    marginBottom: 16,
    lineHeight: 18,
  },
  input: {
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#ffffff',
    fontSize: 15,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalBtnCancel: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalBtnCancelText: {
    color: '#94a3b8',
    fontWeight: '600',
  },
  modalBtnSave: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  modalBtnSaveText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});
