import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, StyleSheet, Text, View, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import Card from '../components/Card';
import IconButton from '../components/IconButton';
import ScreenContainer from '../components/ScreenContainer';
import { colors } from '../constants/colors';
import { useApp } from '../context/AppContext';
import { useEmergency } from '../context/EmergencyContext';
import { useFallDetection } from '../hooks/useFallDetection';
import * as Location from 'expo-location';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const { loading, medications, toggleMedication } = useApp();
  const { transitionTo } = useEmergency();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const handleFallDetected = useCallback(
    (sensorData) => {
      transitionTo('crash_detected', {}); 
      navigation.navigate('CrashAlert', { sensorData });
    },
    [navigation, transitionTo]
  );

  const { startMonitoring, stopMonitoring, isMonitoring } = useFallDetection(handleFallDetected);

  useEffect(() => {
    (async () => {
      await Location.requestForegroundPermissionsAsync();
      try {
        const { Camera } = require('expo-camera');
        if (Camera) {
          await Camera.requestCameraPermissionsAsync();
        }
      } catch (e) {}
    })();
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.06,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    ).start();

    startMonitoring();
    return () => stopMonitoring();
  }, [pulseAnim, startMonitoring, stopMonitoring]);

  const handleSimulateFall = () => {
    handleFallDetected({ type: 'simulated_fall', gForce: 4.8 });
  };

  if (loading) {
    return (
      <ScreenContainer>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Securing your environment...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <View style={styles.container}>
      {/* Background Styling */}
      <View style={styles.topCurtain} />

      <ScreenContainer style={styles.contentWrap}>
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text style={styles.greeting}>Good Morning,</Text>
            <Text style={styles.userName}>Elder Guardian</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileBtn}
            onPress={() => navigation.navigate('Settings')}
          >
            <View style={styles.avatarMini}>
              <Ionicons name="person" size={20} color={colors.primary} />
            </View>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Main Status Card - Premium Glassmorphism Feel */}
          <Animated.View style={[styles.statusCardWrap, { transform: [{ scale: pulseAnim }] }]}>
            <View style={styles.statusInner}>
              <View style={styles.statusContent}>
                <Ionicons name="pulse" size={40} color="#fff" />
                <View style={styles.heartData}>
                  <Text style={styles.heartValue}>72 BPM</Text>
                  <Text style={styles.heartLabel}>Heart Rate Steady</Text>
                </View>
              </View>
              <View style={styles.statusFooterRow}>
                <Text style={styles.statusInfo}>Fall Detection: ACTIVE</Text>
                <Ionicons name="shield-checkmark" size={16} color="#fff" />
              </View>
            </View>
          </Animated.View>

          {/* Vitals Grid */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Vital Snapshot</Text>
            <View style={styles.vitalsRow}>
              <View style={[styles.vitalCard, { backgroundColor: '#FFF5F5' }]}>
                <Ionicons name="heart" size={24} color="#E53935" />
                <Text style={styles.vitalValue}>72</Text>
                <Text style={styles.vitalLabel}>BPM</Text>
              </View>
              <View style={[styles.vitalCard, { backgroundColor: '#F5F9FF' }]}>
                <Ionicons name="walk" size={24} color="#1D4ED8" />
                <Text style={styles.vitalValue}>1,240</Text>
                <Text style={styles.vitalLabel}>Steps</Text>
              </View>
              <View style={[styles.vitalCard, { backgroundColor: '#F9FFF5' }]}>
                <Ionicons name="water" size={24} color="#16A34A" />
                <Text style={styles.vitalValue}>98%</Text>
                <Text style={styles.vitalLabel}>SpO2</Text>
              </View>
            </View>
          </View>

          {/* Medicine Scheduler Integration */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionLabel}>Daily Medications</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Medicine')}>
                <Text style={styles.seeAll}>Manage Schedule</Text>
              </TouchableOpacity>
            </View>

            {medications && medications.length > 0 ? (
              medications.map((med) => (
                <TouchableOpacity
                  key={med.id}
                  style={[styles.medCard, med.taken && styles.medCardTaken]}
                  onPress={() => toggleMedication(med.id)}
                >
                  <View style={[styles.medIconWrap, { backgroundColor: (med.color || colors.primary) + '15' }]}>
                    <Ionicons name={med.icon || 'medical'} size={22} color={med.taken ? colors.textMuted : (med.color || colors.primary)} />
                  </View>
                  <View style={styles.medInfo}>
                    <Text style={[styles.medName, med.taken && styles.strike]}>{med.name}</Text>
                    <Text style={styles.medMeta}>{med.dosage} • {med.time}</Text>
                  </View>
                  <Ionicons
                    name={med.taken ? "checkmark-circle" : "ellipse-outline"}
                    size={24}
                    color={med.taken ? colors.triageGreen : colors.borderSoft}
                  />
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyCard}>
                 <Text style={styles.emptyText}>No medications scheduled for today.</Text>
                 <TouchableOpacity onPress={() => navigation.navigate('Medicine')}>
                    <Text style={styles.addText}>+ Add Medicine</Text>
                 </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Emergency Shortcuts */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Emergency Center</Text>
            <View style={styles.quickActions}>
              <TouchableOpacity style={styles.actionBlock} onPress={() => navigation.navigate('Hospitals')}>
                <View style={[styles.actionIconBox, { backgroundColor: '#FEF2F2' }]}>
                  <Ionicons name="business" size={24} color={colors.primary} />
                </View>
                <Text style={styles.actionText}>Find Hospital</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionBlock} onPress={() => navigation.navigate('History')}>
                <View style={[styles.actionIconBox, { backgroundColor: '#F0F9FF' }]}>
                  <Ionicons name="document-text" size={24} color="#0284C7" />
                </View>
                <Text style={styles.actionText}>Health Records</Text>
              </TouchableOpacity>
            </View>
          </View>
          
        </ScrollView>
      </ScreenContainer>

      {/* Floating SOS Button */}
      <TouchableOpacity 
        style={styles.floatingSOS}
        onPress={handleSimulateFall}
        activeOpacity={0.8}
      >
        <Ionicons name="warning" size={32} color="#fff" />
        <Text style={styles.floatingText}>SOS</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  topCurtain: {
    position: 'absolute',
    top: 0,
    width: '100%',
    height: 280,
    backgroundColor: 'rgba(235, 60, 60, 0.04)',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  contentWrap: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  userName: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  profileBtn: {
    padding: 2,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarMini: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF2F2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusCardWrap: {
    marginBottom: 24,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  statusInner: {
    backgroundColor: colors.primary,
    borderRadius: 24,
    padding: 24,
    overflow: 'hidden',
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  heartData: {
    marginLeft: 16,
  },
  heartValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -1,
  },
  heartLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
    marginTop: 2,
  },
  statusFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.15)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  statusInfo: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 6,
  },
  section: {
    marginBottom: 28,
  },
  sectionLabel: {
    fontSize: 19,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  vitalsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  vitalCard: {
    width: (width - 48 - 16) / 3, // 3 column grid considering padding
    paddingVertical: 16,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vitalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 8,
  },
  vitalLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  medCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  medCardTaken: {
    opacity: 0.6,
    backgroundColor: '#F9FAFB',
  },
  medIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  medInfo: {
    flex: 1,
  },
  medName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  medMeta: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
  strike: {
    textDecorationLine: 'line-through',
    color: colors.textMuted,
  },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)'
  },
  emptyText: {
    color: colors.textSecondary,
    marginBottom: 10,
  },
  addText: {
    color: colors.primary,
    fontWeight: '700',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionBlock: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  actionIconBox: {
    width: 50,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  floatingSOS: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#DC2626',
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  floatingText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 11,
    marginTop: 2,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textMuted,
  },
});
