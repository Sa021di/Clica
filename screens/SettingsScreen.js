import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, Alert, TouchableOpacity, Text, StyleSheet } from 'react-native';
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
        
        Alert.alert(
          'Success',
          'Login data saved. Redirecting to login...',
          [
            {
              text: 'OK',
              onPress: () => {
                setTimeout(() => {
                  navigation.navigate('Login');
                }, 500);
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

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="ログインIDを入力"
        value={userID}
        onChangeText={setUserID}
        style={styles.input}
      />
      <TextInput
        placeholder="パスワードを入力"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <TouchableOpacity style={styles.saveButton} onPress={saveLoginDataAndLogin}>
        <Text style={styles.saveButtonText}>保存</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        onPress={() => navigation.navigate('WebViewScreen', { url: 'signup/user_entry.aspx' })} 
        style={styles.linkButton}>
        <Text style={styles.linkButtonText}>受講者アカウント登録</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        onPress={() => navigation.navigate('WebViewScreen', { url: 'remind/_sub/remind.aspx' })} 
        style={styles.linkButton}>
        <Text style={styles.linkButtonText}>パスワードを忘れた方</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
  },
  input: {
    marginBottom: 10,
    borderWidth: 1,
    padding: 10,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  saveButton: {
    backgroundColor: '#000',
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  linkButton: {
    backgroundColor: '#f0f0f0', // Light background for the link button
    borderRadius: 5, // Rounded corners
    paddingVertical: 15, // Vertical padding for the button
    marginBottom: 10, // Space between buttons
    alignItems: 'center', // Center text horizontally
  },
  linkButtonText: {
    color: '#000', // Text color
    fontSize: 16, // Font size
  },
});

export default SettingsScreen;
