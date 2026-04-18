import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  MONITORING: '@emergency_monitoring',
  SETTINGS: '@emergency_settings',
  CONTACTS: '@emergency_contacts',
  HISTORY: '@emergency_history',
};

export async function getMonitoring() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.MONITORING);
    return raw !== null ? JSON.parse(raw) : { active: false };
  } catch {
    return { active: false };
  }
}

export async function setMonitoring(data) {
  await AsyncStorage.setItem(KEYS.MONITORING, JSON.stringify(data));
}

export async function getSettings() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.SETTINGS);
    return raw !== null
      ? JSON.parse(raw)
      : { aggressiveAlert: true };
  } catch {
    return { aggressiveAlert: true };
  }
}

export async function setSettings(settings) {
  await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
}

export async function getContacts() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.CONTACTS);
    const base = raw !== null ? JSON.parse(raw) : {};
    return {
      name: base.name ?? 'Dr. Emergency',
      phone: base.phone ?? '+1 (555) 010-9999',
      carNumber: base.carNumber ?? '',
      userName: base.userName ?? base.name ?? 'Dr. Emergency',
    };
  } catch {
    return { name: 'Dr. Emergency', phone: '+1 (555) 010-9999', carNumber: '', userName: 'Dr. Emergency' };
  }
}

export async function setContacts(contacts) {
  await AsyncStorage.setItem(KEYS.CONTACTS, JSON.stringify(contacts));
}

export async function getHistory() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.HISTORY);
    return raw !== null ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function appendToHistory(emergency) {
  const history = await getHistory();
  const entry = {
    ...emergency,
    id: emergency.id || `e_${Date.now()}`,
    timestamp: emergency.timestamp || new Date().toISOString(),
  };
  const updated = [entry, ...history].slice(0, 50);
  await AsyncStorage.setItem(KEYS.HISTORY, JSON.stringify(updated));
  return updated;
}
