import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../src/context/AppContext';
import { Button } from '../src/components';
import { COLORS, SPACING, FONT_SIZES } from '../src/constants';

export default function PrivacyConsentScreen() {
  const router = useRouter();
  const { state, updateOnboarding } = useApp();
  const [consented, setConsented] = useState(false);

  const handleContinue = async () => {
    await updateOnboarding(1, { privacy_consent_given: true } as any);
    router.replace('/onboarding');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🔒</Text>
          </View>
          <Text style={styles.title}>Privacy & Data Consent</Text>
          <Text style={styles.subtitle}>
            Your trust matters. Here's how we handle your data.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>What we collect</Text>
          
          <DataItem 
            icon="📊" 
            title="Health-adjacent information"
            description="Age, weight, height, activity level to personalize your meal plans"
          />
          <DataItem 
            icon="🍽️" 
            title="Food preferences"
            description="Cuisines you love, allergens to avoid, cooking skill level"
          />
          <DataItem 
            icon="🏥" 
            title="Optional medical info"
            description="Medical conditions (if any) to show appropriate disclaimers"
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>How we use it</Text>
          
          <BulletPoint text="Generate personalized weekly meal plans" />
          <BulletPoint text="Learn your preferences for better recommendations" />
          <BulletPoint text="Show relevant health disclaimers when needed" />
          <BulletPoint text="Never sell your data to third parties" />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your rights</Text>
          
          <BulletPoint text="Access your data anytime in Profile settings" />
          <BulletPoint text="Delete your account and all data on request" />
          <BulletPoint text="Compliant with India's DPDP Act, 2023" />
        </View>

        <TouchableOpacity 
          style={styles.policyLink}
          onPress={() => {}}
        >
          <Text style={styles.policyLinkText}>
            Read full Privacy Policy →
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.consentRow}
          onPress={() => setConsented(!consented)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, consented && styles.checkboxChecked]}>
            {consented && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.consentText}>
            I consent to the collection and processing of my data as described above
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Continue"
          onPress={handleContinue}
          disabled={!consented}
          size="large"
        />
      </View>
    </SafeAreaView>
  );
}

function DataItem({ 
  icon, 
  title, 
  description 
}: { 
  icon: string; 
  title: string; 
  description: string;
}) {
  return (
    <View style={styles.dataItem}>
      <Text style={styles.dataIcon}>{icon}</Text>
      <View style={styles.dataContent}>
        <Text style={styles.dataTitle}>{title}</Text>
        <Text style={styles.dataDescription}>{description}</Text>
      </View>
    </View>
  );
}

function BulletPoint({ text }: { text: string }) {
  return (
    <View style={styles.bulletRow}>
      <View style={styles.bullet} />
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
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
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: `${COLORS.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  icon: {
    fontSize: 32,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  dataItem: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  dataIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  dataContent: {
    flex: 1,
  },
  dataTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  dataDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
    marginTop: 6,
    marginRight: SPACING.sm,
  },
  bulletText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    lineHeight: 20,
  },
  policyLink: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  policyLinkText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginRight: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkmark: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: FONT_SIZES.sm,
  },
  consentText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    lineHeight: 20,
  },
  footer: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
});
