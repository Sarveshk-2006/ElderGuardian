/**
 * Simplified AI analysis: CSI and triage from crash/sensor data only.
 * Heart rate and bleeding modules removed.
 */

function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

/**
 * Analyze crash data and return CSI + triage (no vitals/bleeding).
 */
export function analyzeEmergency(inputs = {}) {
  const { impactForce = 5, variability = 0.3 } = inputs;

  const impactComponent = clamp(impactForce / 10, 0, 1);
  const csiRaw = 3 * impactComponent + variability * 2;
  const csi = clamp(csiRaw * 1.2, 0, 10);

  let triage = 'green';
  if (csi >= 6) triage = 'red';
  else if (csi >= 4) triage = 'yellow';

  return {
    csi: Math.round(csi * 10) / 10,
    triage,
    confidence: 0.85 + Math.random() * 0.1,
    analyzedAt: new Date().toISOString(),
  };
}

export function generateSimulatedInputs() {
  const impactForce = 4 + Math.random() * 5;
  return {
    impactForce: Math.round(impactForce * 10) / 10,
    variability: 0.2 + Math.random() * 0.3,
  };
}
