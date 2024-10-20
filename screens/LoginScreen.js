import React, { useEffect, useState, useRef } from 'react'; 
import { SafeAreaView, View, Text, Alert, Keyboard, TouchableWithoutFeedback } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WebView from 'react-native-webview';
import { useFocusEffect } from '@react-navigation/native';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [autoLoginEnabled, setAutoLoginEnabled] = useState(false);
  const webviewRef = useRef(null);
  const lastLoggedUrl = useRef('');
  const attemptCount = useRef(0);  // Счетчик попыток

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

        if (autoLogin === 'true') {
          setAutoLoginEnabled(true);
        }
      } else {
        setIsDataLoaded(false);  // Если данных нет
      }
    } catch (error) {
      console.error('Error loading login data:', error);
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

  // Обработка изменения URL для отслеживания логаута и ошибок
  const handleNavigationStateChange = async (navState) => {
    const currentUrl = navState.url;
    console.log('Текущий URL:', currentUrl);

    // Предотвращение бесконечного цикла
    if (currentUrl === lastLoggedUrl.current) {
      console.log('URL не изменился, предотвращаем повторную попытку');
      attemptCount.current += 1;  // Увеличиваем счетчик при каждой проверке
      if (attemptCount.current >= 3) {  // Если после 3 попыток URL не изменился
        console.log('Не удалось войти в систему, сброс данных...');
        
        // Сбрасываем флаг автологина
        setAutoLoginEnabled(false); 

        // Очищаем данные и перенаправляем
        await AsyncStorage.removeItem('username');
        await AsyncStorage.removeItem('password');
        await AsyncStorage.removeItem('autoLogin');

        // Обнуляем счетчик
        attemptCount.current = 0;

        // Оповещаем пользователя и перенаправляем
        Alert.alert("Login Failed", "Your credentials are incorrect. Please re-enter them.");
        navigation.navigate('SettingsScreen');  // Перенаправляем на экран настроек
        return;  // Останавливаем дальнейшую обработку
      }
      return;  // Останавливаем дальнейшую обработку, если URL не изменился
    }

    lastLoggedUrl.current = currentUrl;  // Обновляем последнее записанное значение

    // Сброс счетчика при успешном изменении URL
    if (currentUrl.includes('/home/default.aspx')) {
      console.log('Login successful, resetting attempt count');
      attemptCount.current = 0;  // Сбрасываем счетчик при успешном входе
    }

    if (currentUrl.includes('/logout.aspx')) {
      await AsyncStorage.setItem('autoLogin', 'false');
      Alert.alert("Logged out", "Auto-login has been disabled. You will need to log in manually next time.");
      setAutoLoginEnabled(false);
      navigation.navigate('SettingsScreen');
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
        {isDataLoaded ? (
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
          />
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Waiting for login data...</Text>
          </View>
        )}
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

export default LoginScreen;
