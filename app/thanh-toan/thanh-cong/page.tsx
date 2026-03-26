'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Download, ArrowRight, Star, Gift } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';

export default function ThanhToanThanhCongPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background-dark flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
      <SuccessContent />
    </Suspense>
  );
}

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planKey = searchParams.get('plan');
  const orderIdParam = searchParams.get('orderId');
  
  const [planName, setPlanName] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        if (orderIdParam) {
          const { data } = await supabase
            .from('fitnexus_orders')
            .select('plan_name, id')
            .eq('id', orderIdParam)
            .single();
            
          if (data) {
            setPlanName(data.plan_name);
            setTransactionId(data.id);
          }
        } else if (planKey) {
          const { data } = await supabase
            .from('fitnexus_plans')
            .select('name')
            .eq('id', planKey)
            .single();
            
          if (data) {
            setPlanName(data.name);
          }
        }
      } catch (err) {
        console.error('Lỗi tải thông tin thanh toán:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDetails();
    
    setCurrentDate(new Date().toLocaleDateString('vi-VN'));
    if (!orderIdParam) {
      setTransactionId(`GYM-${Math.floor(Math.random() * 1000000)}`);
    }
    
    // Fire confetti on load
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      import('canvas-confetti').then((confetti) => {
        confetti.default({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#d4af37', '#c6102e', '#ffffff']
        });
        confetti.default({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#d4af37', '#c6102e', '#ffffff']
        });
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, [planKey, orderIdParam]);

  if (isLoading) {
    return <div className="min-h-screen bg-background-dark flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="min-h-screen bg-[#0a0505] text-slate-100 font-sans flex flex-col relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-gold-gradient blur-[120px] rounded-full opacity-20"></div>
      </div>

      <Navbar />
      
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12 flex flex-col items-center justify-center relative z-10">
        
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 mb-6 shadow-[0_0_40px_rgba(52,211,153,0.4)]">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-300 mb-4 drop-shadow-lg uppercase tracking-wider">
            Thanh Toán Thành Công!
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Chào mừng bạn đến với cộng đồng GymVerse. Hành trình thay đổi bản thân của bạn chính thức bắt đầu!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300 fill-mode-both">
          
          {/* Membership Ticket */}
          <div className="relative bg-gradient-to-br from-[#1a1c23] to-[#0f1015] rounded-3xl p-1 border border-white/10 shadow-2xl overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="bg-[#151619] rounded-[22px] h-full p-8 relative z-10 flex flex-col">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <p className="text-sm font-bold text-primary uppercase tracking-widest mb-1">Thẻ Hội Viên</p>
                  <h3 className="text-3xl font-black text-white">{planName}</h3>
                </div>
                <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
              </div>
              
              <div className="space-y-4 mb-8 flex-1">
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-slate-400">Thời hạn</span>
                  <span className="font-bold text-white">1 Tháng</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-slate-400">Ngày kích hoạt</span>
                  <span className="font-bold text-white">{currentDate}</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-2">
                  <span className="text-slate-400">Mã giao dịch</span>
                  <span className="font-mono text-white">{transactionId}</span>
                </div>
              </div>

              <button className="w-full py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 border border-white/10">
                <Download className="w-4 h-4" />
                Tải hóa đơn PDF
              </button>
            </div>
          </div>

          {/* Lucky Money / Welcome Gift */}
          <div className="relative bg-gradient-to-br from-[#c6102e] to-[#8a0b20] rounded-3xl p-8 border border-red-500/30 shadow-[0_0_30px_rgba(198,16,46,0.3)] flex flex-col items-center justify-center text-center overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'#ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
            
            <Gift className="w-16 h-16 text-yellow-400 mb-4 relative z-10" />
            <h3 className="text-2xl font-black text-yellow-400 mb-2 relative z-10">Quà Tặng Tân Binh</h3>
            <p className="text-white/90 mb-6 relative z-10">
              Bạn nhận được 1 buổi tập định hướng 1-1 miễn phí với Huấn luyện viên cá nhân trị giá 500.000đ.
            </p>
            
            <Link href="/dashboard?tab=schedule" className="inline-flex items-center justify-center px-6 py-3 bg-yellow-400 hover:bg-yellow-300 text-red-900 font-black rounded-xl transition-colors relative z-10 w-full">
              Đặt lịch ngay
            </Link>
          </div>

        </div>

        <div className="mt-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500 fill-mode-both">
          <Link href="/dashboard?tab=membership" className="inline-flex items-center justify-center px-8 py-4 bg-primary hover:bg-[#8a0b20] text-white font-bold rounded-xl transition-colors text-lg gap-2 shadow-lg shadow-primary/20">
            Vào trang quản lý gói tập
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

      </main>
    </div>
  );
}
