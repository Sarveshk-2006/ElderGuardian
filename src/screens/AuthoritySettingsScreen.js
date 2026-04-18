import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../components/ScreenContainer';
import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { colors } from '../constants/colors';

export default function AuthoritySettingsScreen() {
  const { user, logout } = useAuth();

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="settings" size={36} color={colors.primary} />
        </View>
        <View>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Authority account</Text>
        </View>
      </View>

      <Card>
        <Text style={styles.label}>Logged in as</Text>
        <Text style={styles.value}>{user?.name}</Text>
        <Text style={styles.muted}>{user?.email}</Text>
        <View style={[styles.roleBadge, { backgroundColor: colors.primarySoft }]}>
          <Text style={[styles.roleText, { color: colors.primary }]}>{user?.role}</Text>
        </View>
      </Card>

      <View style={{ marginTop: 24 }}>
        <PrimaryButton title="Logout" onPress={logout} variant="outline" />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 4,
  },
  muted: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 12,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
});
