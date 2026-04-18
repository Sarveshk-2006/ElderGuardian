export const mockEmergencyHistory = [
    {
      id: '1',
      timestamp: '2026-02-15T14:32:00Z',
      csi: 8.4,
      heartRate: 112,
      bleedingProbability: 0.78,
      triage: 'red',
      status: 'Notified EMS',
    },
    {
      id: '2',
      timestamp: '2026-02-10T09:15:00Z',
      csi: 5.1,
      heartRate: 96,
      bleedingProbability: 0.42,
      triage: 'yellow',
      status: 'Driver Stable',
    },
    {
      id: '3',
      timestamp: '2026-01-28T22:04:00Z',
      csi: 3.0,
      heartRate: 88,
      bleedingProbability: 0.18,
      triage: 'green',
      status: 'Self-Resolved',
    },
  ];
  
  export const mockCurrentEmergency = {
    csi: 7.6,
    heartRate: 118,
    bleedingProbability: 0.65,
    triage: 'red',
  };
  
  export const mockVitals = {
    heartRate: 102,
    respirationRate: 22,
    spo2: 97,
    traumaScore: 0.58,
  };