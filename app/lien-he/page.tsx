'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Mail, MapPin, Phone, Send } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function LienHePage() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    subject: 'goi-tap',
    message: ''
  });
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newContact = {
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      subject: formData.subject,
      message: formData.message,
      status: 'pending'
    };

    try {
      const { error } = await supabase.from('fitnexus_contacts').insert([newContact]);
      if (error) {
        console.error('Error saving contact:', error);
        alert('Có lỗi xảy ra khi gửi liên hệ. Vui lòng thử lại.');
        return;
      }
      
      setIsSuccess(true);
      setFormData({
        name: '',
        phone: '',
        email: '',
        subject: 'goi-tap',
        message: ''
      });
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="relative flex flex-col min-h-screen w-full">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative px-6 py-12 lg:px-20 lg:py-20 text-center">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop')] bg-cover bg-center opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-background-dark via-background-dark/80 to-background-dark"></div>
        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center gap-4">
          <span className="inline-block py-1 px-3 rounded-full bg-accent/10 border border-accent/30 text-accent text-xs font-bold uppercase tracking-widest mb-2">
            Hỗ Trợ 24/7
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">
            Liên Hệ <span className="text-primary">GymVerse</span>
          </h1>
          <p className="text-slate-300 text-lg md:text-xl max-w-2xl font-light">
            Chúng tôi luôn sẵn sàng lắng nghe và giải đáp mọi thắc mắc của bạn. Hãy để lại thông tin, đội ngũ tư vấn sẽ liên hệ trong thời gian sớm nhất.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <main className="flex-1 px-4 md:px-10 lg:px-20 pb-20">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* Contact Info */}
          <div className="flex flex-col gap-8">
            <div>
              <h2 className="text-3xl font-black text-white mb-6">Thông Tin Liên Hệ</h2>
              <p className="text-slate-400 mb-8">
                Đừng ngần ngại liên hệ với chúng tôi qua các kênh dưới đây hoặc đến trực tiếp các câu lạc bộ để trải nghiệm không gian tập luyện đẳng cấp.
              </p>
            </div>
            
            <div className="flex flex-col gap-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg mb-1">Trụ Sở Chính</h3>
                  <p className="text-slate-400">123 Nguyễn Văn Linh, Quận Hải Châu, Đà Nẵng</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
                  <Phone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg mb-1">Hotline</h3>
                  <p className="text-slate-400">1900 123 456 (Miễn phí cước gọi)</p>
                  <p className="text-slate-500 text-sm mt-1">Hỗ trợ từ 06:00 - 22:00 hàng ngày</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg mb-1">Email</h3>
                  <p className="text-slate-400">GymVerseAI@gmail.com</p>
                  <p className="text-slate-400">support@gymverse.vn</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Contact Form */}
          <div className="bg-surface-dark border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl"></div>
            
            <h2 className="text-2xl font-black text-white mb-6 relative z-10">Gửi Tin Nhắn Cho Chúng Tôi</h2>
            
            {isSuccess && (
              <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl mb-6 relative z-10 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong thời gian sớm nhất.
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative z-10">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="name" className="text-sm font-medium text-slate-300">Họ và tên *</label>
                <input 
                  type="text" 
                  id="name" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Nhập họ và tên của bạn" 
                  className="bg-background-dark border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="phone" className="text-sm font-medium text-slate-300">Số điện thoại *</label>
                  <input 
                    type="tel" 
                    id="phone" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="Nhập số điện thoại" 
                    className="bg-background-dark border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-sm font-medium text-slate-300">Email</label>
                  <input 
                    type="email" 
                    id="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="Nhập địa chỉ email" 
                    className="bg-background-dark border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors"
                  />
                </div>
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label htmlFor="subject" className="text-sm font-medium text-slate-300">Chủ đề quan tâm</label>
                <select 
                  id="subject" 
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="bg-background-dark border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors appearance-none"
                >
                  <option value="goi-tap">Tư vấn gói tập</option>
                  <option value="pt">Thuê Huấn Luyện Viên cá nhân</option>
                  <option value="gop-y">Góp ý dịch vụ</option>
                  <option value="khac">Vấn đề khác</option>
                </select>
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label htmlFor="message" className="text-sm font-medium text-slate-300">Nội dung tin nhắn *</label>
                <textarea 
                  id="message" 
                  rows={4} 
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  placeholder="Nhập nội dung bạn muốn gửi..." 
                  className="bg-background-dark border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent transition-colors resize-none"
                  required
                ></textarea>
              </div>
              
              <button 
                type="submit" 
                className="mt-4 w-full py-4 bg-gradient-to-r from-primary to-[#8a0b20] hover:from-[#a00d25] hover:to-[#6b0819] text-white font-bold rounded-xl shadow-[0_0_20px_rgba(198,16,46,0.3)] transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                Gửi Tin Nhắn
              </button>
            </form>
          </div>
          
        </div>
      </main>

      <Footer />
    </div>
  );
}
