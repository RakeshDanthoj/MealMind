export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          goal: string | null
          routine: string | null
          age: number | null
          gender: string | null
          height_cm: number | null
          weight_kg: number | null
          activity: string | null
          medical_conditions: string[] | null
          medical_disclaimer_acked: boolean
          cooking_skill: string | null
          cuisines: string[] | null
          allergens: string[] | null
          privacy_consent_given: boolean
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          goal?: string | null
          routine?: string | null
          age?: number | null
          gender?: string | null
          height_cm?: number | null
          weight_kg?: number | null
          activity?: string | null
          medical_conditions?: string[] | null
          medical_disclaimer_acked?: boolean
          cooking_skill?: string | null
          cuisines?: string[] | null
          allergens?: string[] | null
          privacy_consent_given?: boolean
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          goal?: string | null
          routine?: string | null
          age?: number | null
          gender?: string | null
          height_cm?: number | null
          weight_kg?: number | null
          activity?: string | null
          medical_conditions?: string[] | null
          medical_disclaimer_acked?: boolean
          cooking_skill?: string | null
          cuisines?: string[] | null
          allergens?: string[] | null
          privacy_consent_given?: boolean
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      dish_catalog: {
        Row: {
          dish_id: string
          name: string
          cuisines: string[]
          meal_slots: string[]
          ingredients: string[]
          allergens: string[]
          diet_tags: string[]
          prep_complexity: string
          prep_minutes: number
          kcal: number
          protein_g: number
          carbs_g: number
          fat_g: number
          cheat_suitable: boolean
          festive_tags: string[]
          photo_url: string | null
          recipe_preview: string
          recipe_steps_ref: string | null
          recipe_steps: string | null
          active: boolean
          dietician_reviewed: boolean
          version: number
          created_at: string
          updated_at: string
        }
        Insert: {
          dish_id: string
          name: string
          cuisines: string[]
          meal_slots: string[]
          ingredients: string[]
          allergens: string[]
          diet_tags: string[]
          prep_complexity: string
          prep_minutes: number
          kcal: number
          protein_g: number
          carbs_g: number
          fat_g: number
          cheat_suitable?: boolean
          festive_tags?: string[]
          photo_url?: string | null
          recipe_preview: string
          recipe_steps_ref?: string | null
          recipe_steps?: string | null
          active?: boolean
          dietician_reviewed?: boolean
          version?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          dish_id?: string
          name?: string
          cuisines?: string[]
          meal_slots?: string[]
          ingredients?: string[]
          allergens?: string[]
          diet_tags?: string[]
          prep_complexity?: string
          prep_minutes?: number
          kcal?: number
          protein_g?: number
          carbs_g?: number
          fat_g?: number
          cheat_suitable?: boolean
          festive_tags?: string[]
          photo_url?: string | null
          recipe_preview?: string
          recipe_steps_ref?: string | null
          recipe_steps?: string | null
          active?: boolean
          dietician_reviewed?: boolean
          version?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      weekly_plans: {
        Row: {
          plan_id: string
          user_id: string
          week_start: string
          catalog_version: number
          mode: string
          daily_kcal_target: number
          macro_protein_min: number
          macro_protein_max: number
          macro_carbs_min: number
          macro_carbs_max: number
          macro_fat_min: number
          macro_fat_max: number
          generated_at: string
          generator: string
          created_at: string
        }
        Insert: {
          plan_id?: string
          user_id: string
          week_start: string
          catalog_version?: number
          mode?: string
          daily_kcal_target: number
          macro_protein_min: number
          macro_protein_max: number
          macro_carbs_min: number
          macro_carbs_max: number
          macro_fat_min: number
          macro_fat_max: number
          generated_at?: string
          generator?: string
          created_at?: string
        }
        Update: {
          plan_id?: string
          user_id?: string
          week_start?: string
          catalog_version?: number
          mode?: string
          daily_kcal_target?: number
          macro_protein_min?: number
          macro_protein_max?: number
          macro_carbs_min?: number
          macro_carbs_max?: number
          macro_fat_min?: number
          macro_fat_max?: number
          generated_at?: string
          generator?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_plans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      plan_days: {
        Row: {
          id: string
          plan_id: string
          date: string
          day_index: number
          cheat: boolean
          festive: boolean
          festive_label: string | null
        }
        Insert: {
          id?: string
          plan_id: string
          date: string
          day_index: number
          cheat?: boolean
          festive?: boolean
          festive_label?: string | null
        }
        Update: {
          id?: string
          plan_id?: string
          date?: string
          day_index?: number
          cheat?: boolean
          festive?: boolean
          festive_label?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plan_days_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "weekly_plans"
            referencedColumns: ["plan_id"]
          }
        ]
      }
      plan_meals: {
        Row: {
          id: string
          plan_day_id: string
          slot: string
          dish_id: string
          name: string
          kcal: number
          cuisine: string
          status: string
          prep_minutes: number | null
          photo_url: string | null
        }
        Insert: {
          id?: string
          plan_day_id: string
          slot: string
          dish_id: string
          name: string
          kcal: number
          cuisine: string
          status?: string
          prep_minutes?: number | null
          photo_url?: string | null
        }
        Update: {
          id?: string
          plan_day_id?: string
          slot?: string
          dish_id?: string
          name?: string
          kcal?: number
          cuisine?: string
          status?: string
          prep_minutes?: number | null
          photo_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plan_meals_plan_day_id_fkey"
            columns: ["plan_day_id"]
            isOneToOne: false
            referencedRelation: "plan_days"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_meals_dish_id_fkey"
            columns: ["dish_id"]
            isOneToOne: false
            referencedRelation: "dish_catalog"
            referencedColumns: ["dish_id"]
          }
        ]
      }
      user_dish_avoidance: {
        Row: {
          user_id: string
          dish_id: string
          reason: string | null
          created_at: string
        }
        Insert: {
          user_id: string
          dish_id: string
          reason?: string | null
          created_at?: string
        }
        Update: {
          user_id?: string
          dish_id?: string
          reason?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_dish_avoidance_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_dish_avoidance_dish_id_fkey"
            columns: ["dish_id"]
            isOneToOne: false
            referencedRelation: "dish_catalog"
            referencedColumns: ["dish_id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Insertable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updatable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

export type ProfileRow = Tables<'profiles'>
export type ProfileInsert = Insertable<'profiles'>
export type ProfileUpdate = Updatable<'profiles'>

export type DishCatalogRow = Tables<'dish_catalog'>
export type DishCatalogInsert = Insertable<'dish_catalog'>
export type DishCatalogUpdate = Updatable<'dish_catalog'>

export type WeeklyPlanRow = Tables<'weekly_plans'>
export type WeeklyPlanInsert = Insertable<'weekly_plans'>
export type WeeklyPlanUpdate = Updatable<'weekly_plans'>

export type PlanDayRow = Tables<'plan_days'>
export type PlanDayInsert = Insertable<'plan_days'>
export type PlanDayUpdate = Updatable<'plan_days'>

export type PlanMealRow = Tables<'plan_meals'>
export type PlanMealInsert = Insertable<'plan_meals'>
export type PlanMealUpdate = Updatable<'plan_meals'>

export type UserDishAvoidanceRow = Tables<'user_dish_avoidance'>
export type UserDishAvoidanceInsert = Insertable<'user_dish_avoidance'>
export type UserDishAvoidanceUpdate = Updatable<'user_dish_avoidance'>
