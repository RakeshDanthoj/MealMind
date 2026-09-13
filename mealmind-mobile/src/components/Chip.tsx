import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '../constants';

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
  size?: 'small' | 'medium';
}

export function Chip({
  label,
  selected,
  onPress,
  disabled = false,
  size = 'medium',
}: ChipProps) {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        selected && styles.selected,
        disabled && styles.disabled,
        size === 'small' && styles.small,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.label,
          selected && styles.labelSelected,
          size === 'small' && styles.labelSmall,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

interface ChipGroupProps {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  multiple?: boolean;
  required?: boolean;
  minSelect?: number;
}

export function ChipGroup({
  options,
  selected,
  onChange,
  multiple = true,
  required = false,
  minSelect = 0,
}: ChipGroupProps) {
  const handlePress = (value: string) => {
    if (multiple) {
      if (selected.includes(value)) {
        if (required && selected.length <= minSelect) return;
        onChange(selected.filter(v => v !== value));
      } else {
        onChange([...selected, value]);
      }
    } else {
      if (selected.includes(value) && !required) {
        onChange([]);
      } else {
        onChange([value]);
      }
    }
  };

  return (
    <View style={styles.group}>
      {options.map(option => (
        <Chip
          key={option.value}
          label={option.label}
          selected={selected.includes(option.value)}
          onPress={() => handlePress(option.value)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  selected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  disabled: {
    opacity: 0.5,
  },
  small: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.sm,
  },
  label: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.text,
  },
  labelSelected: {
    color: COLORS.white,
  },
  labelSmall: {
    fontSize: FONT_SIZES.xs,
  },
  group: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});
