import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Switch, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [autoLogin, setAutoLogin] = useState(false);

  useEffect(() => {
    // Загружаем сохраненные данные из AsyncStorage при загрузке экрана настроек
    const loadSettings = async () => {
      const savedUsername = await AsyncStorage.getItem('username');
      const savedPassword = await AsyncStorage.getItem('password');
      const savedAutoLogin = await AsyncStorage.getItem('autoLogin');

      if (savedUsername) setUsername(savedUsername);
      if (savedPassword) setPassword(savedPassword);
      if (savedAutoLogin === 'true') setAutoLogin(true);
    };
    loadSettings();
  }, []);

  const handleSaveSettings = async () => {
    try {
      // Сохраняем логин, пароль и флаг автологина в AsyncStorage
      await AsyncStorage.setItem('username', username);
      await AsyncStorage.setItem('password', password);
      await AsyncStorage.setItem('autoLogin', autoLogin.toString());

      Alert.alert('Success', 'Settings have been saved.');

      // Перенаправляем пользователя на LoginScreen для автоматической авторизации
      navigation.navigate('LoginScreen');
    } catch (e) {
      Alert.alert('Error', 'Failed to save settings.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>ログインID</Text>
      <TextInput
        style={styles.input}
        placeholder="ログインIDを入力"
        value={username}
        onChangeText={setUsername}
      />
      <Text style={styles.label}>パスワード</Text>
      <TextInput
        style={styles.input}
        placeholder="パスワードを入力"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <View style={styles.switchContainer}>
        <Text>自動ログイン</Text>
        <Switch
          value={autoLogin}
          onValueChange={(value) => setAutoLogin(value)}
        />
      </View>
      <Button title="保存" onPress={handleSaveSettings} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
});

export default SettingsScreen;
