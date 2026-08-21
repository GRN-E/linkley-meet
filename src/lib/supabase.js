import { createClient } from "@supabase/supabase-js";

// Public project URL + anon key.
// Safe to expose: every table is protected by Row Level Security.
//
// NOTE: we use the *legacy anon JWT* (not the newer `sb_publishable_...` key)
// because it is accepted by both PostgREST and the Auth (GoTrue) service on
// every supabase-js version. The new-format key can be rejected by Auth on
// older clients, which breaks sign-up / log-in while leaving reads working.
const SUPABASE_URL = "https://zzjkxopeniecfgapanyu.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6amt4b3BlbmllY2ZnYXBhbnl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNjUyMTEsImV4cCI6MjA5Mzk0MTIxMX0.hhUF2KEwj6TR3i3Q6BaidJNDurr8NCrkFarnP-GtOvA";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export const SUPABASE_FUNCTIONS = `${SUPABASE_URL}/functions/v1`;
