import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import ScreenContainer from '../components/ScreenContainer';
import PrimaryButton from '../components/PrimaryButton';
import CountdownTimer from '../components/CountdownTimer';
import { createEmergency, executeMatrixFlow } from '../services/emergencyService';
import { useApp } from '../context/AppContext';
import { useEmergency } from '../context/EmergencyContext';
import { useAuth } from '../context/AuthContext';
import { colors } from '../constants/colors';

export default function CrashAlertScreen({ navigation, route }) {
  const { settings } = useApp();
  const { token, user } = useAuth();
  const { transitionTo } = useEmergency();
  const [active, setActive] = useState(true);
  
  // Audio Recording State
  const [recording, setRecording] = useState(null);
  const [audioUri, setAudioUri] = useState(null);

  const sensorData = route?.params?.sensorData || { type: 'fall_detection' };

  // Attempt to start audio recording immediately when screen opens
  useEffect(() => {
    (async () => {
      try {
        console.log("Requesting mic permissions and starting silent emergency audio recording...");
        const perm = await Audio.requestPermissionsAsync();
        if (perm.status === 'granted' && active) {
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true,
          });

          // Start recording
          const { recording: newRecording } = await Audio.Recording.createAsync(
            Audio.RecordingOptionsPresets.HIGH_QUALITY
          );
          setRecording(newRecording);

          // Automatically stop recording after 10 seconds
          setTimeout(async () => {
            if (newRecording) {
              await newRecording.stopAndUnloadAsync();
              const uri = newRecording.getURI();
              setAudioUri(uri);
              console.log("Audio Recording saved at: ", uri);
            }
          }, 10000);
        }
      } catch (err) {
        console.error("Failed to start audio recording", err);
      }
    })();

    // Cleanup: stop recording if component unmounts early
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync().catch(()=>{});
      }
    };
  }, []); // Run only once when Fall Detected screen mounts

  const handleCancel = async () => {
    setActive(false);
    if (recording) {
      await recording.stopAndUnloadAsync().catch(()=>{});
    }
    transitionTo('monitoring', {});
    navigation.goBack();
  };

  const handleComplete = async () => {
    if (!active) return;
    setActive(false);
    
    // Stop recording to flush the audio file if it hasn't automatically
    let finalAudioUri = audioUri;
    if (recording && !audioUri) {
      await recording.stopAndUnloadAsync().catch(()=>{});
      finalAudioUri = recording.getURI();
    }

    let audioCloudinaryUrl = null;
    if (finalAudioUri) {
      try {
        console.log("Uploading SOS audio securely to File.io...");
        const formData = new FormData();
        formData.append('files[]', { uri: finalAudioUri, type: 'audio/m4a', name: 'sos-audio.m4a' });
        
        const res = await fetch('https://uguu.se/upload.php', {
          method: 'POST',
          body: formData,
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        const d = await res.json();
        if (d.success) {
           audioCloudinaryUrl = d.files[0].url;
           console.log("SOS Audio successfully uploaded! Link: ", audioCloudinaryUrl);
        } else {
           console.warn("Upload response: ", d);
        }
      } catch (err) {
        console.error("Audio upload mistake: ", err);
      }
    }

    try {
      // Package the live Audio URI and the user's settings
      const emergencyData = { 
        ...sensorData, 
        audioUri: finalAudioUri,
        audioCloudinaryUrl,
        relativeContactData: {
          name: settings.contactName,
          phone: settings.contactPhone
        }
      };
      
      const emergency = await createEmergency({ sensorData: emergencyData, token, userId: user?.id });
      transitionTo('emergency_triggered', { emergency, alertStatus: { status: 'retrying' } });

      // BYPASS THE VEHICLE MATRIX! Force direct sending securely to just the Relative!
      const { notifyContactsAuto } = require('../services/emergencyService');
      const result = await notifyContactsAuto(emergency, settings.contactPhone, (status, attempt) => {
        transitionTo('emergency_triggered', {
          emergency,
          alertStatus: { status, attempt },
        });
      });

      const contactStatus = result?.success ? 'sent' : 'failed';
      transitionTo('alerts_sent', {
        emergency,
        alertStatus: { status: contactStatus, attempt: result?.attempt ?? 1 },
      });
      navigation.replace('EmergencyActivated', { emergency });
    } catch (e) {
      console.error(e);
      const fallback = {
        id: `e_${Date.now()}`,
        timestamp: new Date().toISOString(),
        triage: 'red',
        status: 'Emergency Activated',
        audioUri: finalAudioUri
      };
      transitionTo('emergency_triggered', { emergency: fallback });
      navigation.replace('EmergencyActivated', { emergency: fallback });
    }
  };

  return (
    <ScreenContainer style={styles.fullscreen}>
      <View style={styles.header}>
        <View style={styles.alertIconWrap}>
          <Ionicons name="warning" size={64} color={colors.primary} />
        </View>
        <Text style={styles.alertTitle}>Fall Detected!</Text>
        <Text style={styles.alertSubtitle}>
          We detected a severe fall. Background SOS audio recording has started... 
        </Text>
      </View>

      <View style={styles.center}>
        <Text style={styles.countdownLabel}>Dispatching Location & Audio to your Relative in</Text>
        <CountdownTimer
          initialSeconds={10}
          onComplete={handleComplete}
          running={active}
          variant="large"
        />
      </View>

      <View style={styles.footer}>
        <PrimaryButton title="I'm Safe — Cancel Alert" onPress={handleCancel} />
        <Text style={styles.footerHint}>
          If you do nothing, we will automatically text your Live GPS location and the 10-second distress audio to {settings.contactPhone ?? 'your relative'}.
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  fullscreen: {
    justifyContent: 'space-between',
    backgroundColor: '#FFE5E5',
  },
  header: {
    marginTop: 40,
    alignItems: 'center',
  },
  alertIconWrap: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#FFCCCC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 4,
    borderColor: '#FF0000',
  },
  alertTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FF0000',
    marginBottom: 12,
    textAlign: 'center',
  },
  alertSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D80000',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  center: {
    alignItems: 'center',
  },
  countdownLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#990000',
    marginBottom: 10,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  footer: {
    marginBottom: 30,
  },
  footerHint: {
    fontSize: 13,
    fontWeight: '600',
    color: '#CC0000',
    marginTop: 12,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
});
