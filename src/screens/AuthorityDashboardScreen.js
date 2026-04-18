import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Linking,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

let MapView, Marker;
if (Platform.OS !== 'web') {
  try {
    const Maps = require('react-native-maps');
    MapView = Maps.default;
    Marker = Maps.Marker;
  } catch (e) {
    console.warn('react-native-maps not available');
  }
}

import ScreenContainer from '../components/ScreenContainer';
import Card from '../components/Card';
import { useAuth } from '../context/AuthContext';
import { fetchEmergencies } from '../services/api';
import { getTriageMeta } from '../utils/triage';
import { colors } from '../constants/colors';

const ONE_HOUR_MS = 60 * 60 * 1000;
const DEFAULT_REGION = {
  latitude: 20.5937,
  longitude: 78.9629,
  latitudeDelta: 4,
  longitudeDelta: 4,
};

const ROLE_CONFIG = {
  police: {
    label: 'Police',
    icon: 'shield',
    relevantCells: ['A1', 'B1', 'C1', 'A3'],
    color: colors.badgeBlueText,
  },
  hospital: {
    label: 'Hospital',
    icon: 'medical',
    relevantCells: ['A1', 'B1', 'C1', 'A2', 'B2'],
    color: colors.triageRed,
  },
  towing: {
    label: 'Towing',
    icon: 'car',
    relevantCells: ['A2', 'B2', 'C2'],
    color: colors.triageYellow,
  },
};

export default function AuthorityDashboardScreen({ authorityRole }) {
  const { token } = useAuth();
  const role = authorityRole || 'police';
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.police;
  const [emergencies, setEmergencies] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const data = await fetchEmergencies(token);
      const oneHourAgo = Date.now() - ONE_HOUR_MS;
      const filtered = (data || []).filter((e) => {
        const relevant = config.relevantCells.includes(e.matrix_cell);
        const withinHour = new Date(e.timestamp).getTime() >= oneHourAgo;
        return relevant && withinHour;
      });
      setEmergencies(filtered);
    } catch (e) {
      console.warn('Fetch emergencies failed:', e.message);
      setEmergencies([]);
    }
  };

  useEffect(() => {
    load();
  }, [role]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const emergenciesWithLocation = useMemo(
    () => emergencies.filter((e) => e.location_lat != null && e.location_lng != null),
    [emergencies]
  );

  const mapRegion = useMemo(() => {
    if (emergenciesWithLocation.length === 0) return DEFAULT_REGION;
    const lats = emergenciesWithLocation.map((e) => e.location_lat);
    const lngs = emergenciesWithLocation.map((e) => e.location_lng);
    const latMin = Math.min(...lats);
    const latMax = Math.max(...lats);
    const lngMin = Math.min(...lngs);
    const lngMax = Math.max(...lngs);
    const padding = 0.02;
    return {
      latitude: (latMin + latMax) / 2,
      longitude: (lngMin + lngMax) / 2,
      latitudeDelta: Math.max((latMax - latMin) + padding, 0.05),
      longitudeDelta: Math.max((lngMax - lngMin) + padding, 0.05),
    };
  }, [emergenciesWithLocation]);

  const openInMaps = (lat, lng) => {
    const url =
      Platform.OS === 'ios'
        ? `https://maps.apple.com/?q=${lat},${lng}`
        : `https://www.google.com/maps?q=${lat},${lng}`;
    Linking.openURL(url).catch(() => {});
  };

  return (
    <ScreenContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
      >
        <View style={styles.header}>
          <View style={[styles.headerIcon, { backgroundColor: colors.primarySoft }]}>
            <Ionicons name={config.icon} size={32} color={config.color} />
          </View>
          <View>
            <Text style={styles.title}>{config.label} Dashboard</Text>
            <Text style={styles.subtitle}>
              Last 1 hour • {emergencies.length} relevant crash events
            </Text>
          </View>
        </View>

        <Card style={styles.mapCard}>
          <Text style={styles.sectionTitle}>Crash locations (map)</Text>
          <Text style={styles.mapHint}>
            Emergencies detected from driver app; shown for 1 hour with saved location.
          </Text>
          <View style={styles.mapContainer}>
            {Platform.OS === 'web' || !MapView ? (
              <View style={[styles.map, styles.webMapPlaceholder]}>
                <Ionicons name="map-outline" size={48} color={colors.textMuted} />
                <Text style={styles.webMapText}>Map view is available on mobile devices only.</Text>
                <Text style={styles.webMapTextSub}>
                  Showing {emergenciesWithLocation.length} crash locations in the list below.
                </Text>
              </View>
            ) : (
              <MapView
                style={styles.map}
                region={mapRegion}
                showsUserLocation={false}
                showsMyLocationButton={false}
              >
                {emergenciesWithLocation.map((e) => (
                  <Marker
                    key={e.id}
                    coordinate={{
                      latitude: Number(e.location_lat),
                      longitude: Number(e.location_lng),
                    }}
                    title={`${e.matrix_cell || '—'} • CSI ${e.csi?.toFixed(1) || '—'}`}
                    description={new Date(e.timestamp).toLocaleString()}
                    pinColor={config.color}
                  />
                ))}
              </MapView>
            )}
          </View>

        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Saved emergency events</Text>
          {emergencies.length === 0 ? (
            <Text style={styles.emptyText}>
              No crash emergencies for {config.label} in the last 1 hour.
            </Text>
          ) : (
            emergencies.slice(0, 50).map((e) => {
              const meta = getTriageMeta(e.triage || 'yellow');
              const hasLoc = e.location_lat != null && e.location_lng != null;
              return (
                <View key={e.id} style={styles.incidentRow}>
                  <View style={[styles.triageDot, { backgroundColor: meta.color }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.incidentTime}>
                      {new Date(e.timestamp).toLocaleString()}
                    </Text>
                    <Text style={styles.incidentMeta}>
                      CSI {e.csi?.toFixed(1)} • {e.matrix_cell || '—'} • {e.connectivity || '—'}
                    </Text>
                    {hasLoc ? (
                      <Text
                        style={styles.incidentLocLink}
                        onPress={() => openInMaps(e.location_lat, e.location_lng)}
                      >
                        📍 View on map • {e.location_lat.toFixed(4)}, {e.location_lng.toFixed(4)}
                      </Text>
                    ) : (
                      <Text style={styles.incidentLoc}>📍 Location not available</Text>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </Card>
      </ScrollView>
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  incidentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  triageDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
    marginTop: 4,
  },
  incidentTime: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  incidentMeta: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  incidentLoc: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  mapCard: {
    marginBottom: 12,
  },
  mapHint: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 10,
  },
  mapContainer: {
    height: 220,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.borderSoft,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  incidentLocLink: {
    fontSize: 11,
    color: colors.primary,
    marginTop: 2,
    textDecorationLine: 'underline',
  },
  webMapPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.borderSoft,
    padding: 20,
    textAlign: 'center',
  },
  webMapText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 12,
    textAlign: 'center',
  },
  webMapTextSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 6,
    textAlign: 'center',
  },
});

