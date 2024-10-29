import React, { useState, useEffect } from 'react';
import { SafeAreaView, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from './screens/LoginScreen';
import SettingsScreen from './screens/SettingsScreen';
import { WebView } from 'react-native-webview';
import Ionicons from 'react-native-vector-icons/Ionicons'; // Импорт иконок

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const AuthTabs = ({ onLogin }) => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;

        if (route.name === 'Login') {
          iconName = focused ? 'log-in' : 'log-in-outline'; // Иконки для вкладки "Login"
        } else if (route.name === 'Settings') {
          iconName = focused ? 'settings' : 'settings-outline'; // Иконки для вкладки "Settings"
        }

        // Возвращаем иконку
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#87CEFA', // Светло-синий цвет для активных иконок
      tabBarInactiveTintColor: 'gray', // Серый цвет для неактивных иконок
    })}
  >
    <Tab.Screen name="Login" children={() => <LoginScreen onLogin={onLogin} />} />
    <Tab.Screen name="Settings" children={() => <SettingsScreen onSettingsSubmit={onLogin} />} />
  </Tab.Navigator>
);

const MainStack = ({ onLogin, isLoggedIn }) => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AuthTabs" component={AuthTabs} />
    <Stack.Screen name="Main" component={WebView} />
  </Stack.Navigator>
);

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoginStatus = async () => {
      const loginData = await AsyncStorage.getItem('loginData');
      setIsLoggedIn(!!loginData);
      setLoading(false);
    };

    checkLoginStatus();
  }, []);

  const handleLogin = async (loginData) => {
    await AsyncStorage.setItem('loginData', JSON.stringify(loginData));
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('loginData');
    setIsLoggedIn(false);
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
