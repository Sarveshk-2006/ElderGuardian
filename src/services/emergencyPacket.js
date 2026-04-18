/**
 * Structured Emergency Data Packet for responder dashboard.
 * Simplified: no heart rate, bleeding. Focus on CSI, location, triage.
 */

export function createEmergencyDataPacket(emergency, extras = {}) {
  const loc = extras.location || emergency.location;

  return {
    packetId: emergency.id,
    version: '2.0',
    timestamp: emergency.timestamp || new Date().toISOString(),
    source: 'mobile_app',
    matrixCell: emergency.matrixCell?.cell,
    connectivity: emergency.connectivity,
    incident: {
      type: 'road_accident',
      csi: emergency.csi,
      triage: emergency.triage,
      tier: emergency.tier,
      timestamp: emergency.timestamp,
    },
    location: loc
      ? { latitude: loc.latitude, longitude: loc.longitude }
      : null,
    goldenHourStart: emergency.timestamp || new Date().toISOString(),
    severityTrend: extras.severityTrend || [],
  };
}
