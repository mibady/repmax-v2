// Generated types - run `npm run db:generate` after applying migrations
// This is a placeholder until types are generated from Supabase

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          role: "athlete" | "coach" | "recruiter" | "admin";
          full_name: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: "athlete" | "coach" | "recruiter" | "admin";
          full_name: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: "athlete" | "coach" | "recruiter" | "admin";
          full_name?: string;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      athletes: {
        Row: {
          id: string;
          profile_id: string;
          high_school: string;
          city: string;
          state: string;
          zone: string | null;
          class_year: number;
          primary_position: string;
          secondary_position: string | null;
          height_inches: number | null;
          weight_lbs: number | null;
          forty_yard_time: number | null;
          vertical_inches: number | null;
          ten_yard_split: number | null;
          five_ten_five: number | null;
          broad_jump_inches: number | null;
          wingspan_inches: number | null;
          bench_press_lbs: number | null;
          squat_lbs: number | null;
          gpa: number | null;
          weighted_gpa: number | null;
          sat_score: number | null;
          act_score: number | null;
          ncaa_id: string | null;
          ncaa_cleared: boolean;
          star_rating: number | null;
          repmax_score: number | null;
          verified: boolean;
          offers_count: number;
          bio: string | null;
          coach_notes: string | null;
          player_summary: string | null;
          coach_phone: string | null;
          coach_email: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          high_school: string;
          city: string;
          state: string;
          zone?: string | null;
          class_year: number;
          primary_position: string;
          secondary_position?: string | null;
          height_inches?: number | null;
          weight_lbs?: number | null;
          forty_yard_time?: number | null;
          vertical_inches?: number | null;
          ten_yard_split?: number | null;
          five_ten_five?: number | null;
          broad_jump_inches?: number | null;
          wingspan_inches?: number | null;
          bench_press_lbs?: number | null;
          squat_lbs?: number | null;
          gpa?: number | null;
          weighted_gpa?: number | null;
          sat_score?: number | null;
          act_score?: number | null;
          ncaa_id?: string | null;
          ncaa_cleared?: boolean;
          star_rating?: number | null;
          repmax_score?: number | null;
          verified?: boolean;
          offers_count?: number;
          bio?: string | null;
          coach_notes?: string | null;
          player_summary?: string | null;
          coach_phone?: string | null;
          coach_email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          high_school?: string;
          city?: string;
          state?: string;
          zone?: string | null;
          class_year?: number;
          primary_position?: string;
          secondary_position?: string | null;
          height_inches?: number | null;
          weight_lbs?: number | null;
          forty_yard_time?: number | null;
          vertical_inches?: number | null;
          ten_yard_split?: number | null;
          five_ten_five?: number | null;
          broad_jump_inches?: number | null;
          wingspan_inches?: number | null;
          bench_press_lbs?: number | null;
          squat_lbs?: number | null;
          gpa?: number | null;
          weighted_gpa?: number | null;
          sat_score?: number | null;
          act_score?: number | null;
          ncaa_id?: string | null;
          ncaa_cleared?: boolean;
          star_rating?: number | null;
          repmax_score?: number | null;
          verified?: boolean;
          offers_count?: number;
          bio?: string | null;
          coach_notes?: string | null;
          player_summary?: string | null;
          coach_phone?: string | null;
          coach_email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      coaches: {
        Row: {
          id: string;
          profile_id: string;
          school_name: string;
          division: "D1" | "D2" | "D3" | "NAIA" | "JUCO";
          conference: string | null;
          title: string | null;
          verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          school_name: string;
          division: "D1" | "D2" | "D3" | "NAIA" | "JUCO";
          conference?: string | null;
          title?: string | null;
          verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          school_name?: string;
          division?: "D1" | "D2" | "D3" | "NAIA" | "JUCO";
          conference?: string | null;
          title?: string | null;
          verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      highlights: {
        Row: {
          id: string;
          athlete_id: string;
          title: string;
          description: string | null;
          video_url: string;
          thumbnail_url: string | null;
          duration_seconds: number | null;
          view_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          athlete_id: string;
          title: string;
          description?: string | null;
          video_url: string;
          thumbnail_url?: string | null;
          duration_seconds?: number | null;
          view_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          athlete_id?: string;
          title?: string;
          description?: string | null;
          video_url?: string;
          thumbnail_url?: string | null;
          duration_seconds?: number | null;
          view_count?: number;
          created_at?: string;
        };
      };
      shortlists: {
        Row: {
          id: string;
          coach_id: string;
          athlete_id: string;
          notes: string | null;
          priority: "low" | "medium" | "high" | "top";
          pipeline_status: "identified" | "contacted" | "evaluating" | "visit_scheduled" | "offered" | "committed";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          coach_id: string;
          athlete_id: string;
          notes?: string | null;
          priority?: "low" | "medium" | "high" | "top";
          pipeline_status?: "identified" | "contacted" | "evaluating" | "visit_scheduled" | "offered" | "committed";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          coach_id?: string;
          athlete_id?: string;
          notes?: string | null;
          priority?: "low" | "medium" | "high" | "top";
          pipeline_status?: "identified" | "contacted" | "evaluating" | "visit_scheduled" | "offered" | "committed";
          created_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          sender_id: string;
          recipient_id: string;
          subject: string | null;
          body: string;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          sender_id: string;
          recipient_id: string;
          subject?: string | null;
          body: string;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          sender_id?: string;
          recipient_id?: string;
          subject?: string | null;
          body?: string;
          read?: boolean;
          created_at?: string;
        };
      };
      subscription_plans: {
        Row: {
          id: string;
          name: string;
          slug: string;
          price_cents: number;
          billing_period: "monthly" | "yearly";
          features: Json;
          max_team_seats: number | null;
          max_searches_per_day: number | null;
          has_api_access: boolean;
          has_export: boolean;
          active: boolean;
          target_role: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          price_cents: number;
          billing_period: "monthly" | "yearly";
          features: Json;
          max_team_seats?: number | null;
          max_searches_per_day?: number | null;
          has_api_access?: boolean;
          has_export?: boolean;
          active?: boolean;
          target_role?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          price_cents?: number;
          billing_period?: "monthly" | "yearly";
          features?: Json;
          max_team_seats?: number | null;
          max_searches_per_day?: number | null;
          has_api_access?: boolean;
          has_export?: boolean;
          active?: boolean;
          target_role?: string | null;
          created_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          profile_id: string;
          plan_id: string;
          stripe_subscription_id: string | null;
          status: "active" | "canceled" | "past_due" | "trialing";
          current_period_start: string;
          current_period_end: string;
          canceled_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          plan_id: string;
          stripe_subscription_id?: string | null;
          status: "active" | "canceled" | "past_due" | "trialing";
          current_period_start: string;
          current_period_end: string;
          canceled_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          plan_id?: string;
          stripe_subscription_id?: string | null;
          status?: "active" | "canceled" | "past_due" | "trialing";
          current_period_start?: string;
          current_period_end?: string;
          canceled_at?: string | null;
          created_at?: string;
        };
      };
      offers: {
        Row: {
          id: string;
          athlete_id: string;
          school_name: string;
          division: "D1" | "D2" | "D3" | "NAIA" | "JUCO";
          scholarship_type: "full" | "partial" | "walk-on" | "preferred-walk-on" | null;
          offer_date: string;
          committed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          athlete_id: string;
          school_name: string;
          division: "D1" | "D2" | "D3" | "NAIA" | "JUCO";
          scholarship_type?: "full" | "partial" | "walk-on" | "preferred-walk-on" | null;
          offer_date: string;
          committed?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          athlete_id?: string;
          school_name?: string;
          division?: "D1" | "D2" | "D3" | "NAIA" | "JUCO";
          scholarship_type?: "full" | "partial" | "walk-on" | "preferred-walk-on" | null;
          offer_date?: string;
          committed?: boolean;
          created_at?: string;
        };
      };
      documents: {
        Row: {
          id: string;
          athlete_id: string;
          title: string;
          document_type: "transcript" | "recommendation" | "other";
          file_url: string;
          filename: string | null;
          verified: boolean;
          uploaded_at: string;
        };
        Insert: {
          id?: string;
          athlete_id: string;
          title: string;
          document_type: "transcript" | "recommendation" | "other";
          file_url: string;
          filename?: string | null;
          verified?: boolean;
          uploaded_at?: string;
        };
        Update: {
          id?: string;
          athlete_id?: string;
          title?: string;
          document_type?: "transcript" | "recommendation" | "other";
          file_url?: string;
          filename?: string | null;
          verified?: boolean;
          uploaded_at?: string;
        };
      };
      coach_structured_notes: {
        Row: {
          id: string;
          coach_id: string;
          athlete_id: string | null;
          content: string;
          category: "general" | "urgent" | "call_log" | "strategy";
          is_pinned: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          coach_id: string;
          athlete_id?: string | null;
          content: string;
          category?: "general" | "urgent" | "call_log" | "strategy";
          is_pinned?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          coach_id?: string;
          athlete_id?: string | null;
          content?: string;
          category?: "general" | "urgent" | "call_log" | "strategy";
          is_pinned?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      coach_college_tracking: {
        Row: {
          id: string;
          coach_id: string;
          school_name: string;
          temperature: "hot" | "warm" | "cold";
          prospect_count: number;
          scheduled_visits: number;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          coach_id: string;
          school_name: string;
          temperature?: "hot" | "warm" | "cold";
          prospect_count?: number;
          scheduled_visits?: number;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          coach_id?: string;
          school_name?: string;
          temperature?: "hot" | "warm" | "cold";
          prospect_count?: number;
          scheduled_visits?: number;
          notes?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {
      user_role: "athlete" | "coach" | "recruiter" | "admin";
      recruiting_zone: "West" | "Southwest" | "Midwest" | "Southeast" | "Northeast" | "Mid-Atlantic";
      division: "D1" | "D2" | "D3" | "NAIA" | "JUCO";
      priority_level: "low" | "medium" | "high" | "top";
      pipeline_status: "identified" | "contacted" | "evaluating" | "visit_scheduled" | "offered" | "committed";
      subscription_status: "active" | "canceled" | "past_due" | "trialing";
      billing_period: "monthly" | "yearly";
      scholarship_type: "full" | "partial" | "walk-on" | "preferred-walk-on";
    };
  };
};

// Helper types
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];
