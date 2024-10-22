import { AppRegistry } from 'react-native';
import App from './App'; // Убедитесь, что путь к вашему файлу App.js правильный
import { name as appName } from './app.json'; // Импортируйте имя приложения

AppRegistry.registerComponent(appName, () => App); // Регистрация компонента
