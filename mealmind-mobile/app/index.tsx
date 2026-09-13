import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../src/context/AppContext';
import { Button } from '../src/components';
import { COLORS, SPACING, FONT_SIZES } from '../src/constants';

export default function WelcomeScreen() {
  const router = useRouter();
  const { state } = useApp();

  useEffect(() => {
    if (!state.isLoading) {
      if (state.auth.isAuthenticated && state.onboarding.completed && state.currentPlan) {
        router.replace('/(tabs)/plan');
      } else if (state.auth.isAuthenticated && state.onboarding.completed) {
        router.replace('/generating-plan');
      } else if (state.auth.isAuthenticated && state.profile?.privacy_consent_given) {
        router.replace('/onboarding');
      } else if (state.auth.isAuthenticated) {
        router.replace('/privacy-consent');
      }
    }
  }, [state.isLoading, state.auth.isAuthenticated, state.onboarding.completed, state.currentPlan]);

  if (state.isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>M</Text>
          </View>
          <Text style={styles.appName}>MealMind</Text>
        </View>

        <View style={styles.heroSection}>
          <Text style={styles.tagline}>
            Plans that fit your life
          </Text>
          <Text style={styles.subtitle}>
            AI nutrition on dietician-validated guidelines
          </Text>
        </View>

        <View style={styles.features}>
          <FeatureItem 
            icon="✓" 
            text="Personalized weekly meal plans" 
          />
          <FeatureItem 
            icon="✓" 
            text="Cuisines you love — Indian, Asian & more" 
          />
          <FeatureItem 
            icon="✓" 
            text="Swap meals instantly with AI" 
          />
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title="Create account"
          onPress={() => router.push('/auth?mode=signup')}
          size="large"
          style={styles.primaryButton}
        />
        <Button
          title="Log in"
          variant="outline"
          onPress={() => router.push('/auth?mode=login')}
          size="large"
          style={styles.secondaryButton}
        />
      </View>
    </SafeAreaView>
  );
}

function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIcon}>
        <Text style={styles.featureIconText}>{icon}</Text>
      </View>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  logoText: {
    fontSize: 40,
    fontWeight: '700',
    color: COLORS.white,
  },
  appName: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  tagline: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  features: {
    paddingHorizontal: SPACING.md,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  featureIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: `${COLORS.primary}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  featureIconText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  featureText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    flex: 1,
  },
  footer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
  },
  primaryButton: {
    marginBottom: SPACING.sm,
  },
  secondaryButton: {},
});
