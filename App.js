import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { Text } from 'react-native';
import LoginScreen from './screens/LoginScreen';
import SettingsScreen from './screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;

            if (route.name === 'LoginScreen') {
              iconName = 'home-outline';
            } else if (route.name === 'SettingsScreen') {
              iconName = 'settings-outline';
            }

            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarLabel: ({ focused, color }) => {
            let label;
            if (route.name === 'LoginScreen') {
              label = focused ? 'ホーム' : 'ホーム';
            } else if (route.name === 'SettingsScreen') {
              label = focused ? '設定' : '設定';
            }
            return <Text style={{ color, fontSize: 12 }}>{label}</Text>;
          },
          tabBarActiveTintColor: '#007bff',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: { paddingBottom: 10, paddingTop: 10, height: 60 },
        })}
      >
        <Tab.Screen 
          name="LoginScreen" 
          component={LoginScreen} 
          options={{ headerShown: false }}
        />
        <Tab.Screen 
          name="SettingsScreen" 
          component={SettingsScreen} 
          options={{ headerShown: false }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;
