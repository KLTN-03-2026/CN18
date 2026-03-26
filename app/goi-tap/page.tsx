import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CheckCircle, Crown, Dumbbell, Leaf, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import PlanButton from '@/components/PlanButton';

export const revalidate = 0; // Disable caching to always fetch fresh data

export default async function GoiTapPage() {
  const { data: plans } = await supabase.from('fitnexus_plans').select('*').order('id', { ascending: true });
  
  const displayPlans = plans && plans.length > 0 ? plans : [];

  return (
    <div className="relative flex flex-col min-h-screen w-full">
      <Navbar />
      
      {/* Hero / Title Section */}
      <section className="relative px-6 py-12 lg:px-20 lg:py-16 text-center">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-background-dark via-background-dark/80 to-background-dark"></div>
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center gap-4">
          <span className="inline-block py-1 px-3 rounded-full bg-accent/10 border border-accent/30 text-accent text-xs font-bold uppercase tracking-widest mb-2">
            Tết Ất Tỵ 2026
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">
            Gói Tập Hội Viên <span className="text-gold-gradient">Đẳng Cấp</span>
          </h1>
          <p className="text-slate-300 text-lg md:text-xl max-w-2xl font-light">
            Nâng tầm vóc dáng, đón xuân sang với ưu đãi đặc biệt giảm <span className="text-primary font-bold">30%</span> cho tất cả các gói tập.
          </p>
        </div>
      </section>

      {/* Pricing Cards Section */}
      <main className="flex-1 px-4 md:px-10 lg:px-20 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 max-w-[1400px] mx-auto">
          {displayPlans.map((plan, index) => {
            const isPremium = plan.name.toLowerCase().includes('premium') || index === 2;
            const isVip = plan.name.toLowerCase().includes('vip') || index === 3;
            const isStandard = plan.name.toLowerCase().includes('standard') || index === 1;
            
            if (isPremium) {
              return (
                <div key={plan.id} className="relative flex flex-col gap-6 rounded-2xl border-gold-gradient bg-gradient-to-b from-surface-dark to-[#3e1e22] p-6 hover:-translate-y-1.5 transition-transform duration-300 shadow-[0_0_15px_rgba(191,149,63,0.3)] scale-105 z-10">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#bf953f] via-[#fcf6ba] to-[#b38728] text-[#2d1619] text-xs font-black py-1 px-4 rounded-full shadow-lg uppercase tracking-wider whitespace-nowrap z-30">
                    Best Seller
                  </div>
                  <div className="absolute -top-3 -right-3 rotate-12 bg-primary text-white text-[10px] font-bold py-1 px-3 rounded-sm shadow-md z-20">
                    Tết -30%
                  </div>
                  <div className="flex flex-col gap-2 border-b border-white/10 pb-4 pt-2">
                    <h3 className="text-gold-gradient text-2xl font-black">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 text-white">
                      <span className="text-4xl font-black tracking-tight text-white">{plan.price}</span>
                      <span className="text-slate-300 text-sm font-medium">/{plan.duration || 'tháng'}</span>
                    </div>
                    <p className="text-xs text-accent/80 font-medium">Trải nghiệm không giới hạn</p>
                  </div>
                  <ul className="flex flex-col gap-3 flex-1">
                    <li className="flex items-start gap-3 text-sm text-white font-medium">
                      <CheckCircle className="text-accent w-5 h-5 shrink-0" />
                      <span>Truy cập <strong>tất cả chi nhánh</strong></span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-white font-medium">
                      <CheckCircle className="text-accent w-5 h-5 shrink-0" />
                      <span>HLV cá nhân 2 buổi/tuần</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-white font-medium">
                      <CheckCircle className="text-accent w-5 h-5 shrink-0" />
                      <span>Xông hơi & Jacuzzi thư giãn</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-white font-medium">
                      <CheckCircle className="text-accent w-5 h-5 shrink-0" />
                      <span>Nước uống Detox miễn phí</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-white font-medium">
                      <CheckCircle className="text-accent w-5 h-5 shrink-0" />
                      <span>Dẫn theo 1 người bạn đi tập</span>
                    </li>
                  </ul>
                  <PlanButton planId={plan.id} className="w-full mt-auto py-3 rounded-lg bg-gradient-to-r from-[#bf953f] via-[#fcf6ba] to-[#b38728] hover:opacity-90 text-[#2d1619] font-black text-sm shadow-lg shadow-accent/20 transition-all transform hover:scale-[1.02] text-center uppercase">
                    Chọn {plan.name}
                  </PlanButton>
                </div>
              );
            }
            
            if (isVip) {
              return (
                <div key={plan.id} className="relative flex flex-col gap-6 rounded-2xl border border-accent/50 bg-surface-dark p-6 hover:-translate-y-1 transition-transform duration-300 shadow-[0_0_20px_rgba(198,16,46,0.15)]">
                  <div className="absolute -top-3 -right-3 rotate-12 bg-primary text-white text-[10px] font-bold py-1 px-3 rounded-sm shadow-md z-20">
                    Tết -30%
                  </div>
                  <div className="flex flex-col gap-2 border-b border-white/10 pb-4">
                    <h3 className="text-primary text-xl font-black flex items-center gap-2">
                      {plan.name}
                      <Crown className="text-accent w-5 h-5" />
                    </h3>
                    <div className="flex items-baseline gap-1 text-white">
                      <span className="text-3xl font-black tracking-tight">{plan.price}</span>
                      <span className="text-slate-400 text-sm font-medium">/{plan.duration || 'tháng'}</span>
                    </div>
                    <p className="text-xs text-primary/80 font-medium">Đẳng cấp thượng lưu</p>
                  </div>
                  <ul className="flex flex-col gap-3 flex-1">
                    <li className="flex items-start gap-3 text-sm text-slate-200">
                      <CheckCircle className="text-accent w-5 h-5 shrink-0" />
                      <span><strong>Quyền lợi gói Premium +</strong></span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-slate-200">
                      <CheckCircle className="text-accent w-5 h-5 shrink-0" />
                      <span>HLV 1-1 không giới hạn</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-slate-200">
                      <CheckCircle className="text-accent w-5 h-5 shrink-0" />
                      <span>Khu vực VIP riêng biệt, yên tĩnh</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-slate-200">
                      <CheckCircle className="text-accent w-5 h-5 shrink-0" />
                      <span>Tủ đồ riêng cố định</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-accent font-bold">
                      <span className="w-5 h-5 shrink-0 flex items-center justify-center">🎁</span>
                      <span>Bộ quà tặng Tết Ất Tỵ 2026</span>
                    </li>
                  </ul>
                  <PlanButton planId={plan.id} className="w-full mt-auto py-3 rounded-lg bg-primary hover:bg-[#8a0b20] text-white font-bold text-sm shadow-lg shadow-primary/30 transition-all text-center uppercase">
                    Chọn {plan.name}
                  </PlanButton>
                </div>
              );
            }

            if (isStandard) {
              return (
                <div key={plan.id} className="relative flex flex-col gap-6 rounded-2xl border border-white/10 bg-surface-dark p-6 hover:-translate-y-1 transition-transform duration-300 shadow-xl shadow-black/20">
                  <div className="absolute -top-3 -right-3 rotate-12 bg-primary text-white text-[10px] font-bold py-1 px-3 rounded-sm shadow-md z-20">
                    Tết -30%
                  </div>
                  <div className="flex flex-col gap-2 border-b border-white/10 pb-4">
                    <h3 className="text-white text-xl font-bold">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 text-white">
                      <span className="text-3xl font-black tracking-tight">{plan.price}</span>
                      <span className="text-slate-400 text-sm font-medium">/{plan.duration || 'tháng'}</span>
                    </div>
                    <p className="text-xs text-slate-400">Lựa chọn phổ biến nhất</p>
                  </div>
                  <ul className="flex flex-col gap-3 flex-1">
                    <li className="flex items-start gap-3 text-sm text-slate-200">
                      <CheckCircle className="text-accent w-5 h-5 shrink-0" />
                      <span>Truy cập <strong>mọi khung giờ</strong></span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-slate-200">
                      <CheckCircle className="text-accent w-5 h-5 shrink-0" />
                      <span>3 buổi định hướng cùng HLV</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-slate-200">
                      <CheckCircle className="text-accent w-5 h-5 shrink-0" />
                      <span>Khăn tập & Tủ đồ miễn phí</span>
                    </li>
                    <li className="flex items-start gap-3 text-sm text-slate-200">
                      <CheckCircle className="text-accent w-5 h-5 shrink-0" />
                      <span>Tham gia các lớp Group X</span>
                    </li>
                  </ul>
                  <PlanButton planId={plan.id} className="w-full mt-auto py-3 rounded-lg bg-[#3e1e22] hover:bg-[#3e1e22]/80 text-white font-bold text-sm border border-white/10 transition-all text-center uppercase">
                    Chọn {plan.name}
                  </PlanButton>
                </div>
              );
            }

            return (
              <div key={plan.id} className="relative flex flex-col gap-6 rounded-2xl border border-white/5 bg-surface-dark/40 backdrop-blur-sm p-6 hover:-translate-y-1 transition-transform duration-300 group">
                <div className="absolute -top-3 -right-3 rotate-12 bg-primary text-white text-[10px] font-bold py-1 px-3 rounded-sm shadow-md z-20">
                  Tết -30%
                </div>
                <div className="flex flex-col gap-2 border-b border-white/10 pb-4">
                  <h3 className="text-slate-200 text-xl font-bold">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 text-white">
                    <span className="text-3xl font-black tracking-tight">{plan.price}</span>
                    <span className="text-slate-400 text-sm font-medium">/{plan.duration || 'tháng'}</span>
                  </div>
                  <p className="text-xs text-slate-400">Dành cho người mới bắt đầu</p>
                </div>
                <ul className="flex flex-col gap-3 flex-1">
                  <li className="flex items-start gap-3 text-sm text-slate-300">
                    <CheckCircle className="text-accent w-5 h-5 shrink-0" />
                    <span>Truy cập khung giờ thấp điểm (9:00 - 16:00)</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-300">
                    <CheckCircle className="text-accent w-5 h-5 shrink-0" />
                    <span>1 buổi định hướng cùng HLV</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-300">
                    <CheckCircle className="text-accent w-5 h-5 shrink-0" />
                    <span>Tủ đồ tiêu chuẩn</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm text-slate-500">
                    <span className="w-5 h-5 shrink-0 flex items-center justify-center text-slate-600">✕</span>
                    <span className="line-through decoration-slate-600">Khăn tập miễn phí</span>
                  </li>
                </ul>
                <PlanButton planId={plan.id} className="w-full mt-auto py-3 rounded-lg border border-white/20 text-white font-bold text-sm hover:bg-white/5 hover:border-white/40 transition-colors text-center uppercase">
                  Chọn {plan.name}
                </PlanButton>
              </div>
            );
          })}
        </div>

        {/* Features Grid Below Plans */}
        <div className="mt-20 max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex gap-4 items-start">
              <div className="p-3 rounded-lg bg-primary/10 text-primary">
                <Dumbbell className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-white font-bold text-lg mb-1">Thiết bị Technogym</h4>
                <p className="text-slate-400 text-sm leading-relaxed">Hệ thống máy tập nhập khẩu mới nhất 2026, tích hợp công nghệ theo dõi chuyển động.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="p-3 rounded-lg bg-accent/10 text-accent">
                <Leaf className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-white font-bold text-lg mb-1">Tiện ích 5 sao</h4>
                <p className="text-slate-400 text-sm leading-relaxed">Phòng xông hơi đá muối, bể sục Jacuzzi và khu vực lounge thư giãn sang trọng.</p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="p-3 rounded-lg bg-primary/10 text-primary">
                <Users className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-white font-bold text-lg mb-1">Cộng đồng VIP</h4>
                <p className="text-slate-400 text-sm leading-relaxed">Kết nối với những người cùng đam mê, tham gia các sự kiện đặc quyền dịp Tết.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
