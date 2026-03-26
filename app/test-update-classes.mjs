import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://dslxsooykqgarmgxdiup.supabase.co';
const supabaseAnonKey = 'sb_publishable_1PzNTiSP8OMDT1rqbCC9RQ_irswmjBX';
const supabase = createClient(supabaseUrl, supabaseAnonKey);
async function test() {
  const { data, error } = await supabase.from('fitnexus_classes').update({ booked: 1 }).eq('id', 1);
  console.log(error || 'Success');
}
test();
