import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
} from 'react-native';
import { MealItem, MealStatus } from '../types';
import { COLORS, SPACING, FONT_SIZES, MEAL_SLOT_LABELS } from '../constants';
import { Button } from './Button';

interface MealCardProps {
  meal: MealItem;
  onSwap: () => void;
  onDislike: () => void;
  onLog: (status: MealStatus) => void;
  onOpenRecipe: () => void;
  isLimitedMode?: boolean;
  showCoachMark?: boolean;
  onCoachMarkDismiss?: () => void;
}

export function MealCard({
  meal,
  onSwap,
  onDislike,
  onLog,
  onOpenRecipe,
  isLimitedMode = false,
  showCoachMark = false,
  onCoachMarkDismiss,
}: MealCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showDislikeConfirm, setShowDislikeConfirm] = useState(false);

  const getStatusColor = () => {
    switch (meal.status) {
      case 'ate':
        return COLORS.success;
      case 'swapped':
        return COLORS.secondary;
      case 'skipped':
        return COLORS.muted;
      default:
        return COLORS.textSecondary;
    }
  };

  const getStatusLabel = () => {
    switch (meal.status) {
      case 'ate':
        return 'Ate it';
      case 'swapped':
        return 'Swapped';
      case 'skipped':
        return 'Skipped';
      default:
        return '';
    }
  };

  const handleDislike = () => {
    setShowMenu(false);
    setShowDislikeConfirm(true);
  };

  const confirmDislike = () => {
    setShowDislikeConfirm(false);
    onDislike();
  };

  const getCuisineLabel = (cuisine: string) => {
    const labels: Record<string, string> = {
      indian_general: 'Indian',
      north_indian: 'North Indian',
      south_indian: 'South Indian',
      chinese: 'Indo-Chinese',
      asian: 'Asian',
    };
    return labels[cuisine] || cuisine;
  };

  return (
    <View style={styles.container}>
      {showCoachMark && (
        <TouchableOpacity 
          style={styles.coachMarkOverlay}
          onPress={onCoachMarkDismiss}
        >
          <View style={styles.coachMarkBubble}>
            <Text style={styles.coachMarkText}>
              Don't love it? Swap or tell us you don't like it.
            </Text>
            <TouchableOpacity 
              style={styles.coachMarkButton}
              onPress={onCoachMarkDismiss}
            >
              <Text style={styles.coachMarkButtonText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}

      <View style={styles.header}>
        <Text style={styles.slotLabel}>{MEAL_SLOT_LABELS[meal.slot]}</Text>
        {meal.status !== 'planned' && (
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
            <Text style={styles.statusText}>{getStatusLabel()}</Text>
          </View>
        )}
      </View>

      <TouchableOpacity 
        style={styles.content} 
        onPress={onOpenRecipe}
        activeOpacity={0.8}
      >
        <View style={styles.imageContainer}>
          {meal.photo_url ? (
            <Image source={{ uri: meal.photo_url }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>
                {meal.name.charAt(0)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={2}>
            {meal.name}
          </Text>
          <Text style={styles.meta}>
            {getCuisineLabel(meal.cuisine)} • {meal.kcal} kcal
            {meal.prep_minutes ? ` • ${meal.prep_minutes} min` : ''}
          </Text>
        </View>

        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => setShowMenu(true)}
        >
          <Text style={styles.menuDots}>•••</Text>
        </TouchableOpacity>
      </TouchableOpacity>

      {meal.status === 'planned' && (
        <View style={styles.trackingButtons}>
          <TouchableOpacity
            style={[styles.trackButton, styles.ateButton]}
            onPress={() => onLog('ate')}
          >
            <Text style={styles.trackButtonText}>Ate it</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.trackButton, styles.swappedButton]}
            onPress={() => onLog('swapped')}
          >
            <Text style={styles.trackButtonText}>Swapped</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.trackButton, styles.skippedButton]}
            onPress={() => onLog('skipped')}
          >
            <Text style={[styles.trackButtonText, styles.skippedText]}>Skipped</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                onSwap();
              }}
            >
              <Text style={styles.menuItemText}>Swap meal</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleDislike}
            >
              <Text style={styles.menuItemText}>Don't like this</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                onOpenRecipe();
              }}
            >
              <Text style={styles.menuItemText}>View recipe</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.menuItem, styles.cancelItem]}
              onPress={() => setShowMenu(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={showDislikeConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDislikeConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmContainer}>
            <Text style={styles.confirmTitle}>Don't like this?</Text>
            <Text style={styles.confirmMessage}>
              We'll avoid this dish in future plans
              {isLimitedMode ? ' (once you complete medical consent)' : ''}.
            </Text>
            <View style={styles.confirmButtons}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setShowDislikeConfirm(false)}
                style={{ flex: 1, marginRight: SPACING.sm }}
              />
              <Button
                title="Confirm & Swap"
                onPress={confirmDislike}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  coachMarkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  coachMarkBubble: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: 12,
    margin: SPACING.md,
  },
  coachMarkText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  coachMarkButton: {
    alignSelf: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  coachMarkButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: FONT_SIZES.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  slotLabel: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.white,
    fontWeight: '500',
  },
  content: {
    flexDirection: 'row',
    padding: SPACING.md,
    alignItems: 'center',
  },
  imageContainer: {
    width: 64,
    height: 64,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: SPACING.md,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: `${COLORS.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.primary,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  meta: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  menuButton: {
    padding: SPACING.sm,
  },
  menuDots: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
    letterSpacing: 2,
  },
  trackingButtons: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  trackButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ateButton: {
    backgroundColor: `${COLORS.success}15`,
  },
  swappedButton: {
    backgroundColor: `${COLORS.secondary}15`,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: COLORS.border,
  },
  skippedButton: {
    backgroundColor: `${COLORS.muted}10`,
  },
  trackButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.text,
  },
  skippedText: {
    color: COLORS.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: SPACING.xxl,
  },
  menuItem: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  menuItemText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    textAlign: 'center',
  },
  cancelItem: {
    borderBottomWidth: 0,
    marginTop: SPACING.sm,
  },
  cancelText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.error,
    textAlign: 'center',
    fontWeight: '500',
  },
  confirmContainer: {
    backgroundColor: COLORS.white,
    margin: SPACING.lg,
    borderRadius: 16,
    padding: SPACING.lg,
  },
  confirmTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  confirmMessage: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  confirmButtons: {
    flexDirection: 'row',
  },
});
