import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, Switch, Alert, StyleSheet, Keyboard, TouchableWithoutFeedback } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import WebView from 'react-native-webview';

const SettingsScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [autoLogin, setAutoLogin] = useState(false);
  const [webviewUrl, setWebviewUrl] = useState(null); // Для открытия WebView

  useEffect(() => {
    // Загружаем сохраненные данные из AsyncStorage при загрузке экрана настроек
    const loadSettings = async () => {
      try {
        const savedUsername = await AsyncStorage.getItem('username');
        const savedPassword = await AsyncStorage.getItem('password');
        const savedAutoLogin = await AsyncStorage.getItem('autoLogin');

        if (savedUsername) setUsername(savedUsername);
        if (savedPassword) setPassword(savedPassword);
        if (savedAutoLogin === 'true') setAutoLogin(true);
      } catch (e) {
        console.log('Error loading settings', e);
      }
    };
    loadSettings();
  }, []);

  const handleSaveSettings = async () => {
    try {
      await AsyncStorage.setItem('username', username || '');  // Обеспечиваем, что сохраняется строка
      await AsyncStorage.setItem('password', password || '');  // Обеспечиваем, что сохраняется строка
      await AsyncStorage.setItem('autoLogin', autoLogin.toString());

      Alert.alert('Success', 'Settings have been saved.');

      // Перенаправляем пользователя на LoginScreen для автоматической авторизации
      navigation.navigate('LoginScreen');
    } catch (e) {
      Alert.alert('Error', 'Failed to save settings.');
    }
  };

  if (webviewUrl) {
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <WebView source={{ uri: webviewUrl }} style={{ flex: 1 }} />
        <TouchableOpacity style={styles.backButton} onPress={() => setWebviewUrl(null)}>
          <Text style={styles.backButtonText}>戻る</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const isSwitchDisabled = username === '' || password === ''; // Переключатель отключен, если инпуты пустые
  const isSaveButtonDisabled = username === '' || password === ''; // Кнопка "Сохранить" отключена, если данные пустые

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.safeContainer}>
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
              onValueChange={(value) => setAutoLogin(!!value)}
              thumbColor={autoLogin ? '#fff' : '#f4f3f4'}
              trackColor={{ false: '#767577', true: '#000' }}
              disabled={isSwitchDisabled}
            />
          </View>

          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: isSaveButtonDisabled ? '#ccc' : 'black' }]}
            onPress={handleSaveSettings}
            disabled={isSaveButtonDisabled}
          >
            <Text style={styles.buttonText}>保存</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => setWebviewUrl('https://clica.jp/app/signup/user_entry.aspx')}
          >
            <Text style={styles.linkText}>受講者アカウント登録</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => setWebviewUrl('https://clica.jp/app/remind/_sub/remind.aspx')}
          >
            <Text style={styles.linkText}>パスワードを忘れた方</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    paddingTop: 20,
  },
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
    borderRadius: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  saveButton: {
    padding: 10,
    alignItems: 'center',
    marginTop: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  linkButton: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    alignItems: 'center',
    marginTop: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  linkText: {
    color: '#333',
    fontSize: 16,
  },
  backButton: {
    backgroundColor: 'black',
    padding: 10,
    alignItems: 'center',
    borderRadius: 8,
    margin: 10,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default SettingsScreen;
