'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, CreditCard, ShieldCheck, AlertCircle, CheckCircle2, XCircle, Lock } from 'lucide-react';
import Navbar from '@/components/Navbar';
import { supabase } from '@/lib/supabase';

type PaymentStatus = 'idle' | 'pending' | 'requires_action' | 'processing' | 'succeeded' | 'failed';

export default function ThanhToanPage() {
  return (
    <div className="min-h-screen bg-background-dark text-slate-100 font-sans flex flex-col">
      <Navbar />
      <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
        <ThanhToanContent />
      </Suspense>
    </div>
  );
}

function ThanhToanContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planKeyParam = searchParams.get('plan');
  
  const [planKey, setPlanKey] = useState<string | null>(planKeyParam);
  const [plan, setPlan] = useState<any>(null);
  const [isLoadingPlan, setIsLoadingPlan] = useState(true);
  
  useEffect(() => {
    const fetchPlan = async () => {
      try {
        let query = supabase.from('fitnexus_plans').select('*');
        
        if (planKeyParam) {
          query = query.eq('id', planKeyParam);
        } else {
          query = query.order('id', { ascending: true }).limit(1);
        }
        
        const { data, error } = await query;
        
        if (data && data.length > 0) {
          const planData = data[0];
          setPlanKey(planData.id.toString());
          
          // Parse price from various formats: "2.5Trđ", "500K", "2500000", "2,500,000đ", etc.
          const parsePriceToNumber = (priceStr: string): number => {
            if (!priceStr) return 0;
            const str = priceStr.toString().trim();
            
            // Handle "Trđ" / "Tr" format (e.g., "2.5Trđ" = 2,500,000)
            if (str.includes('Tr')) {
              const num = parseFloat(str.replace(/[^0-9.]/g, ''));
              return isNaN(num) ? 0 : num * 1000000;
            }
            // Handle "K" format (e.g., "500K" = 500,000)
            if (str.toUpperCase().includes('K')) {
              const num = parseFloat(str.replace(/[^0-9.]/g, ''));
              return isNaN(num) ? 0 : num * 1000;
            }
            // Handle "M" format (e.g., "2.5M" = 2,500,000)
            if (str.toUpperCase().includes('M') && !str.includes('Tr')) {
              const num = parseFloat(str.replace(/[^0-9.]/g, ''));
              return isNaN(num) ? 0 : num * 1000000;
            }
            // Plain number or formatted like "2.500.000đ" or "2,500,000đ"
            const cleaned = str.replace(/[^\d]/g, '');
            return parseInt(cleaned) || 0;
          };
          
          const formatVND = (amount: number): string => {
            return amount.toLocaleString('vi-VN') + 'đ';
          };
          
          const priceNumber = parsePriceToNumber(planData.price);
          const originalPriceNumber = Math.round(priceNumber * 1.4);
          
          setPlan({
            name: planData.name,
            price: formatVND(priceNumber),
            priceNumber: priceNumber,
            originalPrice: formatVND(originalPriceNumber),
            originalPriceNumber: originalPriceNumber,
            duration: planData.duration || '1 tháng',
          });
        } else {
          setErrorMessage('Gói tập không tồn tại.');
        }
      } catch (err) {
        setErrorMessage('Có lỗi xảy ra khi tải thông tin gói tập.');
      } finally {
        setIsLoadingPlan(false);
      }
    };
    
    fetchPlan();
  }, [planKeyParam]);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('vnpay');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Card Form State
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });
  const [cardErrors, setCardErrors] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  // 3DS State
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');

  // Voucher State
  const [voucherCode, setVoucherCode] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [voucherError, setVoucherError] = useState('');
  const [voucherSuccess, setVoucherSuccess] = useState('');

  const handleApplyVoucher = async () => {
    setVoucherError('');
    setVoucherSuccess('');
    
    if (!voucherCode.trim()) {
      setVoucherError('Vui lòng nhập mã giảm giá');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('fitnexus_vouchers')
        .select('*')
        .eq('code', voucherCode.toUpperCase())
        .eq('status', 'active')
        .single();

      if (error || !data) {
        setVoucherError('Mã giảm giá không hợp lệ hoặc đã hết hạn');
        return;
      }

      setAppliedVoucher(data);
      setVoucherSuccess('Áp dụng mã giảm giá thành công!');
    } catch (err) {
      setVoucherError('Lỗi hệ thống khi kiểm tra mã');
    }
  };

  const calculateFinalPrice = () => {
    if (!plan) return '0đ';
    
    let basePrice = plan.priceNumber || 0;
    if (basePrice === 0) return plan.price;

    if (appliedVoucher) {
      if (appliedVoucher.discount.includes('%')) {
        const percent = parseInt(appliedVoucher.discount.replace('%', ''));
        basePrice = Math.round(basePrice * (1 - percent / 100));
      } else if (appliedVoucher.discount.includes('K')) {
        const amount = parseInt(appliedVoucher.discount.replace('K', '')) * 1000;
        basePrice = Math.max(0, basePrice - amount);
      }
    }

    return basePrice.toLocaleString('vi-VN') + 'đ';
  };

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'number') {
      formattedValue = value.replace(/\D/g, '').substring(0, 16);
      formattedValue = formattedValue.replace(/(\d{4})/g, '$1 ').trim();
    } else if (name === 'expiry') {
      formattedValue = value.replace(/\D/g, '').substring(0, 4);
      if (formattedValue.length >= 2) {
        formattedValue = `${formattedValue.substring(0, 2)}/${formattedValue.substring(2, 4)}`;
      }
    } else if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').substring(0, 3);
    } else if (name === 'name') {
      formattedValue = value.toUpperCase().replace(/[^A-Z\s]/g, '');
    }

    setCardDetails(prev => ({ ...prev, [name]: formattedValue }));
    // Clear error when typing
    setCardErrors(prev => ({ ...prev, [name]: '' }));
    setErrorMessage('');
  };

  const validateCard = () => {
    let isValid = true;
    const newErrors = { number: '', expiry: '', cvv: '', name: '' };

    if (cardDetails.number.replace(/\s/g, '').length !== 16) {
      newErrors.number = 'Số thẻ phải gồm 16 chữ số';
      isValid = false;
    }
    
    if (cardDetails.expiry.length !== 5) {
      newErrors.expiry = 'Định dạng MM/YY';
      isValid = false;
    } else {
      const [month, year] = cardDetails.expiry.split('/');
      const currentDate = new Date();
      const currentYear = parseInt(currentDate.getFullYear().toString().slice(-2));
      const currentMonth = currentDate.getMonth() + 1;
      
      if (parseInt(month) < 1 || parseInt(month) > 12) {
        newErrors.expiry = 'Tháng không hợp lệ';
        isValid = false;
      } else if (parseInt(year) < currentYear || (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
        newErrors.expiry = 'Thẻ đã hết hạn';
        isValid = false;
      }
    }

    if (cardDetails.cvv.length !== 3) {
      newErrors.cvv = 'CVV gồm 3 chữ số';
      isValid = false;
    }

    if (cardDetails.name.trim().length < 3) {
      newErrors.name = 'Tên in trên thẻ không hợp lệ';
      isValid = false;
    }

    setCardErrors(newErrors);
    return isValid;
  };

  const handlePayment = async () => {
    setErrorMessage('');
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user?.email) {
      setErrorMessage('Vui lòng đăng nhập để thanh toán');
      setTimeout(() => router.push('/dang-nhap'), 2000);
      return;
    }

    const currentUserEmail = session.user.email;

    if (paymentMethod === 'card') {
      if (!validateCard()) {
        setErrorMessage('Vui lòng kiểm tra lại thông tin thẻ.');
        return;
      }
      
      // BƯỚC B: Tạo đơn hàng (Mô phỏng gọi API)
      setPaymentStatus('pending');
      setIsProcessing(true);
      
      try {
        // Mô phỏng delay gọi API tạo order
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // BƯỚC C: Tokenization (Mô phỏng SDK trả về token)
        // Trong thực tế, KHÔNG gửi số thẻ lên server của bạn. 
        // Dùng SDK của Stripe/VNPAY để tokenize thẻ trực tiếp từ frontend.
        const mockCardToken = `tok_${Date.now()}`;
        
        // Mô phỏng quá trình xử lý thanh toán với token
        setPaymentStatus('processing');
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // BƯỚC D: Xác thực 3D Secure
        // Mô phỏng yêu cầu xác thực 3DS từ ngân hàng
        setPaymentStatus('requires_action');
        setIsProcessing(false);
        
      } catch (error) {
        setPaymentStatus('failed');
        setErrorMessage('Kết nối không ổn định. Vui lòng thử lại.');
        setIsProcessing(false);
      }
    } else {
      // Xử lý VNPAY / MoMo
      setIsProcessing(true);
      const orderId = `GYMVERSE${Date.now()}`;
      const orderData = {
        id: orderId,
        user_email: currentUserEmail,
        plan_id: planKey,
        plan_name: plan.name,
        amount: calculateFinalPrice(),
        status: 'pending',
        created_at: new Date().toISOString()
      };
      
      // Save to Supabase
      try {
        const { error } = await supabase.from('fitnexus_orders').insert([orderData]);
        if (error) {
          console.error('Supabase order error:', error);
          setErrorMessage('Lỗi khi tạo đơn hàng: ' + error.message);
          setIsProcessing(false);
          return;
        }
      } catch (err) {
        console.error('Failed to save order to Supabase:', err);
        setErrorMessage('Lỗi hệ thống khi tạo đơn hàng.');
        setIsProcessing(false);
        return;
      }

      setTimeout(() => {
        if (paymentMethod === 'momo') {
          router.push(`/thanh-toan/momo?orderId=${orderId}&plan=${planKey}`);
        } else if (paymentMethod === 'vnpay') {
          router.push(`/thanh-toan/vnpay?orderId=${orderId}&plan=${planKey}`);
        }
      }, 1500);
    }
  };

  const handleSubmitOTP = async () => {
    if (otp.length !== 6) {
      setOtpError('OTP phải gồm 6 chữ số');
      return;
    }
    
    setOtpError('');
    setIsProcessing(true);
    setPaymentStatus('processing');
    
    try {
      // BƯỚC E: Nhận kết quả & cập nhật đơn (Mô phỏng)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (otp === '123456') {
        // Thành công
        setPaymentStatus('succeeded');
        
        const { data: { session } } = await supabase.auth.getSession();
        const currentUserEmail = session?.user?.email || '';
        const orderId = `GYMVERSE${Date.now()}`;
        const orderData = {
          id: orderId,
          user_email: currentUserEmail,
          plan_id: planKey,
          plan_name: plan.name,
          amount: calculateFinalPrice(),
          status: 'paid', // Cập nhật trạng thái PAID
          created_at: new Date().toISOString()
        };
        
        // Save to Supabase
        try {
          const { error } = await supabase.from('fitnexus_orders').insert([orderData]);
          if (error) {
            console.error('Supabase order error:', error);
            setPaymentStatus('failed');
            setErrorMessage('Lỗi khi lưu đơn hàng: ' + error.message);
            setIsProcessing(false);
            return;
          }
          
          // Create notification
          const newNotification = {
            user_email: currentUserEmail,
            title: 'Thanh toán thành công',
            message: `Bạn đã thanh toán thành công gói ${plan.name}. Chúc bạn tập luyện hiệu quả!`,
            type: 'payment_success',
            read: false
          };
          
          await supabase.from('fitnexus_notifications').insert([newNotification]);
          
        } catch (err) {
          console.error('Failed to save order to Supabase:', err);
          setPaymentStatus('failed');
          setErrorMessage('Lỗi hệ thống khi lưu đơn hàng.');
          setIsProcessing(false);
          return;
        }
        
        setPaymentStatus('succeeded');
        
        setTimeout(() => {
          router.push(`/thanh-toan/thanh-cong?orderId=${orderId}`);
        }, 1500);
      } else {
        // Thất bại do sai OTP
        setPaymentStatus('failed');
        setErrorMessage('Xác thực không thành công. Mã OTP không chính xác.');
        setIsProcessing(false);
      }
    } catch (error) {
      setPaymentStatus('failed');
      setErrorMessage('Lỗi hệ thống khi xác thực. Vui lòng thử lại.');
      setIsProcessing(false);
    }
  };

  if (isLoadingPlan || !plan) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12">
      <Link href="/goi-tap" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
        <ChevronLeft className="w-4 h-4" />
        Quay lại các gói tập
      </Link>
      
      <h1 className="text-3xl font-black text-white mb-8">Thanh toán gói tập</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div className="bg-surface-dark border border-white/5 rounded-2xl p-8 h-fit">
          <h2 className="text-xl font-bold text-white mb-6">Thông tin đơn hàng</h2>
          
          <div className="flex justify-between items-center pb-4 border-b border-white/10 mb-4">
            <div>
              <p className="font-bold text-lg text-white">Gói {plan.name}</p>
              <p className="text-sm text-slate-400">Thời hạn: {plan.duration}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500 line-through">{plan.originalPrice}</p>
              <p className="font-bold text-lg text-primary">{plan.price}</p>
            </div>
          </div>
          
          <div className="flex justify-between items-center text-sm text-slate-400 mb-2">
            <span>Tạm tính</span>
            <span>{plan.originalPrice}</span>
          </div>
          <div className="flex justify-between items-center text-sm text-accent mb-4 pb-4 border-b border-white/10">
            <span>Khuyến mãi Tết (-30%)</span>
            <span>- {((plan.originalPriceNumber || 0) - (plan.priceNumber || 0)).toLocaleString('vi-VN')}đ</span>
          </div>

          {/* Voucher Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-400 mb-2">Mã giảm giá</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
                placeholder="Nhập mã giảm giá"
                className="flex-1 bg-background-dark border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary uppercase"
              />
              <button 
                onClick={handleApplyVoucher}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-colors"
              >
                Áp dụng
              </button>
            </div>
            {voucherError && <p className="text-red-400 text-sm mt-2">{voucherError}</p>}
            {voucherSuccess && <p className="text-green-400 text-sm mt-2">{voucherSuccess}</p>}
          </div>

          {appliedVoucher && (
            <div className="flex justify-between items-center text-sm text-green-400 mb-4 pb-4 border-b border-white/10">
              <span>Mã {appliedVoucher.code}</span>
              <span>- {appliedVoucher.discount}</span>
            </div>
          )}
          
          <div className="flex justify-between items-center mb-8">
            <span className="font-bold text-white">Tổng cộng</span>
            <span className="text-2xl font-black text-gold-gradient">{calculateFinalPrice()}</span>
          </div>
          
          <div className="flex items-start gap-3 text-sm text-slate-400 bg-white/5 p-4 rounded-xl">
            <ShieldCheck className="w-5 h-5 text-green-500 shrink-0" />
            <p>Giao dịch của bạn được bảo mật an toàn bằng mã hóa SSL 256-bit.</p>
          </div>
        </div>
        
        {/* Payment Methods */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-white mb-6">Phương thức thanh toán</h2>
          
          <div className="space-y-4">
            <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-colors ${paymentMethod === 'vnpay' ? 'border-primary bg-primary/10' : 'border-white/10 bg-surface-dark hover:bg-white/5'}`}>
              <div className="flex items-center gap-4">
                <input 
                  type="radio" 
                  name="payment" 
                  value="vnpay" 
                  checked={paymentMethod === 'vnpay'}
                  onChange={() => setPaymentMethod('vnpay')}
                  className="w-5 h-5 accent-primary"
                />
                <span className="font-medium text-white">Thanh toán qua VNPAY</span>
              </div>
              <div className="text-xs font-bold bg-blue-500/20 text-blue-400 px-2 py-1 rounded">VNPAY</div>
            </label>
            
            <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-colors ${paymentMethod === 'momo' ? 'border-primary bg-primary/10' : 'border-white/10 bg-surface-dark hover:bg-white/5'}`}>
              <div className="flex items-center gap-4">
                <input 
                  type="radio" 
                  name="payment" 
                  value="momo" 
                  checked={paymentMethod === 'momo'}
                  onChange={() => setPaymentMethod('momo')}
                  className="w-5 h-5 accent-primary"
                />
                <span className="font-medium text-white">Ví MoMo</span>
              </div>
              <div className="text-xs font-bold bg-[#A50064]/20 text-[#A50064] px-2 py-1 rounded">MoMo</div>
            </label>
            
            <div className={`rounded-xl border transition-colors overflow-hidden ${paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-white/10 bg-surface-dark hover:bg-white/5'}`}>
              <label className="flex items-center justify-between p-4 cursor-pointer">
                <div className="flex items-center gap-4">
                  <input 
                    type="radio" 
                    name="payment" 
                    value="card" 
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    className="w-5 h-5 accent-primary"
                  />
                  <div>
                    <span className="font-medium text-white block">Thẻ tín dụng / Ghi nợ</span>
                    <span className="text-xs text-slate-400">Visa, Mastercard, JCB</span>
                  </div>
                </div>
                <CreditCard className="w-6 h-6 text-slate-400" />
              </label>
              
              {/* Card Form */}
              {paymentMethod === 'card' && (
                <div className="p-4 border-t border-white/10 bg-surface-dark space-y-4">
                  <div className="text-xs text-slate-400 mb-2 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Thông tin thẻ được mã hóa an toàn
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Số thẻ</label>
                    <input 
                      type="text" 
                      name="number"
                      value={cardDetails.number}
                      onChange={handleCardChange}
                      placeholder="0000 0000 0000 0000"
                      className={`w-full bg-background-dark border ${cardErrors.number ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary font-mono`}
                    />
                    {cardErrors.number && <p className="text-red-500 text-xs mt-1">{cardErrors.number}</p>}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Ngày hết hạn</label>
                      <input 
                        type="text" 
                        name="expiry"
                        value={cardDetails.expiry}
                        onChange={handleCardChange}
                        placeholder="MM/YY"
                        className={`w-full bg-background-dark border ${cardErrors.expiry ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary font-mono`}
                      />
                      {cardErrors.expiry && <p className="text-red-500 text-xs mt-1">{cardErrors.expiry}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Mã bảo mật (CVV)</label>
                      <input 
                        type="password" 
                        name="cvv"
                        value={cardDetails.cvv}
                        onChange={handleCardChange}
                        placeholder="123"
                        maxLength={3}
                        className={`w-full bg-background-dark border ${cardErrors.cvv ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary font-mono`}
                      />
                      {cardErrors.cvv && <p className="text-red-500 text-xs mt-1">{cardErrors.cvv}</p>}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Tên in trên thẻ</label>
                    <input 
                      type="text" 
                      name="name"
                      value={cardDetails.name}
                      onChange={handleCardChange}
                      placeholder="NGUYEN VAN A"
                      className={`w-full bg-background-dark border ${cardErrors.name ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary uppercase`}
                    />
                    {cardErrors.name && <p className="text-red-500 text-xs mt-1">{cardErrors.name}</p>}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {errorMessage && (
            <div className="flex items-center gap-2 text-red-500 bg-red-500/10 p-3 rounded-lg text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p>{errorMessage}</p>
            </div>
          )}
          
          {paymentStatus === 'succeeded' && (
            <div className="flex items-center gap-2 text-green-500 bg-green-500/10 p-3 rounded-lg text-sm">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <p>Thanh toán thành công! Đang chuyển hướng...</p>
            </div>
          )}
          
          <button 
            onClick={handlePayment}
            disabled={isProcessing || paymentStatus === 'succeeded' || paymentStatus === 'requires_action'}
            className="w-full py-4 bg-primary hover:bg-[#8a0b20] text-white font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-8"
          >
            {isProcessing && paymentStatus !== 'requires_action' ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Đang xử lý...
              </>
            ) : (
              `Thanh toán ${plan.price}`
            )}
          </button>
        </div>
      </div>

      {/* 3D Secure Modal */}
      {paymentStatus === 'requires_action' && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-surface-dark border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">Xác thực 3D Secure</h3>
              <button 
                onClick={() => {
                  setPaymentStatus('failed');
                  setErrorMessage('Giao dịch đã bị hủy bởi người dùng.');
                }}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-sm text-slate-400 mb-6">
              Vui lòng nhập mã OTP đã được gửi đến số điện thoại đăng ký với ngân hàng của bạn để hoàn tất giao dịch.
              <br/><br/>
              <span className="text-xs text-primary italic">(Mô phỏng: Nhập &quot;123456&quot; để thành công, số khác để thất bại)</span>
            </p>
            
            <div className="mb-6">
              <input 
                type="text" 
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, '').substring(0, 6));
                  setOtpError('');
                }}
                placeholder="Nhập mã OTP (6 số)"
                className={`w-full bg-background-dark border ${otpError ? 'border-red-500' : 'border-white/10'} rounded-lg px-4 py-3 text-center text-xl tracking-widest text-white focus:outline-none focus:border-primary font-mono`}
              />
              {otpError && <p className="text-red-500 text-xs mt-2 text-center">{otpError}</p>}
            </div>
            
            <button 
              onClick={handleSubmitOTP}
              disabled={isProcessing}
              className="w-full py-3 bg-primary hover:bg-[#8a0b20] text-white font-bold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Xác nhận'
              )}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

