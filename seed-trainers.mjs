import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://dslxsooykqgarmgxdiup.supabase.co',
  'sb_publishable_1PzNTiSP8OMDT1rqbCC9RQ_irswmjBX'
);

const trainers = [
  { name: 'Trần Quốc Cường', specialty: 'Sức mạnh & Tăng cơ', rating: 4.9, description: 'Chuyên gia về sức mạnh và tăng cơ với hơn 8 năm kinh nghiệm. Đã giúp hơn 500 hội viên đạt được mục tiêu thể hình.', tags: ['Sức mạnh', 'Tăng cơ', 'Powerlifting'], experience_years: 8, students_count: 500, status: 'active' },
  { name: 'Nguyễn Thị Mai', specialty: 'Thể hình nữ & Giảm mỡ', rating: 5.0, description: 'Chuyên gia thể hình nữ với chế độ dinh dưỡng cá nhân hóa. Giúp chị em tự tin với vóc dáng chuẩn trong dịp Tết.', tags: ['Giảm mỡ', 'Body Shape', 'Dinh dưỡng'], experience_years: 6, students_count: 350, status: 'active' },
  { name: 'Kim Min-ho', specialty: 'Hình thể chuẩn Idol', rating: 4.9, description: 'HLV đến từ Hàn Quốc, chuyên xây dựng hình thể chuẩn idol K-pop. Phương pháp tập luyện khoa học, hiệu quả nhanh.', tags: ['Body Line', 'Aesthetic', 'K-Fitness'], experience_years: 7, students_count: 420, status: 'active' },
  { name: 'Yuki Tanaka', specialty: 'Thể hình & Dẻo dai', rating: 5.0, description: 'HLV người Nhật chuyên kết hợp thể hình và yoga, giúp tăng sức mạnh đồng thời duy trì sự dẻo dai và linh hoạt.', tags: ['Flexibility', 'Yoga', 'Pilates'], experience_years: 10, students_count: 600, status: 'active' },
  { name: 'Marcus Adebayo', specialty: 'Sức mạnh vượt trội', rating: 4.8, description: 'Biệt danh "The Machine" – chuyên gia sức mạnh với phương pháp huấn luyện cường độ cao, giúp bạn vượt qua giới hạn bản thân.', tags: ['Strength', 'CrossFit', 'HIIT'], experience_years: 12, students_count: 800, status: 'active' },
  { name: 'Aisha Bello', specialty: 'Sức bền & Thể lực', rating: 4.9, description: 'HLV năng động chuyên về sức bền và thể lực toàn diện. Các lớp của Aisha luôn tràn đầy năng lượng và cảm hứng.', tags: ['Endurance', 'Cardio', 'Functional'], experience_years: 6, students_count: 380, status: 'active' },
  { name: 'Alexander Schmidt', specialty: 'Huấn luyện kỹ thuật', rating: 4.7, description: 'HLV người Đức chuyên nghiệp, tập trung vào kỹ thuật tập luyện chuẩn xác và chương trình periodization khoa học.', tags: ['Technique', 'Bodybuilding', 'Rehab'], experience_years: 15, students_count: 1000, status: 'active' },
  { name: 'Sarah Jenkins', specialty: 'Group Fitness & Thể hình nữ', rating: 4.9, description: 'HLV năng nổ dẫn dắt các lớp tập nhóm. Chuyên về thể hình nữ với phương pháp vui nhộn nhưng hiệu quả cao.', tags: ['Group X', 'Zumba', 'Body Pump'], experience_years: 8, students_count: 650, status: 'active' },
  { name: 'Mateo Silva', specialty: 'Functional Training', rating: 4.8, description: 'HLV người Brazil năng động, chuyên về huấn luyện chức năng và thể hình ngoài trời. Mang đến năng lượng tích cực.', tags: ['Functional', 'Outdoor', 'Calisthenics'], experience_years: 9, students_count: 450, status: 'active' },
  { name: 'Li Wei-Hsuan', specialty: 'Yoga & Thể hình nữ', rating: 5.0, description: 'HLV gốc Đài Loan-Việt, kết hợp yoga và thể hình cho nữ giới, mang đến sự cân bằng giữa sức mạnh và uyển chuyển.', tags: ['Yoga', 'Women Fitness', 'Meditation'], experience_years: 7, students_count: 380, status: 'active' },
];

async function seed() {
  console.log('🚀 Đang seed 10 HLV vào fitnexus_trainers...');
  
  const { data, error } = await supabase
    .from('fitnexus_trainers')
    .insert(trainers)
    .select();
  
  if (error) {
    console.error('❌ Lỗi:', error.message);
  } else {
    console.log(`✅ Thành công! Đã thêm ${data.length} HLV:`);
    data.forEach((t, i) => console.log(`  ${i+1}. [ID: ${t.id}] ${t.name} - ${t.specialty} ⭐${t.rating}`));
  }
}

seed();
