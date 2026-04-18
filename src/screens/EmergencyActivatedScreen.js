import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Linking, Platform, StyleSheet, Text, View } from 'react-native';
import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';
import ScreenContainer from '../components/ScreenContainer';
import StatusBadge from '../components/StatusBadge';
import { colors } from '../constants/colors';
import { useApp } from '../context/AppContext';
import { useEmergency } from '../context/EmergencyContext';
import { autoDial108 } from '../services/authorityService';
import { buildEmergencyMessage } from '../services/contactAlert';

const fallbackEmergency = {
  status: 'Emergency Activated',
};

export default function EmergencyActivatedScreen({ route, navigation }) {
  const { refreshHistory, settings } = useApp();
  const { emergency: ctxEmergency, alertStatus } = useEmergency();
  const emergency = route?.params?.emergency || ctxEmergency || fallbackEmergency;

  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  const contactPhone = settings?.contactPhone;
  const contactName = settings?.contactName || 'Emergency contact';

  const statusLabel = alertStatus?.status === 'sent'
    ? 'Relative Notified'
    : alertStatus?.status === 'failed'
      ? 'SMS Draft Opened (Manual Send Required)'
      : 'Pending Delivery…';

  const handleCallContact = () => {
    if (!contactPhone) return;
    const url = Platform.OS === 'ios' ? `telprompt:${contactPhone.replace(/\D/g, '')}` : `tel:${contactPhone.replace(/\D/g, '')}`;
    Linking.openURL(url).catch(() => { });
  };

  const handleMessageContact = () => {
    if (!contactPhone) return;
    // We use the exact same logic that built the automated background SMS!
    const msg = buildEmergencyMessage(emergency, emergency.location, { userName: settings?.userName });
    const url = `sms:${contactPhone.replace(/\D/g, '')}?body=${encodeURIComponent(msg)}`;
    Linking.openURL(url).catch(() => { });
  };

  return (
    <ScreenContainer>
      <View style={styles.titleRow}>
        <View style={styles.titleIconWrap}>
          <Ionicons name="checkmark-circle" size={48} color={colors.triageGreen} />
        </View>
        <View>
          <Text style={styles.title}>Elder Alert Active</Text>
          <Text style={styles.subtitle}>
            Please stay calm. Help is being arranged.
          </Text>
        </View>
      </View>

      <Card>
        <View style={styles.rowBetween}>
          <View style={styles.sectionHeader}>
            <Ionicons name="notifications" size={20} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={styles.sectionTitle}>Automated Dispatch</Text>
          </View>
          <StatusBadge
            label={statusLabel}
            type={
              alertStatus?.status === 'sent'
                ? 'success'
                : alertStatus?.status === 'failed'
                  ? 'danger'
                  : 'warning'
            }
          />
        </View>
        <Text style={styles.desc}>
          If an automatic SMS failed to deliver in the background, a compose window opened. Otherwise, your relative has been notified with your GPS and audio proof.
        </Text>
      </Card>

      {emergency?.sensorData?.audioCloudinaryUrl && (
        <Card style={{ borderColor: colors.triageGreen, borderWidth: 1 }}>
          <View style={styles.sectionHeader}>
            <Ionicons name="mic" size={20} color={colors.triageGreen} style={{ marginRight: 6 }} />
            <Text style={styles.sectionTitle}>Distress Audio</Text>
          </View>
          <Text style={styles.desc}>
            A 10-second proof of life audio file was securely packaged and dispatched to {contactName}.
          </Text>
        </Card>
      )}

      {contactPhone && (
        <Card style={styles.contactCard}>
          <Text style={styles.sectionTitle}>Your Emergency Contact</Text>
          <Text style={styles.contactSubtitle}>{contactName} ({contactPhone})</Text>
          <View style={styles.contactButtons}>
            <PrimaryButton
              title="Call Relative"
              onPress={handleCallContact}
              style={[styles.contactBtn, { marginRight: 8 }]}
            />
            <PrimaryButton
              title="SMS Relative"
              onPress={handleMessageContact}
              variant="outline"
              style={styles.contactBtn}
            />
          </View>
        </Card>
      )}

      <Card style={styles.authorityCard}>
        <Text style={styles.authorityTitle}>Require Immediate Medical Attention?</Text>
        <Text style={styles.authoritySubtitle}>
          If your injuries are severe, contact the ambulance explicitly.
        </Text>
        <PrimaryButton title="Dial 108 (Ambulance)" onPress={() => autoDial108()} style={{ backgroundColor: '#d32f2f' }} />
      </Card>

      <View style={{ marginTop: 8 }}>
        <PrimaryButton
          title="Navigate to Nearby Hospitals"
          onPress={() => navigation.navigate('Hospitals')}
          variant="outline"
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  titleIconWrap: {
    marginRight: 14,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  desc: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  authorityCard: {
    borderColor: '#ffdddd',
    borderWidth: 2,
    backgroundColor: '#fffcfc'
  },
  authorityTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#d32f2f',
    marginBottom: 4,
  },
  authoritySubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 12,
  },
  contactCard: {
    borderColor: colors.primarySoft,
    borderWidth: 2,
    backgroundColor: '#f6f9fc'
  },
  contactSubtitle: {
    fontSize: 14,
    color: colors.textMuted,
    marginBottom: 14,
    fontWeight: '500'
  },
  contactButtons: {
    flexDirection: 'row',
  },
  contactBtn: {
    flex: 1,
  },
});
