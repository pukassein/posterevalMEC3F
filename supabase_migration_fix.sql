-- Run this once in the Supabase SQL Editor for an existing project.
ALTER TABLE public."Eval_posters"
  ADD COLUMN IF NOT EXISTS "presentationDate" TEXT;

ALTER TABLE public."Eval_posters"
  ADD COLUMN IF NOT EXISTS "evaluationStatus" TEXT DEFAULT 'evaluated';

ALTER TABLE public."Eval_evaluators"
  ADD COLUMN IF NOT EXISTS "areas" TEXT[] DEFAULT '{}';
