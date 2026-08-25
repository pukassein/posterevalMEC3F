import fs from 'fs';
let code = fs.readFileSync('supabase_schema.sql', 'utf-8');
code = code.replace('\\n-- 5.', '\n-- 5.');
fs.writeFileSync('supabase_schema.sql', code);
