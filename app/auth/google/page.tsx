'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function GoogleLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'password' | 'loading'>('email');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [password, setPassword] = useState('');

  const handleEmailNext = () => {
    if (!email.trim() || !email.includes('@')) {
      setEmailError('Nhập địa chỉ email');
      return;
    }
    setEmailError('');
    setStep('password');
  };

  const handleSignIn = async () => {
    if (!password.trim() || password.length < 3) {
      setPasswordError('Nhập mật khẩu của bạn');
      return;
    }
    setPasswordError('');
    setStep('loading');

    try {
      // Kiểm tra user trong DB
      const { data: existingUser } = await supabase
        .from('fitnexus_users')
        .select('*')
        .eq('email', email)
        .single();

      if (!existingUser) {
        // Tạo user mới (đăng ký qua Google)
        const fullname = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        await supabase.from('fitnexus_users').insert([{
          email: email,
          fullname: fullname,
          role: 'member',
          points: 100,
          password: 'google_oauth',
          weight: '70',
          height: '175',
          goal: 'Tăng cơ'
        }]);
      }

      // Lưu session
      localStorage.setItem('mock_user_email', email);
      window.dispatchEvent(new Event('user-auth-changed'));

      // Thêm thông báo chào mừng
      await supabase.from('fitnexus_notifications').insert([{
        user_email: email,
        title: 'Đăng nhập thành công',
        message: `Chào mừng bạn đã đăng nhập bằng Google! Chúc bạn tập luyện hiệu quả tại GymVerse.`,
        type: 'info',
        read: false
      }]);

      // Redirect
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err) {
      console.error(err);
      setStep('password');
      setPasswordError('Đã có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-[#f0f4f9] flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-md w-full mx-4">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 text-sm">Đang xác thực tài khoản Google...</p>
          <p className="text-gray-400 text-xs mt-2">Vui lòng đợi trong giây lát</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f4f9] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-[450px] w-full overflow-hidden">
        <div className="p-10 pb-8">
          {/* Google Logo */}
          <div className="flex justify-center mb-4">
            <svg width="75" height="24" viewBox="0 0 75 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M30.2 12.2c0-3.4-2.7-5.9-6-5.9s-6 2.5-6 5.9c0 3.5 2.7 5.9 6 5.9s6-2.5 6-5.9zm-2.6 0c0 2.1-1.5 3.6-3.4 3.6s-3.4-1.5-3.4-3.6c0-2.1 1.5-3.6 3.4-3.6s3.4 1.5 3.4 3.6z" fill="#EA4335"/>
              <path d="M44.5 12.2c0-3.4-2.7-5.9-6-5.9s-6 2.5-6 5.9c0 3.5 2.7 5.9 6 5.9s6-2.5 6-5.9zm-2.6 0c0 2.1-1.5 3.6-3.4 3.6s-3.4-1.5-3.4-3.6c0-2.1 1.5-3.6 3.4-3.6s3.4 1.5 3.4 3.6z" fill="#FBBC05"/>
              <path d="M58.3 6.8v10.5c0 4.3-2.6 6.1-5.6 6.1-2.9 0-4.6-1.9-5.2-3.5l2.3-1c.4 1 1.4 2.1 3 2.1 1.9 0 3.1-1.2 3.1-3.4v-.8h-.1c-.6.7-1.7 1.3-3.1 1.3-3 0-5.7-2.6-5.7-5.9 0-3.4 2.7-6 5.7-6 1.4 0 2.5.6 3.1 1.3h.1v-.9h2.4zm-2.2 5.4c0-2.1-1.4-3.6-3.2-3.6-1.8 0-3.3 1.5-3.3 3.6s1.5 3.6 3.3 3.6c1.8 0 3.2-1.6 3.2-3.6z" fill="#4285F4"/>
              <path d="M62.2 1.2v16.6h-2.5V1.2h2.5z" fill="#34A853"/>
              <path d="M73.4 14.2l2 1.3c-.6 1-2.2 2.6-4.9 2.6-3.3 0-5.8-2.6-5.8-5.9 0-3.5 2.5-5.9 5.5-5.9 3 0 4.5 2.4 5 3.7l.3.7-7.8 3.2c.6 1.2 1.5 1.7 2.8 1.7s2.2-.6 2.9-1.6zm-6.1-2.1l5.2-2.2c-.3-.7-1.2-1.2-2.2-1.2-1.3 0-3.2 1.2-3 3.4z" fill="#EA4335"/>
              <path d="M10.5 10.9v2.6H16c-.2 1.2-.7 2-1.4 2.7-.9.9-2.2 1.8-4.1 1.8-3.3 0-5.8-2.6-5.8-5.9s2.6-5.9 5.8-5.9c1.8 0 3 .7 4 1.6l1.8-1.8C14.9 5 13.2 3.8 10.5 3.8 6 3.8 2.2 7.4 2.2 12s3.8 8.2 8.3 8.2c2.4 0 4.3-.8 5.7-2.3 1.5-1.5 1.9-3.5 1.9-5.2 0-.5 0-1-.1-1.4h-7.5v-.4z" fill="#4285F4"/>
            </svg>
          </div>

          <h1 className="text-2xl font-normal text-[#1f1f1f] text-center mb-1">
            {step === 'email' ? 'Đăng nhập' : 'Chào mừng'}
          </h1>
          <p className="text-sm text-[#444746] text-center mb-8">
            {step === 'email' ? 'Sử dụng Tài khoản Google của bạn' : email}
          </p>

          {step === 'email' && (
            <div>
              <div className="mb-6">
                <div className={`border rounded-md px-3 pt-3 pb-1 transition-colors ${emailError ? 'border-red-500' : 'border-[#747775] hover:border-[#1f1f1f] focus-within:border-blue-600 focus-within:border-2'}`}>
                  <label className="text-xs text-[#444746] block">Email hoặc số điện thoại</label>
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleEmailNext()}
                    className="w-full text-[15px] text-[#1f1f1f] bg-transparent outline-none pb-1"
                    autoFocus
                  />
                </div>
                {emailError && <p className="text-red-500 text-xs mt-2 flex items-center gap-1"><span>⚠</span> {emailError}</p>}
              </div>

              <p className="text-sm text-[#444746] mb-8">
                Bạn không phải máy tính?{' '}
                <a href="#" className="text-blue-600 font-medium hover:underline">Sử dụng chế độ khách</a>{' '}
                để đăng nhập một cách riêng tư.
              </p>

              <div className="flex justify-between items-center">
                <a href="#" className="text-blue-600 text-sm font-medium hover:bg-blue-50 px-2 py-1 rounded-md">
                  Tạo tài khoản
                </a>
                <button 
                  onClick={handleEmailNext}
                  className="bg-[#1a73e8] hover:bg-[#1765cc] text-white text-sm font-medium px-6 py-2.5 rounded-full shadow-sm transition-colors"
                >
                  Tiếp theo
                </button>
              </div>
            </div>
          )}

          {step === 'password' && (
            <div>
              {/* User avatar */}
              <button 
                onClick={() => setStep('email')}
                className="flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full border border-[#747775] hover:bg-[#f0f4f9] transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium">
                  {email[0]?.toUpperCase()}
                </div>
                <span className="text-sm text-[#1f1f1f]">{email}</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M7 10l5 5 5-5z" fill="#1f1f1f"/></svg>
              </button>

              <div className="mb-4">
                <div className={`border rounded-md px-3 pt-3 pb-1 transition-colors ${passwordError ? 'border-red-500' : 'border-[#747775] hover:border-[#1f1f1f] focus-within:border-blue-600 focus-within:border-2'}`}>
                  <label className="text-xs text-[#444746] block">Nhập mật khẩu của bạn</label>
                  <input 
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setPasswordError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
                    className="w-full text-[15px] text-[#1f1f1f] bg-transparent outline-none pb-1"
                    autoFocus
                  />
                </div>
                {passwordError && <p className="text-red-500 text-xs mt-2 flex items-center gap-1"><span>⚠</span> {passwordError}</p>}
              </div>

              <a href="#" className="text-blue-600 text-sm font-medium hover:underline">
                Bạn quên mật khẩu?
              </a>

              <div className="flex justify-between items-center mt-8">
                <span></span>
                <button 
                  onClick={handleSignIn}
                  className="bg-[#1a73e8] hover:bg-[#1765cc] text-white text-sm font-medium px-6 py-2.5 rounded-full shadow-sm transition-colors"
                >
                  Tiếp theo
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-10 py-6 bg-white border-t border-gray-100">
          <select className="text-xs text-[#444746] bg-transparent outline-none cursor-pointer">
            <option>Tiếng Việt</option>
            <option>English (United States)</option>
          </select>
          <div className="flex gap-4">
            <a href="#" className="text-xs text-[#444746] hover:text-[#1f1f1f]">Trợ giúp</a>
            <a href="#" className="text-xs text-[#444746] hover:text-[#1f1f1f]">Quyền riêng tư</a>
            <a href="#" className="text-xs text-[#444746] hover:text-[#1f1f1f]">Điều khoản</a>
          </div>
        </div>
      </div>
    </div>
  );
}
