import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dslxsooykqgarmgxdiup.supabase.co';
const supabaseAnonKey = 'sb_publishable_1PzNTiSP8OMDT1rqbCC9RQ_irswmjBX';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testInsert() {
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('fitnexus_checkins')
    .insert([{ user_email: 'toan02q@gmail.com', date: today, points_earned: 50 }]);

  if (error) {
    console.error("ERROR RECIEVED:", JSON.stringify(error, null, 2));
    console.error("CODE:", error.code);
    console.error("MESSAGE:", error.message);
  } else {
    console.log("INSERT SUCCESSFUL!", data);
  }
}

testInsert();
