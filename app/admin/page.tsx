'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users, Dumbbell, LogOut, LayoutDashboard, Loader2, TrendingUp, DollarSign, Activity, Calendar as CalendarIcon, Star, MessageSquare, Package, UserCheck, ShoppingCart, Edit, Trash2, Eye, Gift, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';

// Helper: parse Vietnamese price strings to number
const parsePriceToNumber = (priceStr: string): number => {
  if (!priceStr) return 0;
  const str = priceStr.toString().trim();
  if (str.includes('Tr')) {
    const num = parseFloat(str.replace(/[^0-9.]/g, ''));
    return isNaN(num) ? 0 : num * 1000000;
  }
  if (str.toUpperCase().includes('K')) {
    const num = parseFloat(str.replace(/[^0-9.]/g, ''));
    return isNaN(num) ? 0 : num * 1000;
  }
  if (str.toUpperCase().includes('M') && !str.includes('Tr')) {
    const num = parseFloat(str.replace(/[^0-9.]/g, ''));
    return isNaN(num) ? 0 : num * 1000000;
  }
  const cleaned = str.replace(/[^\d]/g, '');
  return parseInt(cleaned) || 0;
};

const formatVNDShort = (amount: number): string => {
  if (amount >= 1000000000) return (amount / 1000000000).toFixed(1).replace('.0', '') + 'B';
  if (amount >= 1000000) return (amount / 1000000).toFixed(1).replace('.0', '') + 'M';
  if (amount >= 1000) return (amount / 1000).toFixed(0) + 'K';
  return amount.toString();
};

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [replyForm, setReplyForm] = useState({ id: null, message: '', email: '' });
  const [reviewReplyForm, setReviewReplyForm] = useState<{id: number | null, message: string, user_email: string}>({ id: null, message: '', user_email: '' });
  const [isMounted, setIsMounted] = useState(false);

  // Overview dashboard state
  const [revenueFilter, setRevenueFilter] = useState<'week' | 'month' | 'year'>('month');
  const [checkinFilter, setCheckinFilter] = useState<'week' | 'month' | 'year'>('week');
  const [revenueChartData, setRevenueChartData] = useState<any[]>([]);
  const [checkinChartData, setCheckinChartData] = useState<any[]>([]);
  const [overviewStats, setOverviewStats] = useState({
    totalUsers: 0,
    monthRevenue: 0,
    todayCheckins: 0,
    activeClasses: 0,
    paidOrdersThisMonth: 0,
  });

  // Promotions state
  const defaultVouchers = [
    { id: 1, code: 'NEWBIE2026', discount: '10%', condition: 'Đơn từ 1M', status: 'active' },
    { id: 2, code: 'SUMMERFIT', discount: '500K', condition: 'Gói 6 tháng', status: 'active' },
    { id: 3, code: 'FLASH50', discount: '50%', condition: 'Không giới hạn', status: 'expired' },
  ];
  const defaultGifts = [
    { id: 1, name: 'Bình nước thể thao', points: 500, stock: '50' },
    { id: 2, name: 'Khăn tắm GymVerse', points: 300, stock: '120' },
    { id: 3, name: 'Voucher giảm 200K', points: 1000, stock: 'Vô hạn' },
    { id: 4, name: '1 tháng tập miễn phí', points: 5000, stock: '10' },
  ];

  const [vouchers, setVouchers] = useState<any[]>(defaultVouchers);
  const [gifts, setGifts] = useState<any[]>(defaultGifts);
  const [plans, setPlans] = useState<any[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showTrainerModal, setShowTrainerModal] = useState(false);
  
  const [newVoucher, setNewVoucher] = useState({ id: null, code: '', discount: '', condition: '', status: 'active' });
  const [newGift, setNewGift] = useState({ id: null, name: '', description: '', points_required: '', stock: '' });
  const [newPlan, setNewPlan] = useState({ id: null, name: '', price: '', duration: '', status: 'active' });
  const [newTrainer, setNewTrainer] = useState({ id: null, name: '', specialty: '', image: '', rating: '5.0', status: 'active', description: '', tags: '', experience_years: '', students_count: '' });

  const handleCreateVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    const newV = { code: newVoucher.code, discount: newVoucher.discount, condition: newVoucher.condition, status: newVoucher.status };
    
    try {
      if (newVoucher.id) {
        const { error } = await supabase.from('fitnexus_vouchers').update(newV).eq('id', newVoucher.id);
        if (error) {
          alert('Lỗi khi cập nhật Database: ' + error.message);
          return;
        }
        setVouchers(vouchers.map(v => v.id === newVoucher.id ? { ...v, ...newV } : v));
      } else {
        const { data, error } = await supabase.from('fitnexus_vouchers').insert([newV]).select();
        if (error) {
          alert('Lỗi khi lưu vào Database: ' + error.message);
          return;
        }
        if (data && data.length > 0) {
          setVouchers([data[0], ...vouchers]);
        }
      }
    } catch (err: any) {
      alert('Lỗi hệ thống: ' + err.message);
      return;
    }
    
    setShowVoucherModal(false);
    setNewVoucher({ id: null, code: '', discount: '', condition: '', status: 'active' });
  };

  const handleDeleteVoucher = async (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa mã giảm giá này?')) {
      try {
        const { error } = await supabase.from('fitnexus_vouchers').delete().eq('id', id);
        if (error) {
          alert('Lỗi khi xóa: ' + error.message);
          return;
        }
        setVouchers(vouchers.filter(v => v.id !== id));
      } catch (err: any) {
        alert('Lỗi hệ thống: ' + err.message);
      }
    }
  };

  const handleAddGift = async (e: React.FormEvent) => {
    e.preventDefault();
    const newG = { name: newGift.name, description: newGift.description, points_required: Number(newGift.points_required), stock: Number(newGift.stock) || 0 };
    
    try {
      if (newGift.id) {
        const { error } = await supabase.from('fitnexus_gifts').update(newG).eq('id', newGift.id);
        if (error) {
          alert('Lỗi khi cập nhật Database: ' + error.message);
          return;
        }
        setGifts(gifts.map(g => g.id === newGift.id ? { ...g, ...newG } : g));
      } else {
        const { data, error } = await supabase.from('fitnexus_gifts').insert([newG]).select();
        if (error) {
          alert('Lỗi khi lưu vào Database: ' + error.message);
          return;
        }
        if (data && data.length > 0) {
          setGifts([data[0], ...gifts]);
        }
      }
    } catch (err: any) {
      alert('Lỗi hệ thống: ' + err.message);
      return;
    }

    setShowGiftModal(false);
    setNewGift({ id: null, name: '', description: '', points_required: '', stock: '' });
  };

  const handleDeleteGift = async (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa quà tặng này?')) {
      try {
        const { error } = await supabase.from('fitnexus_gifts').delete().eq('id', id);
        if (error) {
          alert('Lỗi khi xóa: ' + error.message);
          return;
        }
        setGifts(gifts.filter(g => g.id !== id));
      } catch (err: any) {
        alert('Lỗi hệ thống: ' + err.message);
      }
    }
  };

  useEffect(() => {
    setIsMounted(true);
    
    const checkAdminAndFetchData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user?.email) {
          router.push('/dang-nhap');
          return;
        }
        
        const { data: user, error } = await supabase
          .from('fitnexus_users')
          .select('role')
          .eq('email', session.user.email)
          .single();
          
        if (error || !user || user.role !== 'admin') {
          router.push('/dang-nhap');
          return;
        }
        
        // If we reach here, they are a real admin
        fetchUsers();
        loadContacts();
        fetchPromotions();
        fetchPlansAndTrainers();
      } catch (err) {
        console.error('Error verifying admin:', err);
        router.push('/dang-nhap');
      }
    };
    
    const fetchUsers = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('fitnexus_users')
          .select('*')
          .order('id', { ascending: false });
          
        if (fetchError) {
          console.error('Lỗi từ Supabase:', fetchError);
          setError('Có lỗi xảy ra khi tải dữ liệu người dùng.');
          setIsLoading(false);
          return;
        }

        if (data) {
          setUsers(data as any);
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu.');
      } finally {
        setIsLoading(false);
      }
    };

    const loadContacts = async () => {
      try {
        const { data, error } = await supabase.from('fitnexus_contacts').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          setContacts(data);
        } else if (error) {
          console.error('Error fetching contacts from Supabase:', error);
        }
      } catch (err) {
        console.error('Error fetching contacts:', err);
      }
    };

    const fetchPromotions = async () => {
      try {
        const { data: vData, error: vError } = await supabase.from('fitnexus_vouchers').select('*').order('id', { ascending: false });
        if (!vError && vData && vData.length > 0) {
          setVouchers(vData);
        }

        const { data: gData, error: gError } = await supabase.from('fitnexus_gifts').select('*').order('id', { ascending: false });
        if (!gError && gData && gData.length > 0) {
          setGifts(gData);
        }
      } catch (err) {
        console.error(err);
      }
    };

    const fetchPlansAndTrainers = async () => {
      try {
        const { data: pData, error: pError } = await supabase.from('fitnexus_plans').select('*').order('id', { ascending: false });
        if (!pError && pData) {
          setPlans(pData);
        } else {
          setPlans([]);
        }

        const { data: tData, error: tError } = await supabase.from('fitnexus_trainers').select('*').order('id', { ascending: false });
        if (!tError && tData && tData.length > 0) {
          setTrainers(tData);
        } else {
          // Auto-seed 10 HLV mặc định nếu database trống
          const defaultTrainers = [
            { name: 'Trần Quốc Cường', specialty: 'Sức mạnh & Tăng cơ', image: '/trainers/cuong.png', rating: 4.9, description: 'Chuyên gia về sức mạnh và tăng cơ với hơn 8 năm kinh nghiệm. Đã giúp hơn 500 hội viên đạt được mục tiêu thể hình.', tags: ['Sức mạnh', 'Tăng cơ', 'Powerlifting'], experience_years: 8, students_count: 500, status: 'active' },
            { name: 'Nguyễn Thị Mai', specialty: 'Thể hình nữ & Giảm mỡ', image: '/trainers/mai.png', rating: 5.0, description: 'Chuyên gia thể hình nữ với chế độ dinh dưỡng cá nhân hóa. Giúp chị em tự tin với vóc dáng chuẩn trong dịp Tết.', tags: ['Giảm mỡ', 'Body Shape', 'Dinh dưỡng'], experience_years: 6, students_count: 350, status: 'active' },
            { name: 'Kim Min-ho', specialty: 'Hình thể chuẩn Idol', image: '/trainers/minho.png', rating: 4.9, description: 'HLV đến từ Hàn Quốc, chuyên xây dựng hình thể chuẩn idol K-pop. Phương pháp tập luyện khoa học, hiệu quả nhanh.', tags: ['Body Line', 'Aesthetic', 'K-Fitness'], experience_years: 7, students_count: 420, status: 'active' },
            { name: 'Yuki Tanaka', specialty: 'Thể hình & Dẻo dai', image: '/trainers/yuki.png', rating: 5.0, description: 'HLV người Nhật chuyên kết hợp thể hình và yoga, giúp tăng sức mạnh đồng thời duy trì sự dẻo dai và linh hoạt.', tags: ['Flexibility', 'Yoga', 'Pilates'], experience_years: 10, students_count: 600, status: 'active' },
            { name: 'Marcus Adebayo', specialty: 'Sức mạnh vượt trội', image: '/trainers/marcus.png', rating: 4.8, description: 'Biệt danh "The Machine" – chuyên gia sức mạnh với phương pháp huấn luyện cường độ cao, giúp bạn vượt qua giới hạn bản thân.', tags: ['Strength', 'CrossFit', 'HIIT'], experience_years: 12, students_count: 800, status: 'active' },
            { name: 'Aisha Bello', specialty: 'Sức bền & Thể lực', image: '/trainers/aisha.png', rating: 4.9, description: 'HLV năng động chuyên về sức bền và thể lực toàn diện. Các lớp của Aisha luôn tràn đầy năng lượng và cảm hứng.', tags: ['Endurance', 'Cardio', 'Functional'], experience_years: 6, students_count: 380, status: 'active' },
            { name: 'Alexander Schmidt', specialty: 'Huấn luyện kỹ thuật', image: '/trainers/alexander.png', rating: 4.7, description: 'HLV người Đức chuyên nghiệp, tập trung vào kỹ thuật tập luyện chuẩn xác và chương trình periodization khoa học.', tags: ['Technique', 'Bodybuilding', 'Rehab'], experience_years: 15, students_count: 1000, status: 'active' },
            { name: 'Sarah Jenkins', specialty: 'Group Fitness & Thể hình nữ', image: '/trainers/sarah.png', rating: 4.9, description: 'HLV năng nổ dẫn dắt các lớp tập nhóm. Chuyên về thể hình nữ với phương pháp vui nhộn nhưng hiệu quả cao.', tags: ['Group X', 'Zumba', 'Body Pump'], experience_years: 8, students_count: 650, status: 'active' },
            { name: 'Mateo Silva', specialty: 'Functional Training', image: '/trainers/mateo.png', rating: 4.8, description: 'HLV người Brazil năng động, chuyên về huấn luyện chức năng và thể hình ngoài trời. Mang đến năng lượng tích cực.', tags: ['Functional', 'Outdoor', 'Calisthenics'], experience_years: 9, students_count: 450, status: 'active' },
            { name: 'Li Wei-Hsuan', specialty: 'Yoga & Thể hình nữ', image: '/trainers/liwei.png', rating: 5.0, description: 'HLV gốc Đài Loan-Việt, kết hợp yoga và thể hình cho nữ giới, mang đến sự cân bằng giữa sức mạnh và uyển chuyển.', tags: ['Yoga', 'Women Fitness', 'Meditation'], experience_years: 7, students_count: 380, status: 'active' },
          ];
          
          try {
            const { data: seeded, error: seedError } = await supabase
              .from('fitnexus_trainers')
              .insert(defaultTrainers)
              .select();
            
            if (!seedError && seeded) {
              setTrainers(seeded.reverse());
              console.log('✅ Đã seed 10 HLV vào database!');
            } else {
              console.error('Seed error:', seedError);
              setTrainers([]);
            }
          } catch (seedErr) {
            console.error('Seed error:', seedErr);
            setTrainers([]);
          }
        }
        
        const { data: oData, error: oError } = await supabase.from('fitnexus_orders').select('*').order('created_at', { ascending: false });
        if (!oError && oData) {
          setOrders(oData);
        } else {
          setOrders([]);
        }

        const { data: rData, error: rError } = await supabase.from('fitnexus_reviews').select('*').order('created_at', { ascending: false });
        if (!rError && rData) {
          setReviews(rData);
        } else {
          setReviews([]);
        }
      } catch (err) {
        console.error(err);
      }
    };

    checkAdminAndFetchData();
  }, [router]);

  // Fetch overview stats from real data
  useEffect(() => {
    const fetchOverviewData = async () => {
      try {
        // 1. Total users
        const { count: userCount } = await supabase.from('fitnexus_users').select('*', { count: 'exact', head: true });
        
        // 2. Orders this month (for revenue)
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const { data: monthOrders } = await supabase.from('fitnexus_orders').select('*').gte('created_at', startOfMonth);
        
        // Get plan prices for fallback
        const { data: plansData } = await supabase.from('fitnexus_plans').select('id, name, price');
        const planPriceMap: Record<string, number> = {};
        plansData?.forEach((p: any) => {
          planPriceMap[p.name?.toLowerCase()] = parsePriceToNumber(p.price);
          planPriceMap[p.id?.toString()] = parsePriceToNumber(p.price);
        });
        
        let monthRevenue = 0;
        let paidCount = 0;
        if (monthOrders) {
          monthOrders.forEach((o: any) => {
            if (o.status === 'paid' || o.status === 'completed') {
              paidCount++;
              let amount = parsePriceToNumber(o.amount || '0');
              // If amount is suspiciously low, lookup from plan
              if (amount < 10000 && o.plan_name) {
                const planAmount = planPriceMap[o.plan_name.toLowerCase()] || planPriceMap[o.plan_id?.toString()];
                if (planAmount) amount = planAmount;
              }
              monthRevenue += amount;
            }
          });
        }
        
        // 3. Today's check-ins
        const todayStr = now.toISOString().split('T')[0];
        const { count: todayCheckins } = await supabase.from('fitnexus_checkins').select('*', { count: 'exact', head: true }).eq('date', todayStr);
        
        // 4. Active classes (classes scheduled today)
        const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        const todayDay = dayNames[now.getDay()];
        const { count: classCount } = await supabase.from('fitnexus_classes').select('*', { count: 'exact', head: true }).eq('day', todayDay);
        
        setOverviewStats({
          totalUsers: userCount || 0,
          monthRevenue,
          todayCheckins: todayCheckins || 0,
          activeClasses: classCount || 0,
          paidOrdersThisMonth: paidCount,
        });
      } catch (err) {
        console.error('Error fetching overview:', err);
      }
    };
    
    if (!isLoading) fetchOverviewData();
  }, [isLoading, orders]);

  // Build revenue chart data based on filter
  useEffect(() => {
    const buildRevenueChart = async () => {
      try {
        const now = new Date();
        let startDate: Date;
        const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        const monthNames = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
        
        if (revenueFilter === 'week') {
          // Last 7 days
          startDate = new Date(now);
          startDate.setDate(now.getDate() - 6);
        } else if (revenueFilter === 'month') {
          // Start of current month
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        } else {
          // Start of current year
          startDate = new Date(now.getFullYear(), 0, 1);
        }
        
        const { data: chartOrders } = await supabase
          .from('fitnexus_orders')
          .select('*')
          .gte('created_at', startDate.toISOString())
          .in('status', ['paid', 'completed']);
        
        // Get plan prices for fallback on legacy orders
        const { data: plData } = await supabase.from('fitnexus_plans').select('id, name, price');
        const plMap: Record<string, number> = {};
        plData?.forEach((p: any) => {
          plMap[p.name?.toLowerCase()] = parsePriceToNumber(p.price);
          plMap[p.id?.toString()] = parsePriceToNumber(p.price);
        });
        const getOrderAmount = (o: any): number => {
          let amt = parsePriceToNumber(o.amount || '0');
          if (amt < 10000 && o.plan_name) {
            const fallback = plMap[o.plan_name.toLowerCase()] || plMap[o.plan_id?.toString()];
            if (fallback) amt = fallback;
          }
          return amt;
        };
        
        if (revenueFilter === 'week') {
          // Group by day of week
          const grouped: Record<string, number> = {};
          for (let i = 0; i < 7; i++) {
            const d = new Date(startDate);
            d.setDate(startDate.getDate() + i);
            const key = `${d.getDate()}/${d.getMonth() + 1}`;
            grouped[key] = 0;
          }
          chartOrders?.forEach((o: any) => {
            const d = new Date(o.created_at);
            const key = `${d.getDate()}/${d.getMonth() + 1}`;
            if (grouped[key] !== undefined) {
              grouped[key] += getOrderAmount(o);
            }
          });
          setRevenueChartData(Object.entries(grouped).map(([name, total]) => ({ name, total })));
        } else if (revenueFilter === 'month') {
          // Group by week of month
          const weeks: Record<string, number> = { 'Tuần 1': 0, 'Tuần 2': 0, 'Tuần 3': 0, 'Tuần 4': 0, 'Tuần 5': 0 };
          chartOrders?.forEach((o: any) => {
            const d = new Date(o.created_at);
            const weekNum = Math.ceil(d.getDate() / 7);
            const key = `Tuần ${Math.min(weekNum, 5)}`;
            weeks[key] += getOrderAmount(o);
          });
          setRevenueChartData(Object.entries(weeks).filter(([, v]) => true).map(([name, total]) => ({ name, total })));
        } else {
          // Group by month
          const months: Record<string, number> = {};
          monthNames.forEach(m => { months[m] = 0; });
          chartOrders?.forEach((o: any) => {
            const d = new Date(o.created_at);
            const key = monthNames[d.getMonth()];
            months[key] += getOrderAmount(o);
          });
          setRevenueChartData(Object.entries(months).map(([name, total]) => ({ name, total })));
        }
      } catch (err) {
        console.error('Revenue chart error:', err);
      }
    };
    
    if (!isLoading) buildRevenueChart();
  }, [isLoading, revenueFilter, orders]);

  // Build check-in chart data based on filter
  useEffect(() => {
    const buildCheckinChart = async () => {
      try {
        const now = new Date();
        const monthNames = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
        
        const { data: allCheckins } = await supabase.from('fitnexus_checkins').select('*');
        
        if (checkinFilter === 'week') {
          // Last 7 days
          const startDate = new Date(now);
          startDate.setDate(now.getDate() - 6);
          const grouped: Record<string, number> = {};
          const dayLabels = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
          for (let i = 0; i < 7; i++) {
            const d = new Date(startDate);
            d.setDate(startDate.getDate() + i);
            const key = dayLabels[d.getDay()];
            grouped[key] = 0;
          }
          allCheckins?.forEach((c: any) => {
            const d = new Date(c.created_at || c.date);
            if (d >= startDate && d <= now) {
              const dayLabel = dayLabels[d.getDay()];
              if (grouped[dayLabel] !== undefined) {
                grouped[dayLabel]++;
              }
            }
          });
          setCheckinChartData(Object.entries(grouped).map(([name, count]) => ({ name, count })));
        } else if (checkinFilter === 'month') {
          // Group by week of current month
          const weeks: Record<string, number> = { 'Tuần 1': 0, 'Tuần 2': 0, 'Tuần 3': 0, 'Tuần 4': 0, 'Tuần 5': 0 };
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          allCheckins?.forEach((c: any) => {
            const d = new Date(c.created_at || c.date);
            if (d >= startOfMonth && d <= now) {
              const weekNum = Math.ceil(d.getDate() / 7);
              const key = `Tuần ${Math.min(weekNum, 5)}`;
              weeks[key]++;
            }
          });
          setCheckinChartData(Object.entries(weeks).map(([name, count]) => ({ name, count })));
        } else {
          // Group by month
          const months: Record<string, number> = {};
          monthNames.forEach(m => { months[m] = 0; });
          const startOfYear = new Date(now.getFullYear(), 0, 1);
          allCheckins?.forEach((c: any) => {
            const d = new Date(c.created_at || c.date);
            if (d >= startOfYear && d <= now) {
              const key = monthNames[d.getMonth()];
              months[key]++;
            }
          });
          setCheckinChartData(Object.entries(months).map(([name, count]) => ({ name, count })));
        }
      } catch (err) {
        console.error('Checkin chart error:', err);
      }
    };
    
    if (!isLoading) buildCheckinChart();
  }, [isLoading, checkinFilter]);

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    const planData = { name: newPlan.name, price: newPlan.price, duration: newPlan.duration, status: newPlan.status };
    
    try {
      if (newPlan.id) {
        const { error } = await supabase.from('fitnexus_plans').update(planData).eq('id', newPlan.id);
        if (error) {
          alert('Lỗi khi cập nhật Database: ' + error.message);
          return;
        }
        setPlans(plans.map(p => p.id === newPlan.id ? { ...p, ...planData } : p));
      } else {
        const { data, error } = await supabase.from('fitnexus_plans').insert([planData]).select();
        if (error) {
          alert('Lỗi khi lưu vào Database: ' + error.message);
          return;
        }
        if (data && data.length > 0) {
          setPlans([data[0], ...plans]);
        }
      }
    } catch (err: any) {
      alert('Lỗi hệ thống: ' + err.message);
      return;
    }
    
    setShowPlanModal(false);
    setNewPlan({ id: null, name: '', price: '', duration: '', status: 'active' });
  };

  const handleDeletePlan = async (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa gói tập này?')) {
      try {
        const { error } = await supabase.from('fitnexus_plans').delete().eq('id', id);
        if (error) {
          alert('Lỗi khi xóa: ' + error.message);
          return;
        }
        setPlans(plans.filter(p => p.id !== id));
      } catch (err: any) {
        alert('Lỗi hệ thống: ' + err.message);
      }
    }
  };

  const handleSaveTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    const tagsArray = newTrainer.tags ? newTrainer.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [];
    const trainerData = { 
      name: newTrainer.name, 
      specialty: newTrainer.specialty, 
      image: newTrainer.image, 
      rating: Number(newTrainer.rating), 
      status: newTrainer.status,
      description: newTrainer.description || '',
      tags: tagsArray,
      experience_years: Number(newTrainer.experience_years) || 0,
      students_count: Number(newTrainer.students_count) || 0
    };
    
    try {
      if (newTrainer.id) {
        const { error } = await supabase.from('fitnexus_trainers').update(trainerData).eq('id', newTrainer.id);
        if (error) {
          alert('Lỗi khi cập nhật Database: ' + error.message);
          return;
        }
        setTrainers(trainers.map(t => t.id === newTrainer.id ? { ...t, ...trainerData } : t));
      } else {
        const { data, error } = await supabase.from('fitnexus_trainers').insert([trainerData]).select();
        if (error) {
          alert('Lỗi khi lưu vào Database: ' + error.message);
          return;
        }
        if (data && data.length > 0) {
          setTrainers([data[0], ...trainers]);
        }
      }
    } catch (err: any) {
      alert('Lỗi hệ thống: ' + err.message);
      return;
    }
    
    setShowTrainerModal(false);
    setNewTrainer({ id: null, name: '', specialty: '', image: '', rating: '5.0', status: 'active', description: '', tags: '', experience_years: '', students_count: '' });
  };

  const handleDeleteTrainer = async (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa huấn luyện viên này?')) {
      try {
        const { error } = await supabase.from('fitnexus_trainers').delete().eq('id', id);
        if (error) {
          alert('Lỗi khi xóa: ' + error.message);
          return;
        }
        setTrainers(trainers.filter(t => t.id !== id));
      } catch (err: any) {
        alert('Lỗi hệ thống: ' + err.message);
      }
    }
  };

  const handleDeleteReview = async (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
      try {
        const { error } = await supabase.from('fitnexus_reviews').delete().eq('id', id);
        if (error) {
          alert('Lỗi khi xóa: ' + error.message);
          return;
        }
        setReviews(reviews.filter(r => r.id !== id));
      } catch (err: any) {
        alert('Lỗi hệ thống: ' + err.message);
      }
    }
  };

  const handleReplyReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewReplyForm.id || !reviewReplyForm.message) return;

    try {
      // Update review with admin reply
      const { error: updateError } = await supabase
        .from('fitnexus_reviews')
        .update({ admin_reply: reviewReplyForm.message })
        .eq('id', reviewReplyForm.id);

      if (updateError) {
        // If column doesn't exist, add it
        console.error('Error updating review:', updateError);
        alert('Lỗi khi phản hồi: ' + updateError.message + '. Hãy thêm cột admin_reply vào bảng fitnexus_reviews.');
        return;
      }

      // Update local state
      setReviews(reviews.map(r => 
        r.id === reviewReplyForm.id ? { ...r, admin_reply: reviewReplyForm.message } : r
      ));

      // Create notification for user
      if (reviewReplyForm.user_email) {
        const newNotification = {
          user_email: reviewReplyForm.user_email,
          title: 'Phản hồi đánh giá',
          message: `Quản trị viên đã phản hồi đánh giá của bạn: ${reviewReplyForm.message}`,
          type: 'review_reply',
          read: false
        };
        await supabase.from('fitnexus_notifications').insert([newNotification]);
        window.dispatchEvent(new Event('notifications-updated'));
      }
    } catch (err) {
      console.error(err);
    }

    setReviewReplyForm({ id: null, message: '', user_email: '' });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.dispatchEvent(new Event('user-auth-changed'));
    router.push('/dang-nhap');
  };

  const handleReplyContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyForm.id || !replyForm.message) return;

    try {
      // Update contact status in Supabase
      const { error: updateError } = await supabase
        .from('fitnexus_contacts')
        .update({ status: 'replied' })
        .eq('id', replyForm.id);

      if (updateError) {
        console.error('Error updating contact:', updateError);
        alert('Lỗi cập nhật trạng thái liên hệ: ' + updateError.message);
        return;
      } else {
        const updatedContacts = contacts.map(c => 
          c.id === replyForm.id ? { ...c, status: 'replied' } : c
        );
        setContacts(updatedContacts);
      }

      // Create notification for user
      const contact = contacts.find(c => c.id === replyForm.id);
      if (contact && contact.email) {
        const newNotification = {
          user_email: contact.email,
          title: 'Phản hồi liên hệ',
          message: `Quản trị viên đã phản hồi liên hệ "${contact.subject}" của bạn: ${replyForm.message}`,
          type: 'contact_reply',
          read: false
        };

        const { error: notifError } = await supabase
          .from('fitnexus_notifications')
          .insert([newNotification]);

        if (notifError) {
          console.error('Error creating notification:', notifError);
        }
        window.dispatchEvent(new Event('notifications-updated'));
      }
    } catch (err) {
      console.error(err);
    }

    setReplyForm({ id: null, message: '', email: '' });
  };

  return (
    <div className="min-h-screen bg-background-dark flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-surface-dark border-b md:border-b-0 md:border-r border-white/10 p-4 md:p-6 flex flex-col shrink-0">
        <div className="flex items-center justify-between md:justify-start mb-4 md:mb-10">
          <Link href="/" className="flex items-center gap-2">
            <Dumbbell className="text-accent w-6 h-6 md:w-8 md:h-8" />
            <h2 className="text-lg md:text-xl font-black text-white uppercase tracking-tight">
              Gym<span className="text-primary">Verse</span>
            </h2>
          </Link>
          <button onClick={handleLogout} className="md:hidden flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg text-sm font-medium transition-colors">
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </button>
        </div>
        
        <nav className="flex md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          <button onClick={() => setActiveTab('overview')} className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-xl font-bold transition-colors whitespace-nowrap ${activeTab === 'overview' ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <LayoutDashboard className="w-4 h-4 md:w-5 md:h-5" />
            Tổng quan
          </button>
          <button onClick={() => setActiveTab('users')} className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-xl font-bold transition-colors whitespace-nowrap ${activeTab === 'users' ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <Users className="w-4 h-4 md:w-5 md:h-5" />
            Quản lý hội viên
          </button>
          <button onClick={() => setActiveTab('plans')} className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-xl font-bold transition-colors whitespace-nowrap ${activeTab === 'plans' ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <Package className="w-4 h-4 md:w-5 md:h-5" />
            Dịch vụ & Gói tập
          </button>
          <button onClick={() => setActiveTab('trainers')} className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-xl font-bold transition-colors whitespace-nowrap ${activeTab === 'trainers' ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <UserCheck className="w-4 h-4 md:w-5 md:h-5" />
            Huấn luyện viên
          </button>
          <button onClick={() => setActiveTab('orders')} className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-xl font-bold transition-colors whitespace-nowrap ${activeTab === 'orders' ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
            Giao dịch & Đơn hàng
          </button>
          <button onClick={() => setActiveTab('promotions')} className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-xl font-bold transition-colors whitespace-nowrap ${activeTab === 'promotions' ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <Gift className="w-4 h-4 md:w-5 md:h-5" />
            Khuyến mãi & Lì Xì
          </button>
          <button onClick={() => setActiveTab('reviews')} className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-xl font-bold transition-colors whitespace-nowrap ${activeTab === 'reviews' ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <Star className="w-4 h-4 md:w-5 md:h-5" />
            Đánh giá
          </button>
          <button onClick={() => setActiveTab('contacts')} className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-xl font-bold transition-colors whitespace-nowrap ${activeTab === 'contacts' ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
            <MessageSquare className="w-4 h-4 md:w-5 md:h-5" />
            Phản hồi liên hệ
            {contacts.filter(c => c.status === 'pending').length > 0 && (
              <span className="ml-1 md:ml-auto bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                {contacts.filter(c => c.status === 'pending').length}
              </span>
            )}
          </button>
        </nav>
        
        <button onClick={handleLogout} className="hidden md:flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl font-medium transition-colors mt-auto">
          <LogOut className="w-5 h-5" />
            Đăng xuất
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-10 overflow-y-auto">
        {activeTab === 'overview' && (
          <>
            <h1 className="text-2xl md:text-3xl font-black text-white mb-6 md:mb-8">Tổng Quan Hệ Thống</h1>
            
            {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-surface-dark border border-white/10 rounded-2xl p-6 hover:border-primary/30 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <p className="text-slate-400 text-sm font-medium mb-1">Tổng số hội viên</p>
            <h3 className="text-3xl font-black text-white">{overviewStats.totalUsers}</h3>
          </div>

          <div className="bg-surface-dark border border-white/10 rounded-2xl p-6 hover:border-accent/30 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                <DollarSign className="w-6 h-6" />
              </div>
              {overviewStats.paidOrdersThisMonth > 0 && (
                <span className="text-green-400 text-xs font-bold bg-green-400/10 px-2 py-1 rounded-full">
                  {overviewStats.paidOrdersThisMonth} đơn
                </span>
              )}
            </div>
            <p className="text-slate-400 text-sm font-medium mb-1">Doanh thu tháng này</p>
            <h3 className="text-3xl font-black text-white">{formatVNDShort(overviewStats.monthRevenue)}</h3>
          </div>

          <div className="bg-surface-dark border border-white/10 rounded-2xl p-6 hover:border-blue-500/30 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                <Activity className="w-6 h-6" />
              </div>
            </div>
            <p className="text-slate-400 text-sm font-medium mb-1">Lượt check-in hôm nay</p>
            <h3 className="text-3xl font-black text-white">{overviewStats.todayCheckins}</h3>
          </div>

          <div className="bg-surface-dark border border-white/10 rounded-2xl p-6 hover:border-purple-500/30 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                <CalendarIcon className="w-6 h-6" />
              </div>
            </div>
            <p className="text-slate-400 text-sm font-medium mb-1">Lớp học đang diễn ra</p>
            <h3 className="text-3xl font-black text-white">{overviewStats.activeClasses}</h3>
          </div>
        </div>

        {/* Charts Section */}
        {isMounted && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="bg-surface-dark border border-white/10 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Biểu đồ doanh thu</h2>
              <select 
                value={revenueFilter}
                onChange={(e) => setRevenueFilter(e.target.value as 'week' | 'month' | 'year')}
                className="bg-background-dark border border-white/10 text-slate-300 text-sm rounded-lg px-3 py-1 focus:outline-none focus:border-accent"
              >
                <option value="week">Tuần này</option>
                <option value="month">Tháng này</option>
                <option value="year">Năm nay</option>
              </select>
            </div>
            <div className="h-[300px] w-full">
              {revenueChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#c6102e" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#c6102e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="name" stroke="#ffffff50" axisLine={false} tickLine={false} />
                  <YAxis stroke="#ffffff50" axisLine={false} tickLine={false} tickFormatter={(value) => formatVNDShort(value)} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#151619', borderColor: '#ffffff10', borderRadius: '8px' }}
                    itemStyle={{ color: '#c6102e', fontWeight: 'bold' }}
                    formatter={(value: any) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)}
                  />
                  <Area type="monotone" dataKey="total" stroke="#c6102e" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500">Chưa có dữ liệu doanh thu</div>
              )}
            </div>
          </div>

          {/* Check-ins Chart */}
          <div className="bg-surface-dark border border-white/10 rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Lượt check-in</h2>
              <select 
                value={checkinFilter}
                onChange={(e) => setCheckinFilter(e.target.value as 'week' | 'month' | 'year')}
                className="bg-background-dark border border-white/10 text-slate-300 text-sm rounded-lg px-3 py-1 focus:outline-none focus:border-accent"
              >
                <option value="week">Tuần này</option>
                <option value="month">Tháng này</option>
                <option value="year">Năm nay</option>
              </select>
            </div>
            <div className="h-[300px] w-full">
              {checkinChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={checkinChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="name" stroke="#ffffff50" axisLine={false} tickLine={false} />
                  <YAxis stroke="#ffffff50" axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#151619', borderColor: '#ffffff10', borderRadius: '8px' }}
                    itemStyle={{ color: '#d4af37', fontWeight: 'bold' }}
                    cursor={{ fill: '#ffffff05' }}
                  />
                  <Bar dataKey="count" fill="#d4af37" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500">Chưa có dữ liệu check-in</div>
              )}
            </div>
          </div>
        </div>
        )}

        {/* Users Table */}
        <div className="bg-surface-dark border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-xl font-bold text-white">Danh sách hội viên mới đăng ký</h2>
          </div>
          
          {error && (
            <div className="p-6">
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-xl text-sm">
                {error}
                <div className="mt-2 text-slate-300">
                  <strong>Hướng dẫn tạo bảng:</strong>
                  <pre className="mt-2 p-3 bg-black/50 rounded-lg overflow-x-auto text-xs text-slate-400">
{`create table fitnexus_users (
  id bigint generated by default as identity primary key,
  fullname text not null,
  phone text not null,
  email text not null unique,
  password text not null,
  role text default 'user',
  points integer default 0,
  weight text,
  height text,
  goal text,
  dob text,
  gender text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table fitnexus_workout_logs (
  id bigint generated by default as identity primary key,
  user_email text not null,
  date text not null,
  type text not null,
  duration text not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table fitnexus_checkins (
  id bigint generated by default as identity primary key,
  user_email text not null,
  date text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table fitnexus_reviews (
  id bigint generated by default as identity primary key,
  user_email text not null,
  date text not null,
  rating integer not null,
  type text not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table fitnexus_classes (
  id bigint generated by default as identity primary key,
  name text not null,
  type text not null,
  trainer text not null,
  day text not null,
  time text not null,
  duration text not null,
  room text not null,
  capacity integer not null,
  booked integer default 0,
  type_color text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table fitnexus_bookings (
  id bigint generated by default as identity primary key,
  user_email text not null,
  class_id bigint not null references fitnexus_classes(id),
  date text not null,
  status text default 'confirmed',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table fitnexus_redemptions (
  id bigint generated by default as identity primary key,
  user_email text not null,
  gift_id bigint not null,
  points_spent integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table fitnexus_plans (
  id bigint generated by default as identity primary key,
  name text not null,
  price text not null,
  duration text not null,
  status text default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table fitnexus_trainers (
  id bigint generated by default as identity primary key,
  name text not null,
  specialty text not null,
  image text not null,
  rating numeric not null default 5.0,
  status text default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table fitnexus_vouchers (
  id bigint generated by default as identity primary key,
  code text not null unique,
  discount text not null,
  condition text,
  status text default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table fitnexus_gifts (
  id bigint generated by default as identity primary key,
  name text not null,
  description text,
  points_required integer not null,
  stock integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table fitnexus_contacts (
  id bigint generated by default as identity primary key,
  name text not null,
  email text not null,
  phone text not null,
  message text not null,
  status text default 'new',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table fitnexus_notifications (
  id bigint generated by default as identity primary key,
  user_email text not null,
  title text not null,
  message text not null,
  type text not null,
  read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table fitnexus_orders (
  id text primary key,
  user_email text not null,
  plan_id text not null,
  plan_name text not null,
  amount text not null,
  status text default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-slate-300 text-sm">
                  <th className="p-4 font-medium">Họ và tên</th>
                  <th className="p-4 font-medium">Email</th>
                  <th className="p-4 font-medium">Số điện thoại</th>
                  <th className="p-4 font-medium">Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500">
                      <div className="flex justify-center items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        Đang tải dữ liệu...
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 && !error ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-500">Chưa có hội viên nào đăng ký</td>
                  </tr>
                ) : (
                  users.map((user: any, idx: number) => (
                    <tr key={idx} className="border-b border-white/5 text-slate-300 hover:bg-white/5">
                      <td className="p-4">{user.fullname}</td>
                      <td className="p-4">{user.email}</td>
                      <td className="p-4">{user.phone}</td>
                      <td className="p-4">
                        <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-bold border border-green-500/30">
                          Hoạt động
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        </>
      )}

      {activeTab === 'users' && (
          <>
            <h1 className="text-2xl md:text-3xl font-black text-white mb-6 md:mb-8">Quản lý hội viên</h1>
            <div className="bg-surface-dark border border-white/10 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-white/10">
                <h2 className="text-xl font-bold text-white">Danh sách hội viên ({users.length})</h2>
              </div>
              
              {error && (
                <div className="p-6">
                  <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-xl text-sm">
                    {error}
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 text-slate-300 text-sm">
                      <th className="p-4 font-medium">Họ và tên</th>
                      <th className="p-4 font-medium">Email</th>
                      <th className="p-4 font-medium">SĐT</th>
                      <th className="p-4 font-medium">Vai trò</th>
                      <th className="p-4 font-medium">Điểm LX</th>
                      <th className="p-4 font-medium">Gói tập</th>
                      <th className="p-4 font-medium">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-500">
                          <div className="flex justify-center items-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin text-primary" />
                            Đang tải dữ liệu...
                          </div>
                        </td>
                      </tr>
                    ) : users.length === 0 && !error ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-500">Chưa có hội viên nào đăng ký</td>
                      </tr>
                    ) : (
                      users.map((user: any, idx: number) => {
                        const userOrder = orders.find((o: any) => o.user_email === user.email && o.status === 'paid');
                        return (
                        <tr key={idx} className="border-b border-white/5 text-slate-300 hover:bg-white/5">
                          <td className="p-4 font-bold text-white">{user.fullname}</td>
                          <td className="p-4 text-sm">{user.email}</td>
                          <td className="p-4 text-sm">{user.phone || '-'}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold border ${
                              user.role === 'admin' 
                                ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' 
                                : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                            }`}>
                              {user.role === 'admin' ? 'Admin' : 'Member'}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="text-yellow-400 font-bold">{user.points || 0}</span>
                          </td>
                          <td className="p-4">
                            {userOrder ? (
                              <span className="bg-primary/20 text-primary px-2 py-1 rounded text-xs font-bold border border-primary/30">
                                {userOrder.plan_name}
                              </span>
                            ) : (
                              <span className="text-slate-500 text-xs">Chưa có</span>
                            )}
                          </td>
                          <td className="p-4">
                            <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded text-xs font-bold border border-green-500/30">
                              Hoạt động
                            </span>
                          </td>
                        </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'reviews' && (
          <>
            <div className="flex justify-between items-center mb-6 md:mb-8">
              <h1 className="text-2xl md:text-3xl font-black text-white">Quản lý đánh giá ({reviews.length})</h1>
            </div>

            <div className="space-y-4">
              {reviews.length === 0 ? (
                <div className="bg-surface-dark border border-white/10 rounded-2xl p-12 text-center">
                  <Star className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Chưa có đánh giá nào</h3>
                  <p className="text-slate-400">Khi khách hàng gửi đánh giá, thông tin sẽ xuất hiện tại đây.</p>
                </div>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="bg-surface-dark border border-white/10 rounded-2xl p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-bold text-white">{review.user_email}</h3>
                          <span className="bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded text-xs font-bold border border-yellow-500/30">
                            {review.type || 'Chung'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-slate-600'}`} />
                          ))}
                          <span className="text-slate-400 text-sm ml-2">{review.date}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteReview(review.id)}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="bg-background-dark border border-white/5 rounded-xl p-4 mb-4">
                      <p className="text-slate-300">{review.content || review.comment || 'Không có nội dung'}</p>
                    </div>

                    {/* Admin Reply */}
                    {review.admin_reply ? (
                      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                        <p className="text-xs text-primary font-bold mb-1">↳ Phản hồi từ Admin:</p>
                        <p className="text-slate-300 text-sm">{review.admin_reply}</p>
                      </div>
                    ) : (
                      reviewReplyForm.id === review.id ? (
                        <form onSubmit={handleReplyReview} className="mt-2 flex gap-2">
                          <input 
                            type="text" 
                            value={reviewReplyForm.message}
                            onChange={(e) => setReviewReplyForm({...reviewReplyForm, message: e.target.value})}
                            placeholder="Nhập phản hồi đánh giá..." 
                            className="flex-1 bg-background-dark border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary text-sm"
                            required
                          />
                          <button type="submit" className="px-4 py-2 bg-primary hover:bg-[#8a0b20] text-white font-bold rounded-xl text-sm transition-colors">
                            Gửi
                          </button>
                          <button type="button" onClick={() => setReviewReplyForm({ id: null, message: '', user_email: '' })} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl text-sm transition-colors">
                            Hủy
                          </button>
                        </form>
                      ) : (
                        <button 
                          onClick={() => setReviewReplyForm({ id: review.id, message: '', user_email: review.user_email })}
                          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl text-sm transition-colors flex items-center gap-2"
                        >
                          <MessageSquare className="w-4 h-4" />
                          Phản hồi đánh giá
                        </button>
                      )
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {activeTab === 'contacts' && (
          <>
            <h1 className="text-2xl md:text-3xl font-black text-white mb-6 md:mb-8">Phản hồi liên hệ</h1>
            <div className="space-y-6">
              {contacts.length === 0 ? (
                <div className="bg-surface-dark border border-white/10 rounded-2xl p-12 text-center">
                  <MessageSquare className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Chưa có liên hệ nào</h3>
                  <p className="text-slate-400">Khi khách hàng gửi liên hệ, thông tin sẽ xuất hiện tại đây.</p>
                </div>
              ) : (
                contacts.map((contact) => (
                  <div key={contact.id} className="bg-surface-dark border border-white/10 rounded-2xl p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-white">{contact.name}</h3>
                          <span className={`px-2 py-1 rounded text-xs font-bold ${contact.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-green-500/20 text-green-400 border border-green-500/30'}`}>
                            {contact.status === 'pending' ? 'Chưa phản hồi' : 'Đã phản hồi'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-400 mb-1">Email: {contact.email || 'Không có'} | SĐT: {contact.phone}</p>
                        <p className="text-sm text-slate-400">Chủ đề: <span className="text-accent">{contact.subject}</span></p>
                      </div>
                      <span className="text-sm text-slate-500">{contact.created_at ? new Date(contact.created_at).toLocaleString('vi-VN') : 'N/A'}</span>
                    </div>
                    
                    <div className="bg-background-dark border border-white/5 rounded-xl p-4 mb-4">
                      <p className="text-slate-300">{contact.message}</p>
                    </div>

                    {contact.status === 'pending' ? (
                      replyForm.id === contact.id ? (
                        <form onSubmit={handleReplyContact} className="mt-4 flex gap-2">
                          <input 
                            type="text" 
                            value={replyForm.message}
                            onChange={(e) => setReplyForm({...replyForm, message: e.target.value})}
                            placeholder="Nhập nội dung phản hồi..." 
                            className="flex-1 bg-background-dark border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary text-sm"
                            required
                          />
                          <button type="submit" className="px-4 py-2 bg-primary hover:bg-[#8a0b20] text-white font-bold rounded-xl text-sm transition-colors">
                            Gửi
                          </button>
                          <button type="button" onClick={() => setReplyForm({ id: null, message: '', email: '' })} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl text-sm transition-colors">
                            Hủy
                          </button>
                        </form>
                      ) : (
                        <button 
                          onClick={() => setReplyForm({ id: contact.id, message: '', email: contact.email })}
                          className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl text-sm transition-colors"
                        >
                          Phản hồi
                        </button>
                      )
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {activeTab === 'plans' && (
          <>
            <div className="flex justify-between items-center mb-6 md:mb-8">
              <h1 className="text-2xl md:text-3xl font-black text-white">Dịch vụ & Gói tập</h1>
              <button 
                onClick={() => {
                  setNewPlan({ id: null, name: '', price: '', duration: '', status: 'active' });
                  setShowPlanModal(true);
                }}
                className="px-4 py-2 bg-primary hover:bg-[#8a0b20] text-white font-bold rounded-xl text-sm transition-colors"
              >
                + Thêm gói tập
              </button>
            </div>
            <div className="bg-surface-dark border border-white/10 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 text-slate-300 text-sm">
                      <th className="p-4 font-medium">Tên gói</th>
                      <th className="p-4 font-medium">Giá (VNĐ)</th>
                      <th className="p-4 font-medium">Thời hạn</th>
                      <th className="p-4 font-medium">Trạng thái</th>
                      <th className="p-4 font-medium text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plans.map((plan) => (
                      <tr key={plan.id} className="border-b border-white/5 text-slate-300 hover:bg-white/5">
                        <td className="p-4 font-bold text-white">{plan.name}</td>
                        <td className="p-4 text-accent">{plan.price}</td>
                        <td className="p-4">{plan.duration}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold border ${plan.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-slate-500/20 text-slate-400 border-slate-500/30'}`}>
                            {plan.status === 'active' ? 'Đang bán' : 'Ngừng bán'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => {
                                setNewPlan(plan);
                                setShowPlanModal(true);
                              }}
                              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeletePlan(plan.id)}
                              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'trainers' && (
          <>
            <div className="flex justify-between items-center mb-6 md:mb-8">
              <h1 className="text-2xl md:text-3xl font-black text-white">Huấn luyện viên</h1>
              <button 
                onClick={() => {
                  setNewTrainer({ id: null, name: '', specialty: '', image: '', rating: '5.0', status: 'active', description: '', tags: '', experience_years: '', students_count: '' });
                  setShowTrainerModal(true);
                }}
                className="px-4 py-2 bg-primary hover:bg-[#8a0b20] text-white font-bold rounded-xl text-sm transition-colors"
              >
                + Thêm HLV
              </button>
            </div>
            <div className="bg-surface-dark border border-white/10 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 text-slate-300 text-sm">
                      <th className="p-4 font-medium">Ảnh</th>
                      <th className="p-4 font-medium">Họ và tên</th>
                      <th className="p-4 font-medium">Chuyên môn</th>
                      <th className="p-4 font-medium">Đánh giá</th>
                      <th className="p-4 font-medium">Trạng thái</th>
                      <th className="p-4 font-medium text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trainers.map((trainer) => (
                      <tr key={trainer.id} className="border-b border-white/5 text-slate-300 hover:bg-white/5">
                        <td className="p-4">
                          {trainer.image ? (
                            <img src={trainer.image} alt={trainer.name} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">{trainer.name?.charAt(0)}</div>
                          )}
                        </td>
                        <td className="p-4 font-bold text-white">{trainer.name}</td>
                        <td className="p-4">{trainer.specialty}</td>
                        <td className="p-4 flex items-center gap-1 text-accent">
                          <Star className="w-4 h-4 fill-accent" /> {trainer.rating}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold border ${trainer.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-slate-500/20 text-slate-400 border-slate-500/30'}`}>
                            {trainer.status === 'active' ? 'Đang làm việc' : 'Nghỉ việc'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => {
                                setNewTrainer({...trainer, tags: Array.isArray(trainer.tags) ? trainer.tags.join(', ') : (trainer.tags || ''), experience_years: trainer.experience_years?.toString() || '', students_count: trainer.students_count?.toString() || ''});
                                setShowTrainerModal(true);
                              }}
                              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Chỉnh sửa"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteTrainer(trainer.id)}
                              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Xóa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'orders' && (
          <>
            <h1 className="text-2xl md:text-3xl font-black text-white mb-6 md:mb-8">Giao dịch & Đơn hàng</h1>
            <div className="bg-surface-dark border border-white/10 rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-xl font-bold text-white">Lịch sử giao dịch</h2>
                <div className="flex gap-2">
                  <select className="bg-background-dark border border-white/10 text-slate-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-accent">
                    <option value="all">Tất cả trạng thái</option>
                    <option value="paid">Thành công</option>
                    <option value="pending">Đang chờ</option>
                    <option value="failed">Thất bại</option>
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 text-slate-300 text-sm">
                      <th className="p-4 font-medium">Mã ĐH</th>
                      <th className="p-4 font-medium">Khách hàng</th>
                      <th className="p-4 font-medium">Gói tập</th>
                      <th className="p-4 font-medium">Số tiền</th>
                      <th className="p-4 font-medium">Ngày GD</th>
                      <th className="p-4 font-medium">Trạng thái</th>
                      <th className="p-4 font-medium text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order, idx) => (
                      <tr key={idx} className="border-b border-white/5 text-slate-300 hover:bg-white/5">
                        <td className="p-4 font-mono text-xs">{order.id}</td>
                        <td className="p-4">{order.user_email}</td>
                        <td className="p-4 font-medium text-white">{order.plan_name}</td>
                        <td className="p-4 text-accent font-bold">{(() => {
                          let amt = parsePriceToNumber(order.amount || '0');
                          if (amt < 10000 && order.plan_name) {
                            const planMatch = plans.find((p: any) => p.name?.toLowerCase() === order.plan_name?.toLowerCase());
                            if (planMatch) amt = parsePriceToNumber(planMatch.price);
                          }
                          return amt > 0 ? amt.toLocaleString('vi-VN') + 'đ' : order.amount;
                        })()}</td>
                        <td className="p-4 text-sm">{new Date(order.created_at).toLocaleDateString('vi-VN')}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold border ${
                            order.status === 'paid' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 
                            order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' : 
                            'bg-red-500/20 text-red-400 border-red-500/30'
                          }`}>
                            {order.status === 'paid' ? 'Thành công' : order.status === 'pending' ? 'Đang chờ' : 'Thất bại'}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Xem chi tiết">
                              <Eye className="w-4 h-4" />
                            </button>
                            {order.status === 'paid' && (
                              <button className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Hoàn tiền">
                                <LogOut className="w-4 h-4 rotate-180" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'promotions' && (
          <>
            <div className="flex justify-between items-center mb-6 md:mb-8">
              <h1 className="text-2xl md:text-3xl font-black text-white">Khuyến mãi & Gamification</h1>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowGiftModal(true)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-sm transition-colors hidden sm:block"
                >
                  + Thêm Quà Tặng
                </button>
                <button 
                  onClick={() => setShowVoucherModal(true)}
                  className="px-4 py-2 bg-primary hover:bg-[#8a0b20] text-white font-bold rounded-xl text-sm transition-colors"
                >
                  + Tạo Voucher
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Vouchers Table */}
              <div className="bg-surface-dark border border-white/10 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-white/10">
                  <h2 className="text-xl font-bold text-white">Mã giảm giá (Voucher)</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/5 text-slate-300 text-sm">
                        <th className="p-4 font-medium">Mã</th>
                        <th className="p-4 font-medium">Giảm</th>
                        <th className="p-4 font-medium">Điều kiện</th>
                        <th className="p-4 font-medium">Trạng thái</th>
                        <th className="p-4 font-medium text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vouchers.map((voucher) => (
                        <tr key={voucher.id} className="border-b border-white/5 text-slate-300 hover:bg-white/5">
                          <td className="p-4 font-mono text-accent font-bold">{voucher.code}</td>
                          <td className="p-4 font-bold text-white">{voucher.discount}</td>
                          <td className="p-4 text-sm">{voucher.condition}</td>
                          <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold border ${voucher.status === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-slate-500/20 text-slate-400 border-slate-500/30'}`}>
                              {voucher.status === 'active' ? 'Đang chạy' : 'Hết hạn'}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => {
                                  setNewVoucher({ id: voucher.id, code: voucher.code, discount: voucher.discount, condition: voucher.condition, status: voucher.status });
                                  setShowVoucherModal(true);
                                }}
                                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Sửa"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteVoucher(voucher.id)}
                                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Xóa"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Lì Xì Rewards Table */}
              <div className="bg-surface-dark border border-white/10 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white">Quà tặng đổi Điểm Lì Xì</h2>
                  <button 
                    onClick={() => setShowGiftModal(true)}
                    className="sm:hidden px-3 py-1 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg text-xs transition-colors"
                  >
                    + Thêm
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-white/5 text-slate-300 text-sm">
                        <th className="p-4 font-medium">Tên quà tặng</th>
                        <th className="p-4 font-medium">Điểm cần đổi</th>
                        <th className="p-4 font-medium">Số lượng</th>
                        <th className="p-4 font-medium text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gifts.map((reward) => (
                        <tr key={reward.id} className="border-b border-white/5 text-slate-300 hover:bg-white/5">
                          <td className="p-4 font-bold text-white">{reward.name}</td>
                          <td className="p-4 text-accent font-bold flex items-center gap-1">
                            <Gift className="w-4 h-4" /> {reward.points_required}
                          </td>
                          <td className="p-4 text-sm">{reward.stock}</td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => {
                                  setNewGift({ id: reward.id, name: reward.name, description: reward.description || '', points_required: reward.points_required.toString(), stock: reward.stock.toString() });
                                  setShowGiftModal(true);
                                }}
                                className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Sửa"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDeleteGift(reward.id)}
                                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Xóa"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      {showVoucherModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-dark border border-white/10 rounded-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Tạo Mã Giảm Giá Mới</h3>
              <button onClick={() => setShowVoucherModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateVoucher} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Mã Voucher</label>
                <input type="text" required value={newVoucher.code} onChange={e => setNewVoucher({...newVoucher, code: e.target.value.toUpperCase()})} className="w-full bg-background-dark border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary" placeholder="VD: SUMMER2024" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Mức giảm</label>
                <input type="text" required value={newVoucher.discount} onChange={e => setNewVoucher({...newVoucher, discount: e.target.value})} className="w-full bg-background-dark border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary" placeholder="VD: 10% hoặc 500K" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Điều kiện áp dụng</label>
                <input type="text" required value={newVoucher.condition} onChange={e => setNewVoucher({...newVoucher, condition: e.target.value})} className="w-full bg-background-dark border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary" placeholder="VD: Đơn từ 1M" />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowVoucherModal(false)} className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-colors">Hủy</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-primary hover:bg-[#8a0b20] text-white font-bold rounded-xl transition-colors">Tạo Voucher</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showGiftModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-dark border border-white/10 rounded-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">Thêm Quà Tặng Mới</h3>
              <button onClick={() => setShowGiftModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddGift} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Tên quà tặng</label>
                <input type="text" required value={newGift.name} onChange={e => setNewGift({...newGift, name: e.target.value})} className="w-full bg-background-dark border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary" placeholder="VD: Áo thun GymVerse" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Mô tả</label>
                <textarea required value={newGift.description} onChange={e => setNewGift({...newGift, description: e.target.value})} className="w-full bg-background-dark border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary" placeholder="VD: Áo thun chất liệu cotton 100%" rows={3} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Điểm cần đổi</label>
                <input type="number" required value={newGift.points_required} onChange={e => setNewGift({...newGift, points_required: e.target.value})} className="w-full bg-background-dark border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary" placeholder="VD: 500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Số lượng trong kho</label>
                <input type="number" required value={newGift.stock} onChange={e => setNewGift({...newGift, stock: e.target.value})} className="w-full bg-background-dark border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary" placeholder="VD: 50" />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowGiftModal(false)} className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-colors">Hủy</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-primary hover:bg-[#8a0b20] text-white font-bold rounded-xl transition-colors">Thêm Quà</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-dark border border-white/10 rounded-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">{newPlan.id ? 'Sửa Gói Tập' : 'Thêm Gói Tập Mới'}</h3>
              <button onClick={() => setShowPlanModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSavePlan} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Tên gói tập</label>
                <input type="text" required value={newPlan.name} onChange={e => setNewPlan({...newPlan, name: e.target.value})} className="w-full bg-background-dark border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary" placeholder="VD: Gói Khởi Động" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Giá (VNĐ)</label>
                <input type="text" required value={newPlan.price} onChange={e => setNewPlan({...newPlan, price: e.target.value})} className="w-full bg-background-dark border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary" placeholder="VD: 1.500.000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Thời hạn</label>
                <input type="text" required value={newPlan.duration} onChange={e => setNewPlan({...newPlan, duration: e.target.value})} className="w-full bg-background-dark border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary" placeholder="VD: 1 Tháng" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Trạng thái</label>
                <select value={newPlan.status} onChange={e => setNewPlan({...newPlan, status: e.target.value})} className="w-full bg-background-dark border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary">
                  <option value="active">Đang bán</option>
                  <option value="inactive">Ngừng bán</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowPlanModal(false)} className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-colors">Hủy</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-primary hover:bg-[#8a0b20] text-white font-bold rounded-xl transition-colors">Lưu Gói Tập</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTrainerModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-dark border border-white/10 rounded-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-xl font-bold text-white">{newTrainer.id ? 'Sửa Huấn Luyện Viên' : 'Thêm HLV Mới'}</h3>
              <button onClick={() => setShowTrainerModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveTrainer} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Họ và tên</label>
                <input type="text" required value={newTrainer.name} onChange={e => setNewTrainer({...newTrainer, name: e.target.value})} className="w-full bg-background-dark border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary" placeholder="VD: Trần Quốc Cường" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Ảnh đại diện (URL hoặc /trainers/ten.png)</label>
                <input type="text" value={newTrainer.image} onChange={e => setNewTrainer({...newTrainer, image: e.target.value})} className="w-full bg-background-dark border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary" placeholder="VD: /trainers/cuong.png" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Chuyên môn (vai trò)</label>
                <input type="text" required value={newTrainer.specialty} onChange={e => setNewTrainer({...newTrainer, specialty: e.target.value})} className="w-full bg-background-dark border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary" placeholder="VD: Sức mạnh & Tăng cơ" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Mô tả chi tiết</label>
                <textarea value={newTrainer.description || ''} onChange={e => setNewTrainer({...newTrainer, description: e.target.value})} className="w-full bg-background-dark border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary resize-none" rows={3} placeholder="VD: Chuyên gia sức mạnh với 8 năm kinh nghiệm..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Tags chuyên môn (phân cách bằng dấu phẩy)</label>
                <input type="text" value={newTrainer.tags || ''} onChange={e => setNewTrainer({...newTrainer, tags: e.target.value})} className="w-full bg-background-dark border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary" placeholder="VD: Sức mạnh, Tăng cơ, Powerlifting" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Kinh nghiệm (năm)</label>
                  <input type="number" value={newTrainer.experience_years || ''} onChange={e => setNewTrainer({...newTrainer, experience_years: e.target.value})} className="w-full bg-background-dark border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary" placeholder="VD: 8" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Số học viên</label>
                  <input type="number" value={newTrainer.students_count || ''} onChange={e => setNewTrainer({...newTrainer, students_count: e.target.value})} className="w-full bg-background-dark border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary" placeholder="VD: 500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Đánh giá (1-5)</label>
                  <input type="number" step="0.1" min="1" max="5" value={newTrainer.rating} onChange={e => setNewTrainer({...newTrainer, rating: e.target.value})} className="w-full bg-background-dark border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Trạng thái</label>
                  <select value={newTrainer.status} onChange={e => setNewTrainer({...newTrainer, status: e.target.value})} className="w-full bg-background-dark border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-primary">
                    <option value="active">Đang làm việc</option>
                    <option value="inactive">Nghỉ việc</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowTrainerModal(false)} className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-colors">Hủy</button>
                <button type="submit" className="flex-1 px-4 py-3 bg-primary hover:bg-[#8a0b20] text-white font-bold rounded-xl transition-colors">Lưu HLV</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
