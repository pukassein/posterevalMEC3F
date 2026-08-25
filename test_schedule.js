import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const { data, error } = await supabase.from('schedule_items').select('type').not('type', 'is', null);
  if (data) {
    const types = [...new Set(data.map(d => d.type))];
    console.log("Distinct schedule_items types:", types);
  }
}
run();
