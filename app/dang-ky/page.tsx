'use client';

import Link from 'next/link';
import { Dumbbell, ArrowRight, Facebook, Mail, Loader2, Eye, EyeOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function DangKyPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ fullname: '', phone: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleAuthSuccess = async (session: any) => {
      if (!session?.user) return;
      setIsLoading(true);
      
      const email = session.user.email || `${session.user.id}@oauth.gymverse.vn`;
      let userObj = {
        role: 'user',
        email: email,
        fullname: session.user.user_metadata?.full_name || email.split('@')[0] || 'User',
      };
      
      try {
        const { data: existing } = await supabase
          .from('fitnexus_users')
          .select('email, role, fullname')
          .eq('email', email)
          .single();
          
        if (!existing) {
          await supabase.from('fitnexus_users').insert([{
            email: email,
            fullname: userObj.fullname,
            phone: 'N/A',
            password: 'oauth_user',
            role: 'user'
          }]);
        } else {
          userObj = {
            ...userObj,
            role: existing.role || 'user',
            fullname: existing.fullname || userObj.fullname
          };
        }
      } catch (e) {
        console.error('Lỗi đồng bộ user OAuth', e);
      }

      window.dispatchEvent(new Event('user-auth-changed'));
      
      if (userObj.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    };

    // Check existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) handleAuthSuccess(session);
    });

    // 1. Listen for Supabase auth changes (cross-tab)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        handleAuthSuccess(session);
      }
    });

    // 2. Fallback: Listen for popup messages
    const handleMessage = async (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost')) return;
      
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        setIsLoading(true);
        setTimeout(async () => {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            handleAuthSuccess(session);
          } else {
            window.location.href = '/dashboard';
          }
        }, 100);
      } else if (event.data?.type === 'OAUTH_AUTH_ERROR') {
        let errorMsg = event.data.error || 'Đăng nhập thất bại';
        if (errorMsg.includes('Unable to exchange external code')) {
          errorMsg = 'Lỗi cấu hình Google OAuth trong Supabase: Vui lòng kiểm tra lại Client ID và Client Secret trong Supabase Dashboard.';
        }
        setError(errorMsg);
        setIsLoading(false);
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    return () => {
      subscription.unsubscribe();
      window.removeEventListener('message', handleMessage);
    };
  }, [router]);

  const handleOAuth = async (provider: 'google' | 'facebook') => {
    try {
      setError('');
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          skipBrowserRedirect: true,
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;

      if (data?.url) {
        const popup = window.open(data.url, 'oauth_popup', 'width=600,height=700');
        if (!popup) {
          setError('Vui lòng cho phép hiển thị popup (Cửa sổ bật lên) trên trình duyệt để đăng nhập.');
        }
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || `Không thể kết nối với ${provider}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // Bước 1: Kiểm tra email đã tồn tại chưa
      const { data: existing } = await supabase
        .from('fitnexus_users')
        .select('email')
        .eq('email', formData.email)
        .single();

      if (existing) {
        setError('Email này đã được đăng ký!');
        setIsLoading(false);
        return;
      }

      // Bước 2: Insert trực tiếp vào bảng fitnexus_users (KHÔNG gọi supabase.auth.signUp)
      const { error: insertError } = await supabase
        .from('fitnexus_users')
        .insert([
          { 
            fullname: formData.fullname, 
            phone: formData.phone, 
            email: formData.email, 
            password: formData.password,
            role: 'user'
          }
        ]);

      if (insertError) {
        console.error('Lỗi lưu thông tin user:', insertError);
        setError('Có lỗi xảy ra khi đăng ký. Vui lòng thử lại sau.');
        setIsLoading(false);
        return;
      }

      // Bước 3: Redirect về trang đăng nhập với thông báo thành công
      router.push('/dang-nhap?registered=true');
    } catch (err: any) {
      console.error('Lỗi đăng ký:', err);
      setError(err?.message || 'Có lỗi xảy ra khi đăng ký.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background-dark">
      
      {/* Left Side - Image/Branding */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden bg-surface-dark">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1470&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
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
              Bắt Đầu <br />
              <span className="text-gold-gradient">Hành Trình</span>
            </h1>
            <p className="text-slate-300 text-lg font-light leading-relaxed">
              Trở thành hội viên GymVerse ngay hôm nay để trải nghiệm không gian tập luyện đẳng cấp và nhận ưu đãi Tết Ất Tỵ 2026.
            </p>
          </div>
          
          <div className="flex gap-4 text-slate-400 text-sm">
            <span>© 2026 GymVerse.</span>
            <Link href="/bao-mat" className="hover:text-white transition-colors">Bảo mật</Link>
            <Link href="/dieu-khoan" className="hover:text-white transition-colors">Điều khoản</Link>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative overflow-y-auto">
        <Link href="/" className="md:hidden flex items-center gap-2 mb-12 absolute top-8 left-6">
          <Dumbbell className="text-accent w-8 h-8" />
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">
            Gym<span className="text-primary">Verse</span>
          </h2>
        </Link>
        
        <div className="w-full max-w-[400px] flex flex-col gap-8 py-12 md:py-0">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-black text-white mb-2">Đăng Ký Tài Khoản</h2>
            <p className="text-slate-400">Tạo tài khoản để bắt đầu hành trình của bạn.</p>
          </div>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="fullname" className="text-sm font-medium text-slate-300">Họ và tên</label>
              <input 
                type="text" 
                id="fullname" 
                value={formData.fullname}
                onChange={handleChange}
                placeholder="Nhập họ và tên đầy đủ" 
                className="bg-surface-dark border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors w-full"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="phone" className="text-sm font-medium text-slate-300">Số điện thoại</label>
              <input 
                type="tel" 
                id="phone" 
                value={formData.phone}
                onChange={handleChange}
                placeholder="Nhập số điện thoại" 
                className="bg-surface-dark border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors w-full"
                required
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-300">Email</label>
              <input 
                type="email" 
                id="email" 
                value={formData.email}
                onChange={handleChange}
                placeholder="Nhập địa chỉ email" 
                className="bg-surface-dark border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors w-full"
                required
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm font-medium text-slate-300">Mật khẩu</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="password" 
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Tạo mật khẩu (ít nhất 8 ký tự)" 
                  className="bg-surface-dark border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors w-full pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            <div className="flex items-start gap-2 mt-2">
              <input type="checkbox" id="terms" className="w-4 h-4 mt-1 rounded border-white/20 bg-surface-dark text-primary focus:ring-primary focus:ring-offset-background-dark" required />
              <label htmlFor="terms" className="text-sm text-slate-400 cursor-pointer leading-relaxed">
                Tôi đồng ý với các <Link href="/dieu-khoan" className="text-accent hover:text-accent-light transition-colors">Điều khoản dịch vụ</Link> và <Link href="/bao-mat" className="text-accent hover:text-accent-light transition-colors">Chính sách bảo mật</Link> của GymVerse.
              </label>
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-4 mt-4 bg-gradient-to-r from-primary to-[#8a0b20] hover:from-[#a00d25] hover:to-[#6b0819] text-white font-bold rounded-xl shadow-[0_0_20px_rgba(198,16,46,0.3)] transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  Đăng Ký Ngay
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
          
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink-0 mx-4 text-slate-500 text-sm">Hoặc đăng ký với</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <button 
              type="button"
              onClick={() => handleOAuth('facebook')}
              className="flex items-center justify-center gap-2 py-3 rounded-xl border border-white/10 bg-surface-dark hover:bg-white/5 text-white font-medium transition-colors"
            >
              <Facebook className="w-5 h-5 text-blue-500" />
              Facebook
            </button>
            <button 
              type="button"
              onClick={() => handleOAuth('google')}
              className="flex items-center justify-center gap-2 py-3 rounded-xl border border-white/10 bg-surface-dark hover:bg-white/5 text-white font-medium transition-colors"
            >
              <Mail className="w-5 h-5 text-red-500" />
              Google
            </button>
          </div>
          
          <p className="text-center text-slate-400 text-sm mt-4">
            Đã có tài khoản?{' '}
            <a href="/dang-nhap" className="text-accent font-bold hover:text-accent-light transition-colors relative z-10 cursor-pointer inline-block py-2">
              Đăng nhập
            </a>
          </p>
        </div>
      </div>
      
    </div>
  );
}
