import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../components/ScreenContainer';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import { useApp } from '../context/AppContext';
import { formatTimestampToReadable } from '../utils/format';
import { colors } from '../constants/colors';

export default function HistoryScreen() {
  const { history, refreshHistory, loading } = useApp();
  const [activeTab, setActiveTab] = useState('alerts');

  useEffect(() => {
    refreshHistory();
  }, [refreshHistory]);

  const medicalRecords = [
    { id: '1', condition: 'Hypertension', date: 'Diagnosed 2018', icon: 'heart', color: '#E53935' },
    { id: '2', condition: 'Type 2 Diabetes', date: 'Managed since 2020', icon: 'water', color: '#1D4ED8' },
    { id: '3', condition: 'Hip Replacement', date: 'Surgery Aug 2022', icon: 'medical', color: '#16A34A' },
  ];

  const renderAlertItem = ({ item }) => {
    const isCritical = item.triage === 'red' || item.type === 'physical_fall';
    
    return (
      <Card style={styles.alertCard}>
        <View style={styles.timelinePoint}>
          <View style={[styles.dot, { backgroundColor: isCritical ? colors.primary : colors.triageYellow }]} />
          <View style={styles.line} />
        </View>
        <View style={styles.alertContent}>
          <View style={styles.rowBetween}>
            <Text style={styles.timestamp}>{formatTimestampToReadable(item.timestamp)}</Text>
            <StatusBadge 
               label={isCritical ? 'Severe Fall' : 'Shake Alert'} 
               type={isCritical ? 'danger' : 'warning'} 
            />
          </View>
          <View style={styles.metricsRow}>
            <View style={styles.metricBlock}>
              <Text style={styles.metricLabel}>Guardians Notified</Text>
              <Text style={styles.metricValue}>Successfully</Text>
            </View>
            <View style={styles.metricBlock}>
              <Text style={styles.metricLabel}>Location Sent</Text>
              <Text style={styles.metricValue}>Attached</Text>
            </View>
          </View>
        </View>
      </Card>
    );
  };

  const renderMedicalItem = ({ item }) => (
    <Card style={styles.medicalCard}>
      <View style={[styles.medicalIconBox, { backgroundColor: item.color + '15' }]}>
        <Ionicons name={item.icon} size={24} color={item.color} />
      </View>
      <View style={styles.medicalInfo}>
        <Text style={styles.conditionText}>{item.condition}</Text>
        <Text style={styles.recordDate}>{item.date}</Text>
      </View>
      <TouchableOpacity style={styles.editBtn}>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </TouchableOpacity>
    </Card>
  );

  return (
    <ScreenContainer>
      <View style={styles.headerRow}>
        <View style={styles.headerIcon}>
          <Ionicons name="bookmarks" size={32} color={colors.primary} />
        </View>
        <View>
          <Text style={styles.title}>Health & History</Text>
          <Text style={styles.subtitle}>Unified emergency & medical logs.</Text>
        </View>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'alerts' && styles.activeTab]} 
          onPress={() => setActiveTab('alerts')}
        >
          <Text style={[styles.tabText, activeTab === 'alerts' && styles.activeTabText]}>Alert Logs</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'medical' && styles.activeTab]} 
          onPress={() => setActiveTab('medical')}
        >
          <Text style={[styles.tabText, activeTab === 'medical' && styles.activeTabText]}>Records</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'alerts' ? (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id || String(item.timestamp)}
          renderItem={renderAlertItem}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 40 }}
          ListEmptyComponent={
            <Card style={styles.emptyCard}>
              <Ionicons name="notifications-off-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyText}>No emergency events logged.</Text>
              <Text style={styles.emptySubtext}>We'll keep a record of every fall detection here.</Text>
            </Card>
          }
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={refreshHistory} colors={[colors.primary]} />
          }
        />
      ) : (
        <FlatList
          data={medicalRecords}
          keyExtractor={(item) => item.id}
          renderItem={renderMedicalItem}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 40 }}
          ListHeaderComponent={
            <Text style={styles.recordsDescription}>
              Key medical conditions that will be shared with emergency responders if a fall is detected.
            </Text>
          }
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
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
    color: colors.textMuted,
    marginTop: 2,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.primary,
  },
  alertCard: {
    flexDirection: 'row',
    paddingLeft: 0,
    marginBottom: 12,
  },
  timelinePoint: {
    width: 40,
    alignItems: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 14,
    zIndex: 2,
  },
  line: {
    position: 'absolute',
    top: 26,
    bottom: -20,
    width: 2,
    backgroundColor: colors.borderSoft,
  },
  alertContent: {
    flex: 1,
    paddingRight: 16,
    paddingVertical: 12,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  metricsRow: {
    flexDirection: 'row',
    marginTop: 10,
  },
  metricBlock: {
    marginRight: 24,
  },
  metricLabel: {
    fontSize: 10,
    color: colors.textMuted,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2,
  },
  medicalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 10,
  },
  medicalIconBox: {
    width: 50,
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medicalInfo: {
    flex: 1,
    marginLeft: 16,
  },
  conditionText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  recordDate: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },
  recordsDescription: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 18,
    paddingHorizontal: 4,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: 30,
    marginTop: 4,
  },
});
