import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../src/context/AppContext';
import { Button, SelectOption, ChipGroup, ProgressBar } from '../src/components';
import { analytics } from '../src/services/analytics';
import {
  COLORS,
  SPACING,
  FONT_SIZES,
  GOAL_OPTIONS,
  ROUTINE_OPTIONS,
  GENDER_OPTIONS,
  ACTIVITY_OPTIONS,
  COOKING_SKILL_OPTIONS,
  CUISINE_OPTIONS,
  COMMON_MEDICAL_CONDITIONS,
  COMMON_ALLERGENS,
  ONBOARDING_STEPS,
} from '../src/constants';
import { 
  PrimaryGoal, 
  DailyRoutine, 
  Gender, 
  ActivityLevel, 
  CookingSkill,
  CuisineType,
} from '../src/types';

const TOTAL_STEPS = 10;

export default function OnboardingScreen() {
  const router = useRouter();
  const { state, updateOnboarding, completeOnboarding } = useApp();
  
  const [currentStep, setCurrentStep] = useState(state.onboarding.currentStep || 1);
  const [answers, setAnswers] = useState(state.onboarding.answers || {});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentStep === 1) {
      analytics.onboardingStarted();
    }
  }, []);

  const updateAnswer = (key: string, value: any) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const goNext = async () => {
    await updateOnboarding(currentStep + 1, answers);
    
    if (currentStep === TOTAL_STEPS) {
      setLoading(true);
      await completeOnboarding();
      setLoading(false);
      
      const hasMedicalConditions = (answers.medical_conditions || []).length > 0;
      if (hasMedicalConditions) {
        router.replace('/medical-disclaimer');
      } else {
        router.replace('/generating-plan');
      }
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const goBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return !!answers.goal;
      case 2: return !!answers.routine;
      case 3: return !!answers.age && answers.age > 0;
      case 4: return !!answers.gender;
      case 5: return !!answers.height_cm && !!answers.weight_kg;
      case 6: return !!answers.activity;
      case 7: return true;
      case 8: return !!answers.cooking_skill;
      case 9: return (answers.cuisines || []).length > 0;
      case 10: return true;
      default: return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>What's your primary goal?</Text>
            <Text style={styles.stepSubtitle}>
              This helps us personalize your calorie targets
            </Text>
            <View style={styles.options}>
              {GOAL_OPTIONS.map(option => (
                <SelectOption
                  key={option.value}
                  label={option.label}
                  description={option.description}
                  selected={answers.goal === option.value}
                  onPress={() => updateAnswer('goal', option.value as PrimaryGoal)}
                />
              ))}
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>How's your daily routine?</Text>
            <Text style={styles.stepSubtitle}>
              We'll suggest meals that fit your schedule
            </Text>
            <View style={styles.options}>
              {ROUTINE_OPTIONS.map(option => (
                <SelectOption
                  key={option.value}
                  label={option.label}
                  description={option.description}
                  selected={answers.routine === option.value}
                  onPress={() => updateAnswer('routine', option.value as DailyRoutine)}
                />
              ))}
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>What's your age?</Text>
            <Text style={styles.stepSubtitle}>
              Used to calculate your energy needs
            </Text>
            <TextInput
              style={styles.numberInput}
              placeholder="Enter your age"
              placeholderTextColor={COLORS.textLight}
              keyboardType="number-pad"
              value={answers.age?.toString() || ''}
              onChangeText={text => updateAnswer('age', parseInt(text) || 0)}
              maxLength={3}
            />
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>What's your gender?</Text>
            <Text style={styles.stepSubtitle}>
              Helps calculate accurate calorie targets
            </Text>
            <View style={styles.options}>
              {GENDER_OPTIONS.map(option => (
                <SelectOption
                  key={option.value}
                  label={option.label}
                  selected={answers.gender === option.value}
                  onPress={() => updateAnswer('gender', option.value as Gender)}
                />
              ))}
            </View>
          </View>
        );

      case 5:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Your height & weight</Text>
            <Text style={styles.stepSubtitle}>
              Used to personalize your daily calorie needs
            </Text>
            
            <View style={styles.measurementRow}>
              <View style={styles.measurementField}>
                <Text style={styles.fieldLabel}>Height</Text>
                <View style={styles.inputWithUnit}>
                  <TextInput
                    style={[styles.numberInput, styles.measurementInput]}
                    placeholder="170"
                    placeholderTextColor={COLORS.textLight}
                    keyboardType="number-pad"
                    value={answers.height_cm?.toString() || ''}
                    onChangeText={text => updateAnswer('height_cm', parseInt(text) || 0)}
                    maxLength={3}
                  />
                  <Text style={styles.unitLabel}>cm</Text>
                </View>
              </View>

              <View style={styles.measurementField}>
                <Text style={styles.fieldLabel}>Weight</Text>
                <View style={styles.inputWithUnit}>
                  <TextInput
                    style={[styles.numberInput, styles.measurementInput]}
                    placeholder="70"
                    placeholderTextColor={COLORS.textLight}
                    keyboardType="number-pad"
                    value={answers.weight_kg?.toString() || ''}
                    onChangeText={text => updateAnswer('weight_kg', parseInt(text) || 0)}
                    maxLength={3}
                  />
                  <Text style={styles.unitLabel}>kg</Text>
                </View>
              </View>
            </View>
          </View>
        );

      case 6:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>How active are you?</Text>
            <Text style={styles.stepSubtitle}>
              Your activity level affects calorie targets
            </Text>
            <View style={styles.options}>
              {ACTIVITY_OPTIONS.map(option => (
                <SelectOption
                  key={option.value}
                  label={option.label}
                  description={option.description}
                  selected={answers.activity === option.value}
                  onPress={() => updateAnswer('activity', option.value as ActivityLevel)}
                />
              ))}
            </View>
          </View>
        );

      case 7:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Any medical conditions?</Text>
            <Text style={styles.stepSubtitle}>
              Optional — helps us show relevant health information
            </Text>
            <ChipGroup
              options={[
                { value: 'none', label: 'None' },
                ...COMMON_MEDICAL_CONDITIONS.map(c => ({ value: c.toLowerCase(), label: c })),
              ]}
              selected={
                (answers.medical_conditions || []).length === 0 
                  ? ['none'] 
                  : answers.medical_conditions || []
              }
              onChange={(selected) => {
                if (selected.includes('none')) {
                  if ((answers.medical_conditions || []).length > 0) {
                    updateAnswer('medical_conditions', []);
                  } else {
                    updateAnswer('medical_conditions', selected.filter(s => s !== 'none'));
                  }
                } else {
                  updateAnswer('medical_conditions', selected);
                }
              }}
              multiple={true}
            />
            <Text style={styles.hint}>
              Select "None" if you don't have any medical conditions
            </Text>
          </View>
        );

      case 8:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Your cooking skill level</Text>
            <Text style={styles.stepSubtitle}>
              We'll suggest recipes that match your comfort level
            </Text>
            <View style={styles.options}>
              {COOKING_SKILL_OPTIONS.map(option => (
                <SelectOption
                  key={option.value}
                  label={option.label}
                  description={option.description}
                  selected={answers.cooking_skill === option.value}
                  onPress={() => updateAnswer('cooking_skill', option.value as CookingSkill)}
                />
              ))}
            </View>
          </View>
        );

      case 9:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Which cuisines do you prefer?</Text>
            <Text style={styles.stepSubtitle}>
              Select at least one (you can choose multiple)
            </Text>
            <ChipGroup
              options={CUISINE_OPTIONS.map(c => ({ value: c.value, label: c.label }))}
              selected={answers.cuisines || []}
              onChange={(selected) => updateAnswer('cuisines', selected as CuisineType[])}
              multiple={true}
              required={true}
              minSelect={1}
            />
          </View>
        );

      case 10:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Any food allergies?</Text>
            <Text style={styles.stepSubtitle}>
              We'll make sure to avoid these ingredients (you can edit later)
            </Text>
            <ChipGroup
              options={[
                { value: 'none', label: 'None' },
                ...COMMON_ALLERGENS.map(a => ({ value: a.toLowerCase(), label: a })),
              ]}
              selected={
                (answers.allergens || []).length === 0 
                  ? ['none'] 
                  : answers.allergens || []
              }
              onChange={(selected) => {
                if (selected.includes('none')) {
                  if ((answers.allergens || []).length > 0) {
                    updateAnswer('allergens', []);
                  } else {
                    updateAnswer('allergens', selected.filter(s => s !== 'none'));
                  }
                } else {
                  updateAnswer('allergens', selected);
                }
              }}
              multiple={true}
            />
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.progressContainer}>
            <ProgressBar current={currentStep} total={TOTAL_STEPS} />
          </View>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {renderStepContent()}
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title={currentStep === TOTAL_STEPS ? "Generate my plan" : "Continue"}
            onPress={goNext}
            disabled={!canProceed()}
            loading={loading}
            size="large"
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  backButton: {
    marginBottom: SPACING.md,
  },
  backText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '500',
  },
  progressContainer: {
    marginBottom: SPACING.md,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  stepContent: {
    paddingTop: SPACING.md,
  },
  stepTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  stepSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  options: {},
  numberInput: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.lg,
    color: COLORS.text,
    textAlign: 'center',
  },
  measurementRow: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  measurementField: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  inputWithUnit: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  measurementInput: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  unitLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  hint: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    fontStyle: 'italic',
  },
  footer: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
});
