'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Star, Calendar, Filter } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

// Default trainers data (used when DB is empty)
const DEFAULT_TRAINERS = [
  {
    id: 1,
    name: 'Trần Quốc Cường',
    specialty: 'Sức mạnh & Tăng cơ',
    image: '/trainers/cuong.png',
    rating: 4.9,
    description: 'Chuyên gia về sức mạnh và tăng cơ với hơn 8 năm kinh nghiệm. Đã giúp hơn 500 hội viên đạt được mục tiêu thể hình.',
    tags: ['Sức mạnh', 'Tăng cơ', 'Powerlifting'],
    experience_years: 8,
    students_count: 500,
    tag_color: 'primary',
    status: 'active'
  },
  {
    id: 2,
    name: 'Nguyễn Thị Mai',
    specialty: 'Thể hình nữ & Giảm mỡ',
    image: '/trainers/mai.png',
    rating: 5.0,
    description: 'Chuyên gia thể hình nữ với chế độ dinh dưỡng cá nhân hóa. Giúp chị em tự tin với vóc dáng chuẩn trong dịp Tết.',
    tags: ['Giảm mỡ', 'Body Shape', 'Dinh dưỡng'],
    experience_years: 6,
    students_count: 350,
    tag_color: 'pink',
    status: 'active'
  },
  {
    id: 3,
    name: 'Kim Min-ho',
    specialty: 'Hình thể chuẩn Idol',
    image: '/trainers/minho.png',
    rating: 4.9,
    description: 'HLV đến từ Hàn Quốc, chuyên xây dựng hình thể chuẩn idol K-pop. Phương pháp tập luyện khoa học, hiệu quả nhanh.',
    tags: ['Body Line', 'Aesthetic', 'K-Fitness'],
    experience_years: 7,
    students_count: 420,
    tag_color: 'blue',
    status: 'active'
  },
  {
    id: 4,
    name: 'Yuki Tanaka',
    specialty: 'Thể hình & Dẻo dai',
    image: '/trainers/yuki.png',
    rating: 5.0,
    description: 'HLV người Nhật chuyên kết hợp thể hình và yoga, giúp tăng sức mạnh đồng thời duy trì sự dẻo dai và linh hoạt.',
    tags: ['Flexibility', 'Yoga', 'Pilates'],
    experience_years: 10,
    students_count: 600,
    tag_color: 'purple',
    status: 'active'
  },
  {
    id: 5,
    name: 'Marcus Adebayo',
    specialty: 'Sức mạnh vượt trội',
    image: '/trainers/marcus.png',
    rating: 4.8,
    description: 'Biệt danh "The Machine" – chuyên gia sức mạnh với phương pháp huấn luyện cường độ cao, giúp bạn vượt qua giới hạn bản thân.',
    tags: ['Strength', 'CrossFit', 'HIIT'],
    experience_years: 12,
    students_count: 800,
    tag_color: 'orange',
    status: 'active'
  },
  {
    id: 6,
    name: 'Aisha Bello',
    specialty: 'Sức bền & Thể lực',
    image: '/trainers/aisha.png',
    rating: 4.9,
    description: 'HLV năng động chuyên về sức bền và thể lực toàn diện. Các lớp của Aisha luôn tràn đầy năng lượng và cảm hứng.',
    tags: ['Endurance', 'Cardio', 'Functional'],
    experience_years: 6,
    students_count: 380,
    tag_color: 'emerald',
    status: 'active'
  },
  {
    id: 7,
    name: 'Alexander Schmidt',
    specialty: 'Huấn luyện kỹ thuật',
    image: '/trainers/alexander.png',
    rating: 4.7,
    description: 'HLV người Đức chuyên nghiệp, tập trung vào kỹ thuật tập luyện chuẩn xác và chương trình periodization khoa học.',
    tags: ['Technique', 'Bodybuilding', 'Rehab'],
    experience_years: 15,
    students_count: 1000,
    tag_color: 'blue',
    status: 'active'
  },
  {
    id: 8,
    name: 'Sarah Jenkins',
    specialty: 'Group Fitness & Thể hình nữ',
    image: '/trainers/sarah.png',
    rating: 4.9,
    description: 'HLV năng nổ dẫn dắt các lớp tập nhóm. Chuyên về thể hình nữ với phương pháp vui nhộn nhưng hiệu quả cao.',
    tags: ['Group X', 'Zumba', 'Body Pump'],
    experience_years: 8,
    students_count: 650,
    tag_color: 'pink',
    status: 'active'
  },
  {
    id: 9,
    name: 'Mateo Silva',
    specialty: 'Functional Training',
    image: '/trainers/mateo.png',
    rating: 4.8,
    description: 'HLV người Brazil năng động, chuyên về huấn luyện chức năng và thể hình ngoài trời. Mang đến năng lượng tích cực.',
    tags: ['Functional', 'Outdoor', 'Calisthenics'],
    experience_years: 9,
    students_count: 450,
    tag_color: 'orange',
    status: 'active'
  },
  {
    id: 10,
    name: 'Li Wei-Hsuan',
    specialty: 'Yoga & Thể hình nữ',
    image: '/trainers/liwei.png',
    rating: 5.0,
    description: 'HLV gốc Đài Loan-Việt, kết hợp yoga và thể hình cho nữ giới, mang đến sự cân bằng giữa sức mạnh và uyển chuyển.',
    tags: ['Yoga', 'Women Fitness', 'Meditation'],
    experience_years: 7,
    students_count: 380,
    tag_color: 'purple',
    status: 'active'
  },
];

const TAG_COLORS: Record<string, string> = {
  primary: 'bg-primary/10 text-primary ring-primary/20',
  pink: 'bg-pink-500/10 text-pink-400 ring-pink-500/20',
  blue: 'bg-blue-500/10 text-blue-400 ring-blue-500/20',
  purple: 'bg-purple-500/10 text-purple-400 ring-purple-500/20',
  orange: 'bg-orange-500/10 text-orange-400 ring-orange-500/20',
  emerald: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
  default: 'bg-primary/10 text-primary ring-primary/20',
};

export default function HuanLuyenVienPage() {
  const [trainers, setTrainers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const { data, error } = await supabase
          .from('fitnexus_trainers')
          .select('*')
          .eq('status', 'active')
          .order('id', { ascending: true });

        if (!error && data && data.length > 0) {
          setTrainers(data);
        } else {
          // Auto-insert default trainers
          try {
            const insertData = DEFAULT_TRAINERS.map(t => ({
              name: t.name,
              specialty: t.specialty,
              image: t.image,
              rating: t.rating,
              description: t.description,
              tags: t.tags,
              experience_years: t.experience_years,
              students_count: t.students_count,
              status: t.status
            }));
            
            const { data: newTrainers, error: insertError } = await supabase
              .from('fitnexus_trainers')
              .insert(insertData)
              .select();
              
            if (!insertError && newTrainers) {
              setTrainers(newTrainers);
            } else {
              setTrainers(DEFAULT_TRAINERS);
            }
          } catch (e) {
            console.error('Error inserting default trainers:', e);
            setTrainers(DEFAULT_TRAINERS);
          }
        }
      } catch (err) {
        console.error('Error fetching trainers:', err);
        setTrainers(DEFAULT_TRAINERS);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrainers();
  }, []);

  return (
    <div className="relative flex flex-col min-h-screen w-full">
      <Navbar />

      {/* Hero Section */}
      <section className="relative isolate overflow-hidden px-6 py-12 sm:py-20 lg:px-8">
        <div className="absolute inset-0 -z-10 opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/30 via-background-dark to-background-dark"></div>
        
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-4">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                Chuyên gia hàng đầu
              </div>
              <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl mb-4">
                Đội Ngũ <span className="text-gold-gradient">Huấn Luyện Viên</span> Đẳng Cấp
              </h1>
              <p className="text-lg leading-8 text-gray-300 max-w-xl">
                Đội ngũ chuyên gia của chúng tôi không chỉ là người hướng dẫn, mà còn là người truyền cảm hứng, đồng hành cùng bạn chinh phục mọi giới hạn thể hình.
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/lich-tap"
                className="flex h-10 items-center gap-2 rounded-lg border border-[#482329] bg-[#33191e] px-4 text-sm font-medium text-white transition-colors hover:border-primary hover:bg-[#482329]"
              >
                <Calendar className="w-4 h-4" />
                Xem lịch tập
              </Link>
            </div>
          </div>

          {/* Trainers Grid */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
              {trainers.map((trainer) => {
                const tagColor = TAG_COLORS[trainer.tag_color] || TAG_COLORS.default;
                const tags = Array.isArray(trainer.tags) 
                  ? trainer.tags 
                  : (typeof trainer.tags === 'string' ? trainer.tags.split(',') : ['Fitness']);

                return (
                  <Link 
                    key={trainer.id} 
                    href={`/huan-luyen-vien/${trainer.id}`}
                    className="group relative flex flex-col overflow-hidden rounded-2xl bg-[#2a1519] border border-[#482329] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_10px_40px_-10px_rgba(198,16,46,0.3)]"
                  >
                    <div className="relative aspect-[3/4] w-full overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-[#221114] via-transparent to-transparent opacity-60 z-10 transition-opacity group-hover:opacity-40"></div>
                      <Image
                        src={trainer.image || '/trainers/cuong.png'}
                        alt={`HLV ${trainer.name}`}
                        fill
                        className="object-cover object-top transition-transform duration-700 group-hover:scale-110"
                      />
                      {/* Hover Overlay with Gold button */}
                      <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100">
                        <span className="transform translate-y-4 rounded-full bg-gradient-to-r from-[#bf953f] to-[#aa771c] px-6 py-2.5 text-sm font-bold text-black shadow-lg transition-all duration-300 group-hover:translate-y-0">
                          Xem chi tiết
                        </span>
                      </div>
                    </div>
                    <div className="relative z-10 flex flex-1 flex-col justify-end p-5">
                      <div className="mb-1 flex items-center gap-2">
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${tagColor}`}>
                          {trainer.specialty}
                        </span>
                        {Number(trainer.rating) >= 4.9 && (
                          <Star className="text-yellow-500 w-4 h-4 fill-yellow-500" />
                        )}
                      </div>
                      <h3 className="mt-2 text-xl font-bold text-white group-hover:text-primary transition-colors">
                        {trainer.name}
                      </h3>
                      <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                        {trainer.description || `Huấn luyện viên chuyên nghiệp tại GymVerse.`}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Promotion Banner */}
      <section className="px-6 pb-12 sm:pb-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-2xl bg-[#33191e] shadow-2xl ring-1 ring-white/10">
            <div className="flex flex-col lg:flex-row">
              <div className="relative w-full lg:w-1/2 aspect-video lg:aspect-auto min-h-[300px]">
                <Image
                  src="https://images.unsplash.com/photo-1550345332-09e3ac987658?q=80&w=1374&auto=format&fit=crop"
                  alt="Personal Training"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#33191e]/0 to-[#33191e] hidden lg:block"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#33191e] to-[#33191e]/0 lg:hidden"></div>
              </div>
              <div className="flex w-full lg:w-1/2 flex-col justify-center p-8 lg:p-12">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-accent text-lg">🏆</span>
                  <span className="text-sm font-semibold tracking-wide text-accent uppercase">
                    Chương trình đặc biệt
                  </span>
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-4">
                  Tập Luyện Cá Nhân Hóa <br /> Đón Tết Ất Tỵ
                </h2>
                <p className="text-gray-300 mb-8 text-lg">
                  Đăng ký ngay hôm nay để nhận ưu đãi Tết đặc biệt giảm{' '}
                  <span className="text-primary font-bold">30%</span> cho gói tập 1:1 cùng chuyên gia.
                  Cam kết thay đổi vóc dáng trong 90 ngày.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/lien-he"
                    className="flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-red-700 transition-colors"
                  >
                    Tư vấn ngay
                  </Link>
                  <Link
                    href="/goi-tap"
                    className="flex items-center justify-center rounded-lg border border-white/20 px-6 py-3 text-sm font-bold text-white hover:bg-white/5 transition-colors"
                  >
                    Tìm hiểu thêm
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
