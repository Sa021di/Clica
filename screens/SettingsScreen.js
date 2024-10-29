import React, { useState, useEffect } from 'react';
import { View, TextInput, Alert, TouchableOpacity, Text, StyleSheet, SafeAreaView, ActivityIndicator, StatusBar, Switch } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { WebView } from 'react-native-webview'; // Для отображения WebView

const SettingsScreen = () => {
  const [userID, setUserID] = useState('');
  const [password, setPassword] = useState('');
  const [isLoadingData, setIsLoadingData] = useState(true); // State for loading async data
  const [webviewUrl, setWebviewUrl] = useState(null); // State for WebView URL
  const [autoLoginEnabled, setAutoLoginEnabled] = useState(false); // State for auto-login switch
  const navigation = useNavigation(); // Get the navigation object

  useEffect(() => {
    const fetchLoginData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('loginData');
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setUserID(parsedData.userID);
          setPassword(parsedData.password);
          setAutoLoginEnabled(parsedData.autoLoginEnabled || false); // Устанавливаем состояние для переключателя
          console.log('Login data loaded in SettingsScreen:', parsedData);
        }
      } catch (error) {
        console.error('Error loading login data in SettingsScreen:', error);
      } finally {
        setIsLoadingData(false); // Окончание загрузки данных
      }
    };

    fetchLoginData();
  }, []);

  // Сохраняем состояние переключателя сразу при изменении
  const handleAutoLoginToggle = async (newValue) => {
    setAutoLoginEnabled(newValue);

    try {
      const storedData = await AsyncStorage.getItem('loginData');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        const updatedData = { ...parsedData, autoLoginEnabled: newValue };
        await AsyncStorage.setItem('loginData', JSON.stringify(updatedData));
        console.log('Auto-login state updated:', updatedData);
      } else {
        // Если данных еще нет, создаем новую запись
        const newLoginData = { userID, password, autoLoginEnabled: newValue };
        await AsyncStorage.setItem('loginData', JSON.stringify(newLoginData));
        console.log('New login data saved:', newLoginData);
      }
    } catch (error) {
      console.error('Error saving auto-login state:', error);
    }
  };

  const saveLoginDataAndLogin = async () => {
    if (userID && password) {
      const loginData = { userID, password, autoLoginEnabled };
      try {
        await AsyncStorage.setItem('loginData', JSON.stringify(loginData));
        console.log('Login data saved with auto-login enabled:', loginData);
        
        Alert.alert(
          'Success',
          'Login data saved.',
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

  if (isLoadingData) {
    // Показываем индикатор загрузки, пока данные не загрузятся
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  // Если есть URL для WebView, отображаем страницу
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar backgroundColor="white" barStyle="dark-content" />
      <View style={{ flex: 1 }}>
        <View style={styles.formContainer}>
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

          {/* Переключатель для авто-логина */}
          <View style={styles.switchContainer}>
            <Text>自動ログイン</Text>
            <Switch
              value={autoLoginEnabled}
              onValueChange={handleAutoLoginToggle} // Вызываем функцию сохранения при изменении
            />
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={saveLoginDataAndLogin}>
            <Text style={styles.saveButtonText}>保存</Text>
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
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    padding: 20,
    flexGrow: 1,
  },
  input: {
    marginBottom: 10,
    borderWidth: 1,
    padding: 10,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
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
    backgroundColor: '#f0f0f0',
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  linkText: {
    color: '#007AFF',
    fontSize: 16,
  },
  backButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default SettingsScreen;
