'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Dumbbell, User, Calendar, CreditCard, LogOut, ChevronRight, Activity, Clock, Shield, Award, X, Edit2, Plus, CheckCircle, Star, MessageSquare, MapPin } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import { useSearchParams } from 'next/navigation';

import { CLASSES_DATA } from '@/lib/mock-data';

const COLOR_MAP: Record<string, { bg: string, text: string, border: string, solid: string }> = {
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30', solid: 'bg-blue-500' },
  red: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30', solid: 'bg-red-500' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30', solid: 'bg-purple-500' },
  yellow: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30', solid: 'bg-yellow-500' },
  orange: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30', solid: 'bg-orange-500' },
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', solid: 'bg-emerald-500' },
  default: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30', solid: 'bg-slate-500' }
};

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background-dark flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isLoggingWorkout, setIsLoggingWorkout] = useState(false);
  
  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    phone: '',
    weight: '',
    height: '',
    goal: '',
    dob: '',
    gender: ''
  });

  // Workout Form State
  const [workoutForm, setWorkoutForm] = useState({
    date: '',
    type: 'Gym',
    duration: '60',
    notes: ''
  });

  useEffect(() => {
    setWorkoutForm(prev => ({ ...prev, date: new Date().toISOString().split('T')[0] }));
  }, []);

  // Mock workout logs
  const [workoutLogs, setWorkoutLogs] = useState<any[]>([]);

  // Achievements State
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [checkedDays, setCheckedDays] = useState<number[]>([]);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  
  // Membership State
  const [membership, setMembership] = useState<any>(null);
  
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user?.email) {
          router.push('/dang-nhap');
          return;
        }

        const userEmail = session.user.email;
        
        // Fetch latest user data from Supabase
        const { data: userData, error } = await supabase
          .from('fitnexus_users')
          .select('*')
          .eq('email', userEmail)
          .single();
          
        if (userData) {
          setUser(userData);
          setPoints(userData.points || 0);
          
          // Initialize profile form with user data or defaults
          setProfileForm({
            phone: userData.phone || '',
            weight: userData.weight || '70',
            height: userData.height || '175',
            goal: userData.goal || 'Tăng cơ',
            dob: userData.dob || '',
            gender: userData.gender || ''
          });
        } else {
          // Fallback if user not found in fitnexus_users but has auth session
          const fallbackUser = { email: userEmail, fullname: session.user.user_metadata?.fullname || 'User' };
          setUser(fallbackUser);
          // Initialize profile form with defaults
          setProfileForm({
            phone: '',
            weight: '70',
            height: '175',
            goal: 'Tăng cơ',
            dob: '',
            gender: ''
          });
        }

        // Fetch membership from orders
        const { data: ordersData } = await supabase
          .from('fitnexus_orders')
          .select('*')
          .eq('user_email', userEmail)
          .eq('status', 'paid')
          .order('created_at', { ascending: false })
          .limit(1);

        if (ordersData && ordersData.length > 0) {
          const latestOrder = ordersData[0];
          const startDate = new Date(latestOrder.created_at);
          const expiryDate = new Date(startDate);
          expiryDate.setMonth(expiryDate.getMonth() + 1);
          
          setMembership({
            planId: latestOrder.plan_id,
            planName: latestOrder.plan_name,
            startDate: startDate.toISOString(),
            expiryDate: expiryDate.toISOString(),
            status: new Date() < expiryDate ? 'active' : 'expired'
          });
        }
        
        // Fetch workout logs
        let allWorkouts: any[] = [];
        const { data: workoutData, error: workoutError } = await supabase
          .from('fitnexus_workout_logs')
          .select('*')
          .eq('user_email', userEmail)
          .order('date', { ascending: false });
          
        if (!workoutError && workoutData) {
          allWorkouts = [...workoutData];
        }
        
        setWorkoutLogs(allWorkouts);

        // Fetch checkins
        let allCheckins: any[] = [];
        const { data: checkinData, error: checkinError } = await supabase
          .from('fitnexus_checkins')
          .select('*')
          .eq('user_email', userEmail)
          .order('date', { ascending: true });

        if (!checkinError && checkinData) {
          allCheckins = [...checkinData];
        }

        if (allCheckins.length > 0) {
          // Calculate streak and checkedDays
          const today = new Date().toISOString().split('T')[0];
          const hasCheckedIn = allCheckins.some(c => c.date === today);
          setHasCheckedInToday(hasCheckedIn);

          // Calculate streak
          let currentStreak = 0;
          let checkDate = new Date();
          if (!hasCheckedIn) {
            checkDate.setDate(checkDate.getDate() - 1);
          }
          
          const checkinDates = new Set(allCheckins.map(c => c.date));
          
          while (true) {
            const dateStr = checkDate.toISOString().split('T')[0];
            if (checkinDates.has(dateStr)) {
              currentStreak++;
              checkDate.setDate(checkDate.getDate() - 1);
            } else {
              break;
            }
          }
          setStreak(currentStreak);
          
          // Generate checkedDays array for UI visualization (1 to currentStreak)
          setCheckedDays(Array.from({ length: currentStreak }, (_, i) => i + 1));
        }

        // Fetch reviews
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('fitnexus_reviews')
          .select('*')
          .eq('user_email', userEmail)
          .order('date', { ascending: false });

        if (!reviewsError && reviewsData) {
          setReviews(reviewsData);
        }

        // Fetch booked classes
        let allBookings: any[] = [];
        const { data: bookingsData, error: bookingsError } = await supabase
          .from('fitnexus_bookings')
          .select('*')
          .eq('user_email', userEmail)
          .neq('status', 'completed')
          .order('created_at', { ascending: false });

        console.log("Supabase Bookings Data:", bookingsData);
        console.log("Supabase Bookings Error:", bookingsError);

        if (!bookingsError && bookingsData) {
          let formattedBookings = [...bookingsData];
          
          if (bookingsData.length > 0) {
            const classIds = bookingsData.map(b => b.class_id);
            const { data: classesData } = await supabase
              .from('fitnexus_classes')
              .select('*')
              .in('id', classIds);
              
            const classMap: Record<number, any> = {};
            if (classesData) {
              classesData.forEach(cls => {
                classMap[cls.id] = cls;
              });
            }
            
            formattedBookings = bookingsData.map(booking => {
              const dbClass = classMap[booking.class_id];
              const fallbackClass = CLASSES_DATA.find(c => c.id === booking.class_id);
              return {
                ...booking,
                fitnexus_classes: dbClass || fallbackClass || null
              };
            });
          }
          
          allBookings = [...formattedBookings];
        }
        
        setBookedClasses(allBookings);

        // Fetch gifts
        const { data: giftsData, error: giftsError } = await supabase
          .from('fitnexus_gifts')
          .select('*');
        if (!giftsError && giftsData) {
          setGifts(giftsData);
        }

        // Fetch user points (use existing userData)
        if (userData) {
          setUserPoints(userData.points || 0);
        }
      } catch (e) {
        console.error(e);
        router.push('/dang-nhap');
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.dispatchEvent(new Event('user-auth-changed'));
    router.push('/');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Try to update Supabase first
      if (user.email) {
        const { error } = await supabase
          .from('fitnexus_users')
          .update(profileForm)
          .eq('email', user.email);
          
        if (error) {
          console.error('Supabase update profile error:', error);
          setMessage({ type: 'error', text: 'Có lỗi xảy ra khi cập nhật hồ sơ.' });
          setTimeout(() => setMessage(null), 5000);
          return;
        }
      }
      
      // Update local state
      const updatedUser = {
        ...user,
        ...profileForm
      };
      setUser(updatedUser);
      setIsEditingProfile(false);
      
      setMessage({ type: 'success', text: 'Cập nhật hồ sơ thành công!' });
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      console.error('Lỗi cập nhật hồ sơ:', error);
      setMessage({ type: 'error', text: 'Có lỗi xảy ra khi cập nhật hồ sơ.' });
      setTimeout(() => setMessage(null), 5000);
    }
  };

  // Reviews State
  const [reviews, setReviews] = useState<any[]>([]);
  const [bookedClasses, setBookedClasses] = useState<any[]>([]);
  const [gifts, setGifts] = useState<any[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    type: 'Cơ sở vật chất',
    content: ''
  });

  const handleLogWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    const newLog = {
      user_email: user.email,
      ...workoutForm
    };
    
    try {
      const { data, error } = await supabase
        .from('fitnexus_workout_logs')
        .insert([newLog])
        .select();
        
      if (error) {
        console.error('Supabase workout log error:', error);
        setMessage({ type: 'error', text: 'Lỗi khi lưu nhật ký: ' + error.message });
        setTimeout(() => setMessage(null), 3000);
        return;
      }
      
      let updatedLogs;
      if (data && data.length > 0) {
        updatedLogs = [data[0], ...workoutLogs];
      } else {
        updatedLogs = [{ id: Date.now(), ...newLog }, ...workoutLogs];
      }
      
      setWorkoutLogs(updatedLogs);
      
    } catch (error) {
      console.error('Lỗi khi lưu nhật ký tập luyện:', error);
      setMessage({ type: 'error', text: 'Lỗi hệ thống khi lưu nhật ký.' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setIsLoggingWorkout(false);
    // Reset form
    setWorkoutForm({
      date: new Date().toISOString().split('T')[0],
      type: 'Gym',
      duration: '60',
      notes: ''
    });
  };

  const handleCheckIn = async () => {
    if (hasCheckedInToday) return;
    
    const today = new Date().toISOString().split('T')[0];
    
    try {
      const { error } = await supabase
        .from('fitnexus_checkins')
        .insert([{ user_email: user.email, date: today }]);
        
      if (error) {
        console.error('Supabase checkin error:', error);
        setMessage({ type: 'error', text: 'Lỗi khi điểm danh: ' + error.message });
        setTimeout(() => setMessage(null), 3000);
        return;
      }
      
      // Update points in fitnexus_users
      const newPoints = points + 50;
      const { error: updateError } = await supabase
        .from('fitnexus_users')
        .update({ points: newPoints })
        .eq('email', user.email);
        
      if (updateError) {
        console.error('Supabase update points error:', updateError);
        setMessage({ type: 'error', text: 'Lỗi khi cập nhật điểm: ' + updateError.message });
        setTimeout(() => setMessage(null), 3000);
        return;
      }
        
      setPoints(newPoints);
      setUserPoints(newPoints); // Also update userPoints state
      
      setStreak(prev => prev + 1);
      setCheckedDays(prev => [...prev, prev.length + 1]);
      setHasCheckedInToday(true);
      
      setMessage({ type: 'success', text: 'Điểm danh thành công! Bạn nhận được 50 Điểm Lì Xì.' });
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      console.error('Lỗi khi điểm danh:', error);
      setMessage({ type: 'error', text: 'Có lỗi xảy ra khi điểm danh. Vui lòng thử lại sau.' });
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const handleCompleteClass = async (booking: any) => {
    const cls = booking.fitnexus_classes;
    if (!cls || !user) return;

    try {
      // 1. Insert into workout_logs
      const durationMinutes = cls.duration ? parseInt(cls.duration) || 60 : 60;
      const newLog = {
        user_email: user.email,
        date: booking.date,
        type: cls.type || cls.name || 'Gym',
        duration: String(durationMinutes),
        notes: `${cls.name} - HLV: ${cls.trainer || 'N/A'} - ${cls.room || ''}`
      };

      const { data: logData, error: logError } = await supabase
        .from('fitnexus_workout_logs')
        .insert([newLog])
        .select();

      if (logError) {
        console.error('Error inserting workout log:', logError);
        setMessage({ type: 'error', text: 'Lỗi khi lưu nhật ký: ' + logError.message });
        setTimeout(() => setMessage(null), 3000);
        return;
      }

      // 2. Update booking status to 'completed'
      await supabase
        .from('fitnexus_bookings')
        .update({ status: 'completed' })
        .eq('id', booking.id);

      // 3. Update local state
      if (logData && logData.length > 0) {
        setWorkoutLogs(prev => [logData[0], ...prev]);
      } else {
        setWorkoutLogs(prev => [{ id: Date.now(), ...newLog }, ...prev]);
      }

      // 4. Remove from booked classes
      setBookedClasses(prev => prev.filter(b => b.id !== booking.id));

      setMessage({ type: 'success', text: `Đã hoàn thành lớp "${cls.name}" và chuyển vào nhật ký tập luyện!` });
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      console.error('Error completing class:', error);
      setMessage({ type: 'error', text: 'Có lỗi xảy ra. Vui lòng thử lại.' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleRedeemGift = async (gift: any) => {
    if (userPoints < gift.points_required) {
      setMessage({ type: 'error', text: 'Bạn không đủ điểm để đổi quà này.' });
      setTimeout(() => setMessage(null), 5000);
      return;
    }

    try {
      // 1. Deduct points
      const newPoints = userPoints - gift.points_required;
      const { error: updateError } = await supabase
        .from('fitnexus_users')
        .update({ points: newPoints })
        .eq('email', user.email);
      if (updateError) {
        console.error('Supabase update points error:', updateError);
        setMessage({ type: 'error', text: 'Lỗi khi cập nhật điểm: ' + updateError.message });
        setTimeout(() => setMessage(null), 3000);
        return;
      }

      // 2. Record redemption
      const { error: redeemError } = await supabase
        .from('fitnexus_redemptions')
        .insert([{
          user_email: user.email,
          gift_id: gift.id,
          points_spent: gift.points_required
        }]);
      if (redeemError) {
        console.error('Supabase redeem error:', redeemError);
      }

      setUserPoints(newPoints);
      setPoints(newPoints); // Also update points state
      
      setMessage({ type: 'success', text: `Chúc mừng! Bạn đã đổi thành công: ${gift.name}` });
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      console.error('Lỗi khi đổi quà:', error);
      setMessage({ type: 'error', text: 'Có lỗi xảy ra khi đổi quà. Vui lòng thử lại sau.' });
      setTimeout(() => setMessage(null), 5000);
    }
  };
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    const newReview = {
      user_email: user.email,
      date: new Date().toISOString().split('T')[0],
      ...reviewForm
    };
    
    try {
      const { data, error } = await supabase
        .from('fitnexus_reviews')
        .insert([newReview])
        .select();
        
      if (error) {
        console.error('Supabase review error:', error);
      }
      
      if (data && data.length > 0) {
        setReviews([data[0], ...reviews]);
      } else {
        setReviews([{ id: Date.now(), ...newReview }, ...reviews]);
      }
      
      setIsWritingReview(false);
      setReviewForm({
        rating: 5,
        type: 'Cơ sở vật chất',
        content: ''
      });
      setMessage({ type: 'success', text: 'Cảm ơn bạn đã gửi đánh giá! Phản hồi của bạn giúp chúng tôi cải thiện dịch vụ.' });
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      console.error('Lỗi khi gửi đánh giá:', error);
      setMessage({ type: 'error', text: 'Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại sau.' });
      setTimeout(() => setMessage(null), 5000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) return null;

  // Mock membership data (since we don't have a real membership table yet)
  const hasMembership = membership || user.role === 'vip' || user.role === 'admin';

  return (
    <div className="min-h-screen bg-background-dark text-slate-100 font-sans flex flex-col">
      <Navbar />
      
      {/* Toast Message */}
      {message && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className={`px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-500/90 text-white shadow-green-500/20' : 'bg-red-500/90 text-white shadow-red-500/20'} backdrop-blur-md`}>
            <div className={`w-2 h-2 rounded-full ${message.type === 'success' ? 'bg-white' : 'bg-white'} animate-pulse`}></div>
            <p className="font-medium">{message.text}</p>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <div className="bg-surface-dark border border-white/5 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-[#8a0b20] flex items-center justify-center text-xl font-bold text-white shadow-lg">
                {user.fullname ? user.fullname.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <h2 className="font-bold text-white text-lg truncate w-32">{user.fullname}</h2>
                <p className="text-xs text-slate-400 truncate w-32">{user.email}</p>
              </div>
            </div>
            
            <div className="flex overflow-x-auto md:flex-col gap-2 md:gap-1 pb-2 md:pb-0 scrollbar-hide">
              <button 
                onClick={() => setActiveTab('profile')}
                className={`flex-shrink-0 md:w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'profile' ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
              >
                <User className="w-5 h-5" />
                Thông tin cá nhân
              </button>
              <button 
                onClick={() => setActiveTab('workout')}
                className={`flex-shrink-0 md:w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'workout' ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
              >
                <Activity className="w-5 h-5" />
                Nhật ký tập luyện
              </button>
              <button 
                onClick={() => setActiveTab('membership')}
                className={`flex-shrink-0 md:w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'membership' ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
              >
                <Shield className="w-5 h-5" />
                Gói tập của tôi
              </button>
              <button 
                onClick={() => setActiveTab('schedule')}
                className={`flex-shrink-0 md:w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'schedule' ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
              >
                <Calendar className="w-5 h-5" />
                Lịch tập
              </button>
              <button 
                onClick={() => setActiveTab('achievements')}
                className={`flex-shrink-0 md:w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'achievements' ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
              >
                <Award className="w-5 h-5" />
                Điểm Lì Xì / Thành tựu
              </button>
              <button 
                onClick={() => setActiveTab('reviews')}
                className={`flex-shrink-0 md:w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'reviews' ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
              >
                <Star className="w-5 h-5" />
                Đánh giá dịch vụ
              </button>
              <button 
                onClick={() => setActiveTab('rewards')}
                className={`flex-shrink-0 md:w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${activeTab === 'rewards' ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
              >
                <Award className="w-5 h-5" />
                Đổi quà
              </button>
            </div>
            
            <div className="mt-4 md:mt-8 pt-4 md:pt-6 border-t border-white/10">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center md:justify-start gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-400/10 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Đăng xuất
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h1 className="text-3xl font-black text-white mb-8">Xin chào, {user.fullname}!</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-surface-dark border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-[#8a0b20] flex items-center justify-center text-2xl font-bold text-white shadow-lg mb-3">
                    {user.fullname ? user.fullname.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <h3 className="text-white font-bold">{user.fullname}</h3>
                  <p className="text-gold-gradient text-sm font-medium mt-1">Dragon Tier</p>
                </div>
                
                <div className="bg-surface-dark border border-white/5 rounded-2xl p-6 flex flex-col justify-center">
                  <h3 className="text-slate-400 text-sm font-medium mb-1">Cân nặng</h3>
                  <p className="text-2xl font-bold text-white">{user.weight || '70'} <span className="text-sm font-normal text-slate-500">kg</span></p>
                </div>
                
                <div className="bg-surface-dark border border-white/5 rounded-2xl p-6 flex flex-col justify-center">
                  <h3 className="text-slate-400 text-sm font-medium mb-1">Chiều cao</h3>
                  <p className="text-2xl font-bold text-white">{user.height || '175'} <span className="text-sm font-normal text-slate-500">cm</span></p>
                </div>
                
                <div className="bg-surface-dark border border-white/5 rounded-2xl p-6 flex flex-col justify-center">
                  <h3 className="text-slate-400 text-sm font-medium mb-1">Mục tiêu</h3>
                  <p className="text-xl font-bold text-primary">{user.goal || 'Tăng cơ'}</p>
                </div>
              </div>

              <div className="bg-surface-dark border border-white/5 rounded-2xl p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-white">Thông tin chi tiết</h2>
                  <button 
                    onClick={() => setIsEditingProfile(true)}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Cập nhật thông tin
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Email</label>
                    <div className="px-4 py-3 bg-background-dark border border-white/10 rounded-xl text-slate-400 cursor-not-allowed">
                      {user.email}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Số điện thoại</label>
                    <div className="px-4 py-3 bg-background-dark border border-white/10 rounded-xl text-white">
                      {user.phone || 'Chưa cập nhật'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Ngày sinh</label>
                    <div className="px-4 py-3 bg-background-dark border border-white/10 rounded-xl text-white">
                      {user.dob ? new Date(user.dob).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Giới tính</label>
                    <div className="px-4 py-3 bg-background-dark border border-white/10 rounded-xl text-white">
                      {user.gender === 'male' ? 'Nam' : user.gender === 'female' ? 'Nữ' : user.gender === 'other' ? 'Khác' : 'Chưa cập nhật'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Workout Log Tab */}
          {activeTab === 'workout' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Nhật ký tập luyện</h2>
                <button 
                  onClick={() => setIsLoggingWorkout(true)}
                  className="px-4 py-2 bg-primary hover:bg-[#8a0b20] text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Ghi bài tập mới
                </button>
              </div>
              
              {workoutLogs.length > 0 ? (
                <div className="space-y-4">
                  {workoutLogs.map((log) => (
                    <div key={log.id} className="bg-surface-dark border border-white/5 rounded-2xl p-6 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
                          <Activity className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white">{log.type}</h3>
                          <p className="text-sm text-slate-400">{log.date.split('-').reverse().join('/')} • {log.duration} phút</p>
                        </div>
                      </div>
                      {log.notes && (
                        <div className="text-sm text-slate-300 max-w-xs truncate">
                          &quot;{log.notes}&quot;
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-surface-dark border border-white/5 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                    <Activity className="w-10 h-10 text-slate-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Chưa có dữ liệu</h3>
                  <p className="text-slate-400 mb-8 max-w-md mx-auto">Bạn chưa ghi lại buổi tập nào. Hãy bắt đầu ghi chép để theo dõi tiến độ của mình.</p>
                </div>
              )}
            </div>
          )}

          {/* Membership Tab */}
          {activeTab === 'membership' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold text-white mb-6">Gói tập của tôi</h2>
              
              {hasMembership ? (
                <div className="bg-surface-dark border border-primary/30 rounded-2xl p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-4 py-1 rounded-bl-xl uppercase tracking-wider">
                    Active
                  </div>
                  <div className="flex items-start justify-between mb-8">
                    <div>
                      <h3 className="text-3xl font-black text-gold-gradient mb-2">{membership ? membership.planName : 'VIP Membership'}</h3>
                      <p className="text-slate-400">Gói tập của bạn tại GymVerse</p>
                    </div>
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Dumbbell className="w-8 h-8 text-primary" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/10 mb-8">
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Ngày đăng ký</p>
                      <p className="font-medium text-white">{membership ? new Date(membership.startDate).toLocaleDateString('vi-VN') : '01/01/2026'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400 mb-1">Ngày hết hạn</p>
                      <p className="font-medium text-white">{membership ? new Date(membership.expiryDate).toLocaleDateString('vi-VN') : '31/12/2026'}</p>
                    </div>
                  </div>

                  <Link 
                    href={`/thanh-toan?plan=${membership ? membership.planId : 'vip'}`}
                    className="inline-flex items-center justify-center w-full py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-colors border border-white/10"
                  >
                    Gia hạn gói tập
                  </Link>
                </div>
              ) : (
                <div className="bg-surface-dark border border-white/5 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                    <CreditCard className="w-10 h-10 text-slate-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Chưa có gói tập</h3>
                  <p className="text-slate-400 mb-8 max-w-md mx-auto">Bạn hiện chưa đăng ký gói tập nào. Hãy khám phá các gói tập của chúng tôi để bắt đầu.</p>
                  <Link href="/goi-tap" className="inline-flex items-center justify-center px-8 py-3 bg-white text-background-dark hover:bg-slate-200 font-bold rounded-xl transition-colors">
                    Khám phá ngay
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Schedule Tab */}
          {activeTab === 'schedule' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-2xl font-bold text-white mb-6">Lịch tập của tôi</h2>
              
              {bookedClasses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bookedClasses.map((booking) => {
                    const cls = booking.fitnexus_classes;
                    if (!cls) {
                      return null;
                    }
                    
                    // Determine status based on date
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const bookingDate = new Date(booking.date);
                    bookingDate.setHours(0, 0, 0, 0);
                    const isPast = bookingDate < today;
                    const isToday = bookingDate.getTime() === today.getTime();
                    
                    return (
                      <div key={booking.id} className={`bg-surface-dark border ${isPast ? 'border-yellow-500/20' : 'border-white/5'} rounded-2xl p-6 relative overflow-hidden`}>
                        <div className={`absolute top-0 left-0 w-1 h-full ${COLOR_MAP[cls.type_color || cls.typeColor || 'default']?.solid || 'bg-slate-500'}`}></div>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <span className={`inline-block py-1 px-2 rounded ${COLOR_MAP[cls.type_color || cls.typeColor || 'default']?.bg || 'bg-slate-500/10'} ${COLOR_MAP[cls.type_color || cls.typeColor || 'default']?.text || 'text-slate-400'} text-xs font-bold uppercase tracking-wider mb-2`}>
                              {cls.type}
                            </span>
                            <h3 className="text-xl font-bold text-white">{cls.name}</h3>
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-black text-white block">{cls.time}</span>
                            <span className="text-sm text-slate-400">{cls.duration}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-slate-300 text-sm">
                            <Calendar className="w-4 h-4 text-slate-500" />
                            <span>{cls.day}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-300 text-sm">
                            <MapPin className="w-4 h-4 text-slate-500" />
                            <span>{cls.room}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-300 text-sm">
                            <User className="w-4 h-4 text-slate-500" />
                            <span>HLV: {cls.trainer}</span>
                          </div>
                        </div>
                        
                        <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                          <span className="text-xs text-slate-400">Đặt ngày: {booking.date.split('-').reverse().join('/')}</span>
                          {isPast ? (
                            <button
                              onClick={() => handleCompleteClass(booking)}
                              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-lg shadow-yellow-500/20 flex items-center gap-1.5"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              Hoàn thành
                            </button>
                          ) : isToday ? (
                            <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-lg text-xs font-bold border border-blue-500/30 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Hôm nay
                            </span>
                          ) : (
                            <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-bold border border-green-500/30">
                              Sắp tới
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-surface-dark border border-white/5 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                    <Clock className="w-10 h-10 text-slate-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Chưa có lịch tập</h3>
                  <p className="text-slate-400 mb-8 max-w-md mx-auto">Bạn chưa đặt lịch tập nào. Hãy xem lịch và đặt chỗ để tham gia các lớp học sôi động.</p>
                  <Link href="/lich-tap" className="inline-flex items-center justify-center px-8 py-3 bg-primary hover:bg-[#8a0b20] text-white font-bold rounded-xl transition-colors">
                    Xem Lịch Tập
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Điểm Lì Xì & Thành tựu</h2>
                <button 
                  onClick={handleCheckIn}
                  disabled={hasCheckedInToday}
                  className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 ${hasCheckedInToday ? 'bg-white/10 text-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-[#bf953f] to-[#b38728] text-[#2d1619] hover:opacity-90 shadow-[0_0_15px_rgba(191,149,63,0.4)]'}`}
                >
                  <CheckCircle className="w-4 h-4" />
                  {hasCheckedInToday ? 'Đã điểm danh hôm nay' : 'Điểm danh nhận Lì Xì'}
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-br from-[#8a0b20] to-[#4a0611] border border-primary/30 rounded-2xl p-8 relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-32 h-32 bg-gold-gradient rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/3"></div>
                  <h3 className="text-white/80 text-sm font-medium mb-2">Điểm Lì Xì hiện tại</h3>
                  <p className="text-4xl font-black text-gold-gradient mb-4">{points.toLocaleString()}</p>
                  <p className="text-sm text-white/70">Sử dụng điểm để đổi quà hoặc giảm giá gói tập.</p>
                </div>
                
                <div className="bg-surface-dark border border-white/5 rounded-2xl p-8">
                  <h3 className="text-slate-400 text-sm font-medium mb-2">Chuỗi ngày tập (Streak)</h3>
                  <div className="flex items-end gap-2 mb-4">
                    <p className="text-4xl font-black text-white">{streak}</p>
                    <p className="text-slate-400 pb-1">ngày liên tiếp</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {Array.from({ length: Math.max(7, streak + 2) }, (_, i) => i + 1).map((day) => (
                      <div key={day} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${checkedDays.includes(day) ? 'bg-primary text-white shadow-[0_0_10px_rgba(198,16,46,0.5)]' : 'bg-white/5 text-slate-500'}`}>
                        {day}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rewards' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Đổi quà</h2>
                <div className="bg-primary/20 text-primary px-4 py-2 rounded-xl font-bold border border-primary/30">
                  Điểm của bạn: {userPoints}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {gifts.map((gift) => (
                  <div key={gift.id} className="bg-surface-dark border border-white/5 rounded-2xl p-6 flex flex-col">
                    <h3 className="text-lg font-bold text-white mb-2">{gift.name}</h3>
                    <p className="text-slate-400 text-sm mb-4 flex-1">{gift.description}</p>
                    <div className="flex justify-between items-center pt-4 border-t border-white/5">
                      <span className="text-primary font-bold">{gift.points_required} điểm</span>
                      <button 
                        onClick={() => handleRedeemGift(gift)}
                        disabled={userPoints < gift.points_required}
                        className="px-4 py-2 bg-primary hover:bg-[#8a0b20] disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-bold rounded-lg transition-colors"
                      >
                        Đổi quà
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Đánh giá & Phản hồi</h2>
                <button 
                  onClick={() => setIsWritingReview(true)}
                  className="px-4 py-2 bg-primary hover:bg-[#8a0b20] text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4" />
                  Viết đánh giá
                </button>
              </div>
              
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-surface-dark border border-white/5 rounded-2xl p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="bg-white/10 text-slate-300 text-xs font-bold px-2 py-1 rounded">
                              {review.type}
                            </span>
                            <span className="text-slate-500 text-sm">
                              {review.date.split('-').reverse().join('/')}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                key={star} 
                                className={`w-4 h-4 ${star <= review.rating ? 'text-gold-gradient fill-accent' : 'text-slate-600'}`} 
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-slate-300">{review.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-surface-dark border border-white/5 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                    <Star className="w-10 h-10 text-slate-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Chưa có đánh giá</h3>
                  <p className="text-slate-400 mb-8 max-w-md mx-auto">Bạn chưa gửi đánh giá nào. Hãy chia sẻ trải nghiệm của bạn với chúng tôi nhé.</p>
                </div>
              )}
            </div>
          )}

        </div>
      </main>

      {/* Profile Edit Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-surface-dark border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h3 className="text-xl font-bold text-white">Cập nhật thông tin</h3>
              <button 
                onClick={() => setIsEditingProfile(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Cân nặng (kg)</label>
                  <input 
                    type="number" 
                    value={profileForm.weight}
                    onChange={(e) => setProfileForm({...profileForm, weight: e.target.value})}
                    className="w-full px-4 py-3 bg-background-dark border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Chiều cao (cm)</label>
                  <input 
                    type="number" 
                    value={profileForm.height}
                    onChange={(e) => setProfileForm({...profileForm, height: e.target.value})}
                    className="w-full px-4 py-3 bg-background-dark border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Mục tiêu tập luyện</label>
                <select 
                  value={profileForm.goal}
                  onChange={(e) => setProfileForm({...profileForm, goal: e.target.value})}
                  className="w-full px-4 py-3 bg-background-dark border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary transition-colors appearance-none"
                >
                  <option value="Tăng cơ">Tăng cơ</option>
                  <option value="Giảm mỡ">Giảm mỡ</option>
                  <option value="Tăng cân">Tăng cân</option>
                  <option value="Duy trì vóc dáng">Duy trì vóc dáng</option>
                  <option value="Tăng cường thể lực">Tăng cường thể lực</option>
                  <option value="Dẻo dai / Yoga">Dẻo dai / Yoga</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Số điện thoại</label>
                <input 
                  type="tel" 
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                  className="w-full px-4 py-3 bg-background-dark border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Ngày sinh</label>
                  <input 
                    type="date" 
                    value={profileForm.dob}
                    onChange={(e) => setProfileForm({...profileForm, dob: e.target.value})}
                    className="w-full px-4 py-3 bg-background-dark border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary transition-colors [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Giới tính</label>
                  <select 
                    value={profileForm.gender}
                    onChange={(e) => setProfileForm({...profileForm, gender: e.target.value})}
                    className="w-full px-4 py-3 bg-background-dark border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary transition-colors appearance-none"
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-colors"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="px-6 py-3 bg-primary hover:bg-[#8a0b20] text-white font-bold rounded-xl transition-colors"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Workout Log Modal */}
      {isLoggingWorkout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-surface-dark border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h3 className="text-xl font-bold text-white">Ghi bài tập mới</h3>
              <button 
                onClick={() => setIsLoggingWorkout(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleLogWorkout} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Ngày tập</label>
                <input 
                  type="date" 
                  required
                  value={workoutForm.date}
                  onChange={(e) => setWorkoutForm({...workoutForm, date: e.target.value})}
                  className="w-full px-4 py-3 bg-background-dark border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary transition-colors [color-scheme:dark]"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Loại bài tập</label>
                  <select 
                    value={workoutForm.type}
                    onChange={(e) => setWorkoutForm({...workoutForm, type: e.target.value})}
                    className="w-full px-4 py-3 bg-background-dark border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary transition-colors appearance-none"
                  >
                    <option value="Gym">Gym (Tạ)</option>
                    <option value="Cardio">Cardio</option>
                    <option value="Yoga">Yoga</option>
                    <option value="Pilates">Pilates</option>
                    <option value="Bơi lội">Bơi lội</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Thời gian (phút)</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    value={workoutForm.duration}
                    onChange={(e) => setWorkoutForm({...workoutForm, duration: e.target.value})}
                    className="w-full px-4 py-3 bg-background-dark border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Ghi chú (Tùy chọn)</label>
                <textarea 
                  rows={3}
                  value={workoutForm.notes}
                  onChange={(e) => setWorkoutForm({...workoutForm, notes: e.target.value})}
                  placeholder="Ví dụ: Đẩy ngực 60kg x 10 rep, chạy bộ 3km..."
                  className="w-full px-4 py-3 bg-background-dark border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary transition-colors resize-none"
                ></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsLoggingWorkout(false)}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-colors"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="px-6 py-3 bg-primary hover:bg-[#8a0b20] text-white font-bold rounded-xl transition-colors"
                >
                  Lưu bài tập
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Review Modal */}
      {isWritingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-surface-dark border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h3 className="text-xl font-bold text-white">Viết đánh giá</h3>
              <button 
                onClick={() => setIsWritingReview(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmitReview} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Mức độ hài lòng</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewForm({...reviewForm, rating: star})}
                      className="focus:outline-none"
                    >
                      <Star 
                        className={`w-8 h-8 transition-colors ${star <= reviewForm.rating ? 'text-gold-gradient fill-accent' : 'text-slate-600 hover:text-slate-400'}`} 
                      />
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Loại đánh giá</label>
                <select 
                  value={reviewForm.type}
                  onChange={(e) => setReviewForm({...reviewForm, type: e.target.value})}
                  className="w-full px-4 py-3 bg-background-dark border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary transition-colors appearance-none"
                >
                  <option value="Cơ sở vật chất">Cơ sở vật chất / Máy móc</option>
                  <option value="Dịch vụ lớp học">Dịch vụ lớp học (Yoga, Group X...)</option>
                  <option value="Huấn luyện viên">Huấn luyện viên (PT)</option>
                  <option value="Thái độ nhân viên">Thái độ nhân viên</option>
                  <option value="Khác">Khác</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Chi tiết đánh giá</label>
                <textarea 
                  required
                  rows={4}
                  value={reviewForm.content}
                  onChange={(e) => setReviewForm({...reviewForm, content: e.target.value})}
                  placeholder="Chia sẻ trải nghiệm của bạn tại GymVerse..."
                  className="w-full px-4 py-3 bg-background-dark border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary transition-colors resize-none"
                ></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsWritingReview(false)}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-colors"
                >
                  Hủy
                </button>
                <button 
                  type="submit"
                  className="px-6 py-3 bg-primary hover:bg-[#8a0b20] text-white font-bold rounded-xl transition-colors"
                >
                  Gửi đánh giá
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
