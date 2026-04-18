import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';
import { layout } from '../constants/layout';

export default function StatusBadge({ label, type = 'info' }) {
  const background =
    type === 'success'
      ? colors.badgeGreenBg
      : type === 'danger'
      ? colors.badgeRedBg
      : type === 'warning'
      ? colors.badgeYellowBg
      : colors.badgeBlueBg;

  const textColor =
    type === 'success'
      ? colors.badgeGreenText
      : type === 'danger'
      ? colors.badgeRedText
      : type === 'warning'
      ? colors.badgeYellowText
      : colors.badgeBlueText;

  return (
    <View style={[styles.badge, { backgroundColor: background }]}>
      <Text style={[styles.text, { color: textColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: layout.radiusFull,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});