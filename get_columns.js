import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

async function check() {
  const url = `${supabaseUrl}/rest/v1/Eval_posters?select=*&limit=1`;
  const res = await fetch(url, {
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    }
  });
  console.log("Headers:", Object.fromEntries(res.headers.entries()));
  const data = await res.json();
  console.log("Data keys:", data.length > 0 ? Object.keys(data[0]) : "No data");
}
check();
