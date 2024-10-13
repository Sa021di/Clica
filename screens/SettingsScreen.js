import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, Switch, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

export default function SettingsScreen({ setIsLoggedIn }) {
    const [autoLogin, setAutoLogin] = useState(false);
    const [userID, setUserID] = useState('');
    const [password, setPassword] = useState('');
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);
    const navigation = useNavigation();

    useEffect(() => {
        const fetchSettings = async () => {
            setUserID('');
            setPassword('');  
            const storedAutoLogin = await AsyncStorage.getItem('autoLogin');
            const storedUserID = await AsyncStorage.getItem('userID');
            const storedPassword = await AsyncStorage.getItem('password');
            setAutoLogin(storedAutoLogin === 'true');
        };

        fetchSettings();
    }, []);

    useEffect(() => {
        setIsButtonDisabled(!autoLogin);
    }, [autoLogin]);

    const handleSave = async () => {
        const savedUserID = await AsyncStorage.getItem('userID');
        const savedPassword = await AsyncStorage.getItem('password');

        if (userID === savedUserID && password === savedPassword) {
            await AsyncStorage.setItem('autoLogin', autoLogin.toString());
            await AsyncStorage.setItem('isUserLoggedIn', 'true');
            Alert.alert('Settings saved successfully!', '', [
                {
                    text: 'OK',
                    onPress: () => {
                        setIsLoggedIn(true);
                        navigation.navigate('Home');
                    }
                }
            ]);
        } else {
            Alert.alert('Invalid credentials. Please enter correct login details.');
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <Text style={styles.label}>ログインID</Text>
                <TextInput
                    placeholder="ログインIDを入力"
                    value={userID}
                    onChangeText={setUserID}
                    style={styles.input}
                />

                <Text style={styles.label}>パスワード</Text>
                <TextInput
                    placeholder="パスワードを入力"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    style={styles.input}
                />

                <View style={styles.switchContainer}>
                    <Text>自動ログイン</Text>
                    <Switch
                        value={autoLogin}
                        onValueChange={setAutoLogin}
                        trackColor={{ false: '#ddd', true: '#000' }}
                        thumbColor={autoLogin ? '#fff' : '#fff'} 
                    />
                </View>

                <TouchableOpacity
                    style={[styles.saveButton, isButtonDisabled ? styles.disabledButton : null]}
                    onPress={handleSave}
                    disabled={isButtonDisabled}
                >
                    <Text style={styles.saveButtonText}>保存</Text>
                </TouchableOpacity>
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    label: {
        fontSize: 14,
        marginBottom: 5,
        color: '#333',
    },
    input: {
        height: 45,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 15,
        backgroundColor: '#f9f9f9',
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    saveButton: {
        height: 45,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000', // Черная кнопка
        borderRadius: 5,
    },
    disabledButton: {
        backgroundColor: '#888',  // Неактивная кнопка станет серой
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
