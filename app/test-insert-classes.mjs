import { createClient } from '@supabase/supabase-js';
const supabaseUrl = 'https://dslxsooykqgarmgxdiup.supabase.co';
const supabaseAnonKey = 'sb_publishable_1PzNTiSP8OMDT1rqbCC9RQ_irswmjBX';
const supabase = createClient(supabaseUrl, supabaseAnonKey);
async function test() {
  const { data, error } = await supabase.from('fitnexus_classes').insert([{
    name: 'test',
    type: 'test',
    trainer: 'test',
    day: 'test',
    time: 'test',
    duration: 'test',
    room: 'test',
    capacity: 10,
    type_color: 'blue'
  }]);
  console.log(error || 'Success');
}
test();
