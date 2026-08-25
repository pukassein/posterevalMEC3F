import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lpyswsovorgutlqfphgz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxweXN3c292b3JndXRscWZwaGd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1MTU4MzIsImV4cCI6MjA3MjA5MTgzMn0.msGHBGnF0peQN2610zJWZYNoZBKBE-C9kKtwoullINk';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function test() {
  const results = await Promise.all([
    supabase.from('Eval_posters').select('*'),
    supabase.from('Eval_criteria').select('*'),
    supabase.from('Eval_assignments').select('*'),
    supabase.from('Eval_evaluations').select('*'),
  ]);
  console.log(JSON.stringify(results, null, 2));
}

test();
