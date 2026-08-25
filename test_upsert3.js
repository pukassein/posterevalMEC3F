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
      { posterId: 'TEST-102', title: 'New', presenterName: 'Foo', type: 'poster', abstract: 'test', tematica: 'SMA', presentationTime: '10:00' },
      { posterId: 'TEST-103', title: 'New 2', presenterName: 'Bar', type: 'poster' }
    ], { onConflict: 'posterId' });
    
  console.log("Error:", error);
}
check();
