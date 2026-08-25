import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase
    .from('Eval_posters')
    .upsert([
      { posterId: 'TEST-100', title: 'Updated Title', presenterName: 'Foo', type: 'poster' },
      { posterId: 'TEST-101', title: 'New Poster', presenterName: 'Bar', type: 'poster' }
    ], { onConflict: 'posterId' });
    
  console.log("Error:", error);
}
check();
