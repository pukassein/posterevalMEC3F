import fs from 'fs';
let code = fs.readFileSync('src/lib/dataSync.ts', 'utf-8');

code = code.replace(
`export const syncToSupabase = async (table: string, data: any) => {`,
`export const syncToSupabase = async (table: string, data: any): Promise<{ success: boolean; error?: string }> => {`);

code = code.replace(
`  if (!supabase) return;`,
`  if (!supabase) return { success: false, error: 'Supabase client not initialized' };`);

// Replace error handling in Eval_posters
code = code.replace(
`      const { error } = await supabase.from('Eval_posters').upsert(formattedData, { onConflict: 'posterId' });
      if (error) console.error('Error syncing posters:', error.message, error.details);`,
`      const { error } = await supabase.from('Eval_posters').upsert(formattedData, { onConflict: 'posterId' });
      if (error) {
        console.error('Error syncing posters:', error.message, error.details);
        return { success: false, error: error.message };
      }`);

// Replace error handling in Eval_criteria
code = code.replace(
`      const { error } = await supabase.from('Eval_criteria').upsert(data, { onConflict: 'id' });
      if (error) console.error('Error syncing criteria:', error.message, error.details, error.hint);`,
`      const { error } = await supabase.from('Eval_criteria').upsert(data, { onConflict: 'id' });
      if (error) {
        console.error('Error syncing criteria:', error.message, error.details, error.hint);
        return { success: false, error: error.message };
      }`);

// Replace error handling in Eval_evaluations
code = code.replace(
`      const { error } = await supabase.from('Eval_evaluations').upsert(data, { onConflict: 'posterId,evaluatorId' });
      if (error) console.error('Error syncing evaluations:', error.message, error.details);`,
`      const { error } = await supabase.from('Eval_evaluations').upsert(data, { onConflict: 'posterId,evaluatorId' });
      if (error) {
        console.error('Error syncing evaluations:', error.message, error.details);
        return { success: false, error: error.message };
      }`);

// Replace error handling in Eval_evaluators
code = code.replace(
`      const { error } = await supabase.from('Eval_evaluators').upsert(data, { onConflict: 'accessCode' });
      if (error) console.error('Error syncing evaluators:', error.message, error.details);`,
`      const { error } = await supabase.from('Eval_evaluators').upsert(data, { onConflict: 'accessCode' });
      if (error) {
        console.error('Error syncing evaluators:', error.message, error.details);
        return { success: false, error: error.message };
      }`);

// Replace error handling in Eval_assignments
code = code.replace(
`      if (deleteError) console.error('Error clearing assignments:', deleteError);
      
      if (flatAssignments.length > 0) {
        const { error: insertError } = await supabase.from('Eval_assignments').insert(flatAssignments);
        if (insertError) console.error('Error inserting assignments:', insertError);
      }`,
`      if (deleteError) {
        console.error('Error clearing assignments:', deleteError);
        return { success: false, error: deleteError.message };
      }
      
      if (flatAssignments.length > 0) {
        const { error: insertError } = await supabase.from('Eval_assignments').insert(flatAssignments);
        if (insertError) {
          console.error('Error inserting assignments:', insertError);
          return { success: false, error: insertError.message };
        }
      }`);

code = code.replace(
`  } catch (error) {
    console.error('Unexpected error syncing to Supabase:', error);
  }`,
`      return { success: true };
  } catch (error: any) {
    console.error('Unexpected error syncing to Supabase:', error);
    return { success: false, error: error.message };
  }`);

fs.writeFileSync('src/lib/dataSync.ts', code);
