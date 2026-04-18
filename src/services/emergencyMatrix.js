/**
 * A1-C3 Emergency Response Matrix (per Techathon PDF).
 * Maps connectivity class (A/B/C) + severity tier (1/2/3) to actions and roles.
 *
 * Legend: Ô = Hospital (108), μ = Police (100), ̂ = Towing Service, Ö = System Log
 */

export const ROLES = {
  HOSPITAL_108: 'hospital_108',
  POLICE_100: 'police_100',
  TOWING: 'towing',
  SYSTEM_LOG: 'system_log',
};

/**
 * Get matrix cell code (A1, B2, C3, etc.) and actions.
 * @param {string} connectivity - 'A' | 'B' | 'C'
 * @param {number} tier - 1 (Critical), 2 (Urgent), 3 (Routine)
 * @returns {{ cell: string, roles: string[], actions: string[], audioBeacon: boolean, v2vRelay: boolean, systemLog: boolean }}
 */
export function getMatrixCell(connectivity, tier) {
  const c = (connectivity || 'A').toUpperCase();
  const t = Math.max(1, Math.min(3, tier));

  const matrix = {
    A1: {
      cell: 'A1',
      roles: [ROLES.HOSPITAL_108, ROLES.POLICE_100],
      actions: ['Auto-dial 108 & 100', 'Instant SMS with medical details & live GPS'],
      audioBeacon: false,
      v2vRelay: false,
      systemLog: false,
    },
    B1: {
      cell: 'B1',
      roles: [ROLES.HOSPITAL_108, ROLES.POLICE_100],
      actions: ['Fire SMS with medical details & location', 'Activate audio beacon'],
      audioBeacon: true,
      v2vRelay: false,
      systemLog: false,
    },
    C1: {
      cell: 'C1',
      roles: [ROLES.HOSPITAL_108, ROLES.POLICE_100],
      actions: ['Initiate V2V (Vehicle-to-Vehicle) wireless signal relay', 'Flag critical emergency'],
      audioBeacon: false,
      v2vRelay: true,
      systemLog: false,
    },
    A2: {
      cell: 'A2',
      roles: [ROLES.TOWING, ROLES.HOSPITAL_108],
      actions: ['Notify towing service via app', 'Prompt user to auto-dial 108 if needed'],
      audioBeacon: false,
      v2vRelay: false,
      systemLog: false,
    },
    B2: {
      cell: 'B2',
      roles: [ROLES.TOWING, ROLES.HOSPITAL_108],
      actions: ['Send SMS with Car No, Name, and location', 'Activate audio beacon'],
      audioBeacon: true,
      v2vRelay: false,
      systemLog: false,
    },
    C2: {
      cell: 'C2',
      roles: [ROLES.TOWING],
      actions: ['Initiate V2V signal relay to broadcast breakdown status to passing cars'],
      audioBeacon: false,
      v2vRelay: true,
      systemLog: false,
    },
    A3: {
      cell: 'A3',
      roles: [ROLES.POLICE_100],
      actions: ['App prompt: "Are you okay?"', 'If no response, send standard SMS'],
      audioBeacon: false,
      v2vRelay: false,
      systemLog: false,
      requiresOkayPrompt: true,
    },
    B3: {
      cell: 'B3',
      roles: [ROLES.SYSTEM_LOG],
      actions: ['Queue SMS with location data to send once connectivity improves'],
      audioBeacon: false,
      v2vRelay: false,
      systemLog: true,
    },
    C3: {
      cell: 'C3',
      roles: [ROLES.SYSTEM_LOG],
      actions: ['Log crash data via hardware sensors', 'No immediate relay unless manually triggered'],
      audioBeacon: false,
      v2vRelay: false,
      systemLog: true,
    },
  };

  const key = `${c}${t}`;
  return matrix[key] || matrix.A1;
}
