import React, { useEffect, useState, useRef } from 'react'; 
import { SafeAreaView, View, Text, Keyboard, TouchableWithoutFeedback, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WebView from 'react-native-webview';
import { useFocusEffect } from '@react-navigation/native';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [autoLoginEnabled, setAutoLoginEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Флаг для показа индикатора загрузки
  const webviewRef = useRef(null);
  const timerRef = useRef(null);

  // Функция для загрузки данных из AsyncStorage
  const loadLoginData = async () => {
    try {
      const savedUsername = await AsyncStorage.getItem('username');
      const savedPassword = await AsyncStorage.getItem('password');
      const autoLogin = await AsyncStorage.getItem('autoLogin');

      if (savedUsername && savedPassword) {
        setUsername(savedUsername);
        setPassword(savedPassword);
        setIsDataLoaded(true);

        // Если автологин включён, устанавливаем флаг
        if (autoLogin === 'true') {
          setAutoLoginEnabled(true);
        } else {
          setIsLoading(false); // Отключаем загрузку, если автологин не включен
        }
      } else {
        setIsDataLoaded(false);  // Если данных нет
        setIsLoading(false); // Останавливаем индикатор загрузки, если данных нет
      }
    } catch (error) {
      console.error('Error loading login data:', error);
      setIsLoading(false); // Отключаем индикатор загрузки при ошибке
    }
  };

  // Загружаем данные при первом рендере
  useEffect(() => {
    loadLoginData();
  }, []);

  // JavaScript для автологина через WebView
  const loginJavaScript = `
    if ('${username}' !== '' && '${password}' !== '') {
      document.querySelector('input[id="ctl00_cplPageContent_txtUserID"]').value = '${username}';
      document.querySelector('input[id="ctl00_cplPageContent_txtPassword"]').value = '${password}';
      document.querySelector('a[id="ctl00_cplPageContent_LinkButton1"]').click();
    }
    true;
  `;

  // Обновляем данные каждый раз при возврате на экран LoginScreen
  useFocusEffect(
    React.useCallback(() => {
      loadLoginData();
    }, [])
  );

  // Обработка изменения URL для отслеживания успешного входа
  const handleNavigationStateChange = (navState) => {
    const currentUrl = navState.url;
    console.log('Текущий URL:', currentUrl);

    // Успешный вход в систему
    if (currentUrl === 'https://clica.jp/app/home/default.aspx') {
      // Завершаем загрузку после 1 секунды для анимации
      setTimeout(() => {
        setIsLoading(false); // Останавливаем индикатор загрузки
      }, 1000); // 1 секунда
    }

    // Ошибка входа
    if (currentUrl === 'https://clica.jp/app/default.aspx') {
      setIsLoading(false); // Останавливаем индикатор загрузки при ошибке
    }
  };

  // Проверка и выполнение автологина при загрузке
  useEffect(() => {
    if (isDataLoaded && autoLoginEnabled && webviewRef.current) {
      webviewRef.current.injectJavaScript(loginJavaScript);
    }
  }, [isDataLoaded, autoLoginEnabled]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={{ flex: 1 }}>
        {isLoading && (
          // Индикатор загрузки, пока происходит авторизация
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text>Logging in...</Text>
          </View>
        )}
        <WebView
          ref={webviewRef}
          source={{ uri: 'https://clica.jp/app/' }}
          style={{ flex: 1 }}
          injectedJavaScript={loginJavaScript}
          onNavigationStateChange={handleNavigationStateChange}
          onLoadEnd={() => {
            if (autoLoginEnabled) {
              webviewRef.current.injectJavaScript(loginJavaScript);
            }
          }}
          // WebView будет работать "в фоновом режиме", пока виден индикатор загрузки
          style={{ opacity: isLoading ? 0 : 1 }}
        />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 10,
  },
});

export default LoginScreen;
