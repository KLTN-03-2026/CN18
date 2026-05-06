'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { ShieldCheck, Clock, Copy, CheckCircle2, AlertCircle, Smartphone } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function MoMoGatewayPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f8e6f0] flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#A50064] border-t-transparent rounded-full animate-spin"></div></div>}>
      <MoMoContent />
    </Suspense>
  );
}

function MoMoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const planKey = searchParams.get('plan');
  
  const [order, setOrder] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(10 * 60); // 10 minutes for MoMo
  const [isCopied, setIsCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending');

  useEffect(() => {
    if (!orderId) {
      router.push('/goi-tap');
      return;
    }

    const fetchOrder = async () => {
      try {
        const { data, error } = await supabase
          .from('fitnexus_orders')
          .select('*')
          .eq('id', orderId)
          .single();
          
        if (data) {
          setOrder(data);
        } else {
          router.push('/goi-tap');
        }
      } catch (err) {
        console.error('Lỗi tải đơn hàng:', err);
        router.push('/goi-tap');
      }
    };
    
    fetchOrder();
  }, [orderId, router]);

  useEffect(() => {
    if (timeLeft <= 0) {
      setTimeout(() => setPaymentStatus('failed'), 0);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleSuccess = useCallback(async (orderData: any) => {
    const userEmail = orderData.user_email || orderData.userEmail;
    const planName = orderData.plan_name || orderData.planName;
    const planId = orderData.plan_id || orderData.planId;
    
    // Update Supabase order status
    try {
      await supabase.from('fitnexus_orders').update({ status: 'paid' }).eq('id', orderData.id);
    } catch (err) {
      console.error('Failed to update order in Supabase:', err);
    }
    
    // 2. Gửi thông báo
    const newNotification = {
      user_email: userEmail,
      title: 'Thanh toán thành công',
      message: `Bạn đã thanh toán thành công gói tập ${planName} qua MoMo. Thời hạn: 1 tháng.`,
      type: 'payment_success',
      read: false
    };

    try {
      const { error } = await supabase.from('fitnexus_notifications').insert([newNotification]);
      if (error) {
        console.error('Failed to save notification to Supabase:', error);
      }
    } catch (err) {
      console.error(err);
    }
    
    window.dispatchEvent(new Event('notifications-updated'));

    // 3. Chuyển hướng
    setTimeout(() => {
      router.push(`/thanh-toan/thanh-cong?orderId=${orderData.id}`);
    }, 1500);
  }, [router]);

  // Simulate webhook polling
  useEffect(() => {
    if (paymentStatus === 'success') return;

    const pollInterval = setInterval(async () => {
      try {
        const { data } = await supabase
          .from('fitnexus_orders')
          .select('status')
          .eq('id', orderId)
          .single();
          
        if (data && data.status === 'paid') {
          setPaymentStatus('success');
          clearInterval(pollInterval);
          handleSuccess(order);
        }
      } catch (err) {
        console.error('Error polling order status:', err);
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [orderId, paymentStatus, handleSuccess, order]);

  // Phím tắt admin: Ctrl+Shift+K để xác nhận thanh toán
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'K') {
        e.preventDefault();
        if (paymentStatus === 'pending' && order && !isProcessing) {
          setIsProcessing(true);
          try {
            const updatedOrder = { ...order, status: 'paid' };
            await supabase.from('fitnexus_orders').update({ status: 'paid' }).eq('id', orderId);
            setPaymentStatus('success');
            handleSuccess(updatedOrder);
          } catch (err) {
            console.error('Lỗi:', err);
            setIsProcessing(false);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [order, orderId, paymentStatus, isProcessing, handleSuccess]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (!order) return null;

  return (
    <div className="min-h-screen bg-[#f8e6f0] font-sans text-slate-800 flex flex-col items-center py-8 px-4">
      {/* Header */}
      <div className="max-w-4xl w-full flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <div className="bg-[#A50064] text-white font-black text-xl px-3 py-1 rounded-lg tracking-tighter">momo</div>
          <span className="text-slate-500 font-medium text-lg border-l-2 border-slate-300 pl-3 ml-1 hidden md:inline-block">Cổng thanh toán an toàn</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600 bg-white px-4 py-2 rounded-full shadow-sm border border-pink-100">
          <ShieldCheck className="w-4 h-4 text-[#A50064]" />
          <span className="font-medium">Bảo mật SSL</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative border border-pink-100">
        
        {/* Success/Fail Overlays */}
        {paymentStatus === 'success' && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center z-50">
            <div className="w-24 h-24 bg-[#A50064]/10 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-14 h-14 text-[#A50064]" />
            </div>
            <h2 className="text-3xl font-black text-slate-800 mb-2">Thanh toán thành công!</h2>
            <p className="text-slate-500 text-lg">Đang chuyển hướng về trang kết quả...</p>
          </div>
        )}
        
        {paymentStatus === 'failed' && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center z-50">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <AlertCircle className="w-14 h-14 text-red-600" />
            </div>
            <h2 className="text-3xl font-black text-slate-800 mb-2">Giao dịch hết hạn</h2>
            <p className="text-slate-500 text-lg mb-8">Vui lòng tạo lại đơn hàng mới để tiếp tục thanh toán.</p>
            <button onClick={() => router.push('/goi-tap')} className="px-8 py-3 bg-[#A50064] hover:bg-[#80004d] text-white font-bold rounded-xl transition-colors">
              Quay lại trang Gói tập
            </button>
          </div>
        )}

        {/* Left: QR Code Section */}
        <div className="w-full md:w-3/5 p-8 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col items-center bg-gradient-to-b from-pink-50/50 to-white">
          <div className="flex items-center gap-3 mb-6">
            <Smartphone className="w-6 h-6 text-[#A50064]" />
            <h2 className="text-xl font-bold text-slate-800">Quét mã qua ứng dụng MoMo</h2>
          </div>
          
          {/* MoMo QR Card Design */}
          <div className="relative w-[320px] rounded-3xl overflow-hidden shadow-xl bg-[#fceef5] flex flex-col items-center pt-8 pb-8 border border-pink-100">
            
            <div className="text-center mb-6">
              <h3 className="text-lg font-bold text-slate-800 uppercase tracking-wide">NGUYỄN NGỌC TOÀN</h3>
              <p className="text-slate-500 text-sm tracking-widest">*******673</p>
            </div>

            {/* The QR Card */}
            <div className="bg-white w-[260px] rounded-2xl relative flex flex-col items-center shadow-md p-4">
              
              {/* Header Logos */}
              <div className="flex justify-between items-center w-full mb-4 px-2">
                <div className="text-[#A50064] font-black text-xl leading-none flex flex-col">
                  <span>mo</span>
                  <span>mo</span>
                </div>
                <div className="h-4 w-px bg-slate-200"></div>
                <div className="flex items-center gap-1">
                  <span className="font-black text-red-600 text-[10px] tracking-wider flex items-center">
                    <span className="text-sm">V</span>ietQR
                  </span>
                </div>
                <div className="h-4 w-px bg-slate-200"></div>
                <div>
                  <span className="text-[10px] font-bold text-[#005baa]">napas <span className="text-green-500">247</span></span>
                </div>
              </div>

              {/* QR Code Area */}
              <div className="w-[220px] h-[220px] relative">
                 {/* QR Code Pattern Simulation */}
                 <Image 
                   src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg"
                   alt="QR Code"
                   fill
                   className="object-contain opacity-90 mix-blend-multiply"
                 />
                 {/* Logo in center of QR */}
                 <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-1 rounded-full shadow-sm">
                   <div className="w-10 h-10 bg-pink-50 rounded-full flex items-center justify-center text-[#A50064] font-bold text-sm border border-pink-100">
                     NT
                   </div>
                 </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex items-center gap-2 text-[#A50064] bg-pink-50 px-6 py-3 rounded-full border border-pink-100">
            <Clock className="w-5 h-5" />
            <span className="font-medium">Đơn hàng hết hạn sau:</span>
            <span className="font-black text-xl w-16 text-center">{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Right: Order Details */}
        <div className="w-full md:w-2/5 p-8 flex flex-col bg-white">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-800">Thông tin thanh toán</h3>
            <div className="bg-pink-50 text-[#A50064] px-3 py-1 rounded-lg text-xs font-bold">MoMo</div>
          </div>
          
          <div className="space-y-6 flex-1">
            <div>
              <p className="text-sm text-slate-500 mb-1">Nhà cung cấp</p>
              <p className="font-bold text-slate-800 text-lg">GYMVERSE VN</p>
            </div>
            
            <div>
              <p className="text-sm text-slate-500 mb-1">Mã giao dịch</p>
              <p className="font-bold text-slate-800 font-mono bg-slate-100 inline-block px-2 py-1 rounded text-sm">{order.id}</p>
            </div>
            
            <div>
              <p className="text-sm text-slate-500 mb-1">Chi tiết</p>
              <p className="font-medium text-slate-800">Thanh toán gói tập {order.planName}</p>
            </div>
            
            <div className="bg-gradient-to-br from-pink-50 to-white p-5 rounded-2xl border border-pink-100 shadow-sm mt-6">
              <p className="text-sm text-slate-500 mb-2">Tổng tiền thanh toán</p>
              <p className="font-black text-3xl text-[#A50064]">{order.amount}</p>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-100">
            <button 
              onClick={() => router.push('/goi-tap')}
              className="w-full py-4 bg-white hover:bg-slate-50 text-slate-500 font-bold rounded-xl transition-colors border border-slate-200"
            >
              Hủy giao dịch
            </button>
          </div>
        </div>
      </div>
      
      {/* Manual Transfer Info */}
      <div className="max-w-4xl w-full mt-6 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-pink-100 text-[#A50064] flex items-center justify-center text-sm font-bold">i</div>
          Hoặc chuyển khoản thủ công qua MoMo
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider font-semibold">Ví điện tử</p>
            <p className="font-bold text-sm text-[#A50064]">MoMo</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider font-semibold">Người nhận</p>
            <p className="font-bold text-sm text-slate-800">NGUYỄN NGỌC TOÀN</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-center group">
            <div>
              <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider font-semibold">Số điện thoại</p>
              <p className="font-bold text-base text-slate-800">0367564673</p>
            </div>
            <button onClick={() => handleCopy('0367564673')} className="text-slate-400 hover:text-[#A50064] bg-white p-2 rounded-lg shadow-sm group-hover:bg-pink-50 transition-colors">
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <div className="bg-pink-50 p-4 rounded-xl border border-pink-200 flex justify-between items-center group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#A50064]"></div>
            <div>
              <p className="text-xs text-[#A50064] mb-1 uppercase tracking-wider font-semibold">Lời nhắn</p>
              <p className="font-bold text-base text-slate-800">{order.id}</p>
            </div>
            <button onClick={() => handleCopy(order.id)} className="text-[#A50064] hover:text-pink-800 bg-white p-2 rounded-lg shadow-sm group-hover:bg-pink-100 transition-colors">
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>
        {isCopied && <p className="text-sm text-green-600 mt-3 font-medium flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/> Đã sao chép vào khay nhớ tạm!</p>}
      </div>
    </div>
  );
}
