import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loadSettings } from '../services/settingsService';
import { fetchHistory } from '../services/emergencyService';
import { useAuth } from './AuthContext';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const { token } = useAuth();
  const [monitoring, setMonitoringState] = useState(true);
  const [settings, setSettingsState] = useState({
    aggressiveAlert: true,
    contactName: 'Dr. Emergency',
    contactPhone: '+1 (555) 010-9999',
  });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [medications, setMedications] = useState([
    { id: '1', name: 'Aspirin', dosage: '81mg', time: '08:00 AM', taken: true, icon: 'medical', color: '#E53935' },
    { id: '2', name: 'Metformin', dosage: '500mg', time: '12:00 PM', taken: false, icon: 'flask', color: '#1D4ED8' },
    { id: '3', name: 'Lisinopril', dosage: '10mg', time: '09:00 PM', taken: false, icon: 'beaker', color: '#16A34A' },
  ]);

  const toggleMedication = useCallback((id) => {
    setMedications((prev) => 
      prev.map((m) => (m.id === id ? { ...m, taken: !m.taken } : m))
    );
  }, []);

  const refreshSettings = useCallback(async () => {
    const data = await loadSettings(token);
    setSettingsState(data);
  }, [token]);

  const refreshHistory = useCallback(async () => {
    const data = await fetchHistory();
    setHistory(data);
  }, []);

  const updateSettings = useCallback((updates) => {
    setSettingsState((prev) => ({ ...prev, ...updates }));
  }, []);

  useEffect(() => {
    (async () => {
      await Promise.all([refreshSettings(), refreshHistory()]);
      setLoading(false);
    })();
  }, [refreshSettings, refreshHistory]);

  const value = {
    monitoring,
    settings,
    updateSettings,
    history,
    medications,
    toggleMedication,
    refreshHistory,
    refreshSettings,
    loading,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
