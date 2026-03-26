import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://dslxsooykqgarmgxdiup.supabase.co';
const supabaseAnonKey = 'sb_publishable_1PzNTiSP8OMDT1rqbCC9RQ_irswmjBX';
const supabase = createClient(supabaseUrl, supabaseAnonKey);
async function test() {
  const { data, error } = await supabase.from('fitnexus_users').update({ points: 50 }).eq('email', 'thanh0043182@gmail.com');
  console.log(error || 'Success');
}
test();
