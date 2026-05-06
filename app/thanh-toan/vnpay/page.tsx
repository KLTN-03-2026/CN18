'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { ShieldCheck, Clock, Copy, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function VNPayGatewayPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#005baa] border-t-transparent rounded-full animate-spin"></div></div>}>
      <VNPayContent />
    </Suspense>
  );
}

function VNPayContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const planKey = searchParams.get('plan');
  
  const [order, setOrder] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes
  const [isCopied, setIsCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [showAdminHint, setShowAdminHint] = useState(false);

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
      message: `Bạn đã thanh toán thành công gói tập ${planName}. Thời hạn: 1 tháng.`,
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
    <div className="min-h-screen bg-[#f0f2f5] font-sans text-slate-800 flex flex-col items-center py-8 px-4">
      {/* Header */}
      <div className="max-w-4xl w-full flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <span className="text-[#005baa] font-black text-3xl tracking-tighter">VNPAY</span>
          <span className="text-slate-500 font-medium text-lg border-l-2 border-slate-300 pl-3 ml-1 hidden md:inline-block">Cổng thanh toán</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-200">
          <ShieldCheck className="w-4 h-4 text-green-600" />
          <span className="font-medium">Thanh toán an toàn</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row relative">
        
        {/* Success/Fail Overlays */}
        {paymentStatus === 'success' && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center z-50">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-3xl font-black text-slate-800 mb-2">Thanh toán thành công!</h2>
            <p className="text-slate-500 text-lg">Đang chuyển hướng về trang kết quả...</p>
          </div>
        )}
        
        {paymentStatus === 'failed' && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center z-50">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <AlertCircle className="w-12 h-12 text-red-600" />
            </div>
            <h2 className="text-3xl font-black text-slate-800 mb-2">Giao dịch hết hạn</h2>
            <p className="text-slate-500 text-lg mb-8">Vui lòng tạo lại đơn hàng mới để tiếp tục thanh toán.</p>
            <button onClick={() => router.push('/goi-tap')} className="px-8 py-3 bg-[#005baa] hover:bg-[#004a8c] text-white font-bold rounded-xl transition-colors">
              Quay lại trang Gói tập
            </button>
          </div>
        )}

        {/* Left: QR Code Section */}
        <div className="w-full md:w-3/5 p-8 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col items-center relative overflow-hidden">
          <h2 className="text-xl font-bold text-[#005baa] mb-8 text-center relative z-10">Quét mã qua ứng dụng Ngân hàng/Ví điện tử</h2>
          
          {/* Tet Theme Background for QR */}
          <div className="relative w-[320px] rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-b from-[#c6102e] to-[#8a0b20] flex flex-col items-center pt-6 pb-8">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, #ffeb3b 0%, transparent 50%)' }}></div>
            
            {/* The QR Card */}
            <div className="bg-white w-[280px] rounded-xl relative flex flex-col items-center shadow-inner overflow-hidden">
              {/* Card Header */}
              <div className="w-full bg-[#fdf2f2] p-3 flex items-center justify-center gap-2 border-b border-red-100">
                <div className="text-red-600">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </div>
                <div className="text-center">
                  <div className="text-red-700 font-bold text-xs uppercase tracking-wider">NGUYEN NGOC TOAN</div>
                  <div className="text-slate-800 font-bold text-sm">0367564673</div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 w-full flex flex-col items-center">
                <div className="flex justify-between w-full px-2 mb-3 items-center">
                  <span className="font-black text-red-600 text-sm tracking-wider flex items-center gap-1">
                    <span className="text-xl">V</span>ietQR
                  </span>
                  <span className="font-black text-[#005baa] text-lg tracking-wider flex items-center gap-1">
                    <span className="text-red-500 text-xl">★</span>MB
                  </span>
                </div>
                
                <div className="w-[220px] h-[220px] relative">
                   {/* QR Code Pattern Simulation */}
                   <Image 
                     src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg"
                     alt="QR Code"
                     fill
                     className="object-contain opacity-90 mix-blend-multiply"
                   />
                   {/* Logo in center of QR */}
                   <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-1 rounded-md shadow-sm">
                     <div className="w-8 h-8 bg-[#005baa] rounded flex items-center justify-center text-white font-bold text-xs">MB</div>
                   </div>
                </div>

                <div className="flex justify-between w-full px-2 mt-4 items-center border-t border-slate-100 pt-3">
                  <span className="text-[10px] font-bold text-red-600">VietQR<span className="text-blue-600">Pay</span></span>
                  <span className="text-[10px] font-bold text-red-600">VietQR<span className="text-blue-600">Global</span></span>
                  <span className="text-[10px] font-bold text-[#005baa]">napas <span className="text-green-500">247</span></span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex items-center gap-2 text-slate-600 bg-orange-50 px-6 py-3 rounded-full border border-orange-100 relative z-10">
            <Clock className="w-5 h-5 text-orange-500" />
            <span className="font-medium">Giao dịch kết thúc sau:</span>
            <span className="font-black text-xl text-orange-600 w-16 text-center">{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Right: Order Details */}
        <div className="w-full md:w-2/5 bg-slate-50 p-8 flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-200 pb-4">Thông tin đơn hàng</h3>
          
          <div className="space-y-6 flex-1">
            <div>
              <p className="text-sm text-slate-500 mb-1">Nhà cung cấp</p>
              <p className="font-bold text-slate-800 text-lg">CÔNG TY CỔ PHẦN GYMVERSE</p>
            </div>
            
            <div>
              <p className="text-sm text-slate-500 mb-1">Mã đơn hàng</p>
              <p className="font-bold text-slate-800 font-mono bg-slate-200/50 inline-block px-2 py-1 rounded">{order.id}</p>
            </div>
            
            <div>
              <p className="text-sm text-slate-500 mb-1">Mô tả</p>
              <p className="font-medium text-slate-800">Thanh toán gói tập {order.planName}</p>
            </div>
            
            <div className="bg-white p-5 rounded-xl border border-blue-100 shadow-sm mt-6">
              <p className="text-sm text-slate-500 mb-1">Số tiền thanh toán</p>
              <p className="font-black text-3xl text-[#005baa]">{order.amount}</p>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-200">
            <button 
              onClick={() => router.push('/goi-tap')}
              className="w-full py-4 bg-white hover:bg-slate-100 text-slate-600 font-bold rounded-xl transition-colors border border-slate-300"
            >
              Hủy giao dịch
            </button>
          </div>
        </div>
      </div>
      
      {/* Manual Transfer Info */}
      <div className="max-w-4xl w-full mt-6 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">i</div>
          Hoặc chuyển khoản thủ công
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider font-semibold">Ngân hàng</p>
            <p className="font-bold text-sm text-slate-800">MB Bank</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider font-semibold">Chủ tài khoản</p>
            <p className="font-bold text-sm text-slate-800">NGUYEN NGOC TOAN</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-center group">
            <div>
              <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider font-semibold">Số tài khoản</p>
              <p className="font-bold text-base text-[#005baa]">0367564673</p>
            </div>
            <button onClick={() => handleCopy('0367564673')} className="text-slate-400 hover:text-[#005baa] bg-white p-2 rounded-lg shadow-sm group-hover:bg-blue-50 transition-colors">
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <div className="bg-[#fff8e1] p-4 rounded-xl border border-[#ffe082] flex justify-between items-center group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-yellow-400"></div>
            <div>
              <p className="text-xs text-yellow-800 mb-1 uppercase tracking-wider font-semibold">Nội dung CK</p>
              <p className="font-bold text-base text-slate-800">{order.id}</p>
            </div>
            <button onClick={() => handleCopy(order.id)} className="text-yellow-600 hover:text-yellow-800 bg-white p-2 rounded-lg shadow-sm group-hover:bg-yellow-100 transition-colors">
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>
        {isCopied && <p className="text-sm text-green-600 mt-3 font-medium flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/> Đã sao chép vào khay nhớ tạm!</p>}
      </div>
    </div>
  );
}
