import { appendToHistory, getHistory } from './storage';
import { analyzeEmergency, generateSimulatedInputs } from './aiAnalysis';
import { computeCSIFromSensors, simulateCrashSensorData } from './crashDetection';
import { createEmergencyDataPacket } from './emergencyPacket';
import { sendEmergencyAlertWithRetry, autoCallContact } from './contactAlert';
import { getConnectivityClass, getTierFromTriage } from './connectivityService';
import { getMatrixCell } from './emergencyMatrix';
import { executeMatrixActions, sendSmsToAuthority } from './authorityService';
import * as Location from 'expo-location';
import { supabase, isSupabaseConfigured } from './supabase';

/**
 * Create emergency from crash sensor data (no heart rate, bleeding).
 * Auto-fetch location for packet and alerts.
 */
export async function createEmergency(options = {}) {
  const sensorData = options.sensorData || simulateCrashSensorData();
  const inputs = options.inputs || generateSimulatedInputs();

  const csiFromSensors = computeCSIFromSensors(sensorData) || 0;
  const analysis = analyzeEmergency({
    ...inputs,
    impactForce: sensorData.gForce ? sensorData.gForce / 2 : undefined,
    variability: sensorData.gyroSpike ? sensorData.gyroSpike / 6 : undefined,
  });
  
  let csi = Math.max(csiFromSensors, analysis.csi);
  if (isNaN(csi)) csi = 5.0;

  let location = null;
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        maxAge: 10000,
      });
      location = loc?.coords;
    }
  } catch (e) {
    console.warn('Location fetch failed:', e.message);
  }

  const emergency = {
    id: `e_${Date.now()}`,
    timestamp: new Date().toISOString(),
    csi: Math.round(csi * 10) / 10,
    triage: analysis.triage,
    status: 'Emergency Activated',
    contactsNotified: false,
    sensorData,
    location,
  };

  const packet = createEmergencyDataPacket(emergency, { location });
  emergency.packet = packet;

  const connectivity = await getConnectivityClass();
  const tier = getTierFromTriage(emergency.triage);
  const matrixCell = getMatrixCell(connectivity, tier);
  emergency.connectivity = connectivity;
  emergency.tier = tier;
  emergency.matrixCell = matrixCell;

  await appendToHistory(emergency);

  // Sync to MySQL backend if API configured (from AuthContext token)
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  if (apiUrl && options.token) {
    try {
      const { syncEmergency } = require('./api');
      await syncEmergency(emergency, options.token, options.userId);
    } catch (e) {
      console.warn('Backend sync failed:', e.message);
    }
  }

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('emergencies').insert({
        id: emergency.id,
        timestamp: emergency.timestamp,
        csi: emergency.csi,
        triage: emergency.triage,
        status: emergency.status,
        location: location ? { lat: location.latitude, lng: location.longitude } : null,
      });
    } catch (e) {
      console.warn('Supabase sync failed:', e.message);
    }
  }

  return emergency;
}

export async function fetchHistory() {
  let history = await getHistory();
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('emergencies')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);
      if (!error && data?.length) {
        const mapped = data.map((row) => ({
          id: row.id,
          timestamp: row.timestamp,
          csi: row.csi,
          triage: row.triage,
          status: row.status,
        }));
        history = [...mapped, ...history.filter((h) => !mapped.find((m) => m.id === h.id))];
      }
    } catch (e) {
      console.warn('Supabase fetch failed:', e.message);
    }
  }
  return history;
}

/**
 * Auto-notify emergency contacts immediately (no manual confirmation).
 * Uses smart retry: 3 attempts, 10s apart.
 */
export async function notifyContactsAuto(emergency, contactPhone, onAlertStatus) {
  if (!contactPhone || !emergency) return { success: false };

  const location = emergency.location || null;

  const smsResult = await sendEmergencyAlertWithRetry(
    emergency,
    contactPhone,
    location,
    onAlertStatus
  );

  await autoCallContact(contactPhone);

  if (isSupabaseConfigured && supabase) {
    try {
      await supabase
        .from('emergencies')
        .update({ contacts_notified: true, status: 'Contacts Notified' })
        .eq('id', emergency.id);
    } catch (e) {
      console.warn('Supabase update failed:', e.message);
    }
  }

  return { ...smsResult, success: smsResult.success };
}

/**
 * Execute A1-C3 matrix actions and conditionally notify emergency contact.
 * Per Techathon PDF flow diagram.
 */
export async function executeMatrixFlow(emergency, settings, onStatus) {
  const matrixCell = emergency.matrixCell;
  const location = emergency.location;

  const results = await executeMatrixActions(
    matrixCell,
    emergency,
    location,
    settings,
    onStatus
  );

  if (results.requiresOkayPrompt) {
    return { requiresOkayPrompt: true };
  }

  const tier = emergency.tier ?? getTierFromTriage(emergency.triage);
  const contactPhone = settings?.contactPhone;

  if (tier <= 2 && contactPhone && !matrixCell?.roles?.includes('system_log')) {
    const driverDetails = {
      carNumber: settings?.carNumber || '',
      userName: settings?.userName || settings?.contactName || '',
    };
    const smsResult = await sendEmergencyAlertWithRetry(
      emergency,
      contactPhone,
      location,
      (status, attempt) => onStatus?.('contact', { status, attempt }),
      driverDetails
    );
    await autoCallContact(contactPhone);
    return { ...results, contactNotified: smsResult.success };
  }

  return results;
}

/**
 * A3 flow: User did not respond to "Are you okay?" - send standard SMS to police (100).
 */
export async function sendA3NoResponseSms(emergency, settings) {
  const { sendSmsToAuthority } = require('./authorityService');
  const loc = emergency.location;
  const msg =
    `Minor incident - No response to "Are you okay?". Please check.\n` +
    `Location: ${loc ? `https://www.google.com/maps?q=${loc.latitude},${loc.longitude}` : 'Pending'}\n` +
    `Time: ${emergency.timestamp ?? new Date().toISOString()}`;
  await sendSmsToAuthority('100', msg);
  return { sent: true };
}
