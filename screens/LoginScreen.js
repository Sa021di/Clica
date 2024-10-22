import React, { useEffect, useState } from 'react';
import { SafeAreaView, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useIsFocused } from '@react-navigation/native';

const LoginScreen = () => {
  const [loginData, setLoginData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [webViewKey, setWebViewKey] = useState(0); // Ключ для обновления WebView
  const navigation = useNavigation();
  const isFocused = useIsFocused(); // Проверка, когда экран активен

  // Функция для загрузки данных из AsyncStorage
  const fetchLoginData = async () => {
    try {
      const storedData = await AsyncStorage.getItem('loginData');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setLoginData(parsedData);
        console.log('Login data fetched from AsyncStorage:', parsedData); // Лог данных
      } else {
        console.log('No login data found in AsyncStorage');
      }
    } catch (error) {
      console.error('Error fetching login data from AsyncStorage:', error);
    }
  };

  // Загрузка данных при первом рендере
  useEffect(() => {
    fetchLoginData().finally(() => setIsLoading(false));
  }, [navigation]);

  // Обновление WebView при фокусировке экрана
  useEffect(() => {
    if (isFocused) {
      fetchLoginData(); // Обновляем данные при каждом фокусе экрана
      console.log('LoginScreen is focused, reloading WebView...');
      setWebViewKey(prevKey => prevKey + 1); // Обновляем ключ для перезагрузки WebView
    }
  }, [isFocused]);

  // Инъекция JavaScript для автозаполнения и отправки формы
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
              __doPostBack('ctl00$cplPageContent$LinkButton1', ''); // Отправляем форму
              console.log('Form submitted.');
            }, 1000); // Задержка перед отправкой формы
          } else {
            console.error('Form elements not found.');
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
      // Скрываем табы
      navigation.setOptions({ tabBarStyle: { display: 'none' } });
    } else {
      // Показываем табы
      navigation.setOptions({ tabBarStyle: { display: 'flex' } });
    }
  
    if (event.url.includes('logout.aspx')) {
      console.log('Logged out');
      const storedData = await AsyncStorage.getItem('loginData');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        parsedData.autoLoginEnabled = false; // Отключаем автологин при логауте
        await AsyncStorage.setItem('loginData', JSON.stringify(parsedData));
      }
      navigation.replace('AuthTabs'); // Возвращаемся на экран авторизации после логаута
    }
  };  

  const handleMessage = (event) => {
    console.log('Message from WebView:', event.nativeEvent.data);
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
        key={webViewKey} // Используем ключ для принудительного обновления
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
