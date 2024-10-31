import React, { useEffect, useState } from 'react';
import { SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useIsFocused } from '@react-navigation/native';

const MAX_LOGIN_ATTEMPTS = 10;

const LoginScreen = () => {
  const [loginData, setLoginData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [webViewKey, setWebViewKey] = useState(0);
  const [alertShown, setAlertShown] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('https://clica.jp/app/');
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const fetchLoginData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('loginData');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setLoginData(parsedData);
        console.log('Login data fetched from AsyncStorage:', parsedData);
      } else {
        console.log('No login data found in AsyncStorage');
      }
    } catch (error) {
      console.error('Error fetching login data from AsyncStorage:', error);
      Alert.alert('Error', 'Failed to fetch login data');
    }
  };

  useEffect(() => {
    fetchLoginData().finally(() => setIsLoading(false));
  }, [navigation]);

  useEffect(() => {
    if (isFocused) {
      fetchLoginData();
      console.log('LoginScreen is focused, reloading WebView...');
      setWebViewKey(prevKey => prevKey + 1);
    }
  }, [isFocused]);

  const injectJavaScriptToFillForm = () => {
    if (!loginData) {
      console.log('Login data is missing or auto-login is disabled.');
      return '';
    }

    if (loginData.autoLoginEnabled) {
      console.log('Injecting JavaScript to fill the form with:', loginData);
      return `
        (function() {
          console.log('Starting to fill the form...');
          var userInput = document.getElementById('ctl00_cplPageContent_txtUserID');
          var passwordInput = document.getElementById('ctl00_cplPageContent_txtPassword');

          if (userInput && passwordInput) {
            userInput.value = '${loginData.userID}';
            passwordInput.value = '${loginData.password}';
            console.log('UserID and Password filled.');
            setTimeout(() => {
              __doPostBack('ctl00$cplPageContent$LinkButton1', '');
              console.log('Form submitted.');
            }, 1000);
          } else {
            console.error('Form elements not found.');
          }

          // Перехватываем клик на кнопку логаута
          var logoutButton = document.querySelector('a[href="https://clica.jp/app/logout.aspx"]');
          if (logoutButton) {
            console.log('Logout button found. Adding event listener.');
            logoutButton.addEventListener('click', function() {
              window.ReactNativeWebView.postMessage('logout');
              console.log('Logout button clicked, message sent to React Native WebView.');
            });
          } else {
            console.error('Logout button not found.');
          }
        })();
      `;
    }

    console.log('Auto-login is disabled.');
    return '';
  };

  const handleNavigationStateChange = async (event) => {
    console.log('Navigating to:', event.url);

    if (event.url.includes('home/default.aspx')) {
      console.log('Successfully logged in');
      navigation.setOptions({ tabBarStyle: { display: 'none' } });
      setLoginAttempts(0);
      setAlertShown(false); // Reset alert state after successful login
    } else {
      navigation.setOptions({ tabBarStyle: { display: 'flex' } });
    }

    if (event.url.includes('logout.aspx')) {
      console.log('Logout initiated');

      // Выключаем авто-логин, но сохраняем данные пользователя в AsyncStorage
      const storedLoginData = await AsyncStorage.getItem('loginData');
      if (storedLoginData) {
        let parsedData = JSON.parse(storedLoginData);
        parsedData.autoLoginEnabled = false;

        try {
          await AsyncStorage.setItem('loginData', JSON.stringify(parsedData));
          console.log('Auto-login disabled after logout.', parsedData);
        } catch (error) {
          console.error('Error saving loginData after logout:', error);
        }
      } else {
        console.error('No login data found in AsyncStorage during logout.');
      }

      // Переход на экран авторизации
      navigation.replace('AuthTabs');
    } else if (loginAttempts >= MAX_LOGIN_ATTEMPTS && !alertShown) {
      console.log('Max login attempts reached. Clearing login data.');
      await AsyncStorage.removeItem('loginData');
      setLoginData(null);
      setAlertShown(true);

      Alert.alert(
        'Login Error',
        'Too many failed attempts. Please re-enter your credentials.',
        [
          {
            text: 'OK',
            onPress: () => {
              console.log('Redirecting to Settings for re-login');
              navigation.navigate('AuthTabs', { screen: 'Settings' });
            }
          }
        ]
      );
    } else {
      setLoginAttempts(prev => prev + 1);
      console.log(`Login attempt: ${loginAttempts + 1}`);
    }
  };

  const handleShouldStartLoadWithRequest = (request) => {
    const url = request.url;

    // Перехватываем все запросы с http://clica.jp и заменяем их на https
    if (url.startsWith('http://clica.jp')) {
      const secureUrl = url.replace('http://', 'https://');
      console.log(`Redirecting to secure URL: ${secureUrl}`);
      setCurrentUrl(secureUrl);
      setWebViewKey(prevKey => prevKey + 1);
      return false;
    }

    // Перехватываем все ссылки и загружаем их внутри WebView
    if (request.navigationType === 'click' && request.url !== currentUrl) {
      console.log('Opening link inside WebView:', request.url);
      setCurrentUrl(request.url);
      setWebViewKey(prevKey => prevKey + 1); // Перезагружаем WebView с новым URL
      return false; // Останавливаем внешнее открытие и загружаем в WebView
    }

    return true; // Разрешаем все остальные запросы
  };

  const handleMessage = (event) => {
    console.log('Message from WebView:', event.nativeEvent.data);
    if (event.nativeEvent.data === 'logout') {
      console.log('Logout message received from WebView');
      handleNavigationStateChange({ url: 'logout.aspx' }); // Имитируем переход к логауту
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <WebView
        key={webViewKey}
        source={{ uri: currentUrl }}
        injectedJavaScript={injectJavaScriptToFillForm()}
        onNavigationStateChange={handleNavigationStateChange}
        onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        mixedContentMode="compatibility"
        originWhitelist={['*']}
        setSupportMultipleWindows={false} // Отключаем поддержку открытия нескольких окон
        style={{ flex: 1 }}
      />
    </SafeAreaView>
  );
};

export default LoginScreen;
