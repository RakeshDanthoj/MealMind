import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../src/context/AppContext';
import { COLORS, SPACING, FONT_SIZES, GENERATION_TIPS } from '../src/constants';

export default function GeneratingPlanScreen() {
  const router = useRouter();
  const { state, generatePlan } = useApp();
  
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  
  const spinValue = useRef(new Animated.Value(0)).current;
  const fadeValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  useEffect(() => {
    const tipInterval = setInterval(() => {
      Animated.sequence([
        Animated.timing(fadeValue, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeValue, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
      
      setCurrentTipIndex(prev => (prev + 1) % GENERATION_TIPS.length);
    }, 2500);

    return () => clearInterval(tipInterval);
  }, []);

  useEffect(() => {
    const generate = async () => {
      try {
        await generatePlan();
        router.replace('/plan-reveal');
      } catch (e) {
        setError((e as Error).message);
      }
    };

    if (!state.currentPlan) {
      generate();
    } else {
      router.replace('/plan-reveal');
    }
  }, []);

  const handleRetry = async () => {
    setRetrying(true);
    setError(null);
    try {
      await generatePlan();
      router.replace('/plan-reveal');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setRetrying(false);
    }
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.errorIcon}>
            <Text style={styles.errorEmoji}>😕</Text>
          </View>
          <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
          <Text style={styles.errorMessage}>
            We couldn't generate your plan right now. Please try again.
          </Text>
          <View style={styles.retryButton}>
            <Text 
              style={styles.retryButtonText}
              onPress={handleRetry}
            >
              {retrying ? 'Retrying...' : 'Try again'}
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Animated.View 
          style={[
            styles.spinnerContainer,
            { transform: [{ rotate: spin }] }
          ]}
        >
          <View style={styles.spinner}>
            <View style={styles.spinnerInner} />
          </View>
        </Animated.View>

        <Text style={styles.title}>Creating your plan</Text>
        
        <Animated.Text style={[styles.tip, { opacity: fadeValue }]}>
          {GENERATION_TIPS[currentTipIndex]}
        </Animated.Text>

        <View style={styles.profileSummary}>
          <Text style={styles.summaryTitle}>Building for you:</Text>
          <View style={styles.summaryItems}>
            {state.profile?.goal && (
              <Text style={styles.summaryItem}>
                🎯 {formatGoal(state.profile.goal)}
              </Text>
            )}
            {state.profile?.cuisines && state.profile.cuisines.length > 0 && (
              <Text style={styles.summaryItem}>
                🍽️ {state.profile.cuisines.map(formatCuisine).join(', ')}
              </Text>
            )}
            {state.profile?.cooking_skill && (
              <Text style={styles.summaryItem}>
                👨‍🍳 {formatSkill(state.profile.cooking_skill)} cooking
              </Text>
            )}
          </View>
        </View>
      </View>
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
  return labels[goal] || goal;
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

function formatSkill(skill: string): string {
  const labels: Record<string, string> = {
    beginner: 'Beginner',
    comfortable: 'Comfortable',
    advanced: 'Advanced',
  };
  return labels[skill] || skill;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  spinnerContainer: {
    marginBottom: SPACING.xl,
  },
  spinner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: `${COLORS.primary}30`,
    borderTopColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinnerInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.primary}20`,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  tip: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xxl,
    height: 24,
  },
  profileSummary: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.md,
    width: '100%',
  },
  summaryTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  summaryItems: {},
  summaryItem: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  errorIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: `${COLORS.error}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  errorEmoji: {
    fontSize: 48,
  },
  errorTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: 12,
  },
  retryButtonText: {
    color: COLORS.white,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
});
