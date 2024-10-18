import React, { useEffect, useState } from 'react';
import { View, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WebView from 'react-native-webview';

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isDataLoaded, setIsDataLoaded] = useState(false);  // Флаг для отслеживания загрузки данных

  useEffect(() => {
    // Загружаем сохраненные данные из AsyncStorage
    const loadLoginData = async () => {
      const savedUsername = await AsyncStorage.getItem('username');
      const savedPassword = await AsyncStorage.getItem('password');
      if (savedUsername && savedPassword) {
        setUsername(savedUsername);
        setPassword(savedPassword);
        setIsDataLoaded(true);  // Устанавливаем флаг, что данные загружены
        console.log("Данные загружены:", savedUsername, savedPassword);  // Логируем для проверки
      } else {
        console.log("Данные не найдены");
        Alert.alert("Error", "Login credentials not found in AsyncStorage.");
      }
    };
    loadLoginData();
  }, []);

  // JavaScript, который будет выполняться в WebView для заполнения полей и отправки формы
  const injectedJavaScript = `
    document.querySelector('input[id="ctl00_cplPageContent_txtUserID"]').value = '${username}';
    document.querySelector('input[id="ctl00_cplPageContent_txtPassword"]').value = '${password}';
    document.querySelector('a[id="ctl00_cplPageContent_LinkButton1"]').click();  // Имитация нажатия на кнопку
    window.ReactNativeWebView.postMessage("Form filled and submitted");
    true;
  `;

  // Обработка сообщений из WebView
  const handleWebViewMessage = (event) => {
    console.log("Сообщение из WebView:", event.nativeEvent.data);
    Alert.alert("Info", event.nativeEvent.data);  // Показываем сообщение о том, что форма была отправлена
  };

  return (
    <View style={{ flex: 1 }}>
      {isDataLoaded && (  // Рендерим WebView только после загрузки данных из AsyncStorage
        <WebView
          source={{ uri: 'https://clica.jp/spn/' }}  // Загружаем страницу авторизации
          style={{ flex: 1 }}
          injectedJavaScript={injectedJavaScript}  // Внедряем JavaScript для заполнения формы и отправки
          onMessage={handleWebViewMessage}  // Обрабатываем сообщения из WebView
          onLoadEnd={() => {
            console.log('Страница загружена и форма отправлена');
          }}
        />
      )}
    </View>
  );
};

export default LoginScreen;
