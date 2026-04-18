import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../components/ScreenContainer';
import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { saveSettings } from '../services/settingsService';
import { colors } from '../constants/colors';

export default function SettingsScreen() {
  const { settings, updateSettings, refreshSettings, loading } = useApp();
  const { user, token, logout } = useAuth();
  
  const [userName, setUserName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setUserName(settings.userName ?? '');
    setContactName(settings.contactName ?? '');
    setContactPhone(settings.contactPhone ?? '');
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSettings(
        { userName, contactName, contactPhone },
        token
      );
      await refreshSettings();
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View style={styles.profileSection}>
            <View style={styles.avatarCircle}>
              <Ionicons name="person" size={40} color="#fff" />
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.userNameText}>{userName || 'Senior User'}</Text>
              <Text style={styles.userRole}>Guardian Protection Active</Text>
            </View>
          </View>
        </View>

        <Card style={styles.settingCard}>
          <Text style={styles.sectionTitle}>Identity</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={userName}
              onChangeText={setUserName}
              placeholder="e.g., John Doe"
            />
          </View>
        </Card>

        <Card style={styles.settingCard}>
          <View style={styles.sectionHeader}>
            <Ionicons name="shield-checkmark" size={20} color={colors.primary} style={{ marginRight: 8 }} />
            <Text style={styles.sectionTitle}>Emergency Contact</Text>
          </View>
          <Text style={styles.helperText}>
            This person will receive your live GPS location and audio recording automatically if a fall is detected.
          </Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Relative's Name</Text>
            <TextInput
              style={styles.input}
              value={contactName}
              onChangeText={setContactName}
              placeholder="e.g., Jane (Daughter)"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Relative's Phone</Text>
            <TextInput
              style={styles.input}
              value={contactPhone}
              onChangeText={setContactPhone}
              placeholder="+1 555-000-000"
              keyboardType="phone-pad"
            />
          </View>

          <PrimaryButton
            title={saving ? 'Updating...' : 'Update Guardians'}
            onPress={handleSave}
            loading={saving}
            style={{ marginTop: 16 }}
          />
        </Card>

        <Card style={styles.settingCard}>
          <Text style={styles.sectionTitle}>System Preferences</Text>
          <View style={styles.prefRow}>
            <View style={styles.prefLeft}>
              <Ionicons name="notifications" size={22} color={colors.textSecondary} />
              <Text style={styles.prefLabel}>Emergency Siren</Text>
            </View>
            <Text style={styles.prefValue}>High Volume</Text>
          </View>
          <View style={styles.prefRow}>
            <View style={styles.prefLeft}>
              <Ionicons name="mic" size={22} color={colors.textSecondary} />
              <Text style={styles.prefLabel}>Auto-Record Audio</Text>
            </View>
            <Text style={styles.prefValue}>Enabled</Text>
          </View>
          <View style={[styles.prefRow, { borderBottomWidth: 0 }]}>
            <View style={styles.prefLeft}>
              <Ionicons name="pulse" size={22} color={colors.textSecondary} />
              <Text style={styles.prefLabel}>Movement Tracking</Text>
            </View>
            <Text style={styles.prefValue}>Active</Text>
          </View>
        </Card>

        {user && (
          <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
            <Ionicons name="log-out-outline" size={20} color={colors.primary} />
            <Text style={styles.logoutText}>Sign Out of ElderGuardian</Text>
          </TouchableOpacity>
        )}

        <View style={styles.footer}>
          <Text style={styles.version}>ElderGuardian v1.0.4</Text>
          <Text style={styles.copyright}>© 2026 Smart Emergency Response</Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    marginVertical: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  avatarCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
  },
  headerInfo: {
    marginLeft: 16,
  },
  userNameText: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  userRole: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  settingCard: {
    marginBottom: 16,
    borderRadius: 20,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  helperText: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 18,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 6,
    marginLeft: 2,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  prefRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  prefLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prefLabel: {
    marginLeft: 12,
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  prefValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingVertical: 12,
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  version: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
  },
  copyright: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
  },
});
