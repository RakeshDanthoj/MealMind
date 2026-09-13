import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../src/context/AppContext';
import { MealCard, Button, CoachMark } from '../../src/components';
import { MealSlot, MealStatus } from '../../src/types';
import { COLORS, SPACING, FONT_SIZES, DAY_NAMES, MEAL_SLOT_LABELS } from '../../src/constants';

export default function PlanScreen() {
  const router = useRouter();
  const { 
    state, 
    swapMealAction, 
    dislikeMealAction, 
    regenerateDayAction,
    setDayFlagsAction,
    logMealAction,
    hasCoachMarkBeenShown,
    markCoachMarkShown,
    acknowledgeDisclaimer,
  } = useApp();

  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [showDayActions, setShowDayActions] = useState(false);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);
  const [showMealCoachMark, setShowMealCoachMark] = useState(false);
  const [showTrackingCoachMark, setShowTrackingCoachMark] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [swappingSlot, setSwappingSlot] = useState<MealSlot | null>(null);

  useEffect(() => {
    const checkCoachMarks = async () => {
      const mealShown = hasCoachMarkBeenShown('meal_actions');
      if (!mealShown) {
        setTimeout(() => setShowMealCoachMark(true), 500);
      }
    };
    checkCoachMarks();
  }, []);

  const plan = state.currentPlan;
  const profile = state.profile;

  if (!plan) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>No plan yet</Text>
          <Text style={styles.emptyMessage}>
            Complete onboarding to get your personalized meal plan.
          </Text>
          <Button
            title="Start onboarding"
            onPress={() => router.replace('/onboarding')}
          />
        </View>
      </SafeAreaView>
    );
  }

  const selectedDay = plan.days[selectedDayIndex];
  const isLimitedMode = plan.mode === 'limited';

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    setRefreshing(false);
  };

  const handleSwap = async (slot: MealSlot) => {
    setSwappingSlot(slot);
    try {
      await swapMealAction(selectedDay.date, slot);
    } finally {
      setSwappingSlot(null);
    }
  };

  const handleDislike = async (slot: MealSlot) => {
    try {
      await dislikeMealAction(selectedDay.date, slot);
    } catch (e) {
      Alert.alert('Error', 'Could not process your request');
    }
  };

  const handleLog = async (slot: MealSlot, status: MealStatus) => {
    await logMealAction(selectedDay.date, slot, status);
    
    if (!hasCoachMarkBeenShown('meal_tracking')) {
      setShowTrackingCoachMark(true);
    }
  };

  const handleRegenerateDay = async () => {
    setShowRegenerateConfirm(false);
    setShowDayActions(false);
    setActionLoading(true);
    try {
      await regenerateDayAction(selectedDay.date);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleCheat = async () => {
    setShowDayActions(false);
    await setDayFlagsAction(selectedDay.date, { cheat: !selectedDay.flags.cheat });
  };

  const handleToggleFestive = async () => {
    setShowDayActions(false);
    await setDayFlagsAction(selectedDay.date, { 
      festive: !selectedDay.flags.festive,
      festive_label: !selectedDay.flags.festive ? 'Festival Day' : null,
    });
  };

  const handleOpenRecipe = (slot: MealSlot) => {
    const meal = selectedDay.meals.find(m => m.slot === slot);
    if (meal) {
      router.push(`/recipe-preview?dishId=${meal.dish_id}&name=${encodeURIComponent(meal.name)}`);
    }
  };

  const handleDismissMealCoachMark = async () => {
    setShowMealCoachMark(false);
    await markCoachMarkShown('meal_actions');
  };

  const handleDismissTrackingCoachMark = async () => {
    setShowTrackingCoachMark(false);
    await markCoachMarkShown('meal_tracking');
  };

  const getDayLabel = (dayIndex: number) => {
    const date = new Date(plan.days[dayIndex]?.date || '');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayDate = new Date(date);
    dayDate.setHours(0, 0, 0, 0);
    
    if (dayDate.getTime() === today.getTime()) {
      return 'Today';
    }
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (dayDate.getTime() === tomorrow.getTime()) {
      return 'Tomorrow';
    }
    
    return `${DAY_NAMES[date.getDay()]} ${date.getDate()}`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <CoachMark
        visible={showTrackingCoachMark}
        message="Great! Log Ate / Swapped / Skipped so plans get smarter."
        onDismiss={handleDismissTrackingCoachMark}
        position="bottom"
      />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Plan</Text>
        <Text style={styles.headerSubtitle}>
          7-day personalized meal plan
        </Text>
      </View>

      {isLimitedMode && (
        <TouchableOpacity 
          style={styles.limitedBanner}
          onPress={() => router.push('/medical-disclaimer')}
        >
          <Text style={styles.limitedBannerText}>
            ⚠️ Limited plan — medical disclaimer applies
          </Text>
          <Text style={styles.limitedBannerAction}>Tap to unlock full plan</Text>
        </TouchableOpacity>
      )}

      <View style={styles.daySelector}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daySelectorContent}
        >
          {plan.days.map((day, index) => (
            <TouchableOpacity
              key={day.date}
              style={[
                styles.dayTab,
                selectedDayIndex === index && styles.dayTabSelected,
              ]}
              onPress={() => setSelectedDayIndex(index)}
            >
              <Text
                style={[
                  styles.dayTabLabel,
                  selectedDayIndex === index && styles.dayTabLabelSelected,
                ]}
              >
                D{index + 1}
              </Text>
              <Text
                style={[
                  styles.dayTabDate,
                  selectedDayIndex === index && styles.dayTabDateSelected,
                ]}
              >
                {getDayLabel(index).split(' ')[0]}
              </Text>
              {(day.flags.festive || day.flags.cheat) && (
                <View style={styles.dayBadge}>
                  <Text style={styles.dayBadgeText}>
                    {day.flags.festive ? '🎊' : '🍕'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity
          style={styles.dayActionsButton}
          onPress={() => setShowDayActions(true)}
        >
          <Text style={styles.dayActionsButtonText}>•••</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.mealsContainer}
        contentContainerStyle={styles.mealsContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.dayHeader}>
          <Text style={styles.dayTitle}>{getDayLabel(selectedDayIndex)}</Text>
          {selectedDay.flags.festive && (
            <View style={styles.flagBadge}>
              <Text style={styles.flagBadgeText}>
                🎊 {selectedDay.flags.festive_label || 'Festival'}
              </Text>
            </View>
          )}
          {selectedDay.flags.cheat && (
            <View style={styles.flagBadge}>
              <Text style={styles.flagBadgeText}>🍕 Cheat Day</Text>
            </View>
          )}
        </View>

        {selectedDay.meals.map((meal, index) => (
          <MealCard
            key={meal.slot}
            meal={meal}
            onSwap={() => handleSwap(meal.slot)}
            onDislike={() => handleDislike(meal.slot)}
            onLog={(status) => handleLog(meal.slot, status)}
            onOpenRecipe={() => handleOpenRecipe(meal.slot)}
            isLimitedMode={isLimitedMode}
            showCoachMark={showMealCoachMark && index === 0}
            onCoachMarkDismiss={handleDismissMealCoachMark}
            hideCalories={true}
          />
        ))}
      </ScrollView>

      <Modal
        visible={showDayActions}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDayActions(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDayActions(false)}
        >
          <View style={styles.actionsSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.actionsTitle}>Day Actions</Text>
            
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => {
                setShowDayActions(false);
                setShowRegenerateConfirm(true);
              }}
            >
              <Text style={styles.actionIcon}>🔃</Text>
              <Text style={styles.actionText}>Regenerate all meals</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionItem}
              onPress={handleToggleCheat}
            >
              <Text style={styles.actionIcon}>🍕</Text>
              <Text style={styles.actionText}>
                {selectedDay.flags.cheat ? 'Remove cheat day' : 'Mark as cheat day'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionItem}
              onPress={handleToggleFestive}
            >
              <Text style={styles.actionIcon}>🎊</Text>
              <Text style={styles.actionText}>
                {selectedDay.flags.festive ? 'Remove festive day' : 'Mark as festive day'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionItem, styles.cancelAction]}
              onPress={() => setShowDayActions(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal
        visible={showRegenerateConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRegenerateConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmDialog}>
            <Text style={styles.confirmTitle}>Regenerate Day?</Text>
            <Text style={styles.confirmMessage}>
              This will replace all meals for {getDayLabel(selectedDayIndex)} with new suggestions.
            </Text>
            <View style={styles.confirmButtons}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setShowRegenerateConfirm(false)}
                style={{ flex: 1, marginRight: SPACING.sm }}
              />
              <Button
                title="Regenerate"
                onPress={handleRegenerateDay}
                loading={actionLoading}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  limitedBanner: {
    backgroundColor: `${COLORS.warning}20`,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: `${COLORS.warning}40`,
  },
  limitedBannerText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '500',
  },
  limitedBannerAction: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.warning,
    marginTop: 2,
  },
  daySelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    alignItems: 'center',
  },
  daySelectorContent: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  dayTab: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    minWidth: 56,
  },
  dayTabSelected: {
    backgroundColor: COLORS.primary,
  },
  dayTabLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
  },
  dayTabLabelSelected: {
    color: COLORS.white,
  },
  dayTabDate: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  dayTabDateSelected: {
    color: COLORS.white,
  },
  dayBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
  dayBadgeText: {
    fontSize: 10,
  },
  dayActionsButton: {
    padding: SPACING.md,
    marginRight: SPACING.sm,
  },
  dayActionsButtonText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
    letterSpacing: 2,
  },
  mealsContainer: {
    flex: 1,
  },
  mealsContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  dayTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  flagBadge: {
    backgroundColor: `${COLORS.secondary}20`,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 8,
  },
  flagBadgeText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.secondary,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  emptyMessage: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  actionsSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  actionsTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  actionIcon: {
    fontSize: 20,
    marginRight: SPACING.md,
  },
  actionText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  cancelAction: {
    borderBottomWidth: 0,
    justifyContent: 'center',
    marginTop: SPACING.sm,
  },
  cancelText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.error,
    fontWeight: '500',
    textAlign: 'center',
  },
  confirmDialog: {
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
    lineHeight: 20,
  },
  confirmButtons: {
    flexDirection: 'row',
  },
});
