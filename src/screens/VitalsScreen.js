import { CameraView, useCameraPermissions } from 'expo-camera';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Card from '../components/Card';
import ScreenContainer from '../components/ScreenContainer';
import { colors } from '../constants/colors';
import { analyzeEmergency, generateSimulatedInputs } from '../services/aiAnalysis';
import { formatPercentage } from '../utils/format';

/**
 * PDF: AI-based visual trauma detection (heavy bleeding, pale skin detection)
 * PDF: Camera-based remote heart rate estimation
 */
export default function VitalsScreen() {
  const [vitals, setVitals] = useState(null);
  const [traumaDetection, setTraumaDetection] = useState(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraActive, setCameraActive] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scanAnim = useRef(new Animated.Value(0)).current;

  const runAnalysis = useCallback(() => {
    const inputs = generateSimulatedInputs();
    const analysis = analyzeEmergency(inputs);

    const bleedingProb = analysis.bleedingProbability;
    const paleSkinProb = Math.min(0.3 + (100 - analysis.spo2) / 150, 0.9);
    const traumaDet = {
      heavyBleeding: bleedingProb >= 0.5,
      heavyBleedingProb: bleedingProb,
      paleSkin: paleSkinProb >= 0.5,
      paleSkinProb,
      confidence: Math.round(analysis.confidence * 100),
    };

    setVitals({
      heartRate: analysis.heartRate,
      respirationRate: analysis.respirationRate,
      spo2: analysis.spo2,
      traumaScore: analysis.bleedingProbability,
      confidence: Math.round(analysis.confidence * 100),
    });
    setTraumaDetection(traumaDet);
  }, []);

  useEffect(() => {
    runAnalysis();
    const interval = setInterval(runAnalysis, 5000);
    return () => clearInterval(interval);
  }, [runAnalysis]);

  useEffect(() => {
    if (vitals) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 900,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 900,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [vitals, pulseAnim]);

  useEffect(() => {
    if (cameraActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnim, { toValue: 1, duration: 2500, useNativeDriver: true }),
          Animated.timing(scanAnim, { toValue: 0, duration: 2500, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [cameraActive, scanAnim]);

  const v = vitals || {
    heartRate: 102,
    respirationRate: 22,
    spo2: 97,
    traumaScore: 0.58,
    confidence: 89,
  };

  const enableCamera = async () => {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (granted) setCameraActive(true);
    } else {
      setCameraActive(true);
    }
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Vitals & Trauma AI</Text>
      <Text style={styles.subtitle}>
        PDF: Camera-based remote heart rate estimation. AI-based visual trauma (bleeding, pale skin).
      </Text>

      <Card>
        <Text style={styles.sectionTitle}>Camera Preview</Text>
        {cameraActive && permission?.granted ? (
          <View style={styles.cameraContainer}>
            <CameraView style={styles.camera} facing="front">
              <Animated.View 
                style={[
                  styles.scanBar, 
                  { transform: [{ translateY: scanAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 220] }) }] }
                ]} 
              />
              <View style={styles.cameraOverlay}>
                <Text style={styles.cameraOverlayText}>AI analyzes facial blood flow & skin tone</Text>
                <TouchableOpacity style={styles.analyzeBtn} onPress={runAnalysis}>
                  <Text style={styles.analyzeBtnText}>Refresh Vitals</Text>
                </TouchableOpacity>
              </View>
            </CameraView>
          </View>
        ) : (
          <View style={styles.cameraPlaceholder}>
            <View style={styles.cameraFrame}>
              <Text style={styles.cameraText}>Camera Feed</Text>
              <Text style={styles.cameraSubtext}>
                Enable camera for heart rate estimation and trauma detection (bleeding, pale skin).
              </Text>
              <TouchableOpacity style={styles.analyzeBtn} onPress={enableCamera}>
                <Text style={styles.analyzeBtnText}>Enable Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.analyzeBtnOutline} onPress={runAnalysis}>
                <Text style={styles.analyzeBtnOutlineText}>Run AI (Demo)</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Card>

      {traumaDetection && (
        <Card>
          <Text style={styles.sectionTitle}>AI Trauma Detection</Text>
          <View style={styles.traumaRow}>
            <View style={[styles.traumaBadge, traumaDetection.heavyBleeding && styles.traumaBadgeAlert]}>
              <Text style={styles.traumaLabel}>Heavy Bleeding</Text>
              <Text style={styles.traumaValue}>
                {traumaDetection.heavyBleeding ? 'Detected' : 'None'} ({formatPercentage(traumaDetection.heavyBleedingProb, 0)})
              </Text>
            </View>
            <View style={[styles.traumaBadge, traumaDetection.paleSkin && styles.traumaBadgeAlert]}>
              <Text style={styles.traumaLabel}>Pale Skin</Text>
              <Text style={styles.traumaValue}>
                {traumaDetection.paleSkin ? 'Detected' : 'None'} ({formatPercentage(traumaDetection.paleSkinProb, 0)})
              </Text>
            </View>
          </View>
          <Text style={styles.confidence}>Confidence: {traumaDetection.confidence}%</Text>
        </Card>
      )}

      <Card>
        <Text style={styles.sectionTitle}>Estimated Vitals (AI)</Text>
        {vitals && <Text style={styles.confidence}>Confidence: {v.confidence}%</Text>}
        <View style={styles.metricsRow}>
          <Animated.View style={[styles.metricBlock, { transform: [{ scale: pulseAnim }] }]}>
            <Text style={styles.metricLabel}>Heart Rate</Text>
            <Text style={styles.metricValue}>{v.heartRate} bpm</Text>
          </Animated.View>
          <View style={styles.metricBlock}>
            <Text style={styles.metricLabel}>Respiration</Text>
            <Text style={styles.metricValue}>{v.respirationRate} /min</Text>
          </View>
        </View>

        <View style={[styles.metricsRow, { marginTop: 12 }]}>
          <View style={styles.metricBlock}>
            <Text style={styles.metricLabel}>SpO₂</Text>
            <Text style={styles.metricValue}>{v.spo2}%</Text>
          </View>
          <View style={styles.metricBlock}>
            <Text style={styles.metricLabel}>Trauma Likelihood</Text>
            <Text style={styles.metricValue}>{formatPercentage(v.traumaScore, 0)}</Text>
          </View>
        </View>
      </Card>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  confidence: {
    fontSize: 12,
    color: colors.primary,
    marginBottom: 6,
    fontWeight: '600',
  },
  cameraContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    height: 220,
  },
  camera: {
    flex: 1,
    height: 220,
  },
  cameraOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: 16,
  },
  cameraOverlayText: {
    color: '#fff',
    fontSize: 12,
    marginBottom: 8,
  },
  cameraPlaceholder: {
    backgroundColor: colors.primarySoft,
    borderRadius: 16,
    padding: 16,
  },
  cameraFrame: {
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.primary,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  cameraSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 12,
    textAlign: 'center',
  },
  analyzeBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  analyzeBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  analyzeBtnOutline: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  analyzeBtnOutlineText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 14,
  },
  traumaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  traumaBadge: {
    flex: 1,
    marginHorizontal: 4,
    padding: 10,
    borderRadius: 8,
    backgroundColor: colors.badgeGreenBg,
  },
  traumaBadgeAlert: {
    backgroundColor: colors.badgeRedBg,
  },
  traumaLabel: {
    fontSize: 11,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  traumaValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  metricBlock: {
    flex: 1,
    marginRight: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2,
  },
  scanBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: '#00FF00',
    zIndex: 10,
    elevation: 10,
    opacity: 0.6,
  },
});
