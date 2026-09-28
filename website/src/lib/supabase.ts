import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  display_name: string | null;
  is_admin: boolean;
  created_at: string;
};

export type Progress = {
  id: string;
  user_id: string;
  phase: string;
  exercise_id: string;
  done: boolean;
  updated_at: string;
};

export type LeaderboardEntry = {
  id: string;
  user_id: string;
  username: string | null;
  avatar_url: string | null;
  display_name: string | null;
  completed_count: number;
  last_active: string | null;
  updated_at: string;
};
