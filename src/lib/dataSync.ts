import { supabase } from './supabase';
import { Poster, Evaluation, Criterion, Evaluator, Tematica } from '../types';

export const syncToSupabase = async (table: string, data: any): Promise<{ success: boolean; error?: string }> => {
  if (!supabase) return { success: false, error: 'Supabase client not initialized' };
  
  console.log(`[Diagnostic] syncToSupabase called for table: ${table}`);
  console.log(`[Diagnostic] Payload:`, JSON.stringify(data, null, 2));

  try {
    const deleteMissingRows = async (column: string, values: string[]) => {
      const { data: existingRows, error: fetchError } = await supabase.from(table).select(column);
      if (fetchError) return fetchError;

      const currentValues = new Set(values);
      const rowsToDelete = (existingRows || []).filter((row: any) => !currentValues.has(row[column]));
      for (const row of rowsToDelete) {
        const { error } = await supabase.from(table).delete().eq(column, row[column]);
        if (error) return error;
      }
      return null;
    };

    if (table === 'Eval_posters') {
      // Omit the frontend-generated 'id' to let Supabase handle its UUID generation, 
      // otherwise we get UUID parsing errors if 'id' is a simple random string.
      const formattedData = data.map((d: any) => {
        const { id, ...rest } = d;
        return rest;
      });
      console.log(`[Diagnostic] Formatted payload for Eval_posters:`, JSON.stringify(formattedData, null, 2));
      const response = await supabase.from('Eval_posters').upsert(formattedData, { onConflict: 'posterId' });
      console.log(`[Diagnostic] Supabase response for Eval_posters:`, response);
      if (response.error) {
        console.error('[Error] Data persistence failing for Eval_posters:', response.error.message, response.error.details, response.error.hint);
        return { success: false, error: response.error.message };
      }
      const deleteError = await deleteMissingRows('posterId', data.map((d: any) => d.posterId));
      if (deleteError) return { success: false, error: deleteError.message };
    } else if (table === 'Eval_criteria') {
      const response = await supabase.from('Eval_criteria').upsert(data, { onConflict: 'id' });
      console.log(`[Diagnostic] Supabase response for Eval_criteria:`, response);
      if (response.error) {
        console.error('Error syncing criteria:', response.error.message, response.error.details, response.error.hint);
        return { success: false, error: response.error.message };
      }
      const deleteError = await deleteMissingRows('id', data.map((d: any) => d.id));
      if (deleteError) return { success: false, error: deleteError.message };
    } else if (table === 'Eval_assignments') {
      const flatAssignments: any[] = [];
      const seen = new Set<string>();
      Object.keys(data).forEach(evaluatorId => {
        data[evaluatorId].forEach((posterId: string) => {
          const key = `${evaluatorId}-${posterId}`;
          if (!seen.has(key)) {
            seen.add(key);
            flatAssignments.push({ evaluatorId, posterId });
          }
        });
      });
      
      const { data: existingData, error: fetchError } = await supabase.from('Eval_assignments').select('evaluatorId, posterId');
      if (fetchError) {
        console.error('Error fetching existing assignments:', fetchError);
        return { success: false, error: fetchError.message };
      }
      
      const existingSeen = new Set(existingData.map(a => `${a.evaluatorId}-${a.posterId}`));
      const toAdd = flatAssignments.filter(a => !existingSeen.has(`${a.evaluatorId}-${a.posterId}`));
      const toDelete = existingData.filter(a => !seen.has(`${a.evaluatorId}-${a.posterId}`));

      if (toDelete.length > 0) {
        for (const item of toDelete) {
           const delRes = await supabase.from('Eval_assignments').delete().match({ evaluatorId: item.evaluatorId, posterId: item.posterId });
           if (delRes.error) console.error('Error deleting assignment:', delRes.error);
        }
      }
      
      if (toAdd.length > 0) {
        const chunkSize = 500;
        for (let i = 0; i < toAdd.length; i += chunkSize) {
          const chunk = toAdd.slice(i, i + chunkSize);
          const insertResponse = await supabase.from('Eval_assignments').insert(chunk);
          if (insertResponse.error) {
            console.error('Error inserting assignments chunk:', insertResponse.error);
            return { success: false, error: insertResponse.error.message };
          }
        }
        console.log(`[Diagnostic] Successfully inserted ${toAdd.length} assignments.`);
      }
    } else if (table === 'Eval_evaluations') {
      const response = await supabase.from('Eval_evaluations').upsert(data, { onConflict: 'posterId,evaluatorId' });
      console.log(`[Diagnostic] Supabase response for Eval_evaluations:`, response);
      if (response.error) {
        console.error('Error syncing evaluations:', response.error.message, response.error.details);
        return { success: false, error: response.error.message };
      }
    } else if (table === 'Eval_evaluators') {
      const formattedData = data.map((d: any) => {
        // We now have the 'areas' column in DB, we can send it directly
        // Fallback to name hack only if you don't run the SQL query
        return { id: d.id, name: d.name, accessCode: d.accessCode, areas: d.areas || [] };
      });
      const response = await supabase.from('Eval_evaluators').upsert(formattedData, { onConflict: 'id' });
      console.log(`[Diagnostic] Supabase response for Eval_evaluators:`, response);
      if (response.error) {
        console.error('[Error] Data persistence failing for Eval_evaluators:', response.error.message, response.error.details, response.error.hint);
        return { success: false, error: response.error.message };
      }
      const deleteError = await deleteMissingRows('id', data.map((d: any) => d.id));
      if (deleteError) return { success: false, error: deleteError.message };
    }
      return { success: true };
  } catch (error: any) {
    console.error('Unexpected error syncing to Supabase:', error);
    return { success: false, error: error.message };
  }
};

export const fetchFromSupabase = async () => {
  if (!supabase) return null;

  const fetchAll = async (table: string) => {
    let allData: any[] = [];
    let from = 0;
    const pageSize = 1000;
    while (true) {
      const { data, error } = await supabase.from(table).select('*').range(from, from + pageSize - 1);
      if (error) {
        if (table === 'Eval_evaluators') return { data: null, error };
        throw error;
      }
      if (data) {
        allData = allData.concat(data);
        if (data.length < pageSize) break;
        from += pageSize;
      } else {
        break;
      }
    }
    return { data: allData, error: null };
  };

  try {
    const results = await Promise.all([
      fetchAll('Eval_posters'),
      fetchAll('Eval_criteria'),
      fetchAll('Eval_assignments'),
      fetchAll('Eval_evaluations'),
      fetchAll('Eval_evaluators')
    ]);

    const posters = results[0].data || [];
    const criteria = results[1].data || [];
    const assignmentsData = results[2].data || [];
    const evaluations = results[3].data || [];
    let evaluators = results[4].data?.map((e: any) => {
      let name = e.name;
      let areas: Tematica[] = e.areas || [];
      // Backward compatibility if someone still has the hack
      if (name.includes(':::')) {
        const parts = name.split(':::');
        name = parts[0];
        if (areas.length === 0) areas = parts[1].split(',') as Tematica[];
      }
      return { ...e, name, areas };
    });
    
    if (results[4].error) {
       console.error("Eval_evaluators table might not exist yet. Please run the SQL schema update.", results[4].error);
       evaluators = null; 
    }

    const assignments: Record<string, string[]> = {};
    if (assignmentsData && Array.isArray(assignmentsData)) {
      assignmentsData.forEach((a: any) => {
        if (!assignments[a.evaluatorId]) assignments[a.evaluatorId] = [];
        if (!assignments[a.evaluatorId].includes(a.posterId)) {
          assignments[a.evaluatorId].push(a.posterId);
        }
      });
    }

    return {
      posters: posters as Poster[],
      criteria: criteria as Criterion[],
      assignments,
      evaluations: evaluations as Evaluation[],
      evaluators: evaluators ? (evaluators as Evaluator[]) : null,
    };
  } catch (error) {
    console.error("Error fetching from Supabase", error);
    // Return empty state instead of null so we don't fall back to local storage mock data if connection fails partially
    return {
      posters: [],
      criteria: [],
      assignments: {},
      evaluations: [],
      evaluators: []
    };
  }
};
