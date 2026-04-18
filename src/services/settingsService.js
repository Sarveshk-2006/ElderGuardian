import { getSettings, setSettings, getContacts, setContacts } from './storage';
import { fetchSettings, saveSettingsApi } from './api';
import { supabase, isSupabaseConfigured } from './supabase';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export async function loadSettings(token) {
  const localSettings = await getSettings();
  const localContacts = await getContacts();

  // Backend (MySQL) - per user
  if (API_URL && token) {
    try {
      const data = await fetchSettings(token);
      if (data) {
        const merged = {
          aggressiveAlert: data.aggressiveAlert ?? localSettings.aggressiveAlert,
          contactName: data.contactName ?? localContacts.name,
          contactPhone: data.contactPhone ?? localContacts.phone,
          carNumber: data.carNumber ?? localContacts.carNumber ?? '',
          userName: data.userName ?? localContacts.userName ?? localContacts.name,
        };
        // Cache locally
        await setSettings({ aggressiveAlert: merged.aggressiveAlert });
        await setContacts({
          name: merged.contactName,
          phone: merged.contactPhone,
          carNumber: merged.carNumber,
          userName: merged.userName,
        });
        return merged;
      }
    } catch (e) {
      console.warn('Backend settings fetch failed:', e.message);
    }
  }

  // Supabase (optional)
  if (isSupabaseConfigured && supabase) {
    try {
      const { data } = await supabase.from('settings').select('*').limit(1).single();
      if (data) {
        return {
          aggressiveAlert: data.aggressive_alert ?? localSettings.aggressiveAlert,
          contactName: data.contact_name ?? localContacts.name,
          contactPhone: data.contact_phone ?? localContacts.phone,
          carNumber: data.car_number ?? localContacts.carNumber ?? '',
          userName: data.user_name ?? localContacts.userName ?? localContacts.name,
        };
      }
    } catch {
      // Use local
    }
  }

  return {
    aggressiveAlert: localSettings.aggressiveAlert,
    contactName: localContacts.name,
    contactPhone: localContacts.phone,
    carNumber: localContacts.carNumber ?? '',
    userName: localContacts.userName ?? localContacts.name ?? '',
  };
}

export async function saveSettings(payload, token) {
  const { aggressiveAlert, contactName, contactPhone, carNumber, userName } = payload;

  // Always save locally (cache/offline)
  await setSettings({ aggressiveAlert });
  await setContacts({
    name: contactName,
    phone: contactPhone,
    carNumber: carNumber ?? '',
    userName: userName ?? contactName,
  });

  // Backend (MySQL) - per user
  if (API_URL && token) {
    try {
      await saveSettingsApi(token, {
        aggressiveAlert,
        contactName,
        contactPhone,
        carNumber,
        userName,
      });
    } catch (e) {
      console.warn('Backend settings save failed:', e.message);
    }
  }

  // Supabase (optional)
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('settings').upsert(
        {
          id: 'user_settings',
          aggressive_alert: aggressiveAlert,
          contact_name: contactName,
          contact_phone: contactPhone,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );
    } catch (e) {
      console.warn('Supabase settings sync failed:', e.message);
    }
  }

  return { success: true };
}
