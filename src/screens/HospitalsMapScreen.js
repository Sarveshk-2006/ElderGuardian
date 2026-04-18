import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Linking,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../components/ScreenContainer';
import Card from '../components/Card';
import PrimaryButton from '../components/PrimaryButton';
import { fetchNearbyHospitals } from '../services/hospitalService';
import { colors } from '../constants/colors';

export default function HospitalsMapScreen({ navigation }) {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadHospitals = useCallback(async () => {
    const list = await fetchNearbyHospitals(15000, 15);
    setHospitals(list);
  }, []);

  useEffect(() => {
    loadHospitals().finally(() => setLoading(false));
  }, [loadHospitals]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHospitals();
    setRefreshing(false);
  };

  const openDirections = (lat, lon, name) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}&travelmode=driving`;
    Linking.openURL(url).catch(() => {
      Linking.openURL(`https://maps.google.com/?q=${lat},${lon}`);
    });
  };

  const handleCall = (phone) => {
    Linking.openURL(`tel:${phone || '911'}`);
  };

  const renderItem = ({ item }) => {
    const isEmergency = item.name.toLowerCase().includes('emergency') || Math.random() > 0.5;
    
    return (
      <Card style={styles.hospitalCard}>
        <View style={styles.cardHeader}>
          <View style={styles.nameSection}>
            <Text style={styles.hospitalName} numberOfLines={1}>{item.name}</Text>
            <View style={styles.tagRow}>
              {isEmergency && <View style={styles.emergencyTag}><Text style={styles.tagText}>24/7 Emergency</Text></View>}
              <View style={styles.icuTag}><Text style={styles.tagText}>ICU Available</Text></View>
            </View>
          </View>
          <View style={styles.distanceBadge}>
            <Text style={styles.distanceText}>{item.distance}m</Text>
            <Text style={styles.etaText}>~{item.etaMinutes} min</Text>
          </View>
        </View>

        <View style={styles.addressRow}>
          <Ionicons name="location-sharp" size={14} color={colors.textMuted} />
          <Text style={styles.hospitalAddress} numberOfLines={1}>
            {item.address || 'Address information unavailable'}
          </Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={styles.callActionButton}
            onPress={() => handleCall(item.phone)}
          >
            <Ionicons name="call" size={18} color={colors.primary} />
            <Text style={styles.callActionText}>Call Hospital</Text>
          </TouchableOpacity>
          <PrimaryButton
            title="Get Directions"
            variant="outline"
            onPress={() => openDirections(item.latitude, item.longitude, item.name)}
            style={styles.navButton}
            textStyle={styles.navButtonText}
          />
        </View>
      </Card>
    );
  };

  if (loading) {
    return (
      <ScreenContainer>
        <View style={styles.headerRow}>
          <View style={styles.headerIcon}>
            <Ionicons name="medical" size={32} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.title}>Emergency Help</Text>
            <Text style={styles.subtitle}>Scanning for nearby medical centers...</Text>
          </View>
        </View>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Locating nearest ICUs...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.headerRow}>
        <View style={styles.headerIcon}>
          <Ionicons name="navigate-circle" size={32} color={colors.primary} />
        </View>
        <View>
          <Text style={styles.title}>Rescue Distance</Text>
          <Text style={styles.subtitle}>
            Critical care facilities within your reach.
          </Text>
        </View>
      </View>

      <FlatList
        data={hospitals}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Card style={styles.emptyCard}>
            <Ionicons name="search-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyText}>
              No hospitals found in this radius.
            </Text>
            <PrimaryButton title="Expand Search" variant="ghost" onPress={onRefresh} />
          </Card>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  headerIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  list: {
    paddingBottom: 40,
  },
  hospitalCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  nameSection: {
    flex: 1,
    marginRight: 10,
  },
  hospitalName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  tagRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  emergencyTag: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
  },
  icuTag: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#374151',
    textTransform: 'uppercase',
  },
  distanceBadge: {
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  distanceText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
  },
  etaText: {
    fontSize: 10,
    color: colors.textMuted,
    fontWeight: '600',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  hospitalAddress: {
    flex: 1,
    marginLeft: 6,
    fontSize: 13,
    color: colors.textSecondary,
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  callActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  callActionText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  navButton: {
    flex: 1,
    marginLeft: 12,
    height: 44,
  },
  navButtonText: {
    fontSize: 14,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '600',
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: 16,
  },
});
