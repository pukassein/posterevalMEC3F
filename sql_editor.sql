-- Adicionar coluna 'areas' como um array de texto à tabela Eval_evaluators
-- Isso permite salvar as temáticas dos avaliadores de forma mais estruturada
ALTER TABLE "Eval_evaluators" 
ADD COLUMN IF NOT EXISTS "areas" TEXT[] DEFAULT '{}';
