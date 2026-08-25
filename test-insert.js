import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lpyswsovorgutlqfphgz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxweXN3c292b3JndXRscWZwaGd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1MTU4MzIsImV4cCI6MjA3MjA5MTgzMn0.msGHBGnF0peQN2610zJWZYNoZBKBE-C9kKtwoullINk';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase.from('Eval_posters').upsert([{
    posterId: 'test1234',
    title: 'Test Title',
    presenterName: 'Test Name',
    type: 'poster'
  }], { onConflict: 'posterId' }).select();
  console.log("Error:", error?.message);
  console.log("Data:", data);
}
test();
