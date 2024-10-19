import React, { useEffect, useState, useRef } from 'react';
import { View, Text, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WebView from 'react-native-webview';
import { useFocusEffect } from '@react-navigation/native';  // Для обновления при возврате на экран

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [autoLoginEnabled, setAutoLoginEnabled] = useState(false);  // Флаг автологина
  const webviewRef = useRef(null);

  // Функция для загрузки данных из AsyncStorage
  const loadLoginData = async () => {
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
      }
    } else {
      setIsDataLoaded(false);  // Если данных нет, показываем сообщение
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
      loadLoginData();  // Перезагружаем данные при каждом возврате на экран
    }, [])
  );

  // Обработка изменения URL для отслеживания логаута
  const handleNavigationStateChange = async (navState) => {
    const currentUrl = navState.url;
    console.log('Текущий URL:', currentUrl);

    // Если пользователь переходит на страницу логаута
    if (currentUrl.includes('/logout.aspx')) {
      // Отключаем только автологин, не удаляя логин и пароль
      await AsyncStorage.setItem('autoLogin', 'false');

      Alert.alert("Logged out", "Auto-login has been disabled. You will need to log in manually next time.");

      // Сбрасываем флаг автологина, но оставляем логин и пароль
      setAutoLoginEnabled(false);

      // Перенаправляем на экран настроек
      navigation.navigate('SettingsScreen');
    }
  };

  // Проверка и выполнение автологина при загрузке
  useEffect(() => {
    if (isDataLoaded && autoLoginEnabled && webviewRef.current) {
      webviewRef.current.injectJavaScript(loginJavaScript); // Выполняем автологин, если включен
    }
  }, [isDataLoaded, autoLoginEnabled]);

  return (
    <View style={{ flex: 1 }}>
      {isDataLoaded ? (
        <WebView
          ref={webviewRef}
          source={{ uri: 'https://clica.jp/app/' }}
          style={{ flex: 1 }}
          injectedJavaScript={loginJavaScript}  // Внедряем JavaScript для автологина
          onNavigationStateChange={handleNavigationStateChange}  // Отслеживаем изменения URL
          onLoadEnd={() => {
            if (autoLoginEnabled) {
              webviewRef.current.injectJavaScript(loginJavaScript);  // Автологин при загрузке
            }
          }}
        />
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Waiting for login data...</Text>
        </View>
      )}
    </View>
  );
};

export default LoginScreen;
