import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Sparkles, ArrowRight, User, Users, Dumbbell, Award, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import PlanButton from '@/components/PlanButton';

export const revalidate = 0;

// Features mapping for homepage display
const planFeatures: Record<string, string[]> = {
  'basic': ['Truy cập khung giờ thấp điểm (9:00 - 16:00)', '1 buổi định hướng cùng HLV', 'Tủ đồ tiêu chuẩn'],
  'standard': ['Truy cập mọi khung giờ', '3 buổi định hướng cùng HLV', 'Khăn tập & Tủ đồ miễn phí', 'Tham gia các lớp Group X'],
  'premium': ['Truy cập tất cả chi nhánh', 'HLV cá nhân 2 buổi/tuần', 'Xông hơi & Jacuzzi thư giãn', 'Nước uống Detox miễn phí'],
  'vip': ['Quyền lợi gói Premium +', 'HLV 1-1 không giới hạn', 'Khu vực VIP riêng biệt', 'PT kèm 1-1 không giới hạn'],
};

function getFeaturesForPlan(planName: string): string[] {
  const key = planName.toLowerCase();
  for (const [k, v] of Object.entries(planFeatures)) {
    if (key.includes(k)) return v;
  }
  return ['Tập gym không giới hạn', 'Tủ đồ tiêu chuẩn', 'Miễn phí gửi xe'];
}

export default async function Home() {
  const { data: plans } = await supabase
    .from('fitnexus_plans')
    .select('*')
    .eq('status', 'active')
    .order('id', { ascending: true })
    .limit(3);

  const displayPlans = plans && plans.length > 0 ? plans : [];

  return (
    <div className="relative flex flex-col min-h-screen w-full">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <div className="relative w-full overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0" 
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop')" }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/80 to-background-dark/40"></div>
          </div>
          
          <div className="relative z-10 px-6 py-20 md:px-10 lg:px-20 lg:py-32 flex flex-col items-center text-center max-w-7xl mx-auto">
            <div className="mb-6 flex items-center gap-2 px-4 py-1.5 rounded-full border border-accent/30 bg-accent/5 backdrop-blur-md">
              <Sparkles className="text-accent w-4 h-4" />
              <span className="text-accent text-xs font-semibold tracking-wider uppercase">Tết Ất Tỵ 2026 - Year of the Snake</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight text-white mb-6 drop-shadow-xl max-w-4xl">
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400">Khởi đầu năm mới</span>
              <span className="block mt-2 text-gold-gradient" style={{ filter: 'drop-shadow(0 0 20px rgba(212, 175, 55, 0.3))' }}>Mạnh mẽ hơn bao giờ hết</span>
            </h1>
            
            <p className="text-slate-300 text-lg md:text-xl font-light leading-relaxed max-w-2xl mb-10">
              Đánh thức sức mạnh tiềm ẩn cùng GymVerse. Trải nghiệm không gian tập luyện đẳng cấp Dark Luxury và nhận lì xì ưu đãi lên đến 50%.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center items-center">
              <Link href="/goi-tap" className="w-full sm:w-auto min-w-[200px] h-14 px-8 rounded-xl bg-primary hover:bg-[#a00d25] text-white font-bold text-lg shadow-[0_0_20px_rgba(198,16,46,0.4)] transition-all transform hover:scale-105 flex items-center justify-center gap-2">
                <span>Khám phá gói tập</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/huan-luyen-vien" className="w-full sm:w-auto min-w-[200px] h-14 px-8 rounded-xl border border-accent text-accent hover:bg-accent hover:text-background-dark font-bold text-lg transition-all flex items-center justify-center gap-2 group">
                <span>Gặp huấn luyện viên</span>
                <User className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
          
          {/* Stats / Trust Badges */}
          <div className="relative z-10 w-full border-t border-white/5 bg-black/20 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-6 py-8 md:px-10 lg:px-20 grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="flex flex-col items-center md:items-start gap-1">
                <div className="flex items-center gap-2 text-accent mb-1">
                  <Users className="w-8 h-8" />
                  <span className="text-3xl font-bold">15K+</span>
                </div>
                <p className="text-slate-400 text-sm font-medium">Hội viên hài lòng</p>
              </div>
              <div className="flex flex-col items-center md:items-start gap-1">
                <div className="flex items-center gap-2 text-accent mb-1">
                  <Dumbbell className="w-8 h-8" />
                  <span className="text-3xl font-bold">500+</span>
                </div>
                <p className="text-slate-400 text-sm font-medium">Thiết bị cao cấp</p>
              </div>
              <div className="flex flex-col items-center md:items-start gap-1">
                <div className="flex items-center gap-2 text-accent mb-1">
                  <Award className="w-8 h-8" />
                  <span className="text-3xl font-bold">200+</span>
                </div>
                <p className="text-slate-400 text-sm font-medium">HLV Chuyên nghiệp</p>
              </div>
              <div className="flex flex-col items-center md:items-start gap-1">
                <div className="flex items-center gap-2 text-accent mb-1">
                  <Clock className="w-8 h-8" />
                  <span className="text-3xl font-bold">10 Năm</span>
                </div>
                <p className="text-slate-400 text-sm font-medium">Kinh nghiệm</p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-20 px-6 md:px-10 lg:px-20 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row gap-12 items-start">
            <div className="md:w-1/3 flex flex-col gap-6 sticky top-24">
              <h2 className="text-4xl md:text-5xl font-black text-white leading-tight">
                Dịch vụ <br/><span className="text-primary">Đẳng cấp 5 Sao</span>
              </h2>
              <p className="text-slate-400 text-lg">
                Không chỉ là tập luyện, GymVerse mang đến phong cách sống thượng lưu với những tiện ích đặc quyền dành riêng cho hội viên.
              </p>
              <Link href="/dich-vu" className="w-fit text-accent font-bold hover:text-white transition-colors flex items-center gap-2 group mt-4">
                Xem tất cả dịch vụ
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="group relative overflow-hidden rounded-2xl bg-surface-dark border border-white/5 hover:border-accent/50 transition-all duration-300">
                <div className="h-48 overflow-hidden">
                  <div className="w-full h-full bg-cover bg-center group-hover:scale-110 transition-transform duration-500" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1470&auto=format&fit=crop')" }}></div>
                </div>
                <div className="p-6">
                  <h3 className="text-white text-xl font-bold mb-2">Không gian Dark Luxury</h3>
                  <p className="text-slate-400 text-sm">Thiết kế nội thất sang trọng, ánh sáng nghệ thuật tạo cảm hứng tập luyện bất tận.</p>
                </div>
              </div>
              
              <div className="group relative overflow-hidden rounded-2xl bg-surface-dark border border-white/5 hover:border-accent/50 transition-all duration-300">
                <div className="h-48 overflow-hidden">
                  <div className="w-full h-full bg-cover bg-center group-hover:scale-110 transition-transform duration-500" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1470&auto=format&fit=crop')" }}></div>
                </div>
                <div className="p-6">
                  <h3 className="text-white text-xl font-bold mb-2">PT Cá nhân hóa 1:1</h3>
                  <p className="text-slate-400 text-sm">Lộ trình tập luyện khoa học được thiết kế riêng biệt theo thể trạng và mục tiêu của bạn.</p>
                </div>
              </div>
              
              <div className="group relative overflow-hidden rounded-2xl bg-surface-dark border border-white/5 hover:border-accent/50 transition-all duration-300">
                <div className="h-48 overflow-hidden">
                  <div className="w-full h-full bg-cover bg-center group-hover:scale-110 transition-transform duration-500" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1576678927484-cc907957088c?q=80&w=1374&auto=format&fit=crop')" }}></div>
                </div>
                <div className="p-6">
                  <h3 className="text-white text-xl font-bold mb-2">Công nghệ Technogym</h3>
                  <p className="text-slate-400 text-sm">Hệ thống máy tập nhập khẩu 100% tích hợp công nghệ theo dõi chỉ số thông minh.</p>
                </div>
              </div>
              
              <div className="group relative overflow-hidden rounded-2xl bg-surface-dark border border-white/5 hover:border-accent/50 transition-all duration-300">
                <div className="h-48 overflow-hidden">
                  <div className="w-full h-full bg-cover bg-center group-hover:scale-110 transition-transform duration-500" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1583416750470-965b2707b355?q=80&w=1470&auto=format&fit=crop')" }}></div>
                </div>
                <div className="p-6">
                  <h3 className="text-white text-xl font-bold mb-2">Thư giãn & Phục hồi</h3>
                  <p className="text-slate-400 text-sm">Khu vực xông hơi, bể sục Jacuzzi và quầy bar dinh dưỡng giúp bạn phục hồi nhanh chóng.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Section — Dynamic from DB */}
        <div className="bg-[#221013] py-20 px-6 md:px-10 lg:px-20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-black text-white mb-4">Bảng Giá Hội Viên</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">Chọn gói tập phù hợp với mục tiêu của bạn. Đăng ký ngay hôm nay để nhận ưu đãi Tết đặc biệt.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {displayPlans.map((plan, index) => {
                const features = getFeaturesForPlan(plan.name);
                const isFeatured = index === 1; // Middle plan is featured
                
                if (isFeatured) {
                  return (
                    <div key={plan.id} className="relative flex flex-col p-8 rounded-2xl border-2 border-accent bg-surface-dark/50 md:-translate-y-4 shadow-[0_0_30px_rgba(212,175,55,0.15)]">
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-background-dark text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider whitespace-nowrap">
                        Được chọn nhiều nhất
                      </div>
                      <div className="mb-6">
                        <h3 className="text-xl font-bold text-accent mb-2">{plan.name}</h3>
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-black text-white">{plan.price}</span>
                          <span className="text-slate-400">/{plan.duration || 'tháng'}</span>
                        </div>
                      </div>
                      <ul className="flex-1 flex flex-col gap-4 mb-8">
                        {features.map((feature, fi) => (
                          <li key={fi} className="flex items-center gap-3 text-sm text-slate-300">
                            <CheckCircle className="text-accent w-5 h-5 shrink-0" />
                            <span className={fi === 0 ? 'font-semibold text-white' : ''}>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <PlanButton planId={plan.id} className="w-full py-3 rounded-lg bg-accent text-background-dark font-bold hover:bg-accent-light transition-all shadow-lg shadow-accent/20 text-center">
                        Đăng ký ngay
                      </PlanButton>
                    </div>
                  );
                }
                
                return (
                  <div key={plan.id} className="relative flex flex-col p-8 rounded-2xl border border-white/10 bg-surface-dark hover:border-primary/50 transition-all duration-300 group">
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-white">{plan.price}</span>
                        <span className="text-slate-400">/{plan.duration || 'tháng'}</span>
                      </div>
                    </div>
                    <ul className="flex-1 flex flex-col gap-4 mb-8">
                      {features.map((feature, fi) => (
                        <li key={fi} className="flex items-center gap-3 text-sm text-slate-300">
                          <CheckCircle className="text-primary w-5 h-5 shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <PlanButton planId={plan.id} className="w-full py-3 rounded-lg border border-primary text-primary font-bold group-hover:bg-primary group-hover:text-white transition-all text-center">
                      Chọn gói này
                    </PlanButton>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
