import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import ScreenContainer from '../components/ScreenContainer';
import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { colors } from '../constants/colors';

const ROLES = [
  { value: 'elderly', label: 'Elderly / Senior Citizen' },
  { value: 'police', label: 'Police / Emergency' },
];

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('elderly');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError('');
    if (!name || !email || !password) {
      setError('Fill all fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register(email, password, name, role);
    } catch (e) {
      setError(e.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Choose your role</Text>
      </View>

      <Card>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          placeholderTextColor={colors.textMuted}
        />
        <Text style={[styles.label, { marginTop: 12 }]}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          placeholderTextColor={colors.textMuted}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Text style={[styles.label, { marginTop: 12 }]}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Min 6 characters"
          placeholderTextColor={colors.textMuted}
          secureTextEntry
        />
        <Text style={[styles.label, { marginTop: 12 }]}>Role</Text>
        {ROLES.map((r) => (
          <TouchableOpacity
            key={r.value}
            style={[styles.roleOption, role === r.value && styles.roleSelected]}
            onPress={() => setRole(r.value)}
          >
            <Text style={[styles.roleLabel, role === r.value && styles.roleLabelSelected]}>{r.label}</Text>
          </TouchableOpacity>
        ))}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <PrimaryButton title={loading ? 'Creating...' : 'Register'} onPress={handleRegister} loading={loading} style={{ marginTop: 16 }} />
      </Card>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: 24,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: '#fff',
    marginTop: 6,
  },
  roleOption: {
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: 10,
    padding: 12,
    marginTop: 6,
  },
  roleSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  roleLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  roleLabelSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  error: {
    fontSize: 13,
    color: colors.triageRed,
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 6,
  },
  footerText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  link: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
});
