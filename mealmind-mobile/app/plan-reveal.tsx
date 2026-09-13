import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../src/context/AppContext';
import { Button, CoachMark } from '../src/components';
import { COLORS, SPACING, FONT_SIZES, DAY_NAMES } from '../src/constants';

export default function PlanRevealScreen() {
  const router = useRouter();
  const { state, markFirstPlanViewed, hasCoachMarkBeenShown, markCoachMarkShown } = useApp();
  
  const [selectedDay, setSelectedDay] = useState(0);
  const [showCoachMark, setShowCoachMark] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    const checkCoachMark = async () => {
      const shown = hasCoachMarkBeenShown('plan_reveal_days');
      if (!shown) {
        setTimeout(() => setShowCoachMark(true), 1000);
      }
    };
    checkCoachMark();
  }, []);

  const handleDismissCoachMark = async () => {
    setShowCoachMark(false);
    await markCoachMarkShown('plan_reveal_days');
  };

  const handleSeeTodaysMeals = async () => {
    await markFirstPlanViewed();
    router.replace('/(tabs)/plan');
  };

  if (!state.currentPlan) {
    return null;
  }

  const plan = state.currentPlan;
  const goalLabel = formatGoal(state.profile?.goal || '');
  const cuisineLabels = (state.profile?.cuisines || []).map(formatCuisine).join(' + ');

  const getDayLabel = (dayIndex: number) => {
    const date = new Date(plan.days[dayIndex]?.date || '');
    return `${DAY_NAMES[date.getDay()]} ${date.getDate()}`;
  };

  const selectedDayData = plan.days[selectedDay];

  return (
    <SafeAreaView style={styles.container}>
      <CoachMark
        visible={showCoachMark}
        message="This is your week. Tap a day to peek ahead."
        onDismiss={handleDismissCoachMark}
        position="center"
      />

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View 
          style={[
            styles.heroSection,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.successIcon}>
            <Text style={styles.successEmoji}>🎉</Text>
          </View>
          <Text style={styles.title}>Your week is ready!</Text>
          <Text style={styles.subtitle}>
            Built for {goalLabel.toLowerCase()}
            {cuisineLabels ? ` · ${cuisineLabels}` : ''}
          </Text>
          
          {plan.mode === 'limited' && (
            <View style={styles.limitedBadge}>
              <Text style={styles.limitedText}>
                Limited plan — complete medical consent for full personalization
              </Text>
            </View>
          )}
        </Animated.View>

        <View style={styles.weekPreview}>
          <Text style={styles.sectionTitle}>7-Day Overview</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dayPills}
          >
            {plan.days.map((day, index) => (
              <TouchableOpacity
                key={day.date}
                style={[
                  styles.dayPill,
                  selectedDay === index && styles.dayPillSelected,
                ]}
                onPress={() => setSelectedDay(index)}
              >
                <Text 
                  style={[
                    styles.dayPillText,
                    selectedDay === index && styles.dayPillTextSelected,
                  ]}
                >
                  D{index + 1}
                </Text>
                <Text 
                  style={[
                    styles.dayPillDate,
                    selectedDay === index && styles.dayPillDateSelected,
                  ]}
                >
                  {getDayLabel(index).split(' ')[0]}
                </Text>
                {day.flags.festive && (
                  <View style={styles.festiveBadge}>
                    <Text style={styles.festiveBadgeText}>🎊</Text>
                  </View>
                )}
                {day.flags.cheat && (
                  <View style={styles.cheatBadge}>
                    <Text style={styles.cheatBadgeText}>🍕</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {selectedDayData && (
          <View style={styles.dayPreview}>
            <Text style={styles.dayPreviewTitle}>
              {getDayLabel(selectedDay)}'s Meals
            </Text>
            {selectedDayData.meals.map((meal, index) => (
              <View key={meal.slot} style={styles.mealPreviewItem}>
                <View style={styles.mealPreviewIcon}>
                  <Text style={styles.mealPreviewEmoji}>
                    {getMealEmoji(meal.slot)}
                  </Text>
                </View>
                <View style={styles.mealPreviewContent}>
                  <Text style={styles.mealPreviewSlot}>
                    {meal.slot.charAt(0).toUpperCase() + meal.slot.slice(1)}
                  </Text>
                  <Text style={styles.mealPreviewName}>{meal.name}</Text>
                  <Text style={styles.mealPreviewKcal}>{meal.kcal} kcal</Text>
                </View>
              </View>
            ))}
            <Text style={styles.dayTotal}>
              Total: ~{selectedDayData.meals.reduce((sum, m) => sum + m.kcal, 0)} kcal
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.howItWorksButton}
          onPress={() => setShowHowItWorks(true)}
        >
          <Text style={styles.howItWorksText}>How this works →</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="See today's meals"
          onPress={handleSeeTodaysMeals}
          size="large"
        />
      </View>

      {showHowItWorks && (
        <TouchableOpacity 
          style={styles.sheetOverlay}
          activeOpacity={1}
          onPress={() => setShowHowItWorks(false)}
        >
          <View style={styles.sheetContent}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>How MealMind Works</Text>
            
            <View style={styles.howItWorksItem}>
              <View style={styles.howItWorksIcon}>
                <Text>🔄</Text>
              </View>
              <View style={styles.howItWorksText2}>
                <Text style={styles.howItWorksItemTitle}>Swap</Text>
                <Text style={styles.howItWorksItemDesc}>
                  Don't want a meal? Tap swap and AI finds an alternative that keeps your day balanced.
                </Text>
              </View>
            </View>
            
            <View style={styles.howItWorksItem}>
              <View style={styles.howItWorksIcon}>
                <Text>👎</Text>
              </View>
              <View style={styles.howItWorksText2}>
                <Text style={styles.howItWorksItemTitle}>Don't Like</Text>
                <Text style={styles.howItWorksItemDesc}>
                  Tell us you don't like a dish and we'll remember — you won't see it again.
                </Text>
              </View>
            </View>
            
            <View style={styles.howItWorksItem}>
              <View style={styles.howItWorksIcon}>
                <Text>🔃</Text>
              </View>
              <View style={styles.howItWorksText2}>
                <Text style={styles.howItWorksItemTitle}>Regenerate Day</Text>
                <Text style={styles.howItWorksItemDesc}>
                  Want a fresh start? Regenerate all meals for any day.
                </Text>
              </View>
            </View>
            
            <View style={styles.howItWorksItem}>
              <View style={styles.howItWorksIcon}>
                <Text>✅</Text>
              </View>
              <View style={styles.howItWorksText2}>
                <Text style={styles.howItWorksItemTitle}>Track Meals</Text>
                <Text style={styles.howItWorksItemDesc}>
                  Mark meals as Ate / Swapped / Skipped so future plans get smarter.
                </Text>
              </View>
            </View>

            <Button
              title="Got it!"
              onPress={() => setShowHowItWorks(false)}
              style={styles.sheetButton}
            />
          </View>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

function formatGoal(goal: string): string {
  const labels: Record<string, string> = {
    healthy_lifestyle: 'Healthy lifestyle',
    weight_loss: 'Weight loss',
    muscle_gain: 'Muscle gain',
    maintenance: 'Maintenance',
    other: 'General wellness',
  };
  return labels[goal] || 'Your goals';
}

function formatCuisine(cuisine: string): string {
  const labels: Record<string, string> = {
    indian_general: 'Indian',
    north_indian: 'North Indian',
    south_indian: 'South Indian',
    chinese: 'Indo-Chinese',
    asian: 'Asian',
  };
  return labels[cuisine] || cuisine;
}

function getMealEmoji(slot: string): string {
  const emojis: Record<string, string> = {
    breakfast: '🌅',
    lunch: '☀️',
    snack: '🍎',
    dinner: '🌙',
  };
  return emojis[slot] || '🍽️';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${COLORS.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  successEmoji: {
    fontSize: 48,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  limitedBadge: {
    backgroundColor: `${COLORS.warning}20`,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    marginTop: SPACING.md,
  },
  limitedText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.warning,
    textAlign: 'center',
  },
  weekPreview: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  dayPills: {
    paddingRight: SPACING.lg,
  },
  dayPill: {
    width: 56,
    height: 72,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  dayPillSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dayPillText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  dayPillTextSelected: {
    color: COLORS.white,
  },
  dayPillDate: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  dayPillDateSelected: {
    color: COLORS.white,
  },
  festiveBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
  festiveBadgeText: {
    fontSize: 12,
  },
  cheatBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
  cheatBadgeText: {
    fontSize: 12,
  },
  dayPreview: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  dayPreviewTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  mealPreviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  mealPreviewIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.primary}10`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  mealPreviewEmoji: {
    fontSize: 18,
  },
  mealPreviewContent: {
    flex: 1,
  },
  mealPreviewSlot: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  mealPreviewName: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.text,
  },
  mealPreviewKcal: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  dayTotal: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
    textAlign: 'right',
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  howItWorksButton: {
    alignItems: 'center',
    paddingVertical: SPACING.md,
  },
  howItWorksText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '500',
  },
  footer: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  sheetOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  sheetContent: {
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
  sheetTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  howItWorksItem: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  howItWorksIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.primary}10`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  howItWorksText2: {
    flex: 1,
  },
  howItWorksItemTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  howItWorksItemDesc: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  sheetButton: {
    marginTop: SPACING.lg,
  },
});
