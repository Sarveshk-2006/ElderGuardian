/**
 * Pre-Accident Risk Alert: Detect aggressive driving and warn before crash.
 * PDF: "Pre-Accident Risk Alert: Detect aggressive driving and warn before crash"
 */

import { Accelerometer } from 'expo-sensors';

const HARD_BRAKING_G = 2.0;          // Deceleration threshold
const HARD_ACCEL_G = 2.0;            // Acceleration threshold
const SAMPLE_INTERVAL_MS = 100;
const WINDOW_MS = 2000;              // Look back 2 seconds
const WARN_COOLDOWN_MS = 10000;      // Don't warn again for 10 sec

let subscription = null;
let lastWarningTime = 0;
let samples = [];
let callback = null;

function onAccelerometerUpdate({ x, y, z }) {
  const g = Math.sqrt(x * x + y * y + z * z);
  samples.push({ g, z, timestamp: Date.now() });
  if (samples.length > WINDOW_MS / SAMPLE_INTERVAL_MS) {
    samples.shift();
  }

  if (Date.now() - lastWarningTime < WARN_COOLDOWN_MS) return;

  const recent = samples.slice(-5);
  const avgG = recent.reduce((s, r) => s + r.g, 0) / recent.length;
  const deltaG = samples.length >= 2 ? Math.abs(samples[samples.length - 1].g - samples[samples.length - 2].g) : 0;

  const hardBraking = recent.some((r) => r.g >= HARD_BRAKING_G) || (avgG >= 1.8 && deltaG > 0.5);
  const hardAccel = recent.some((r) => r.g >= HARD_ACCEL_G + 0.5);

  if ((hardBraking || hardAccel) && callback) {
    lastWarningTime = Date.now();
    callback({
      type: hardBraking ? 'hard_braking' : 'hard_acceleration',
      severity: avgG >= 2.5 ? 'high' : 'medium',
      timestamp: new Date().toISOString(),
    });
  }
}

export async function startAggressiveDrivingDetection(onWarning) {
  if (!onWarning) return;
  callback = onWarning;
  Accelerometer.setUpdateInterval(SAMPLE_INTERVAL_MS);
  subscription = Accelerometer.addListener(onAccelerometerUpdate);
}

export function stopAggressiveDrivingDetection() {
  if (subscription) {
    subscription.remove();
    subscription = null;
  }
  callback = null;
  samples = [];
}
