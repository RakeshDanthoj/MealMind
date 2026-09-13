import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '../constants';

interface SelectOptionProps {
  label: string;
  description?: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
}

export function SelectOption({
  label,
  description,
  selected,
  onPress,
  disabled = false,
}: SelectOptionProps) {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        selected && styles.selected,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={styles.radio}>
        {selected && <View style={styles.radioInner} />}
      </View>
      <View style={styles.content}>
        <Text style={[styles.label, selected && styles.labelSelected]}>
          {label}
        </Text>
        {description && (
          <Text style={styles.description}>{description}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    marginBottom: SPACING.sm,
  },
  selected: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}10`,
  },
  disabled: {
    opacity: 0.5,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: FONT_SIZES.md,
    fontWeight: '500',
    color: COLORS.text,
  },
  labelSelected: {
    color: COLORS.primary,
  },
  description: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
