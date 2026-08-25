import fs from 'fs';
let code = fs.readFileSync('supabase_schema.sql', 'utf-8');

const tableSql = `
-- 5. Create Eval_evaluators table
CREATE TABLE IF NOT EXISTS public."Eval_evaluators" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "accessCode" TEXT UNIQUE NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public."Eval_evaluators" ENABLE ROW LEVEL SECURITY;

-- Create Policies to allow anonymous access (since the app uses custom auth)
DROP POLICY IF EXISTS "Allow public read/write on Eval_evaluators" ON public."Eval_evaluators";
CREATE POLICY "Allow public read/write on Eval_evaluators" ON public."Eval_evaluators" FOR ALL USING (true) WITH CHECK (true);
`;

code = code + "\\n" + tableSql;
fs.writeFileSync('supabase_schema.sql', code);
