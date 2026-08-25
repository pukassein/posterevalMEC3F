import { createClient } from '@supabase/supabase-js';

// Your Project URL
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://lpyswsovorgutlqfphgz.supabase.co';

// Your Anon Key
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxweXN3c292b3JndXRscWZwaGd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1MTU4MzIsImV4cCI6MjA3MjA5MTgzMn0.msGHBGnF0peQN2610zJWZYNoZBKBE-C9kKtwoullINk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const isSupabaseConfigured = () => {
  return SUPABASE_URL !== 'https://placeholder-project.supabase.co' &&
         !SUPABASE_URL.includes('placeholder-project') &&
         SUPABASE_ANON_KEY !== 'placeholder-key' &&
         SUPABASE_ANON_KEY !== 'PASTE_YOUR_ANON_KEY_HERE';
};