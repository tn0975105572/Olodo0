import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../global.css';
import Toast from 'react-native-toast-message'; // 1. Import Toast
import { Provider } from 'react-redux';

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    Oughter: require('../assets/fonts/Oughter.otf'),
    tuan: require('../assets/fonts/Augusthin Beatrice DEMO VERSION.otf'),
    tuan1: require('../assets/fonts/BAMBOOBRUSH.otf'), // thêm phoong chu
  });

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
      <Toast />
    </ThemeProvider>
  );
}
