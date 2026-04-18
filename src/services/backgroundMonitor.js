/**
 * Background monitoring for crash detection.
 * Uses AppState + expo-task-manager where supported.
 * Note: Background location is not available in Expo Go—skipped to avoid warnings.
 * For full background detection, use a development build.
 */

import { AppState } from 'react-native';
import Constants from 'expo-constants';
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';

const isExpoGo = Constants.appOwnership === 'expo';

const BACKGROUND_TASK = 'emergency_background_location';
const SAMPLE_INTERVAL_MS = 100; // Reduced when backgrounded for battery

let onCrashDetected = null;
let isMonitoring = false;
let appStateSubscription = null;

export function registerBackgroundCrashHandler(handler) {
  onCrashDetected = handler;
}

export function getIsMonitoring() {
  return isMonitoring;
}

export function setMonitoringActive(active) {
  isMonitoring = active;
}

/**
 * Start background-capable monitoring.
 * Foreground: full sensor detection.
 * Background: location keepalive (Expo Go: sensors pause; dev build can add native sensor task).
 */
export async function startBackgroundMonitoring(crashHandler) {
  onCrashDetected = crashHandler;
  isMonitoring = true;

  if (!isExpoGo) {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        await Location.startLocationUpdatesAsync(BACKGROUND_TASK, {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 30000,
          distanceInterval: 50,
          deferredUpdatesInterval: 30000,
          showsBackgroundLocationIndicator: true,
        });
      }
    } catch (e) {
      // Background location requires dev build; skip in Expo Go
    }
  }

  appStateSubscription = AppState.addEventListener('change', (nextState) => {
    if (nextState === 'active') {
      // App foregrounded: sensors resume via crashDetection
    } else if (nextState === 'background') {
      // App backgrounded: sensors may pause; location continues
    }
  });
}

export async function stopBackgroundMonitoring() {
  isMonitoring = false;
  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_TASK);
    if (isRegistered) {
      await Location.stopLocationUpdatesAsync(BACKGROUND_TASK);
    }
  } catch (e) {
    console.warn('Stop background location:', e.message);
  }
  if (appStateSubscription) {
    appStateSubscription.remove();
    appStateSubscription = null;
  }
}

TaskManager.defineTask(BACKGROUND_TASK, async ({ data, error }) => {
  if (error) {
    console.warn('Background task error:', error);
  }
});
