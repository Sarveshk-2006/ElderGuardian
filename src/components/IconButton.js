import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { layout } from '../constants/layout';

export default function IconButton({
  title,
  icon,
  onPress,
  variant = 'outline',
  style,
}) {
  const borderColor = variant === 'outline' ? colors.primary : 'transparent';
  const iconColor = variant === 'primary' ? '#fff' : colors.primary;
  const textColor = variant === 'primary' ? '#fff' : colors.primary;
  const backgroundColor = variant === 'primary' ? colors.primary : 'transparent';

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor, borderColor },
        style,
      ]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      {icon && (
        <Ionicons name={icon} size={20} color={iconColor} style={styles.icon} />
      )}
      <Text style={[styles.text, { color: textColor }]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    height: 48,
    borderRadius: layout.radiusMd,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    paddingHorizontal: 16,
  },
  icon: {
    marginRight: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: '700',
  },
});
