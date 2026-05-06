import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://dslxsooykqgarmgxdiup.supabase.co',
  'sb_publishable_1PzNTiSP8OMDT1rqbCC9RQ_irswmjBX'
);

const newClasses = [
  // === THÊM NHIỀU LỚP MỚI ĐỂ PHONG PHÚ HƠN ===
  // Thứ 2
  { name: 'Power Yoga Sáng', type: 'Yoga', trainer: 'Li Wei-Hsuan', day: 'Thứ 2', time: '07:00', duration: '60 phút', room: 'Studio 1', capacity: 25, booked: 10 },
  { name: 'Cycling Đốt Calo', type: 'Cycling', trainer: 'Mateo Silva', day: 'Thứ 2', time: '08:30', duration: '45 phút', room: 'Spinning Room', capacity: 20, booked: 14 },
  { name: 'Pilates Core Strength', type: 'Pilates', trainer: 'Trần Thị BÍCH', day: 'Thứ 2', time: '10:00', duration: '60 phút', room: 'Studio 3', capacity: 15, booked: 8 },
  { name: 'HIIT Tabata Chiều', type: 'HIIT', trainer: 'Marcus Adebayo', day: 'Thứ 2', time: '16:30', duration: '30 phút', room: 'Studio 2', capacity: 20, booked: 16 },
  
  // Thứ 3
  { name: 'Yoga Thiền Định', type: 'Yoga', trainer: 'Yuki Tanaka', day: 'Thứ 3', time: '06:00', duration: '60 phút', room: 'Studio 1', capacity: 20, booked: 12 },
  { name: 'Zumba Latin Fire', type: 'Zumba', trainer: 'Sarah Jenkins', day: 'Thứ 3', time: '09:00', duration: '60 phút', room: 'Studio 2', capacity: 30, booked: 22 },
  { name: 'Body Pump Toàn Thân', type: 'Body Pump', trainer: 'Nguyễn Văn AN', day: 'Thứ 3', time: '17:30', duration: '60 phút', room: 'Studio 1', capacity: 25, booked: 15 },
  { name: 'Cycling Night Ride', type: 'Cycling', trainer: 'Mateo Silva', day: 'Thứ 3', time: '19:30', duration: '45 phút', room: 'Spinning Room', capacity: 18, booked: 18 },
  
  // Thứ 4
  { name: 'Ashtanga Yoga', type: 'Yoga', trainer: 'Li Wei-Hsuan', day: 'Thứ 4', time: '06:30', duration: '75 phút', room: 'Studio 1', capacity: 20, booked: 15 },
  { name: 'HIIT Circuit Training', type: 'HIIT', trainer: 'Aisha Bello', day: 'Thứ 4', time: '08:00', duration: '45 phút', room: 'Studio 2', capacity: 20, booked: 12 },
  { name: 'Zumba Kids & Teens', type: 'Zumba', trainer: 'Sarah Jenkins', day: 'Thứ 4', time: '15:00', duration: '45 phút', room: 'Studio 3', capacity: 25, booked: 18 },
  { name: 'Body Pump Heavy', type: 'Body Pump', trainer: 'Kim Min-ho', day: 'Thứ 4', time: '18:30', duration: '60 phút', room: 'Studio 1', capacity: 25, booked: 20 },
  { name: 'Pilates Reformer', type: 'Pilates', trainer: 'Nguyễn Thị Mai', day: 'Thứ 4', time: '20:00', duration: '60 phút', room: 'Studio 3', capacity: 12, booked: 10 },
  
  // Thứ 5
  { name: 'Sunrise Yoga', type: 'Yoga', trainer: 'Yuki Tanaka', day: 'Thứ 5', time: '05:30', duration: '60 phút', room: 'Studio 1', capacity: 20, booked: 8 },
  { name: 'Cycling Endurance', type: 'Cycling', trainer: 'Trần Quốc Cường', day: 'Thứ 5', time: '07:30', duration: '60 phút', room: 'Spinning Room', capacity: 18, booked: 14 },
  { name: 'Zumba Toning', type: 'Zumba', trainer: 'Sarah Jenkins', day: 'Thứ 5', time: '10:00', duration: '60 phút', room: 'Studio 2', capacity: 30, booked: 20 },
  { name: 'Body Pump Express', type: 'Body Pump', trainer: 'Alexander Schmidt', day: 'Thứ 5', time: '12:00', duration: '30 phút', room: 'Studio 1', capacity: 20, booked: 16 },
  { name: 'HIIT Bootcamp', type: 'HIIT', trainer: 'Marcus Adebayo', day: 'Thứ 5', time: '17:00', duration: '45 phút', room: 'Studio 2', capacity: 25, booked: 22 },
  { name: 'Pilates Stretching', type: 'Pilates', trainer: 'Nguyễn Thị Mai', day: 'Thứ 5', time: '20:00', duration: '60 phút', room: 'Studio 3', capacity: 15, booked: 9 },
  
  // Thứ 6
  { name: 'Yoga Flow & Breathe', type: 'Yoga', trainer: 'Li Wei-Hsuan', day: 'Thứ 6', time: '06:00', duration: '60 phút', room: 'Studio 1', capacity: 25, booked: 18 },
  { name: 'Cycling Sprint', type: 'Cycling', trainer: 'Mateo Silva', day: 'Thứ 6', time: '08:00', duration: '30 phút', room: 'Spinning Room', capacity: 18, booked: 15 },
  { name: 'Zumba Mega Party', type: 'Zumba', trainer: 'Sarah Jenkins', day: 'Thứ 6', time: '17:00', duration: '60 phút', room: 'Studio 2', capacity: 35, booked: 28 },
  { name: 'Body Pump Challenge', type: 'Body Pump', trainer: 'Kim Min-ho', day: 'Thứ 6', time: '19:00', duration: '60 phút', room: 'Studio 1', capacity: 25, booked: 20 },
  
  // Thứ 7
  { name: 'Yoga Nâng Cao', type: 'Yoga', trainer: 'Yuki Tanaka', day: 'Thứ 7', time: '07:00', duration: '90 phút', room: 'Studio 1', capacity: 20, booked: 16 },
  { name: 'HIIT Weekend Warrior', type: 'HIIT', trainer: 'Aisha Bello', day: 'Thứ 7', time: '09:00', duration: '45 phút', room: 'Studio 2', capacity: 25, booked: 20 },
  { name: 'Cycling Weekend', type: 'Cycling', trainer: 'Trần Quốc Cường', day: 'Thứ 7', time: '10:30', duration: '60 phút', room: 'Spinning Room', capacity: 18, booked: 14 },
  { name: 'Pilates Advanced', type: 'Pilates', trainer: 'Trần Thị BÍCH', day: 'Thứ 7', time: '14:00', duration: '60 phút', room: 'Studio 3', capacity: 12, booked: 8 },
  { name: 'Body Pump Weekend', type: 'Body Pump', trainer: 'Alexander Schmidt', day: 'Thứ 7', time: '16:00', duration: '60 phút', room: 'Studio 1', capacity: 25, booked: 18 },
  
  // CN
  { name: 'Yoga & Meditation', type: 'Yoga', trainer: 'Li Wei-Hsuan', day: 'CN', time: '07:00', duration: '90 phút', room: 'Studio 1', capacity: 25, booked: 20 },
  { name: 'Zumba Sunday Vibes', type: 'Zumba', trainer: 'Sarah Jenkins', day: 'CN', time: '09:00', duration: '60 phút', room: 'Studio 2', capacity: 35, booked: 30 },
  { name: 'HIIT Express Sunday', type: 'HIIT', trainer: 'Marcus Adebayo', day: 'CN', time: '10:30', duration: '30 phút', room: 'Studio 2', capacity: 20, booked: 16 },
  { name: 'Pilates Relax', type: 'Pilates', trainer: 'Nguyễn Thị Mai', day: 'CN', time: '14:00', duration: '60 phút', room: 'Studio 3', capacity: 15, booked: 10 },
  { name: 'Cycling Recovery', type: 'Cycling', trainer: 'Mateo Silva', day: 'CN', time: '16:00', duration: '45 phút', room: 'Spinning Room', capacity: 18, booked: 12 },
];

async function seed() {
  console.log('Seeding classes...');
  
  const { data, error } = await supabase
    .from('fitnexus_classes')
    .insert(newClasses)
    .select();
    
  if (error) {
    console.log('Error:', error.message);
  } else {
    console.log('Done! Inserted', data.length, 'classes');
  }
}

seed();
