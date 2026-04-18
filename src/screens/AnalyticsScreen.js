import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ScreenContainer from '../components/ScreenContainer';
import Card from '../components/Card';
import { useApp } from '../context/AppContext';
import { colors } from '../constants/colors';

export default function AnalyticsScreen() {
  const { history } = useApp();
  const totalFalls = history.length;
  
  const activityDays = [
    { day: 'Mon', h: 40 }, { day: 'Tue', h: 60 }, { day: 'Wed', h: 30 },
    { day: 'Thu', h: 90 }, { day: 'Fri', h: 50 }, { day: 'Sat', h: 80 }, { day: 'Sun', h: 70 }
  ];

  const impactMetrics = [
    { label: 'Background Sensors', value: 'Active', desc: 'Accelerometers tracking normally' },
    { label: 'Weekly False Alarms', value: '0', desc: 'Canceled automatically' },
    { label: 'Average Response Time', value: '< 2 min', desc: 'From relative notification' },
  ];

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={styles.headerRow}>
          <View style={styles.headerIcon}>
            <Ionicons name="analytics" size={32} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.greeting}>Activity Insights</Text>
            <Text style={styles.userName}>Health & Safety</Text>
          </View>
        </View>

        <View style={styles.scoreContainer}>
          <View style={styles.scoreCircle}>
            <Text style={styles.scoreValue}>98</Text>
            <Text style={styles.scoreLabel}>Safety Score</Text>
          </View>
          <View style={styles.scoreDetails}>
            <Text style={styles.scoreTitle}>Great Protection!</Text>
            <Text style={styles.scoreText}>Your system is fully active and relatives are reachable.</Text>
          </View>
        </View>

        <Card style={styles.chartCard}>
          <Text style={styles.sectionTitle}>Weekly Mobility</Text>
          <View style={styles.barChart}>
            {activityDays.map((d, i) => (
              <View key={i} style={styles.barItem}>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, { height: `${d.h}%` }]} />
                </View>
                <Text style={styles.barLabel}>{d.day}</Text>
              </View>
            ))}
          </View>
        </Card>

        <View style={styles.statsGrid}>
          <Card style={styles.statBox}>
            <Ionicons name="walk" size={24} color={colors.primary} />
            <Text style={styles.statValue}>1.2k</Text>
            <Text style={styles.statLabel}>Steps Today</Text>
          </Card>
          <Card style={styles.statBox}>
            <Ionicons name="alert-circle" size={24} color={colors.triageYellow} />
            <Text style={styles.statValue}>{totalFalls}</Text>
            <Text style={styles.statLabel}>Total Alerts</Text>
          </Card>
        </View>

        <Card>
          <Text style={styles.sectionTitle}>System Health</Text>
          {impactMetrics.map((m, i) => (
            <View key={i} style={styles.metricItem}>
              <View style={styles.metricInfo}>
                <Text style={styles.metricLabel}>{m.label}</Text>
                <Text style={styles.metricDesc}>{m.desc}</Text>
              </View>
              <Text style={styles.metricValue}>{m.value}</Text>
            </View>
          ))}
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Alert History</Text>
          {history.length > 0 ? (
            history.slice(0, 5).map((h) => (
              <View key={h.id} style={styles.historyRow}>
                <View style={[styles.historyDot, { backgroundColor: colors.primary }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.historyText}>Fall Alert Triggered</Text>
                  <Text style={styles.historyDate}>{new Date(h.timestamp).toLocaleDateString()}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No recent alerts recorded.</Text>
          )}
        </Card>
      </ScrollView>
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
  greeting: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  userName: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    padding: 20,
    borderRadius: 24,
    marginBottom: 20,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: '900',
    color: '#fff',
  },
  scoreLabel: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '700',
  },
  scoreDetails: {
    flex: 1,
    marginLeft: 16,
  },
  scoreTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  scoreText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  chartCard: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  barChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
    paddingTop: 10,
  },
  barItem: {
    alignItems: 'center',
    width: 30,
  },
  barTrack: {
    width: 12,
    height: 80,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  barFill: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: 6,
  },
  barLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 8,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statBox: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  metricItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  metricInfo: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  metricDesc: {
    fontSize: 12,
    color: colors.textMuted,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  historyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  historyText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  historyDate: {
    fontSize: 12,
    color: colors.textMuted,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    paddingVertical: 20,
  },
});
