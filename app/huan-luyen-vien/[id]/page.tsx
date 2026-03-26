'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Star, Calendar, MessageCircle, Award, Users, Clock, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// Fallback trainer data
const FALLBACK_TRAINERS: Record<string, any> = {
  '1': { id: 1, name: 'Trần Quốc Cường', specialty: 'Sức mạnh & Tăng cơ', image: '/trainers/cuong.png', rating: 4.9, description: 'Chuyên gia về sức mạnh và tăng cơ với hơn 8 năm kinh nghiệm. Đã giúp hơn 500 hội viên đạt được mục tiêu thể hình.', tags: ['Sức mạnh', 'Tăng cơ', 'Powerlifting'], experience_years: 8, students_count: 500 },
  '2': { id: 2, name: 'Nguyễn Thị Mai', specialty: 'Thể hình nữ & Giảm mỡ', image: '/trainers/mai.png', rating: 5.0, description: 'Chuyên gia thể hình nữ với chế độ dinh dưỡng cá nhân hóa.', tags: ['Giảm mỡ', 'Body Shape', 'Dinh dưỡng'], experience_years: 6, students_count: 350 },
  '3': { id: 3, name: 'Kim Min-ho', specialty: 'Hình thể chuẩn Idol', image: '/trainers/minho.png', rating: 4.9, description: 'HLV đến từ Hàn Quốc, chuyên xây dựng hình thể chuẩn idol K-pop.', tags: ['Body Line', 'Aesthetic', 'K-Fitness'], experience_years: 7, students_count: 420 },
  '4': { id: 4, name: 'Yuki Tanaka', specialty: 'Thể hình & Dẻo dai', image: '/trainers/yuki.png', rating: 5.0, description: 'HLV người Nhật chuyên kết hợp thể hình và yoga.', tags: ['Flexibility', 'Yoga', 'Pilates'], experience_years: 10, students_count: 600 },
  '5': { id: 5, name: 'Marcus Adebayo', specialty: 'Sức mạnh vượt trội', image: '/trainers/marcus.png', rating: 4.8, description: 'Biệt danh "The Machine" – chuyên gia sức mạnh cường độ cao.', tags: ['Strength', 'CrossFit', 'HIIT'], experience_years: 12, students_count: 800 },
  '6': { id: 6, name: 'Aisha Bello', specialty: 'Sức bền & Thể lực', image: '/trainers/aisha.png', rating: 4.9, description: 'HLV năng động chuyên về sức bền và thể lực toàn diện.', tags: ['Endurance', 'Cardio', 'Functional'], experience_years: 6, students_count: 380 },
  '7': { id: 7, name: 'Alexander Schmidt', specialty: 'Huấn luyện kỹ thuật', image: '/trainers/alexander.png', rating: 4.7, description: 'HLV người Đức chuyên nghiệp, tập trung vào kỹ thuật tập luyện chuẩn xác.', tags: ['Technique', 'Bodybuilding', 'Rehab'], experience_years: 15, students_count: 1000 },
  '8': { id: 8, name: 'Sarah Jenkins', specialty: 'Group Fitness & Thể hình nữ', image: '/trainers/sarah.png', rating: 4.9, description: 'HLV năng nổ dẫn dắt các lớp tập nhóm.', tags: ['Group X', 'Zumba', 'Body Pump'], experience_years: 8, students_count: 650 },
  '9': { id: 9, name: 'Mateo Silva', specialty: 'Functional Training', image: '/trainers/mateo.png', rating: 4.8, description: 'HLV người Brazil năng động, chuyên về huấn luyện chức năng.', tags: ['Functional', 'Outdoor', 'Calisthenics'], experience_years: 9, students_count: 450 },
  '10': { id: 10, name: 'Li Wei-Hsuan', specialty: 'Yoga & Thể hình nữ', image: '/trainers/liwei.png', rating: 5.0, description: 'HLV gốc Đài Loan-Việt, kết hợp yoga và thể hình cho nữ giới.', tags: ['Yoga', 'Women Fitness', 'Meditation'], experience_years: 7, students_count: 380 },
};

export default function TrainerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [trainer, setTrainer] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrainer = async () => {
      const trainerId = params.id as string;
      try {
        // Try fetching by numeric ID first
        const numId = Number(trainerId);
        let foundTrainer = null;
        
        if (!isNaN(numId)) {
          const { data, error } = await supabase
            .from('fitnexus_trainers')
            .select('*')
            .eq('id', numId)
            .single();
          
          if (!error && data) {
            foundTrainer = data;
          }
        }
        
        // If not found by numeric ID, try as-is (for UUID or other ID types)
        if (!foundTrainer) {
          const { data, error } = await supabase
            .from('fitnexus_trainers')
            .select('*')
            .eq('id', trainerId)
            .single();
          
          if (!error && data) {
            foundTrainer = data;
          }
        }
        
        // Fallback to static data
        if (!foundTrainer && FALLBACK_TRAINERS[trainerId]) {
          foundTrainer = FALLBACK_TRAINERS[trainerId];
        }
        
        setTrainer(foundTrainer);

        // Fetch reviews
        const { data: reviewData } = await supabase
          .from('fitnexus_reviews')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(4);

        if (reviewData) {
          setReviews(reviewData);
        }
      } catch (err) {
        console.error('Error fetching trainer:', err);
        // Use fallback
        if (FALLBACK_TRAINERS[trainerId]) {
          setTrainer(FALLBACK_TRAINERS[trainerId]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchTrainer();
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!trainer) {
    return (
      <div className="min-h-screen bg-background-dark flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Không tìm thấy HLV</h2>
            <Link href="/huan-luyen-vien" className="text-primary hover:underline">
              ← Quay lại danh sách HLV
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const tags = Array.isArray(trainer.tags)
    ? trainer.tags
    : typeof trainer.tags === 'string'
    ? trainer.tags.split(',')
    : ['Fitness'];

  return (
    <div className="relative flex flex-col min-h-screen w-full">
      {/* Background decorative elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/5 blur-[100px] rounded-full"></div>
      </div>

      <Navbar />

      <main className="flex-1 z-10 relative">
        <div className="max-w-[960px] mx-auto px-4 md:px-10 py-8">
          {/* Breadcrumb */}
          <div className="flex flex-wrap justify-between gap-3 mb-6">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-accent/80 text-sm font-medium uppercase tracking-wider mb-1">
                <Award className="w-4 h-4" />
                <span>GYMVERSE Elite Trainer</span>
              </div>
              <h2 className="text-white tracking-tight text-3xl md:text-4xl font-bold leading-tight">
                Thông Tin Huấn Luyện Viên
              </h2>
              <p className="text-slate-400 text-sm font-normal leading-normal">
                Chương trình Tết Ất Tỵ 2026 - Khởi đầu mới, Vóc dáng mới
              </p>
            </div>
            <Link
              href="/huan-luyen-vien"
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm self-start"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại
            </Link>
          </div>

          {/* Main Trainer Card */}
          <div className="flex flex-col md:flex-row gap-6 p-4 md:p-6 rounded-xl bg-surface-dark/50 backdrop-blur-sm border border-white/5 shadow-xl">
            {/* Image Section */}
            <div className="w-full md:w-1/3 flex flex-col gap-4">
              <div className="aspect-[3/4] w-full rounded-lg overflow-hidden shadow-lg relative group">
                <Image
                  src={trainer.image || '/trainers/cuong.png'}
                  alt={`HLV ${trainer.name}`}
                  fill
                  className="object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                <div className="absolute bottom-4 left-4">
                  <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-accent text-xs font-bold border border-accent/20">
                    <Award className="w-3 h-3" />
                    <span>Verified Pro</span>
                  </div>
                </div>
              </div>
              {/* Stats row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#3a2226] p-3 rounded-lg text-center border border-primary/20">
                  <p className="text-2xl font-bold text-white">{trainer.experience_years || 5}+</p>
                  <p className="text-xs text-slate-400">Năm kinh nghiệm</p>
                </div>
                <div className="bg-[#3a2226] p-3 rounded-lg text-center border border-primary/20">
                  <p className="text-2xl font-bold text-white">{trainer.students_count || 100}+</p>
                  <p className="text-xs text-slate-400">Học viên</p>
                </div>
              </div>
            </div>

            {/* Info Section */}
            <div className="w-full md:w-2/3 flex flex-col gap-5">
              <div className="flex flex-col border-b border-white/10 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-white text-3xl font-bold leading-tight tracking-tight mb-1">
                      {trainer.name}
                    </h3>
                    <p className="text-primary text-lg font-medium">{trainer.specialty}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1 text-accent">
                      <Star className="w-5 h-5 fill-accent" />
                      <span className="text-xl font-bold">{trainer.rating || '5.0'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <h4 className="text-white text-lg font-semibold flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Giới thiệu
                </h4>
                <p className="text-slate-300 text-base font-light leading-relaxed">
                  {trainer.description ||
                    `Chào mừng bạn đến với GymVerse! Huấn luyện viên chuyên nghiệp với nhiều năm kinh nghiệm trong lĩnh vực thể hình.`}
                </p>
              </div>

              {/* Skills */}
              <div className="space-y-3 pt-2">
                <h4 className="text-white text-lg font-semibold flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  Chuyên Môn & Kỹ Năng
                </h4>
                <div className="flex gap-2 flex-wrap">
                  {tags.map((tag: string, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center gap-x-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 hover:bg-primary/20 transition-colors cursor-default"
                    >
                      <p className="text-slate-200 text-sm font-medium">{tag.trim()}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Schedule Preview */}
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-white text-lg font-semibold flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Lịch Trống Tuần Này
                  </h4>
                  <span className="text-xs text-slate-400">Cập nhật: Hôm nay</span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-center">
                  <div className="bg-surface-dark p-2 rounded border border-white/5">
                    <p className="text-xs text-slate-400 mb-1">Thứ 2</p>
                    <p className="text-sm font-bold text-white">09:00</p>
                  </div>
                  <div className="bg-surface-dark p-2 rounded border border-white/5">
                    <p className="text-xs text-slate-400 mb-1">Thứ 3</p>
                    <p className="text-sm font-bold text-white">Full</p>
                  </div>
                  <div className="bg-surface-dark p-2 rounded border border-white/5 opacity-50">
                    <p className="text-xs text-slate-400 mb-1">Thứ 4</p>
                    <p className="text-sm font-bold text-slate-500">---</p>
                  </div>
                  <div className="bg-surface-dark p-2 rounded border border-white/5">
                    <p className="text-xs text-slate-400 mb-1">Thứ 5</p>
                    <p className="text-sm font-bold text-white">16:30</p>
                  </div>
                  <div className="bg-surface-dark p-2 rounded border border-white/5">
                    <p className="text-xs text-slate-400 mb-1">Thứ 6</p>
                    <p className="text-sm font-bold text-white">18:00</p>
                  </div>
                </div>
              </div>

              {/* CTA Actions */}
              <div className="mt-auto pt-6 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={async () => {
                    // Check login status
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session?.user?.email) {
                      alert('Bạn cần đăng nhập để đặt lịch tập!');
                      router.push('/dang-nhap');
                      return;
                    }
                    // Check if user has an active plan
                    const { data: orders } = await supabase
                      .from('fitnexus_orders')
                      .select('*')
                      .eq('user_email', session.user.email)
                      .eq('status', 'paid')
                      .limit(1);
                    if (!orders || orders.length === 0) {
                      alert('Bạn chưa có gói tập! Vui lòng chọn gói tập trước khi đặt lịch.');
                      router.push('/goi-tap');
                      return;
                    }
                    // Has plan → go to schedule
                    router.push('/lich-tap');
                  }}
                  className="flex-1 h-12 flex items-center justify-center gap-2 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold transition-all shadow-[0_0_20px_rgba(198,16,46,0.4)] hover:shadow-[0_0_30px_rgba(198,16,46,0.6)] cursor-pointer"
                >
                  <Calendar className="w-5 h-5" />
                  <span>Đặt Lịch Ngay</span>
                </button>
                <Link
                  href="/lien-he"
                  className="h-12 px-6 flex items-center justify-center gap-2 rounded-lg border border-white/10 hover:border-accent/50 bg-transparent hover:bg-accent/10 text-white font-medium transition-all"
                >
                  <MessageCircle className="w-5 h-5 text-accent" />
                  <span>Nhắn Tin</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          {reviews.length > 0 && (
            <div className="mt-8">
              <h3 className="text-white text-xl font-bold mb-4 px-4 flex justify-between items-center">
                <span>Đánh Giá Mới Nhất</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4">
                {reviews.slice(0, 4).map((review) => (
                  <div key={review.id} className="bg-surface-dark p-4 rounded-lg border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                          {review.user_email?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{review.user_email?.split('@')[0] || 'Học viên'}</p>
                          <p className="text-xs text-slate-400">Thành viên</p>
                        </div>
                      </div>
                      <div className="flex text-accent text-xs">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < (review.rating || 5) ? 'fill-accent' : 'text-slate-600'}`} />
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-300 text-sm">{review.content || review.comment || 'Dịch vụ rất tốt!'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
