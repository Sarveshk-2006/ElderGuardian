import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

export default function AppLogo({ size = 64, color = colors.primary }) {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={[styles.iconWrapper, { width: size, height: size }]}>
        <Ionicons name="shield-checkmark" size={size * 0.7} color={color} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: 999,
  },
});
