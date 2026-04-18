/**
 * Global Emergency State Flow
 * States: monitoring | crash_detected | cancel_window | emergency_triggered | alerts_sent | authority_callback | hospital_nav
 */

import React, { createContext, useContext, useState, useCallback } from 'react';

const EmergencyContext = createContext(null);

export const APP_STATES = {
  MONITORING: 'monitoring',
  CRASH_DETECTED: 'crash_detected',
  CANCEL_WINDOW: 'cancel_window',
  EMERGENCY_TRIGGERED: 'emergency_triggered',
  ALERTS_SENT: 'alerts_sent',
  AUTHORITY_CALLBACK: 'authority_callback',
  HOSPITAL_NAV: 'hospital_nav',
};

export function EmergencyProvider({ children }) {
  const [appState, setAppState] = useState(APP_STATES.MONITORING);
  const [emergency, setEmergency] = useState(null);
  const [alertStatus, setAlertStatus] = useState(null); // { status: 'sent'|'failed'|'retrying', attempt: 0 }
  const [authorityCallback, setAuthorityCallback] = useState(null);

  const transitionTo = useCallback((state, data = {}) => {
    setAppState(state);
    if (data.emergency) setEmergency(data.emergency);
    if (data.alertStatus !== undefined) setAlertStatus(data.alertStatus);
    if (data.authorityCallback !== undefined) setAuthorityCallback(data.authorityCallback);
  }, []);

  const resetEmergency = useCallback(() => {
    setAppState(APP_STATES.MONITORING);
    setEmergency(null);
    setAlertStatus(null);
    setAuthorityCallback(null);
  }, []);

  const value = {
    appState,
    emergency,
    alertStatus,
    authorityCallback,
    transitionTo,
    setEmergency,
    setAlertStatus,
    setAuthorityCallback,
    resetEmergency,
  };

  return (
    <EmergencyContext.Provider value={value}>{children}</EmergencyContext.Provider>
  );
}

export function useEmergency() {
  const ctx = useContext(EmergencyContext);
  if (!ctx) throw new Error('useEmergency must be used within EmergencyProvider');
  return ctx;
}
