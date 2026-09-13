import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../../src/context/AppContext';
import { Button } from '../../src/components';
import { 
  COLORS, 
  SPACING, 
  FONT_SIZES,
  GOAL_OPTIONS,
  ACTIVITY_OPTIONS,
  COOKING_SKILL_OPTIONS,
  CUISINE_OPTIONS,
  COMMON_ALLERGENS,
} from '../../src/constants';

export default function ProfileScreen() {
  const router = useRouter();
  const { state, logout, acknowledgeDisclaimer, updateProfile } = useApp();
  const [loggingOut, setLoggingOut] = useState(false);
  const [showAllergenEditor, setShowAllergenEditor] = useState(false);
  const [newAllergen, setNewAllergen] = useState('');

  const profile = state.profile;

  const handleLogout = async () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out? Your data will be preserved.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            setLoggingOut(true);
            await logout();
            router.replace('/');
          },
        },
      ]
    );
  };

  const getGoalLabel = (goal: string | undefined) => {
    if (!goal) return 'Not set';
    return GOAL_OPTIONS.find(o => o.value === goal)?.label || goal;
  };

  const getActivityLabel = (activity: string | undefined) => {
    if (!activity) return 'Not set';
    return ACTIVITY_OPTIONS.find(o => o.value === activity)?.label || activity;
  };

  const getSkillLabel = (skill: string | undefined) => {
    if (!skill) return 'Not set';
    return COOKING_SKILL_OPTIONS.find(o => o.value === skill)?.label || skill;
  };

  const getCuisineLabels = (cuisines: string[] | undefined) => {
    if (!cuisines || cuisines.length === 0) return 'Not set';
    return cuisines
      .map(c => CUISINE_OPTIONS.find(o => o.value === c)?.label || c)
      .join(', ');
  };

  const handleAddAllergen = async () => {
    if (!newAllergen.trim()) return;
    
    const allergenToAdd = newAllergen.trim().toLowerCase();
    const currentAllergens = profile?.allergens || [];
    
    if (currentAllergens.includes(allergenToAdd)) {
      Alert.alert('Already Added', 'This allergen is already in your list.');
      return;
    }
    
    await updateProfile({ allergens: [...currentAllergens, allergenToAdd] });
    setNewAllergen('');
  };

  const handleRemoveAllergen = async (allergen: string) => {
    const currentAllergens = profile?.allergens || [];
    await updateProfile({ 
      allergens: currentAllergens.filter(a => a !== allergen) 
    });
  };

  const handleQuickAddAllergen = async (allergen: string) => {
    const allergenLower = allergen.toLowerCase();
    const currentAllergens = profile?.allergens || [];
    
    if (currentAllergens.includes(allergenLower)) return;
    
    await updateProfile({ allergens: [...currentAllergens, allergenLower] });
  };

  if (!profile) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>👤</Text>
          <Text style={styles.emptyTitle}>No Profile</Text>
          <Text style={styles.emptyMessage}>
            Complete onboarding to set up your profile.
          </Text>
          <Button
            title="Start onboarding"
            onPress={() => router.replace('/onboarding')}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Goals & Activity</Text>
          
          <ProfileItem
            label="Primary Goal"
            value={getGoalLabel(profile.goal)}
          />
          <ProfileItem
            label="Activity Level"
            value={getActivityLabel(profile.activity)}
          />
          <ProfileItem
            label="Cooking Skill"
            value={getSkillLabel(profile.cooking_skill)}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Food Preferences</Text>
          
          <ProfileItem
            label="Preferred Cuisines"
            value={getCuisineLabels(profile.cuisines)}
          />
          
          <View style={styles.allergenSection}>
            <View style={styles.allergenHeader}>
              <Text style={styles.allergenLabel}>Allergens to Avoid</Text>
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => setShowAllergenEditor(true)}
              >
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            </View>
            
            {(profile.allergens?.length ?? 0) > 0 ? (
              <View style={styles.allergenTags}>
                {profile.allergens!.map(allergen => (
                  <View key={allergen} style={styles.allergenTag}>
                    <Text style={styles.allergenTagText}>
                      {allergen.charAt(0).toUpperCase() + allergen.slice(1)}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.noAllergens}>None specified</Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Information</Text>
          
          <ProfileItem
            label="Medical Conditions"
            value={
              (profile.medical_conditions?.length ?? 0) > 0
                ? profile.medical_conditions!.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(', ')
                : 'None specified'
            }
          />
          
          {(profile.medical_conditions?.length ?? 0) > 0 && (
            <View style={styles.disclaimerStatus}>
              <Text style={styles.disclaimerLabel}>
                Medical Disclaimer:
              </Text>
              {profile.medical_disclaimer_acked ? (
                <View style={styles.acknowledgedBadge}>
                  <Text style={styles.acknowledgedText}>Acknowledged</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.acknowledgeButton}
                  onPress={() => router.push('/medical-disclaimer')}
                >
                  <Text style={styles.acknowledgeButtonText}>
                    Acknowledge for full plan
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Body Metrics</Text>
          
          <ProfileItem
            label="Age"
            value={`${profile.age} years`}
          />
          <ProfileItem
            label="Height"
            value={`${profile.height_cm} cm`}
          />
          <ProfileItem
            label="Weight"
            value={`${profile.weight_kg} kg`}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>
          
          <TouchableOpacity style={styles.linkItem}>
            <Text style={styles.linkText}>Privacy Policy</Text>
            <Text style={styles.linkArrow}>→</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.linkItem}>
            <Text style={styles.linkText}>Terms of Service</Text>
            <Text style={styles.linkArrow}>→</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.linkItem}>
            <Text style={styles.linkText}>Request Data Export</Text>
            <Text style={styles.linkArrow}>→</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <TouchableOpacity
            style={styles.editProfileButton}
            onPress={() => Alert.alert('Coming Soon', 'Profile editing will be available in a future update.')}
          >
            <Text style={styles.editProfileText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={loggingOut}
        >
          <Text style={styles.logoutText}>
            {loggingOut ? 'Logging out...' : 'Log Out'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.version}>MealMind v1.0.0 (P0)</Text>
      </ScrollView>

      <Modal
        visible={showAllergenEditor}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAllergenEditor(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.allergenEditorSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.allergenEditorTitle}>Edit Allergens</Text>
            
            <View style={styles.addAllergenRow}>
              <TextInput
                style={styles.allergenInput}
                placeholder="Add allergen..."
                placeholderTextColor={COLORS.textLight}
                value={newAllergen}
                onChangeText={setNewAllergen}
                onSubmitEditing={handleAddAllergen}
                returnKeyType="done"
                autoCapitalize="none"
              />
              <TouchableOpacity 
                style={styles.addButton}
                onPress={handleAddAllergen}
              >
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.quickAddLabel}>Quick add:</Text>
            <View style={styles.quickAddTags}>
              {COMMON_ALLERGENS.filter(
                a => !(profile?.allergens || []).includes(a.toLowerCase())
              ).map(allergen => (
                <TouchableOpacity
                  key={allergen}
                  style={styles.quickAddTag}
                  onPress={() => handleQuickAddAllergen(allergen)}
                >
                  <Text style={styles.quickAddTagText}>+ {allergen}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {(profile?.allergens?.length ?? 0) > 0 && (
              <>
                <Text style={styles.currentLabel}>Current allergens:</Text>
                <View style={styles.currentTags}>
                  {profile?.allergens?.map(allergen => (
                    <TouchableOpacity
                      key={allergen}
                      style={styles.currentTag}
                      onPress={() => handleRemoveAllergen(allergen)}
                    >
                      <Text style={styles.currentTagText}>
                        {allergen.charAt(0).toUpperCase() + allergen.slice(1)}
                      </Text>
                      <Text style={styles.removeTagText}> ✕</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}

            <Button
              title="Done"
              onPress={() => setShowAllergenEditor(false)}
              style={styles.doneButton}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function ProfileItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.profileItem}>
      <Text style={styles.profileLabel}>{label}</Text>
      <Text style={styles.profileValue}>{value}</Text>
    </View>
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
    paddingBottom: SPACING.xxl,
  },
  section: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.md,
  },
  profileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  profileLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    flex: 1,
  },
  profileValue: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    fontWeight: '500',
    flex: 1.5,
    textAlign: 'right',
  },
  disclaimerStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  disclaimerLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  acknowledgedBadge: {
    backgroundColor: `${COLORS.success}20`,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  acknowledgedText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.success,
    fontWeight: '500',
  },
  acknowledgeButton: {
    backgroundColor: `${COLORS.warning}20`,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  acknowledgeButtonText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.warning,
    fontWeight: '500',
  },
  linkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  linkText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
  },
  linkArrow: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  editProfileButton: {
    backgroundColor: `${COLORS.primary}15`,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  editProfileText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: `${COLORS.error}10`,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  logoutText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.error,
    fontWeight: '600',
  },
  version: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: SPACING.lg,
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
  allergenSection: {
    paddingVertical: SPACING.sm,
  },
  allergenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  allergenLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  editButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  editButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  allergenTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  allergenTag: {
    backgroundColor: `${COLORS.error}15`,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: 8,
  },
  allergenTagText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
    fontWeight: '500',
  },
  noAllergens: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  allergenEditorSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
    maxHeight: '80%',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  allergenEditorTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  addAllergenRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  allergenInput: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    borderRadius: 12,
    justifyContent: 'center',
  },
  addButtonText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: FONT_SIZES.sm,
  },
  quickAddLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  quickAddTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  quickAddTag: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: 8,
  },
  quickAddTagText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  currentLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  currentTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  currentTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.error}15`,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 6,
    borderRadius: 8,
  },
  currentTagText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
    fontWeight: '500',
  },
  removeTagText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
  },
  doneButton: {
    marginTop: SPACING.sm,
  },
});
