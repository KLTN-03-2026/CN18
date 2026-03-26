'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Calendar, Clock, MapPin, User, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

import { CLASSES_DATA } from '@/lib/mock-data';

const DAYS = [
  { day: 'Thứ 2', date: '23/02' },
  { day: 'Thứ 3', date: '24/02' },
  { day: 'Thứ 4', date: '25/02' },
  { day: 'Thứ 5', date: '26/02' },
  { day: 'Thứ 6', date: '27/02' },
  { day: 'Thứ 7', date: '28/02' },
  { day: 'CN', date: '01/03' },
];

const FILTERS = ['Tất cả', 'Yoga', 'Zumba', 'Body Pump', 'Cycling', 'Pilates', 'HIIT'];

const COLOR_MAP: Record<string, { bg: string, text: string, border: string }> = {
  blue: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
  red: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
  purple: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
  yellow: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  orange: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
  emerald: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  default: { bg: 'bg-slate-500/20', text: 'text-slate-400', border: 'border-slate-500/30' }
};

export default function LichTapPage() {
  const [activeFilter, setActiveFilter] = useState('Tất cả');
  const [activeDay, setActiveDay] = useState('Thứ 2');
  const [bookedClasses, setBookedClasses] = useState<number[]>([]);
  const [classes, setClasses] = useState<any[]>(CLASSES_DATA);
  const [user, setUser] = useState<any>(null);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const { data, error } = await supabase
          .from('fitnexus_classes')
          .select('*')
          .order('time', { ascending: true });
          
        if (!error && data && data.length > 0) {
          setClasses(data);
        } else if (!error && data && data.length === 0) {
          // Auto-insert mock data to database
          try {
            const insertData = CLASSES_DATA.map(c => ({
              name: c.name,
              type: c.type,
              trainer: c.trainer,
              day: c.day,
              time: c.time,
              duration: c.duration,
              room: c.room,
              capacity: c.capacity,
              booked: c.booked,
              type_color: c.typeColor
            }));
            
            const { data: newClasses, error: insertError } = await supabase
              .from('fitnexus_classes')
              .insert(insertData)
              .select();
              
            if (!insertError && newClasses) {
              setClasses(newClasses);
            } else {
              setClasses(CLASSES_DATA);
            }
          } catch (e) {
            console.error('Lỗi thêm dữ liệu mẫu:', e);
            setClasses(CLASSES_DATA);
          }
        }
      } catch (err) {
        console.error('Lỗi tải danh sách lớp học:', err);
      }
    };

    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const userEmail = session.user.email;
          
          // Fetch user details
          const { data: userData } = await supabase
            .from('fitnexus_users')
            .select('*')
            .eq('email', userEmail)
            .single();
            
          const currentUser = userData || { email: userEmail, fullname: session.user.user_metadata?.fullname || 'User' };
          setUser(currentUser);
          
          // Fetch booked classes
          const { data, error } = await supabase
            .from('fitnexus_bookings')
            .select('class_id')
            .eq('user_email', currentUser.email);
            
          if (!error && data) {
            const supabaseBookings = data.map(b => b.class_id);
            setBookedClasses(supabaseBookings);
          }
        }
      } catch (err) {
        console.error('Lỗi kiểm tra đăng nhập:', err);
      }
    };

    fetchClasses();
    checkUser();
  }, []);

  const handleBookClass = async (classId: number) => {
    console.log('handleBookClass called for:', classId);
    console.log('User:', user);
    if (!user) {
      setMessage({ type: 'error', text: 'Vui lòng đăng nhập để đặt lịch tập.' });
      setTimeout(() => setMessage(null), 3000);
      setTimeout(() => { window.location.href = '/dang-nhap'; }, 1500);
      return;
    }

    if (bookedClasses.includes(classId)) {
      console.log('Class already booked');
      return;
    }
    
    try {
      console.log('Attempting to book for user:', user.email);
      const today = new Date().toISOString().split('T')[0];
      const { error } = await supabase
        .from('fitnexus_bookings')
        .insert([{
          user_email: user.email,
          class_id: classId,
          date: today,
          status: 'confirmed'
        }]);
        
      if (error) {
        console.error('Supabase booking error:', error);
        setMessage({ type: 'error', text: 'Lỗi khi đặt lịch: ' + error.message });
        setTimeout(() => setMessage(null), 3000);
        return;
      }
      
      console.log('Booking successful, updating class count...');
      // Update booked count in class
      const cls = classes.find(c => c.id === classId);
      if (cls) {
        const { error: updateError } = await supabase
          .from('fitnexus_classes')
          .update({ booked: cls.booked + 1 })
          .eq('id', classId);
          
        if (updateError) {
          console.error('Supabase class update error:', updateError);
        }
          
        // Update local state
        setClasses(classes.map(c => c.id === classId ? { ...c, booked: c.booked + 1 } : c));
      }
      
      setBookedClasses(prev => [...prev, classId]);
      setMessage({ type: 'success', text: 'Đặt chỗ thành công! Bạn có thể xem lại trong phần Lịch Tập của mình tại Dashboard.' });
      setTimeout(() => setMessage(null), 5000);
    } catch (error) {
      console.error('Lỗi khi đặt chỗ:', error);
      setMessage({ type: 'error', text: 'Có lỗi xảy ra khi đặt chỗ. Vui lòng thử lại sau.' });
      setTimeout(() => setMessage(null), 5000);
    }
  };

  const filteredClasses = classes.filter(cls => {
    const matchDay = cls.day === activeDay;
    const matchFilter = activeFilter === 'Tất cả' || cls.type === activeFilter;
    return matchDay && matchFilter;
  });

  return (
    <div className="relative flex flex-col min-h-screen w-full">
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

      {/* Hero Section */}
      <section className="relative px-6 py-12 lg:px-20 lg:py-20 text-center">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1470&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-background-dark via-background-dark/80 to-background-dark"></div>
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center gap-4">
          <span className="inline-block py-1 px-3 rounded-full bg-accent/10 border border-accent/30 text-accent text-xs font-bold uppercase tracking-widest mb-2">
            Group X & Yoga
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">
            Lịch Tập <span className="text-gold-gradient">Tuần Này</span>
          </h1>
          <p className="text-slate-300 text-lg md:text-xl max-w-2xl font-light">
            Tham gia các lớp học nhóm sôi động, được hướng dẫn bởi các chuyên gia hàng đầu. Đặt chỗ ngay hôm nay!
          </p>
        </div>
      </section>

      {/* Schedule Container */}
      <main className="flex-1 px-4 md:px-10 lg:px-20 pb-20">
        <div className="max-w-[1200px] mx-auto">
          
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between bg-surface-dark p-4 rounded-xl border border-white/5">
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              {FILTERS.map((filter, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-colors ${
                    activeFilter === filter 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                      : 'bg-background-dark text-slate-400 hover:text-white border border-white/10 hover:border-white/30'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
            
            <div className="flex gap-2 w-full md:w-auto">
              <select className="bg-background-dark border border-white/10 text-slate-300 text-sm rounded-lg px-4 py-2 focus:outline-none focus:border-accent w-full md:w-48">
                <option>Tất cả chi nhánh</option>
                <option>GymVerse Hải Châu</option>
                <option>GymVerse Sơn Trà</option>
                <option>GymVerse Ngũ Hành Sơn</option>
              </select>
            </div>
          </div>

          {/* Days Tabs */}
          <div className="flex overflow-x-auto md:grid md:grid-cols-7 gap-2 mb-8 pb-2 scrollbar-hide">
            {DAYS.map((item, idx) => (
              <button 
                key={idx}
                onClick={() => setActiveDay(item.day)}
                className={`flex flex-col items-center justify-center py-3 px-4 md:px-0 min-w-[80px] rounded-xl border transition-all ${
                  activeDay === item.day 
                    ? 'bg-accent/10 border-accent text-accent shadow-[0_0_15px_rgba(212,175,55,0.15)]' 
                    : 'bg-surface-dark border-white/5 text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="text-xs font-medium mb-1 whitespace-nowrap">{item.day}</span>
                <span className={`text-lg font-black ${activeDay === item.day ? 'text-white' : ''}`}>{item.date}</span>
              </button>
            ))}
          </div>

          {/* Classes List */}
          <div className="flex flex-col gap-4">
            
            {filteredClasses.length === 0 ? (
              <div className="text-center py-12 bg-surface-dark border border-white/5 rounded-2xl">
                <Calendar className="w-12 h-12 text-slate-500 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-bold text-white mb-2">Không có lớp học nào</h3>
                <p className="text-slate-400">Hiện tại không có lớp {activeFilter !== 'Tất cả' ? activeFilter : ''} nào được lên lịch vào {activeDay}.</p>
              </div>
            ) : (
              filteredClasses.map((cls) => {
                const isFull = cls.booked >= cls.capacity;
                const isBooked = bookedClasses.includes(cls.id);
                
                const colorKey = cls.type_color || cls.typeColor || 'default';
                const colorClasses = COLOR_MAP[colorKey] || COLOR_MAP.default;
                
                return (
                  <div key={cls.id} className={`flex flex-col md:flex-row gap-6 bg-surface-dark border border-white/5 rounded-2xl p-6 transition-colors group ${isBooked ? 'border-accent/50 bg-accent/5' : 'hover:border-accent/30'}`}>
                    <div className="md:w-48 flex flex-col justify-center border-b md:border-b-0 md:border-r border-white/10 pb-4 md:pb-0 md:pr-6">
                      <div className="flex items-center gap-2 text-white mb-2">
                        <Clock className={`w-5 h-5 ${isFull && !isBooked ? 'text-primary' : 'text-accent'}`} />
                        <span className="text-2xl font-black">{cls.time}</span>
                      </div>
                      <span className="text-slate-400 text-sm">{cls.duration}</span>
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-center">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`${colorClasses.bg} ${colorClasses.text} text-xs font-bold px-2 py-1 rounded border ${colorClasses.border}`}>
                          {cls.type}
                        </span>
                        <span className="bg-white/5 text-slate-300 text-xs font-bold px-2 py-1 rounded border border-white/10 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {cls.room}
                        </span>
                      </div>
                      <h3 className={`text-xl font-bold text-white mb-2 transition-colors ${isFull && !isBooked ? 'group-hover:text-primary' : 'group-hover:text-accent'}`}>{cls.name}</h3>
                      <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <User className="w-4 h-4" />
                        <span>HLV: {cls.trainer}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col justify-center items-end gap-3 md:w-48 border-t md:border-t-0 border-white/10 pt-4 md:pt-0">
                      <div className="text-right">
                        <span className={isFull && !isBooked ? 'text-primary font-bold' : 'text-white font-bold'}>
                          {isBooked ? cls.booked + 1 : cls.booked}/{cls.capacity}
                        </span>
                        <span className="text-slate-400 text-sm ml-1">chỗ</span>
                      </div>
                      
                      {isBooked ? (
                        <button disabled className="w-full py-2 bg-accent/20 text-accent border border-accent/50 font-bold rounded-lg flex items-center justify-center gap-2">
                          <CheckCircle className="w-4 h-4" /> Đã Đặt
                        </button>
                      ) : isFull ? (
                        <button disabled className="w-full py-2 bg-surface-dark border border-white/20 text-slate-400 font-bold rounded-lg cursor-not-allowed">
                          Đã Kín Chỗ
                        </button>
                      ) : (
                        <button 
                          onClick={() => {
                            console.log('Button clicked for class:', cls.id);
                            handleBookClass(cls.id);
                          }}
                          className="w-full py-2 bg-accent text-background-dark font-bold rounded-lg hover:bg-accent-light transition-colors shadow-lg shadow-accent/20"
                        >
                          Đặt Chỗ
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
