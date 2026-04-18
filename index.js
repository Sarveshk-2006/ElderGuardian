import { registerRootComponent } from 'expo';
import * as SplashScreen from 'expo-splash-screen';
import { LogBox } from 'react-native';

import App from './App';

LogBox.ignoreAllLogs(false);

setTimeout(() => {
  SplashScreen.hideAsync().catch(() => {});
}, 1500);

registerRootComponent(App);
