import React, { useEffect, useState } from 'react';
import { SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useIsFocused } from '@react-navigation/native';

const LoginScreen = () => {
  const [loginData, setLoginData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [webViewKey, setWebViewKey] = useState(0);
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
            logoutButton.addEventListener('click', function() {
              window.ReactNativeWebView.postMessage('logout');
            });
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
    } else {
      navigation.setOptions({ tabBarStyle: { display: 'flex' } });
    }

    if (event.url.includes('logout.aspx')) {
      console.log('Logout initiated');
  
      // Выключаем авто-логин, но сохраняем данные пользователя в AsyncStorage
      const loginData = await AsyncStorage.getItem('loginData');
      if (loginData) {
        const updatedData = { ...JSON.parse(loginData), autoLoginEnabled: false };
        await AsyncStorage.setItem('loginData', JSON.stringify(updatedData));
        console.log('Auto-login disabled, but login data remains in AsyncStorage');
      }
  
      // Переход на экран авторизации
      navigation.replace('AuthTabs');
    }
  };  

  const handleMessage = (event) => {
    console.log('Message from WebView:', event.nativeEvent.data);
    if (event.nativeEvent.data === 'logout') {
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
    <SafeAreaView style={{ flex: 1, paddingTop: 50}}>
      <WebView
        key={webViewKey}
        source={{ uri: 'https://clica.jp/app/' }}
        injectedJavaScript={injectJavaScriptToFillForm()}
        onNavigationStateChange={handleNavigationStateChange}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        mixedContentMode="compatibility"
        originWhitelist={['*']}
        style={{ flex: 1 }}
      />
    </SafeAreaView>
  );
};

export default LoginScreen;
