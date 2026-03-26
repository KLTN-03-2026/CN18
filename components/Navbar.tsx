'use client';

import Link from 'next/link';
import { Dumbbell, User, LogOut, Activity, Shield, Calendar, Award, Bell, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const userEmail = session.user.email;
          
          // Fetch user details from custom table to get role and fullname
          const { data: userData } = await supabase
            .from('fitnexus_users')
            .select('*')
            .eq('email', userEmail)
            .single();
            
          if (userData) {
            setUser(userData);
          } else {
            setUser({ email: userEmail, fullname: session.user.user_metadata?.fullname || 'User' });
          }
          
          if (userEmail) {
            loadNotifications(userEmail);
          }
        } else {
          setUser(null);
          setNotifications([]);
        }
      } catch (e) {
        console.error('Error checking auth session:', e);
      }
    };

    const loadNotifications = async (email: string) => {
      try {
        const { data, error } = await supabase
          .from('fitnexus_notifications')
          .select('*')
          .eq('user_email', email)
          .order('created_at', { ascending: false });
          
        if (!error && data) {
          setNotifications(data);
        } else if (error) {
          console.error('Error fetching notifications from Supabase:', error);
        }
      } catch (err) {
        console.error('Error loading notifications:', err);
      }
    };

    checkUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      checkUser();
    });
    
    // Custom event to trigger re-render on login/logout
    window.addEventListener('user-auth-changed', checkUser);
    window.addEventListener('notifications-updated', () => {
      if (user?.email) {
        loadNotifications(user.email);
      }
    });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('user-auth-changed', checkUser);
      window.removeEventListener('notifications-updated', checkUser);
    };
  }, [user?.email]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.dispatchEvent(new Event('user-auth-changed'));
    setIsMobileMenuOpen(false);
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-[#482329] bg-background-dark/95 backdrop-blur-sm px-4 py-4 md:px-10 lg:px-20">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Toggle */}
        <button 
          className="lg:hidden text-slate-300 hover:text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        <Link href="/" className="flex items-center gap-2 md:gap-4">
          <div className="size-6 md:size-8 text-accent">
            <Dumbbell className="w-full h-full" />
          </div>
          <h2 className="text-white text-lg md:text-xl font-black tracking-tight uppercase">
            Gym<span className="text-primary">Verse</span>
          </h2>
        </Link>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden lg:flex flex-1 justify-center gap-8">
        <nav className="flex items-center gap-8">
          <Link href="/" className="text-slate-300 hover:text-accent text-sm font-medium transition-colors">Trang chủ</Link>
          <Link href="/goi-tap" className="text-slate-300 hover:text-accent text-sm font-medium transition-colors">Gói tập</Link>
          <Link href="/huan-luyen-vien" className="text-slate-300 hover:text-accent text-sm font-medium transition-colors">Huấn luyện viên</Link>
          <Link href="/co-so-vat-chat" className="text-slate-300 hover:text-accent text-sm font-medium transition-colors">Cơ sở vật chất</Link>
          <Link href="/lich-tap" className="text-slate-300 hover:text-accent text-sm font-medium transition-colors">Lịch tập</Link>
          <Link href="/lien-he" className="text-slate-300 hover:text-accent text-sm font-medium transition-colors">Liên hệ</Link>
        </nav>
      </div>

      {/* User Actions */}
      <div className="flex gap-2 md:gap-3 relative items-center">
        {user ? (
          <>
            <div className="relative">
              <button 
                onClick={() => {
                  setIsNotificationsOpen(!isNotificationsOpen);
                  setIsMenuOpen(false);
                }}
                className="relative p-2 text-slate-300 hover:text-white transition-colors rounded-full hover:bg-white/5"
              >
                <Bell className="w-5 h-5" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-72 md:w-80 rounded-xl border border-white/10 bg-surface-dark shadow-xl py-2 z-50 max-h-96 overflow-y-auto">
                  <div className="px-4 py-2 border-b border-white/10 mb-2 flex justify-between items-center">
                    <h3 className="text-sm font-bold text-white">Thông báo</h3>
                    {notifications.length > 0 && (
                      <button 
                        onClick={async () => {
                          const updated = notifications.map(n => ({ ...n, read: true }));
                          setNotifications(updated);
                          try {
                            await supabase
                              .from('fitnexus_notifications')
                              .update({ read: true })
                              .eq('user_email', user.email);
                          } catch (err) {
                            console.error('Error updating notifications:', err);
                          }
                          window.dispatchEvent(new Event('notifications-updated'));
                        }}
                        className="text-xs text-primary hover:text-white transition-colors"
                      >
                        Đã đọc
                      </button>
                    )}
                  </div>
                  
                  {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-center text-slate-400 text-sm">
                      Không có thông báo nào
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {notifications.map((notif) => (
                        <div key={notif.id} className={`px-4 py-3 hover:bg-white/5 transition-colors ${!notif.read ? 'bg-primary/5' : ''}`}>
                          <p className="text-sm font-bold text-white mb-1">{notif.title}</p>
                          <p className="text-sm text-slate-300 mb-1">{notif.message}</p>
                          <p className="text-xs text-slate-500">{new Date(notif.created_at || notif.date).toLocaleString('vi-VN')}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="relative">
              <button 
                onClick={() => {
                  setIsMenuOpen(!isMenuOpen);
                  setIsNotificationsOpen(false);
                }}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-surface-dark px-2 md:px-4 py-1.5 md:py-2 hover:bg-white/5 transition-colors"
              >
              <span className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center text-xs font-bold">
                {user.fullname ? user.fullname.charAt(0).toUpperCase() : 'U'}
              </span>
              <span className="text-sm font-medium text-white hidden md:block max-w-[100px] truncate">
                {user.fullname}
              </span>
            </button>
            
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl border border-white/10 bg-surface-dark shadow-xl py-2 z-50">
                <div className="px-4 py-2 border-b border-white/10 mb-2">
                  <p className="text-sm font-medium text-white truncate">{user.fullname}</p>
                  <p className="text-xs text-slate-400 truncate">{user.email}</p>
                </div>
                
                {user.role === 'admin' && (
                  <Link 
                    href="/admin" 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    Quản trị viên
                  </Link>
                )}
                
                <Link 
                  href="/dashboard?tab=profile" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                >
                  <User className="w-4 h-4" />
                  Thông tin cá nhân
                </Link>
                
                <Link 
                  href="/dashboard?tab=workout" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                >
                  <Activity className="w-4 h-4" />
                  Nhật ký tập luyện
                </Link>

                <Link 
                  href="/dashboard?tab=membership" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                >
                  <Shield className="w-4 h-4" />
                  Gói tập của tôi
                </Link>

                <Link 
                  href="/dashboard?tab=schedule" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  Lịch tập của tôi
                </Link>

                <Link 
                  href="/dashboard?tab=achievements" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                >
                  <Award className="w-4 h-4" />
                  Điểm Lì Xì / Thành tựu
                </Link>
                
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-white/5 hover:text-red-300 transition-colors mt-1 border-t border-white/10 pt-2"
                >
                  <LogOut className="w-4 h-4" />
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
          </>
        ) : (
          <>
            <Link href="/dang-nhap" className="hidden md:flex cursor-pointer items-center justify-center rounded-lg h-10 px-6 border border-accent/50 text-accent hover:bg-accent/10 transition-colors text-sm font-bold">
              Đăng nhập
            </Link>
            <Link href="/dang-ky" className="flex cursor-pointer items-center justify-center rounded-lg h-9 md:h-10 px-4 md:px-6 bg-gradient-to-r from-primary to-[#8a0b20] hover:from-[#a00d25] hover:to-[#6b0819] text-white text-xs md:text-sm font-bold shadow-lg shadow-primary/20 transition-all whitespace-nowrap">
              Đăng ký
            </Link>
          </>
        )}
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-surface-dark border-b border-white/10 shadow-2xl lg:hidden flex flex-col py-4 px-6 gap-4 z-50 max-h-[calc(100vh-70px)] overflow-y-auto">
          <nav className="flex flex-col gap-4">
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-300 hover:text-accent text-base font-medium transition-colors border-b border-white/5 pb-2">Trang chủ</Link>
            <Link href="/goi-tap" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-300 hover:text-accent text-base font-medium transition-colors border-b border-white/5 pb-2">Gói tập</Link>
            <Link href="/huan-luyen-vien" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-300 hover:text-accent text-base font-medium transition-colors border-b border-white/5 pb-2">Huấn luyện viên</Link>
            <Link href="/co-so-vat-chat" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-300 hover:text-accent text-base font-medium transition-colors border-b border-white/5 pb-2">Cơ sở vật chất</Link>
            <Link href="/lich-tap" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-300 hover:text-accent text-base font-medium transition-colors border-b border-white/5 pb-2">Lịch tập</Link>
            <Link href="/lien-he" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-300 hover:text-accent text-base font-medium transition-colors pb-2">Liên hệ</Link>
          </nav>
          
          {!user ? (
            <div className="flex flex-col gap-3 mt-2 border-t border-white/10 pt-4">
              <Link href="/dang-nhap" onClick={() => setIsMobileMenuOpen(false)} className="flex cursor-pointer items-center justify-center rounded-lg h-12 px-6 border border-accent/50 text-accent hover:bg-accent/10 transition-colors text-base font-bold w-full">
                Đăng nhập
              </Link>
              <Link href="/dang-ky" onClick={() => setIsMobileMenuOpen(false)} className="flex cursor-pointer items-center justify-center rounded-lg h-12 px-6 bg-gradient-to-r from-primary to-[#8a0b20] hover:from-[#a00d25] hover:to-[#6b0819] text-white text-base font-bold shadow-lg shadow-primary/20 transition-all w-full">
                Đăng ký
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3 mt-2 border-t border-white/10 pt-4">
              <div className="px-2 mb-2">
                <p className="text-sm font-medium text-white truncate">{user.fullname}</p>
                <p className="text-xs text-slate-400 truncate">{user.email}</p>
              </div>
              
              {user.role === 'admin' && (
                <Link 
                  href="/admin" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center px-2 py-2 text-base text-slate-300 hover:text-white transition-colors"
                >
                  Quản trị viên
                </Link>
              )}
              
              <Link 
                href="/dashboard?tab=profile" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-2 py-2 text-base text-slate-300 hover:text-white transition-colors"
              >
                <User className="w-5 h-5" />
                Thông tin cá nhân
              </Link>
              
              <Link 
                href="/dashboard?tab=workout" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-2 py-2 text-base text-slate-300 hover:text-white transition-colors"
              >
                <Activity className="w-5 h-5" />
                Nhật ký tập luyện
              </Link>

              <Link 
                href="/dashboard?tab=membership" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-2 py-2 text-base text-slate-300 hover:text-white transition-colors"
              >
                <Shield className="w-5 h-5" />
                Gói tập của tôi
              </Link>

              <Link 
                href="/dashboard?tab=schedule" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-2 py-2 text-base text-slate-300 hover:text-white transition-colors"
              >
                <Calendar className="w-5 h-5" />
                Lịch tập của tôi
              </Link>

              <Link 
                href="/dashboard?tab=achievements" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-2 py-2 text-base text-slate-300 hover:text-white transition-colors"
              >
                <Award className="w-5 h-5" />
                Điểm Lì Xì / Thành tựu
              </Link>
              
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-2 py-2 text-base text-red-400 hover:text-red-300 transition-colors mt-2 border-t border-white/10 pt-4"
              >
                <LogOut className="w-5 h-5" />
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
