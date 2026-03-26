'use client';

import Link from 'next/link';
import { Dumbbell, ArrowRight, ArrowLeft, Mail, KeyRound, CheckCircle2, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function QuenMatKhauPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendCode = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      // Check if email exists
      const { data: user, error: fetchError } = await supabase
        .from('fitnexus_users')
        .select('email')
        .eq('email', email)
        .single();

      if (fetchError || !user) {
        if (fetchError?.code === '42P01') {
          setError('Bảng fitnexus_users chưa được tạo trong Supabase Database của bạn.');
        } else {
          setError('Email không tồn tại trong hệ thống.');
        }
        setIsLoading(false);
        return;
      }

      // Generate a random 6-digit code
      const newCode = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedCode(newCode);
      
      // Call API to send email
      const response = await fetch('/api/send-reset-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code: newCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === 'Email credentials are not configured on the server') {
          setError('Tính năng gửi email chưa được cấu hình trên server (Thiếu EMAIL_USER/EMAIL_PASS).');
        } else {
          setError(`Không thể gửi email: ${data.details || data.error || 'Vui lòng thử lại sau.'}`);
        }
        setIsLoading(false);
        return;
      }

      setSuccess(`Mã xác nhận đã được gửi đến email ${email} của bạn.`);
      setStep(2);
    } catch (err: any) {
      setError('Có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (code === generatedCode) {
      setSuccess('Xác thực thành công. Vui lòng nhập mật khẩu mới.');
      setStep(3);
    } else {
      setError('Mã xác nhận không chính xác.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự.');
      setIsLoading(false);
      return;
    }

    try {
      const { error: updateError } = await supabase
        .from('fitnexus_users')
        .update({ password: newPassword })
        .eq('email', email);

      if (updateError) throw updateError;

      setSuccess('Đổi mật khẩu thành công! Đang chuyển hướng đến trang đăng nhập...');
      
      setTimeout(() => {
        router.push('/dang-nhap');
      }, 2000);
    } catch (err: any) {
      setError('Có lỗi xảy ra khi cập nhật mật khẩu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background-dark">
      {/* Left Side - Image/Branding */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden bg-surface-dark">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-background-dark/90 via-background-dark/50 to-transparent"></div>
        
        <div className="relative z-10 p-12 flex flex-col justify-between h-full">
          <Link href="/" className="flex items-center gap-3 w-fit">
            <Dumbbell className="text-accent w-10 h-10" />
            <h2 className="text-3xl font-black text-white uppercase tracking-tight">
              Gym<span className="text-primary">Verse</span>
            </h2>
          </Link>
          
          <div className="max-w-md">
            <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-6">
              Khôi Phục <br />
              <span className="text-gold-gradient">Tài Khoản</span>
            </h1>
            <p className="text-slate-300 text-lg font-light leading-relaxed">
              Đừng lo lắng, chúng tôi sẽ giúp bạn lấy lại quyền truy cập vào tài khoản GymVerse của mình.
            </p>
          </div>
          
          <div className="flex gap-4 text-slate-400 text-sm">
            <span>© 2026 GymVerse.</span>
            <Link href="/bao-mat" className="hover:text-white transition-colors">Bảo mật</Link>
            <Link href="/dieu-khoan" className="hover:text-white transition-colors">Điều khoản</Link>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative">
        <Link href="/" className="md:hidden flex items-center gap-2 mb-12 absolute top-8 left-6">
          <Dumbbell className="text-accent w-8 h-8" />
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">
            Gym<span className="text-primary">Verse</span>
          </h2>
        </Link>
        
        <div className="w-full max-w-[400px] flex flex-col gap-8">
          <Link href="/dang-nhap" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors w-fit">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Quay lại đăng nhập</span>
          </Link>

          <div className="text-center md:text-left">
            <h2 className="text-3xl font-black text-white mb-2">Quên mật khẩu?</h2>
            <p className="text-slate-400">
              {step === 1 && 'Nhập email của bạn để nhận mã xác nhận.'}
              {step === 2 && 'Nhập mã gồm 6 chữ số đã được gửi đến email của bạn.'}
              {step === 3 && 'Tạo mật khẩu mới cho tài khoản của bạn.'}
            </p>
          </div>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-xl text-sm">
              {success}
            </div>
          )}
          
          {/* Step 1: Email */}
          {step === 1 && (
            <form onSubmit={handleSendCode} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label htmlFor="email" className="text-sm font-medium text-slate-300">Email đăng ký</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-500" />
                  </div>
                  <input 
                    type="email" 
                    id="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Nhập email của bạn" 
                    className="bg-surface-dark border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-accent transition-colors w-full"
                    required
                  />
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={isLoading || !email}
                className="w-full py-4 mt-4 bg-primary hover:bg-[#8a0b20] text-white font-bold rounded-xl shadow-[0_0_20px_rgba(198,16,46,0.3)] transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang gửi...
                  </>
                ) : (
                  <>
                    Gửi mã xác nhận
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Step 2: Verification Code */}
          {step === 2 && (
            <form onSubmit={handleVerifyCode} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label htmlFor="code" className="text-sm font-medium text-slate-300">Mã xác nhận</label>
                <input 
                  type="text" 
                  id="code" 
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Nhập mã 6 số" 
                  className="bg-surface-dark border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors w-full text-center text-2xl tracking-[0.5em] font-mono"
                  required
                  maxLength={6}
                />
              </div>
              
              <button 
                type="submit" 
                disabled={code.length !== 6}
                className="w-full py-4 mt-4 bg-primary hover:bg-[#8a0b20] text-white font-bold rounded-xl shadow-[0_0_20px_rgba(198,16,46,0.3)] transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
              >
                Xác nhận mã
                <CheckCircle2 className="w-5 h-5" />
              </button>
              
              <button 
                type="button"
                onClick={handleSendCode}
                className="text-sm text-slate-400 hover:text-white transition-colors text-center mt-2"
              >
                Chưa nhận được mã? Gửi lại
              </button>
            </form>
          )}

          {/* Step 3: New Password */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label htmlFor="newPassword" className="text-sm font-medium text-slate-300">Mật khẩu mới</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <KeyRound className="h-5 w-5 text-slate-500" />
                  </div>
                  <input 
                    type="password" 
                    id="newPassword" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới" 
                    className="bg-surface-dark border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-accent transition-colors w-full"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-300">Xác nhận mật khẩu mới</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <KeyRound className="h-5 w-5 text-slate-500" />
                  </div>
                  <input 
                    type="password" 
                    id="confirmPassword" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới" 
                    className="bg-surface-dark border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-accent transition-colors w-full"
                    required
                    minLength={6}
                  />
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={isLoading || !newPassword || !confirmPassword}
                className="w-full py-4 mt-4 bg-primary hover:bg-[#8a0b20] text-white font-bold rounded-xl shadow-[0_0_20px_rgba(198,16,46,0.3)] transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Đang cập nhật...
                  </>
                ) : (
                  <>
                    Đổi mật khẩu
                    <CheckCircle2 className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
