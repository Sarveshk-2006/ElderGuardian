import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useAuth } from '../context/AuthContext';

import { colors } from '../constants/colors';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import AuthorityDashboardScreen from '../screens/AuthorityDashboardScreen';
import AuthoritySettingsScreen from '../screens/AuthoritySettingsScreen';
import CrashAlertScreen from '../screens/CrashAlertScreen';
import EmergencyActivatedScreen from '../screens/EmergencyActivatedScreen';
import HistoryScreen from '../screens/HistoryScreen';
import HomeScreen from '../screens/HomeScreen';
import HospitalsMapScreen from '../screens/HospitalsMapScreen';
import MedicineScreen from '../screens/MedicineScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function PersonMainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: colors.borderSoft,
          height: 64,
          paddingBottom: 10,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} /> }} />
      <Tab.Screen name="Hospitals" component={HospitalsMapScreen} options={{ title: 'Hospitals', tabBarIcon: ({ color, size }) => <Ionicons name="medical" size={size} color={color} /> }} />
      <Tab.Screen name="History" component={HistoryScreen} options={{ tabBarIcon: ({ color, size }) => <Ionicons name="time" size={size} color={color} /> }} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} options={{ tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart" size={size} color={color} /> }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarIcon: ({ color, size }) => <Ionicons name="settings" size={size} color={color} /> }} />
    </Tab.Navigator>
  );
}

function AuthorityMainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: colors.borderSoft,
          height: 64,
          paddingBottom: 10,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="Police"
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="shield" size={size} color={color} /> }}
      >
        {() => <AuthorityDashboardScreen authorityRole="police" />}
      </Tab.Screen>
      <Tab.Screen
        name="Hospital"
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="medical" size={size} color={color} /> }}
      >
        {() => <AuthorityDashboardScreen authorityRole="hospital" />}
      </Tab.Screen>
      <Tab.Screen
        name="Towing"
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="car" size={size} color={color} /> }}
      >
        {() => <AuthorityDashboardScreen authorityRole="towing" />}
      </Tab.Screen>
      <Tab.Screen
        name="Settings"
        component={AuthoritySettingsScreen}
        options={{ tabBarIcon: ({ color, size }) => <Ionicons name="settings" size={size} color={color} /> }}
      />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : user.role === 'person' ? (
        <>
          <Stack.Screen name="MainTabs" component={PersonMainTabs} />
          <Stack.Screen name="CrashAlert" component={CrashAlertScreen} options={{ presentation: 'fullScreenModal' }} />
          <Stack.Screen name="EmergencyActivated" component={EmergencyActivatedScreen} options={{ headerShown: true, title: 'Emergency Activated' }} />
          <Stack.Screen name="Hospitals" component={HospitalsMapScreen} options={{ headerShown: true, title: 'Nearby Hospitals' }} />
          <Stack.Screen name="Medicine" component={MedicineScreen} options={{ headerShown: false }} />
        </>
      ) : (
        <Stack.Screen name="AuthorityTabs" component={AuthorityMainTabs} />
      )}
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
