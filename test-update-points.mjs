import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dslxsooykqgarmgxdiup.supabase.co';
const supabaseAnonKey = 'sb_publishable_1PzNTiSP8OMDT1rqbCC9RQ_irswmjBX';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testUpdate() {
  const { data, error } = await supabase
    .from('fitnexus_users')
    .update({ points: 50 })
    .eq('email', 'toan02q@gmail.com');

  if (error) {
    console.error("ERROR RECIEVED:", JSON.stringify(error, null, 2));
    console.error("CODE:", error.code);
    console.error("MESSAGE:", error.message);
  } else {
    console.log("UPDATE SUCCESSFUL!", data);
  }
}

testUpdate();
