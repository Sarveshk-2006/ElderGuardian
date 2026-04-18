/**
 * Improved Crash Detection using Accelerometer and Gyroscope.
 * CSI from: G-force peak, sudden orientation change, impact duration, motion inactivity post-impact.
 */

import { Accelerometer, Gyroscope } from 'expo-sensors';

const CRASH_THRESHOLD_G = 2.5;
const IMPACT_DURATION_MS = 300;
const GYRO_SPIKE_THRESHOLD = 3.0;
const SAMPLE_INTERVAL_MS = 50;
const MOTION_INACTIVITY_THRESHOLD = 0.3; // Low G after impact = possible unconsciousness
const POST_IMPACT_WINDOW_MS = 800;
const ORIENTATION_CHANGE_THRESHOLD = 0.8; // Rad/s sustained

let accelSubscription = null;
let gyroSubscription = null;
let lastAccelData = null;
let lastGyroData = null;
let impactStartTime = null;
let preImpactOrientation = null;
let callback = null;
let gyroHistory = [];

function magnitude(x, y, z) {
  return Math.sqrt(x * x + y * y + z * z);
}

function onAccelerometerUpdate({ x, y, z }) {
  const g = magnitude(x, y, z);
  lastAccelData = { x, y, z, g, timestamp: Date.now() };

  if (g >= CRASH_THRESHOLD_G) {
    if (!impactStartTime) {
      impactStartTime = Date.now();
      preImpactOrientation = lastGyroData ? { ...lastGyroData } : null;
    }
    const duration = Date.now() - impactStartTime;
    if (duration >= IMPACT_DURATION_MS && callback) {
      const gyroMagnitude = lastGyroData
        ? magnitude(lastGyroData.x, lastGyroData.y, lastGyroData.z)
        : 0;

      // Orientation change: average gyro spike during impact
      const orientationChange = gyroHistory.length > 0
        ? gyroHistory.reduce((s, g) => s + magnitude(g.x, g.y, g.z), 0) / gyroHistory.length
        : gyroMagnitude;

      callback({
        gForce: g,
        gForcePeak: g,
        impactDurationMs: duration,
        gyroSpike: gyroMagnitude,
        orientationChange,
        accel: { x, y, z },
        preImpactOrientation,
      });
      impactStartTime = null;
      gyroHistory = [];
    }
  } else {
    if (impactStartTime) {
      gyroHistory.push(lastGyroData ? { ...lastGyroData } : { x: 0, y: 0, z: 0 });
    } else {
      gyroHistory = [];
    }
    impactStartTime = null;
  }
}

function onGyroscopeUpdate({ x, y, z }) {
  lastGyroData = { x, y, z, timestamp: Date.now() };
}

/**
 * Compute Crash Severity Index (CSI) from sensor data.
 * Factors: G-force peak, orientation change, impact duration, motion post-impact.
 */
export function computeCSIFromSensors({
  gForce = 0,
  gForcePeak = 0,
  impactDurationMs = 0,
  gyroSpike = 0,
  orientationChange = 0,
  speedDrop = 0,
  motionInactivity = 0,
}) {
  const gPeak = gForcePeak || gForce;
  const gComponent = Math.min(gPeak / 8, 1) * 4;
  const durationComponent = Math.min(impactDurationMs / 500, 1) * 2;
  const orientationComponent = Math.min((orientationChange || gyroSpike) / 6, 1) * 2;
  const motionComponent = Math.min((gyroSpike || 0) / 6, 1) * 1.5;
  const inactivityBonus = motionInactivity > 0.5 ? 0.5 : 0;
  const speedDropBonus = speedDrop > 0 ? Math.min(speedDrop / 50, 0.5) : 0;

  const csi = Math.min(
    gComponent + durationComponent + orientationComponent + motionComponent + inactivityBonus + speedDropBonus,
    10
  );
  return Math.round(csi * 10) / 10;
}

export async function startCrashDetection(onCrashDetected) {
  callback = onCrashDetected;
  Accelerometer.setUpdateInterval(SAMPLE_INTERVAL_MS);
  Gyroscope.setUpdateInterval(SAMPLE_INTERVAL_MS);
  accelSubscription = Accelerometer.addListener(onAccelerometerUpdate);
  gyroSubscription = Gyroscope.addListener(onGyroscopeUpdate);
}

export function stopCrashDetection() {
  if (accelSubscription) {
    accelSubscription.remove();
    accelSubscription = null;
  }
  if (gyroSubscription) {
    gyroSubscription.remove();
    gyroSubscription = null;
  }
  callback = null;
  impactStartTime = null;
  lastAccelData = null;
  lastGyroData = null;
  gyroHistory = [];
}

export function simulateCrashSensorData() {
  return {
    gForce: 4.2 + Math.random() * 3,
    gForcePeak: 5,
    impactDurationMs: 250 + Math.random() * 150,
    gyroSpike: 2.5 + Math.random() * 2,
    orientationChange: 2 + Math.random() * 2,
    accel: { x: 2.1, y: -1.8, z: 3.2 },
  };
}
