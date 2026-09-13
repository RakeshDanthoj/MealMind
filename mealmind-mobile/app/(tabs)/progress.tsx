import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../src/context/AppContext';
import { COLORS, SPACING, FONT_SIZES } from '../../src/constants';

export default function ProgressScreen() {
  const { state } = useApp();
  const plan = state.currentPlan;

  const getStats = () => {
    if (!plan) return { ate: 0, swapped: 0, skipped: 0, total: 0 };
    
    let ate = 0, swapped = 0, skipped = 0, total = 0;
    
    plan.days.forEach(day => {
      day.meals.forEach(meal => {
        total++;
        if (meal.status === 'ate') ate++;
        else if (meal.status === 'swapped') swapped++;
        else if (meal.status === 'skipped') skipped++;
      });
    });
    
    return { ate, swapped, skipped, total };
  };

  const stats = getStats();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Progress</Text>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {plan ? (
          <>
            <View style={styles.weekStats}>
              <Text style={styles.sectionTitle}>This Week</Text>
              
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{stats.ate}</Text>
                  <Text style={styles.statLabel}>Meals eaten</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{stats.swapped}</Text>
                  <Text style={styles.statLabel}>Swapped</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{stats.skipped}</Text>
                  <Text style={styles.statLabel}>Skipped</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>
                    {stats.total > 0 
                      ? Math.round((stats.ate / stats.total) * 100) 
                      : 0}%
                  </Text>
                  <Text style={styles.statLabel}>Adherence</Text>
                </View>
              </View>
            </View>

            <View style={styles.comingSoon}>
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>📊</Text>
              </View>
              <Text style={styles.title}>Streaks & Challenges</Text>
              <Text style={styles.description}>
                Coming soon: Track your streaks, earn badges, and complete 
                weekly challenges to stay motivated.
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyTitle}>No Progress Yet</Text>
            <Text style={styles.emptyMessage}>
              Complete onboarding and start logging meals to see your progress here.
            </Text>
          </View>
        )}

        <View style={styles.preview}>
          <Text style={styles.previewTitle}>Coming in Future Updates</Text>
          
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🔥</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Streaks</Text>
              <Text style={styles.featureDesc}>
                Maintain daily logging streaks and see how consistent you are
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🏆</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Badges & Achievements</Text>
              <Text style={styles.featureDesc}>
                Earn badges for milestones like "Tried 5 new cuisines"
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📈</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Weekly Reports</Text>
              <Text style={styles.featureDesc}>
                Get insights on your eating patterns and adherence
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SPACING.lg,
  },
  weekStats: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  comingSoon: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${COLORS.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  icon: {
    fontSize: 36,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  description: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: SPACING.lg,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
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
    paddingHorizontal: SPACING.lg,
  },
  preview: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.md,
    marginTop: SPACING.md,
  },
  previewTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
});
