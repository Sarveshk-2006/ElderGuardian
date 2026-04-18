/**
 * Authority service for A1-C3 matrix roles.
 * Hospital (108), Police (100), Towing, System Log.
 */

import { Linking, Platform } from 'react-native';
import { ROLES } from './emergencyMatrix';
import { queueOfflineSms } from './contactAlert';

const PHONE_HOSPITAL = '108';
const PHONE_POLICE = '100';

function buildLocationLink(lat, lon) {
  if (lat != null && lon != null) return `https://www.google.com/maps?q=${lat},${lon}`;
  return 'Location unavailable';
}

function buildMedicalDetailsMessage(emergency, location) {
  const locLink = location ? buildLocationLink(location.latitude, location.longitude) : 'Location pending';
  return `EMERGENCY - CRITICAL INJURY\n` +
    `CSI: ${emergency.csi ?? 'N/A'}\nTriage: ${emergency.triage ?? 'unknown'}\n` +
    `Time: ${emergency.timestamp ?? new Date().toISOString()}\n\n` +
    `Live GPS: ${locLink}`;
}

function buildTowingMessage(emergency, location, carNumber, userName) {
  const locLink = location ? buildLocationLink(location.latitude, location.longitude) : 'Location pending';
  return `BREAKDOWN/URGENT - Towing needed\n` +
    `Car No: ${carNumber || 'N/A'}\nName: ${userName || 'N/A'}\n` +
    `Location: ${locLink}\n` +
    `Time: ${emergency.timestamp ?? new Date().toISOString()}`;
}

function buildStandardSmsMessage(emergency, location) {
  const locLink = location ? buildLocationLink(location.latitude, location.longitude) : 'Location pending';
  return `Minor incident - Please check.\n` +
    `Location: ${locLink}\nTime: ${emergency.timestamp ?? new Date().toISOString()}`;
}

export async function autoDial108() {
  const url = Platform.OS === 'ios' ? `telprompt:${PHONE_HOSPITAL}` : `tel:${PHONE_HOSPITAL}`;
  try {
    if (await Linking.canOpenURL(url)) {
      await Linking.openURL(url);
      return true;
    }
  } catch (e) {
    console.warn('Auto-dial 108 failed:', e.message);
  }
  return false;
}

export async function autoDial100() {
  const url = Platform.OS === 'ios' ? `telprompt:${PHONE_POLICE}` : `tel:${PHONE_POLICE}`;
  try {
    if (await Linking.canOpenURL(url)) {
      await Linking.openURL(url);
      return true;
    }
  } catch (e) {
    console.warn('Auto-dial 100 failed:', e.message);
  }
  return false;
}

export async function autoDial108And100() {
  await autoDial108();
  await new Promise((r) => setTimeout(r, 500));
  await autoDial100();
  return true;
}

/**
 * Send SMS to authority number (108/100) via native SMS compose.
 */
export async function sendSmsToAuthority(phone, message) {
  try {
    const url = `sms:${phone}?body=${encodeURIComponent(message)}`;
    if (await Linking.canOpenURL(url)) {
      await Linking.openURL(url);
      return { success: true };
    }
  } catch (e) {
    console.warn('SMS to authority failed:', e.message);
  }
  return { success: false };
}

/**
 * Execute matrix cell actions based on roles and connectivity.
 */
export async function executeMatrixActions(matrixCell, emergency, location, settings, onStatus) {
  const { roles, audioBeacon, v2vRelay, systemLog } = matrixCell;
  const carNumber = settings?.carNumber || '';
  const userName = settings?.userName || settings?.contactName || '';

  const results = { hospital: false, police: false, towing: false, smsQueued: false };

  const medicalMsg = buildMedicalDetailsMessage(emergency, location);
  const towingMsg = buildTowingMessage(emergency, location, carNumber, userName);
  const standardMsg = buildStandardSmsMessage(emergency, location);

  // System log: emergency already appended in createEmergency; B3/C3 just control relay behavior

  if (roles.includes(ROLES.HOSPITAL_108)) {
    if (matrixCell.cell.startsWith('A')) {
      await autoDial108And100();
      await sendSmsToAuthority(PHONE_HOSPITAL, medicalMsg);
      await sendSmsToAuthority(PHONE_POLICE, medicalMsg);
      results.hospital = true;
      results.police = true;
    } else if (matrixCell.cell.startsWith('B')) {
      await queueOfflineSms(PHONE_HOSPITAL, medicalMsg);
      await queueOfflineSms(PHONE_POLICE, medicalMsg);
      results.smsQueued = true;
    } else if (matrixCell.cell.startsWith('C') && matrixCell.cell === 'C1') {
      activateV2VRelay(emergency, 'critical');
    }
  }

  if (roles.includes(ROLES.POLICE_100) && !results.police) {
    if (matrixCell.cell.startsWith('A') && matrixCell.requiresOkayPrompt) {
      results.requiresOkayPrompt = true;
    } else if (matrixCell.cell.startsWith('B')) {
      await queueOfflineSms(PHONE_POLICE, medicalMsg);
      results.smsQueued = true;
    }
  }

  if (roles.includes(ROLES.TOWING)) {
    if (matrixCell.cell.startsWith('A')) {
      onStatus?.('towing', 'notify_via_app');
      results.towing = true;
    } else if (matrixCell.cell.startsWith('B')) {
      await queueOfflineSms(PHONE_HOSPITAL, towingMsg);
      results.smsQueued = true;
    } else if (matrixCell.cell === 'C2') {
      activateV2VRelay(emergency, 'breakdown');
    }
  }

  if (roles.includes(ROLES.SYSTEM_LOG)) {
    if (matrixCell.cell === 'B3') {
      const contactPhone = settings?.contactPhone;
      if (contactPhone) {
        await queueOfflineSms(contactPhone, standardMsg);
        results.smsQueued = true;
      }
    }
  }

  if (audioBeacon) {
    activateAudioBeacon();
  }

  if (v2vRelay && matrixCell.cell.startsWith('C')) {
    activateV2VRelay(emergency, matrixCell.cell === 'C1' ? 'critical' : 'breakdown');
  }

  return results;
}

/**
 * Activate audio beacon (sos pattern via device audio).
 * Uses expo-haptics for vibration pattern as audio surrogate on mobile.
 */
export function activateAudioBeacon() {
  try {
    const Haptics = require('expo-haptics');
    const sosPattern = async () => {
      const Feedback = Haptics.NotificationFeedbackType;
      for (let i = 0; i < 3; i++) {
        await Haptics.notificationAsync(Feedback.Warning);
        await new Promise((r) => setTimeout(r, 200));
      }
      await new Promise((r) => setTimeout(r, 400));
      for (let i = 0; i < 3; i++) {
        await Haptics.notificationAsync(Feedback.Warning);
        await new Promise((r) => setTimeout(r, 200));
      }
      await new Promise((r) => setTimeout(r, 400));
      for (let i = 0; i < 3; i++) {
        await Haptics.notificationAsync(Feedback.Warning);
        await new Promise((r) => setTimeout(r, 200));
      }
    };
    sosPattern();
  } catch (e) {
    console.warn('Audio beacon (haptics) failed:', e.message);
  }
}

/**
 * V2V (Vehicle-to-Vehicle) relay - simulated broadcast.
 * In production: BLE/broadcast/mesh network. Here: log + haptic indicator.
 */
export function activateV2VRelay(emergency, type) {
  try {
    const Haptics = require('expo-haptics');
    Haptics.notificationAsync(
      type === 'critical' ? Haptics.NotificationFeedbackType.Error : Haptics.NotificationFeedbackType.Warning
    );
  } catch (e) {
    console.warn('V2V relay haptic failed:', e.message);
  }
  return { v2vActivated: true, type };
}
