import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  const payload = {
    posterId: 'TEST-100',
    title: 'Test Poster',
    presenterName: 'Test Presenter',
    type: 'poster',
    tematica: 'SMA',
    presentationTime: '10:00',
    abstract: 'test abstract'
  };
  
  console.log("Upserting:", payload);
  const { data, error } = await supabase.from('Eval_posters').upsert(payload, { onConflict: 'posterId' }).select();
  
  console.log("Result:", data);
  if (error) console.error("Error:", error.message, error.details, error.hint);
}
testInsert();
