import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lpyswsovorgutlqfphgz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxweXN3c292b3JndXRscWZwaGd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1MTU4MzIsImV4cCI6MjA3MjA5MTgzMn0.msGHBGnF0peQN2610zJWZYNoZBKBE-C9kKtwoullINk';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function test() {
  const data = [
      {
        "id": "9f040ef7-afbd-4eb5-b0ba-913991053218",
        "posterId": "fffff",
        "title": "fffffffffffff",
        "presenterName": "ffffffff",
        "type": "rrr",
        "abstract": null,
        "presentationTime": null,
        "tematica": null,
        "created_at": "2026-07-02T13:33:48.932559+00:00"
      },
      {
        "id": "new123",
        "posterId": "NEW-APP-2",
        "title": "New Poster from App",
        "presenterName": "John Doe",
        "type": "poster",
        "presentationTime": "14:00",
        "tematica": "SMA"
      }
  ];
  
  const formattedData = data.map((d) => {
    const { id, created_at, ...rest } = d;
    return rest;
  });
  
  console.log("Upserting:", formattedData);
  const { data: res, error } = await supabase.from('Eval_posters').upsert(formattedData, { onConflict: 'posterId' }).select();
  console.log("Error:", error);
  console.log("Result:", res);
}

test();
