'use client';

import Link from 'next/link';
import { Dumbbell, ArrowRight, Facebook, Mail, Loader2, Eye, EyeOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function DangNhapPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if user just registered
    const params = new URLSearchParams(window.location.search);
    if (params.get('registered') === 'true') {
      setSuccess('Đăng ký thành công! Vui lòng đăng nhập.');
    }

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

      // Lưu session vào localStorage cho nhất quán
      localStorage.setItem('mock_user_email', email);
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
      // Query trực tiếp bảng fitnexus_users
      const { data: user, error: fetchError } = await supabase
        .from('fitnexus_users')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .single();

      if (fetchError || !user) {
        setError('Email hoặc mật khẩu không chính xác!');
        setIsLoading(false);
        return;
      }

      // Lưu session vào localStorage
      localStorage.setItem('mock_user_email', email);
      window.dispatchEvent(new Event('user-auth-changed'));

      // Redirect theo role
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Có lỗi xảy ra khi đăng nhập.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background-dark">
      
      {/* Left Side - Image/Branding */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden bg-surface-dark">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1470&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay"></div>
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
              Đẳng Cấp <br />
              <span className="text-gold-gradient">Thể Hình</span>
            </h1>
            <p className="text-slate-300 text-lg font-light leading-relaxed">
              Đăng nhập để quản lý lịch tập, theo dõi tiến độ và nhận những ưu đãi đặc quyền dành riêng cho hội viên GymVerse.
            </p>
          </div>
          
          <div className="flex gap-4 text-slate-400 text-sm">
            <span>© 2026 GymVerse.</span>
            <Link href="/bao-mat" className="hover:text-white transition-colors">Bảo mật</Link>
            <Link href="/dieu-khoan" className="hover:text-white transition-colors">Điều khoản</Link>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 relative">
        <Link href="/" className="md:hidden flex items-center gap-2 mb-12 absolute top-8 left-6">
          <Dumbbell className="text-accent w-8 h-8" />
          <h2 className="text-2xl font-black text-white uppercase tracking-tight">
            Gym<span className="text-primary">Verse</span>
          </h2>
        </Link>
        
        <div className="w-full max-w-[400px] flex flex-col gap-8">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-black text-white mb-2">Chào mừng trở lại!</h2>
            <p className="text-slate-400">Vui lòng đăng nhập vào tài khoản của bạn.</p>
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
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-medium text-slate-300">Email hoặc Tên đăng nhập</label>
              <input 
                type="text" 
                id="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email hoặc tên đăng nhập" 
                className="bg-surface-dark border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors w-full"
                required
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-sm font-medium text-slate-300">Mật khẩu</label>
                <Link href="/quen-mat-khau" className="text-sm text-accent hover:text-accent-light transition-colors">Quên mật khẩu?</Link>
              </div>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu" 
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
            
            <div className="flex items-center gap-2 mt-2">
              <input type="checkbox" id="remember" className="w-4 h-4 rounded border-white/20 bg-surface-dark text-primary focus:ring-primary focus:ring-offset-background-dark" />
              <label htmlFor="remember" className="text-sm text-slate-400 cursor-pointer">Ghi nhớ đăng nhập</label>
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-4 mt-4 bg-primary hover:bg-[#8a0b20] text-white font-bold rounded-xl shadow-[0_0_20px_rgba(198,16,46,0.3)] transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  Đăng Nhập
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
          
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink-0 mx-4 text-slate-500 text-sm">Hoặc đăng nhập với</span>
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
            Chưa có tài khoản?{' '}
            <a href="/dang-ky" className="text-accent font-bold hover:text-accent-light transition-colors relative z-10 cursor-pointer inline-block py-2">
              Đăng ký ngay
            </a>
          </p>
        </div>
      </div>
      
    </div>
  );
}
