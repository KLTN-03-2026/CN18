import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dslxsooykqgarmgxdiup.supabase.co';
const supabaseAnonKey = 'sb_publishable_1PzNTiSP8OMDT1rqbCC9RQ_irswmjBX';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  console.log('Testing booking insert...');
  const { data, error } = await supabase
    .from('fitnexus_bookings')
    .insert([{
      user_email: 'thanh0043182@gmail.com',
      class_id: 1,
      date: '2026-03-14',
      status: 'confirmed'
    }]);
    
  if (error) {
    console.error('Insert Error:', error);
  } else {
    console.log('Insert Success:', data);
  }
}

test();
