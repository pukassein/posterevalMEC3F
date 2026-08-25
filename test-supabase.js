import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envContent = fs.readFileSync('.env.local', 'utf-8').split('\n');
let SUPABASE_URL = '';
let SUPABASE_ANON_KEY = '';
envContent.forEach(line => {
  if (line.startsWith('VITE_SUPABASE_URL=')) SUPABASE_URL = line.split('=')[1].trim();
  if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) SUPABASE_ANON_KEY = line.split('=')[1].trim();
});

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Try .env
  try {
      const envContent2 = fs.readFileSync('.env', 'utf-8').split('\n');
      envContent2.forEach(line => {
        if (line.startsWith('VITE_SUPABASE_URL=')) SUPABASE_URL = line.split('=')[1].trim();
        if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) SUPABASE_ANON_KEY = line.split('=')[1].trim();
      });
  } catch (e) {}
}

if (!SUPABASE_URL) {
    SUPABASE_URL = 'https://lpyswsovorgutlqfphgz.supabase.co';
    SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxweXN3c292b3JndXRscWZwaGd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1MTU4MzIsImV4cCI6MjA3MjA5MTgzMn0.msGHBGnF0peQN2610zJWZYNoZBKBE-C9kKtwoullINk';
}

console.log("URL:", SUPABASE_URL);

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function test() {
  const { data, error } = await supabase.from('Eval_posters').select('*').limit(5);
  if (error) {
    console.error("Error fetching:", error);
  } else {
    console.log("Posters:", data);
  }
}

test();
