import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, Image, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function LoginScreen({ setIsLoggedIn }) {
    const [userID, setUserID] = useState('');
    const [password, setPassword] = useState('');
    const navigation = useNavigation();

    useEffect(() => {
        const setDefaultTestUser = async () => {
            const savedUserID = await AsyncStorage.getItem('userID');
            const savedPassword = await AsyncStorage.getItem('password');

            if (!savedUserID || !savedPassword) {
                await AsyncStorage.setItem('userID', 'Test');
                await AsyncStorage.setItem('password', '1234');
            }
        };

        setDefaultTestUser();
    }, []);

    const handleLogin = async () => {
        const savedUserID = await AsyncStorage.getItem('userID');
        const savedPassword = await AsyncStorage.getItem('password');

        if (userID === savedUserID && password === savedPassword) {
            await AsyncStorage.setItem('isUserLoggedIn', 'true');
            setIsLoggedIn(true);
         
            navigation.navigate('Home');
        } else {
            Alert.alert('Invalid login details');
        }
    };
    const openAppStore = () => {
        Linking.openURL('https://www.apple.com/app-store/');
    };

    const isButtonDisabled = userID === '' || password === '';

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
                <Image source={require('../assets/logo.png')} style={styles.logo} />
                <Text style={styles.label}>ユーザID</Text>
                <TextInput
                    placeholder="ユーザIDを入力"
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

                <TouchableOpacity
                    style={[
                        styles.loginButton,
                        isButtonDisabled ? styles.disabledButton : {},
                    ]}
                    onPress={handleLogin}
                    disabled={isButtonDisabled}
                >
                    <Text style={styles.loginButtonText}>ログイン</Text>
                </TouchableOpacity>

                <View style={styles.linksContainer}>
                    <TouchableOpacity>
                        <Text style={styles.linkText}>受信者アカウント登録はこちら</Text>
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Text style={styles.linkText}>講師用アカウント登録はこちら</Text>
                    </TouchableOpacity>
                    <TouchableOpacity>
                        <Text style={styles.linkText}>
                            パスワードを忘れた方、Office365でログインされていた方はこちら
                        </Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={openAppStore}>
                    <Image source={require('../assets/app-store-badge.png')} style={styles.appStoreBadge} />
                </TouchableOpacity>

                <View style={styles.infoContainer}>
                    <Text style={styles.infoHeader}>iOSご利用の方へ</Text>
                    <Text style={styles.infoText}>
                        新しいClicaは「学びアプリ」として、現在のアクティブラーニングツールに加えて、
                        学びのプラットフォームとの連係、デジタル修了証との連係を行えるようになりました。
                        そのため本バージョンアップにてアプり名が「Clica」から「Study.jp」に変更されます。
                    </Text>
                </View>
            </View>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    logo: {
        width: 100,
        height: 100,
        marginBottom: 30,
    },
    label: {
        alignSelf: 'flex-start',
        marginBottom: 5,
        marginLeft: '5%',
        color: '#666',
        fontSize: 14,
    },
    input: {
        width: '100%',
        height: 45,
        backgroundColor: '#f1f3f5',
        borderRadius: 5,
        paddingHorizontal: 10,
        marginBottom: 15,
    },
    loginButton: {
        width: '100%',
        height: 45,
        backgroundColor: '#87ceeb',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        marginVertical: 20,
    },
    disabledButton: {
        backgroundColor: '#d3d3d3',
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    linksContainer: {
        alignItems: 'flex-start',
        width: '100%',
        marginTop: 10,
        marginBottom: 20,
    },
    linkText: {
        color: '#4F5D73',
        fontSize: 14,
        marginVertical: 5,
    },
    appStoreBadge: {
        width: 180,
        height: 60,
        marginVertical: 20,
        marginTop: -10,
    },
    infoContainer: {
        backgroundColor: '#f0f8ff',
        padding: 20,
        marginTop: -10,
        width: '100%',
        borderRadius: 10,
    },
    infoHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    infoText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 22,
    },
});
