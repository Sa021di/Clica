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
    <Tab.Screen name="Login" children={() => <LoginScreen onLogin={onLogin} />} />
    <Tab.Screen name="Settings" children={() => <SettingsScreen onSettingsSubmit={onLogin} />} />
  </Tab.Navigator>
);

const MainStack = ({ onLogin, isLoggedIn }) => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AuthTabs">
      {() => <AuthTabs onLogin={onLogin} />}
    </Stack.Screen>
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
