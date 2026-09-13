import { AnalyticsEvent } from '../types';

class AnalyticsService {
  private isEnabled = true;

  track(event: AnalyticsEvent): void {
    if (!this.isEnabled) return;

    const timestamp = new Date().toISOString();
    const eventData = { ...event, timestamp };

    console.log('[Analytics]', event.type, eventData);
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  onboardingStarted(): void {
    this.track({ type: 'onboarding_started' });
  }

  onboardingStepCompleted(stepId: number, stepName: string): void {
    this.track({ type: 'onboarding_step_completed', step_id: stepId, step_name: stepName });
  }

  onboardingCompleted(): void {
    this.track({ type: 'onboarding_completed' });
  }

  disclaimerShown(): void {
    this.track({ type: 'disclaimer_shown' });
  }

  disclaimerAccepted(): void {
    this.track({ type: 'disclaimer_accepted' });
  }

  planGenerationStarted(): void {
    this.track({ type: 'plan_generation_started' });
  }

  planGenerationSucceeded(planId: string): void {
    this.track({ type: 'plan_generation_succeeded', plan_id: planId });
  }

  planGenerationFailed(reason: string): void {
    this.track({ type: 'plan_generation_failed', reason });
  }

  firstPlanViewed(planId: string): void {
    this.track({ type: 'first_plan_viewed', plan_id: planId });
  }

  mealSwapped(
    planId: string,
    date: string,
    slot: string,
    oldDishId: string,
    newDishId: string
  ): void {
    this.track({
      type: 'meal_swapped',
      plan_id: planId,
      date,
      slot: slot as any,
      old_dish_id: oldDishId,
      new_dish_id: newDishId,
    });
  }

  mealDisliked(planId: string, date: string, slot: string, dishId: string): void {
    this.track({
      type: 'meal_disliked',
      plan_id: planId,
      date,
      slot: slot as any,
      dish_id: dishId,
    });
  }

  dayRegenerated(planId: string, date: string): void {
    this.track({ type: 'day_regenerated', plan_id: planId, date });
  }

  mealLogged(planId: string, date: string, slot: string, status: string): void {
    this.track({
      type: 'meal_logged',
      plan_id: planId,
      date,
      slot: slot as any,
      status: status as any,
    });
  }
}

export const analytics = new AnalyticsService();
