import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View, Alert } from 'react-native';
import LoginScreen from './screens/LoginScreen';
import SettingsScreen from './screens/SettingsScreen';
import HomeScreen from './screens/HomeScreen';
import WebViewScreen from './screens/WebViewScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAutoLoginEnabled, setIsAutoLoginEnabled] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const autoLogin = await AsyncStorage.getItem('autoLogin');
                const isUserLoggedIn = await AsyncStorage.getItem('isUserLoggedIn');
                const savedUserID = await AsyncStorage.getItem('userID');
                const savedPassword = await AsyncStorage.getItem('password');

                if (autoLogin === 'true' && isUserLoggedIn === 'true' && savedUserID && savedPassword) {
                    setIsLoggedIn(true);
                    setIsAutoLoginEnabled(true);
                } else {
                    setIsLoggedIn(false);
                }
            } catch (error) {
                console.error('Error checking login status: ', error);
            } finally {
                setIsLoading(false);
            }
        };

        checkLoginStatus();
    }, []);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    const handleLogout = async () => {
        await AsyncStorage.setItem('autoLogin', 'false');
        await AsyncStorage.setItem('isUserLoggedIn', 'false');
        setIsLoggedIn(false);
    };

    const confirmLogout = () => {
        Alert.alert(
            "確認",
            "本当にログアウトしますか？",
            [
                {
                    text: "キャンセル",
                    style: "cancel",
                },
                {
                    text: "ログアウト",
                    onPress: handleLogout,
                },
            ],
            { cancelable: false }
        );
    };

    return (
        <Tab.Navigator>
            {!isLoggedIn ? (
                <>
                    <Tab.Screen
                        name="Login"
                        children={() => <LoginScreen setIsLoggedIn={setIsLoggedIn} />}
                        options={{
                            title: 'ホーム',
                            tabBarIcon: ({ color, size }) => (
                                <Ionicons name="home" color={color} size={size} />
                            ),
                        }}
                    />
                    <Tab.Screen
                        name="Settings"
                        children={() => <SettingsScreen setIsLoggedIn={setIsLoggedIn} />}
                        options={{
                            title: '設定', // "Настройки"
                            tabBarIcon: ({ color, size }) => (
                                <Ionicons name="settings" color={color} size={size} />
                            ),
                        }}
                    />
                </>
            ) : (
                <>
                    <Tab.Screen
                        name="Home"
                        component={HomeScreen}
                        options={{
                            title: 'ホーム',
                            tabBarIcon: ({ color, size }) => (
                                <Ionicons name="home" color={color} size={size} />
                            ),
                        }}
                    />
                    <Tab.Screen
                        name="WebView"
                        component={WebViewScreen}
                        options={{
                            title: 'Clicaについて',
                            tabBarButton: () => null,
                        }}
                    />
                    <Tab.Screen
                        name="Logout"
                        listeners={{
                            tabPress: e => {
                                e.preventDefault();
                                confirmLogout();
                            },
                        }}
                        options={{
                            title: 'ログアウト',
                            tabBarIcon: ({ color, size }) => (
                                <Ionicons name="log-out" color={color} size={size} />
                            ),
                        }}>
                        {() => null}
                    </Tab.Screen>
                </>
            )}
        </Tab.Navigator>
    );
}
