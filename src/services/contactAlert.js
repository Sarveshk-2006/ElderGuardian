/**
 * Network-independent emergency contact notification.
 * Priority: Internet API (Twilio) -> Native SMS -> Retry logic (3 attempts, 10s apart).
 * Message includes: Google Maps location link, Crash Severity, Timestamp.
 */

import { Linking, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OFFLINE_QUEUE_KEY = '@emergency_offline_sms_queue';
const RETRY_INTERVAL_MS = 10000;
const MAX_ATTEMPTS = 3;

const TWILIO_API_URL = process.env.EXPO_PUBLIC_TWILIO_API_URL || '';

function buildLocationLink(lat, lon) {
  if (lat != null && lon != null) {
    return `https://www.google.com/maps?q=${lat},${lon}`;
  }
  return 'Location unavailable';
}

/**
 * @param {Object} emergency - emergency object
 * @param {Object} location - { latitude, longitude }
 * @param {Object} driverDetails - optional { carNumber, userName } from settings
 */
export function buildEmergencyMessage(emergency, location = null, driverDetails = {}) {
  const locLink = location ? buildLocationLink(location.latitude, location.longitude) : 'Location pending';
  const timestamp = emergency.timestamp ?? new Date().toISOString();
  const userName = driverDetails.userName || 'your relative';
  const audioCloudinaryUrl = emergency.sensorData?.audioCloudinaryUrl || '';

  let message = `EMERGENCY ALERT - ElderGuardian\n\n` +
    `Severe Fall Detected for ${userName}.\n` +
    `Time: ${timestamp}\n\n` +
    `Live GPS Location: ${locLink}\n`;
    
  if (audioCloudinaryUrl) {
    message += `\nDistress Audio Recording:\n${audioCloudinaryUrl}\n`;
  }

  return message + `\nPlease check on them immediately or call an ambulance if necessary.`;
}

const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.42:3001/api';

async function sendViaApi(phone, message) {
  try {
    const res = await fetch(`${BACKEND_URL}/emergencies/dispatch-sms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        to: phone.replace(/\D/g, ''), 
        body: message,
        source: 'automatic_fall_detection' 
      }),
    });
    if (res.ok) return { success: true, method: 'backend_api' };
    return { success: false, method: 'api_error' };
  } catch (e) {
    console.warn("Backend Dispatch failed:", e.message);
    return { success: false, method: 'api_error' };
  }
}

import * as SMS from 'expo-sms';

async function sendViaNativeSMS(phone, message, audioUri) {
  try {
    const isAvailable = await SMS.isAvailableAsync();
    if (isAvailable) {
      let options = {};
      if (audioUri) {
        options.attachments = {
          uri: audioUri,
          mimeType: 'audio/m4a',
          filename: 'sos_proof_of_life.m4a'
        };
      }
      const { result } = await SMS.sendSMSAsync([phone], message, options);
      return { success: true, method: 'expo-sms' };
    }

    const smstoUrl = `sms:${phone.replace(/\D/g, '')}?body=${encodeURIComponent(message)}`;
    if (await Linking.canOpenURL(smstoUrl)) {
      await Linking.openURL(smstoUrl);
      return { success: true, method: 'linking' };
    }
    return { success: false, method: 'sms_unavailable' };
  } catch (e) {
    return { success: false, method: 'error' };
  }
}

async function queueOfflineSms(phone, message) {
  try {
    const raw = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    const queue = raw ? JSON.parse(raw) : [];
    queue.push({ phone, message, timestamp: new Date().toISOString() });
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue.slice(-20)));
  } catch (e) {
    console.warn('Offline queue failed:', e);
  }
}

export async function flushOfflineQueue() {
  try {
    const raw = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    if (!raw) return [];
    const queue = JSON.parse(raw);
    const sent = [];
    const remaining = [];
    for (const item of queue) {
      try {
        const url = `sms:${item.phone.replace(/\D/g, '')}?body=${encodeURIComponent(item.message)}`;
        if (await Linking.canOpenURL(url)) {
          await Linking.openURL(url);
          sent.push(item);
        } else {
          remaining.push(item);
        }
      } catch {
        remaining.push(item);
      }
    }
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remaining));
    return sent;
  } catch {
    return [];
  }
}

/**
 * Send with smart retry: 3 attempts, 10 seconds apart.
 * @param {Object} emergency - emergency object
 * @param {string} phone - contact phone
 * @param {Object} location - { latitude, longitude }
 * @param {Function} onStatus - (status: 'sent'|'failed'|'retrying', attempt) => void
 * @param {Object} driverDetails - optional { carNumber, userName } for the message
 */
export async function sendEmergencyAlertWithRetry(emergency, phone, location, onStatus, driverDetails = {}) {
  const message = buildEmergencyMessage(emergency, location, driverDetails);
  const audioUri = emergency?.sensorData?.audioUri;

  const trySend = async () => {
    const apiRes = await sendViaApi(phone, message);
    if (apiRes.success) return { success: true };
    
    // Attempt MMS with Audio (Manual Fallback if API fails)!
    const smsRes = await sendViaNativeSMS(phone, message, audioUri);
    if (smsRes.success) return smsRes;

    await queueOfflineSms(phone, message);
    return { success: false, queued: true };
  };

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    if (attempt > 1) {
      onStatus?.('retrying', attempt);
      await new Promise((r) => setTimeout(r, RETRY_INTERVAL_MS));
    } else {
      onStatus?.('retrying', 1);
    }
    const result = await trySend();
    if (result.success) {
      onStatus?.('sent', attempt);
      return { success: true, attempt };
    }
  }
  onStatus?.('failed', MAX_ATTEMPTS);
  return { success: false, attempt: MAX_ATTEMPTS };
}

export async function autoCallContact(phone) {
  const tel = phone.replace(/\D/g, '');
  const url = Platform.OS === 'ios' ? `telprompt:${tel}` : `tel:${tel}`;
  try {
    if (await Linking.canOpenURL(url)) {
      await Linking.openURL(url);
      return { success: true };
    }
  } catch (e) {
    console.warn('Auto-call failed:', e);
  }
  return { success: false };
}
