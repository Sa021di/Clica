import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from './screens/LoginScreen';
import SettingsScreen from './screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const AuthTabs = ({ onLogin }) => (
  <Tab.Navigator>
    <Tab.Screen name="Login">
      {() => <LoginScreen onLogin={onLogin} />}
    </Tab.Screen>
    <Tab.Screen name="Settings">
      {() => <SettingsScreen onSettingsSubmit={onLogin} />}
    </Tab.Screen>
  </Tab.Navigator>
);

const MainStack = ({ onLogin }) => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AuthTabs">
      {() => <AuthTabs onLogin={onLogin} />}
    </Stack.Screen>
    <Stack.Screen name="Main">
      {() => <LoginScreen onLogin={onLogin} />}
    </Stack.Screen>
  </Stack.Navigator>
);

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const loginData = await AsyncStorage.getItem('loginData');
      setIsLoggedIn(loginData ? true : false);
    };

    checkLoginStatus();
  }, []);

  const handleLogin = async (loginData) => {
    // Сохраняем данные для логина в AsyncStorage и выполняем вход
    await AsyncStorage.setItem('loginData', JSON.stringify(loginData));
    setIsLoggedIn(true); // Устанавливаем статус как авторизованный
  };

  return (
    <NavigationContainer>
      <MainStack onLogin={handleLogin} />
    </NavigationContainer>
  );
};

export default App;
