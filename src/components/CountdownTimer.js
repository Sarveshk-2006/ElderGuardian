import React, { useEffect, useState, useRef } from 'react';
import { Text, StyleSheet, View, Vibration } from 'react-native';
import { colors } from '../constants/colors';
import { formatDuration } from '../utils/format';

export default function CountdownTimer({
  initialSeconds,
  onComplete,
  running = true,
  variant = 'compact',
  label,
}) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!running) {
      clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        // Vibrate on every tick (100ms) to alert the user
        Vibration.vibrate(100);
        
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setTimeout(() => onComplete?.(), 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [running, onComplete]);

  const formatted =
    initialSeconds >= 60 ? formatDuration(secondsLeft) : `${secondsLeft}s`;

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Text style={[styles.time, variant === 'large' && styles.timeLarge]}>
        {formatted}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  time: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  timeLarge: {
    fontSize: 32,
  },
});