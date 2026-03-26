import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://dslxsooykqgarmgxdiup.supabase.co';
const supabaseAnonKey = 'sb_publishable_1PzNTiSP8OMDT1rqbCC9RQ_irswmjBX';
const supabase = createClient(supabaseUrl, supabaseAnonKey);
async function test() {
  const { data, error } = await supabase.from('fitnexus_reviews').insert([{
    user_email: 'thanh0043182@gmail.com',
    date: '2026-03-14',
    rating: 5,
    type: 'test',
    content: 'test'
  }]);
  console.log(error || 'Success');
}
test();
