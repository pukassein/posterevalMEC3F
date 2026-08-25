import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkTable(tableName) {
  console.log(`\n--- Checking table: ${tableName} ---`);
  const { data, error } = await supabase.from(tableName).select('*').limit(1);
  if (error) {
    console.error(`Error fetching ${tableName}:`, error.message);
  } else {
    console.log(`Successfully fetched from ${tableName}. Fields available:`);
    if (data.length > 0) {
      console.log(Object.keys(data[0]).join(', '));
      console.log("Sample row:", data[0]);
    } else {
      console.log("Table is empty, cannot infer schema via select.");
    }
  }
}

async function run() {
  await checkTable('posters');
  await checkTable('schedule_items');
}

run();
