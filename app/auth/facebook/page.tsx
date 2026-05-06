'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function FacebookLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'login' | 'loading'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    if (!email.trim()) {
      setError('Vui lòng nhập email hoặc số điện thoại.');
      return;
    }
    if (!password.trim() || password.length < 3) {
      setError('Mật khẩu không hợp lệ. Vui lòng thử lại.');
      return;
    }
    setError('');
    setStep('loading');

    try {
      // Kiểm tra user trong DB
      const { data: existingUser } = await supabase
        .from('fitnexus_users')
        .select('*')
        .eq('email', email)
        .single();

      if (!existingUser) {
        // Tạo user mới (đăng ký qua Facebook)
        const fullname = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        await supabase.from('fitnexus_users').insert([{
          email: email,
          fullname: fullname,
          role: 'member',
          points: 100,
          password: 'facebook_oauth',
          weight: '70',
          height: '175',
          goal: 'Giảm mỡ'
        }]);
      }

      // Lưu session
      localStorage.setItem('mock_user_email', email);
      window.dispatchEvent(new Event('user-auth-changed'));

      // Thêm thông báo chào mừng
      await supabase.from('fitnexus_notifications').insert([{
        user_email: email,
        title: 'Đăng nhập thành công',
        message: `Chào mừng bạn đã đăng nhập bằng Facebook! Chúc bạn tập luyện hiệu quả tại GymVerse.`,
        type: 'info',
        read: false
      }]);

      // Redirect
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err) {
      console.error(err);
      setStep('login');
      setError('Đã có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-[#f0f2f5] flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-12 text-center max-w-md w-full mx-4">
          <div className="w-10 h-10 border-4 border-[#1877F2] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-600 text-sm">Đang xác thực tài khoản Facebook...</p>
          <p className="text-gray-400 text-xs mt-2">Vui lòng đợi trong giây lát</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-[980px] mx-auto px-4 h-14 flex items-center justify-between">
          {/* Facebook Logo */}
          <svg width="112" height="28" viewBox="0 0 112 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <text x="0" y="22" fontFamily="Helvetica, Arial, sans-serif" fontSize="24" fontWeight="bold" fill="#1877F2">facebook</text>
          </svg>
          <div className="flex items-center gap-2">
            <input 
              type="text"
              placeholder="Email hoặc số điện thoại"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              className="h-9 w-44 px-3 text-sm border border-[#dddfe2] rounded-md bg-white focus:outline-none focus:border-[#1877F2]"
            />
            <input 
              type="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
              className="h-9 w-44 px-3 text-sm border border-[#dddfe2] rounded-md bg-white focus:outline-none focus:border-[#1877F2]"
            />
            <button 
              onClick={handleSignIn}
              className="h-9 px-4 bg-[#1877F2] hover:bg-[#166FE5] text-white text-sm font-bold rounded-md transition-colors"
            >
              Đăng nhập
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-[980px] w-full flex flex-col lg:flex-row items-center gap-6 lg:gap-16 py-12">
          {/* Left - Text */}
          <div className="lg:flex-1 text-center lg:text-left lg:pt-12">
            <h1 className="text-[#1877F2] text-4xl lg:text-[56px] font-bold leading-tight mb-4 lg:mb-0" style={{ fontFamily: 'SFProDisplay-Regular, Helvetica, Arial, sans-serif' }}>
              facebook
            </h1>
            <p className="text-xl lg:text-2xl text-[#1c1e21] font-normal leading-relaxed">
              Facebook giúp bạn kết nối và chia sẻ với mọi người trong cuộc sống của bạn.
            </p>
          </div>

          {/* Right - Login Form */}
          <div className="w-full max-w-[396px]">
            <div className="bg-white rounded-lg shadow-lg p-4">
              <div className="space-y-3">
                <input 
                  type="text"
                  placeholder="Email hoặc số điện thoại"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  className="w-full h-[52px] px-4 text-[17px] border border-[#dddfe2] rounded-md bg-white focus:outline-none focus:border-[#1877F2] focus:shadow-[0_0_0_2px_#e7f3ff] transition-all placeholder:text-[#8a8d91]"
                />
                <input 
                  type="password"
                  placeholder="Mật khẩu"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleSignIn()}
                  className="w-full h-[52px] px-4 text-[17px] border border-[#dddfe2] rounded-md bg-white focus:outline-none focus:border-[#1877F2] focus:shadow-[0_0_0_2px_#e7f3ff] transition-all placeholder:text-[#8a8d91]"
                />

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <button 
                  onClick={handleSignIn}
                  className="w-full h-[48px] bg-[#1877F2] hover:bg-[#166FE5] text-white text-xl font-bold rounded-md transition-colors shadow-sm"
                >
                  Đăng nhập
                </button>

                <div className="text-center pt-1">
                  <a href="#" className="text-[#1877F2] text-sm hover:underline">Quên mật khẩu?</a>
                </div>

                <div className="border-t border-[#dadde1] pt-4 mt-4">
                  <div className="flex justify-center">
                    <button className="h-[48px] px-4 bg-[#42b72a] hover:bg-[#36a420] text-white text-[17px] font-bold rounded-md transition-colors">
                      Tạo tài khoản mới
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-center text-sm text-[#737373] mt-6">
              <a href="#" className="font-bold text-[#1c1e21] hover:underline">Tạo Trang</a>{' '}
              dành cho người nổi tiếng, thương hiệu hoặc doanh nghiệp.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-[980px] mx-auto px-4">
          <div className="flex flex-wrap gap-2 text-xs text-[#8a8d91] mb-3">
            <a href="#" className="hover:underline">Tiếng Việt</a>
            <a href="#" className="hover:underline">English</a>
            <a href="#" className="hover:underline">中文(简体)</a>
            <a href="#" className="hover:underline">日本語</a>
            <a href="#" className="hover:underline">한국어</a>
            <a href="#" className="hover:underline">Français</a>
            <a href="#" className="hover:underline">Deutsch</a>
          </div>
          <div className="border-t border-[#e5e5e5] pt-2">
            <p className="text-xs text-[#8a8d91]">Meta © 2026</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
