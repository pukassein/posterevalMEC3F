-- SQL Script for Supabase Table Creation
-- Run this in your Supabase SQL Editor

-- 1. Create Eval_posters table
CREATE TABLE IF NOT EXISTS public."Eval_posters" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "posterId" TEXT UNIQUE NOT NULL,
    "title" TEXT NOT NULL,
    "presenterName" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "abstract" TEXT,
    "presentationTime" TEXT,
    "presentationDate" TEXT,
    "tematica" TEXT,
    "evaluationStatus" TEXT DEFAULT 'evaluated',
    "created_at" TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Eval_criteria table
CREATE TABLE IF NOT EXISTS public."Eval_criteria" (
    "id" TEXT PRIMARY KEY,
    "label" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Eval_assignments table
CREATE TABLE IF NOT EXISTS public."Eval_assignments" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "evaluatorId" TEXT NOT NULL,
    "posterId" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE("evaluatorId", "posterId")
);

-- 4. Create Eval_evaluations table
CREATE TABLE IF NOT EXISTS public."Eval_evaluations" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "posterId" TEXT NOT NULL,
    "evaluatorId" TEXT NOT NULL,
    "scores" JSONB NOT NULL,
    "generalComments" TEXT,
    "timestamp" TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE("posterId", "evaluatorId")
);

-- Insert Initial Criteria
INSERT INTO public."Eval_criteria" ("id", "label") VALUES
    ('visualPresentation', 'Apresentação Visual'),
    ('scientificMerit', 'Mérito Científico'),
    ('methodology', 'Metodologia'),
    ('clarityOfResults', 'Clareza dos Resultados'),
    ('oralDefense', 'Defesa Oral')
ON CONFLICT ("id") DO NOTHING;

-- Enable Row Level Security
ALTER TABLE public."Eval_posters" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Eval_criteria" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Eval_assignments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Eval_evaluations" ENABLE ROW LEVEL SECURITY;

-- Create Policies to allow anonymous access (since the app uses custom auth)
DROP POLICY IF EXISTS "Allow public read/write on Eval_posters" ON public."Eval_posters";
CREATE POLICY "Allow public read/write on Eval_posters" ON public."Eval_posters" FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read/write on Eval_criteria" ON public."Eval_criteria";
CREATE POLICY "Allow public read/write on Eval_criteria" ON public."Eval_criteria" FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read/write on Eval_assignments" ON public."Eval_assignments";
CREATE POLICY "Allow public read/write on Eval_assignments" ON public."Eval_assignments" FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read/write on Eval_evaluations" ON public."Eval_evaluations";
CREATE POLICY "Allow public read/write on Eval_evaluations" ON public."Eval_evaluations" FOR ALL USING (true) WITH CHECK (true);
\n
-- 5. Create Eval_evaluators table
CREATE TABLE IF NOT EXISTS public."Eval_evaluators" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "accessCode" TEXT UNIQUE NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT NOW()
);

-- Safe upgrades for databases created before these fields were added
ALTER TABLE public."Eval_posters" ADD COLUMN IF NOT EXISTS "presentationDate" TEXT;
ALTER TABLE public."Eval_posters" ADD COLUMN IF NOT EXISTS "authors" TEXT;
ALTER TABLE public."Eval_evaluators" ADD COLUMN IF NOT EXISTS "areas" TEXT[] DEFAULT '{}';

-- Enable Row Level Security
ALTER TABLE public."Eval_evaluators" ENABLE ROW LEVEL SECURITY;

-- Create Policies to allow anonymous access (since the app uses custom auth)
DROP POLICY IF EXISTS "Allow public read/write on Eval_evaluators" ON public."Eval_evaluators";
CREATE POLICY "Allow public read/write on Eval_evaluators" ON public."Eval_evaluators" FOR ALL USING (true) WITH CHECK (true);
