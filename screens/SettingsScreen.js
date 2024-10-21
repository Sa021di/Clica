import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const SettingsScreen = () => {
  const [userID, setUserID] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    const fetchLoginData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('loginData');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setUserID(parsedData.userID);
          setPassword(parsedData.password);
          console.log('Login data loaded in SettingsScreen:', parsedData);
        }
      } catch (error) {
        console.error('Error loading login data in SettingsScreen:', error);
      }
    };

    fetchLoginData();
  }, []);

  const saveLoginDataAndLogin = async () => {
    if (userID && password) {
      const loginData = { userID, password, autoLoginEnabled: true };
      try {
        await AsyncStorage.setItem('loginData', JSON.stringify(loginData));
        console.log('Login data saved with auto-login enabled:', loginData);
        
        // Показываем алерт о сохранении данных
        Alert.alert(
          'Success',
          'Login data saved. Redirecting to login...',
          [
            {
              text: 'OK',
              onPress: () => {
                // Перенаправление на LoginScreen после нажатия "OK"
                navigation.navigate('Login');
              },
            },
          ]
        );
      } catch (error) {
        console.error('Error saving login data:', error);
        Alert.alert('Error', 'Failed to save login data');
      }
    } else {
      Alert.alert('Error', 'Please fill out both fields');
    }
  };

  const clearAsyncStorage = async () => {
    try {
      await AsyncStorage.removeItem('loginData');
      setUserID('');
      setPassword('');
      Alert.alert('Success', 'Login data cleared');
      console.log('AsyncStorage cleared');
    } catch (error) {
      console.error('Error clearing AsyncStorage:', error);
      Alert.alert('Error', 'Failed to clear login data');
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Enter User ID"
        value={userID}
        onChangeText={setUserID}
        style={{ marginBottom: 10, borderWidth: 1, padding: 10 }}
      />
      <TextInput
        placeholder="Enter Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ marginBottom: 10, borderWidth: 1, padding: 10 }}
      />
      <Button title="Save and Log In" onPress={saveLoginDataAndLogin} />
      <Button title="Clear AsyncStorage" onPress={clearAsyncStorage} color="red" />
    </View>
  );
};

export default SettingsScreen;
