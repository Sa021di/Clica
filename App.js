import React, { useState, useEffect, useRef } from 'react';
import { Animated, Easing, SafeAreaView, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from './screens/LoginScreen';
import SettingsScreen from './screens/SettingsScreen';
import { WebView } from 'react-native-webview';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const AuthTabs = ({ onLogin }) => (
  <Tab.Navigator screenOptions={{ headerShown: false }}>
    <Tab.Screen name="Login">
      {() => <LoginScreen onLogin={onLogin} />}
    </Tab.Screen>
    <Tab.Screen name="Settings">
      {() => <SettingsScreen onSettingsSubmit={onLogin} />}
    </Tab.Screen>
  </Tab.Navigator>
);

const MainStack = ({ onLogin, isLoggedIn }) => (
  <Stack.Navigator screenOptions={{ headerShown: !isLoggedIn }}>
    <Stack.Screen name="AuthTabs">
      {() => <AuthTabs onLogin={onLogin} />}
    </Stack.Screen>
    <Stack.Screen name="Main">
      {() => <WebView source={{ uri: 'https://clica.jp/app/' }} />}
    </Stack.Screen>
  </Stack.Navigator>
);

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true); // Добавляем состояние загрузки
  const tabAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const checkLoginStatus = async () => {
      const loginData = await AsyncStorage.getItem('loginData');
      setIsLoggedIn(!!loginData);
      setLoading(false); // Останавливаем индикатор загрузки
    };

    checkLoginStatus();
  }, []);

  const handleLogin = async (loginData) => {
    await AsyncStorage.setItem('loginData', JSON.stringify(loginData));
    setIsLoggedIn(true); // Устанавливаем статус как авторизованный
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('loginData');
    setIsLoggedIn(false); // Устанавливаем статус как не авторизованный
  };

  const handleNavigationStateChange = (event) => {
    console.log('Navigating to:', event.url);
    if (event.url.includes('home/default.aspx')) {
      console.log('Successfully logged in');
      // Скрываем табы и заголовок при переходе на home/default.aspx
    } else {
      // Показываем табы и заголовок на остальных страницах
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <NavigationContainer>
      <MainStack onLogin={handleLogin} isLoggedIn={isLoggedIn} />
    </NavigationContainer>
  );
};

export default App;
