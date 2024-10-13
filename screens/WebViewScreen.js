import React from 'react';
import { WebView } from 'react-native-webview';
import { View, Button, StyleSheet } from 'react-native';

export default function WebViewScreen({ navigation }) {
    return (
        <View style={{ flex: 1 }}>
            <WebView
                source={{ uri: 'https://clica.jp/LP/' }}
                style={{ flex: 1 }}
            />
            <Button title="戻る" onPress={() => navigation.goBack()} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
