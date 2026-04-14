'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Play, X, Dumbbell, Activity, ShieldCheck, Droplets, MapPin } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const FACILITIES = [
  {
    id: 'cardio',
    title: 'Khu Vực Cardio',
    description: 'Hệ thống máy chạy bộ, xe đạp, máy trượt tuyết hiện đại nhất từ Technogym với màn hình cảm ứng, tích hợp giải trí và theo dõi nhịp tim chính xác.',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop',
    icon: <Activity className="w-6 h-6" />
  },
  {
    id: 'freeweights',
    title: 'Khu Vực Free Weights',
    description: 'Không gian rộng rãi với đầy đủ các loại tạ đơn, tạ đòn, rack tập squat và bench press. Sàn lót cao su chống ồn và giảm chấn an toàn.',
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1470&auto=format&fit=crop',
    icon: <Dumbbell className="w-6 h-6" />
  },
  {
    id: 'machines',
    title: 'Hệ Thống Máy Tập Chuyên Dụng',
    description: 'Các dòng máy tập cô lập từng nhóm cơ, thiết kế chuẩn sinh trắc học giúp tối ưu hóa hiệu quả tập luyện và hạn chế tối đa chấn thương.',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1470&auto=format&fit=crop',
    icon: <ShieldCheck className="w-6 h-6" />
  },
  {
    id: 'studio',
    title: 'Phòng Studio & Yoga',
    description: 'Không gian yên tĩnh, thoáng đãng với sàn gỗ cao cấp, gương tràn viền. Trang bị đầy đủ thảm tập, bóng yoga, bục nhảy cho các lớp Group X.',
    image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?q=80&w=1470&auto=format&fit=crop',
    icon: <MapPin className="w-6 h-6" />
  },
  {
    id: 'locker',
    title: 'Khu Vực Tiện Ích & Thư Giãn',
    description: 'Phòng thay đồ sang trọng, tủ khóa thông minh. Khu vực xông hơi khô (Sauna), phòng tắm hiện đại và quầy nước uống miễn phí.',
    image: 'https://images.unsplash.com/photo-1583416750470-965b2707b355?q=80&w=1470&auto=format&fit=crop',
    icon: <Droplets className="w-6 h-6" />
  }
];

export default function FacilitiesPage() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background-dark text-slate-100 font-sans selection:bg-primary/30">
      <Navbar />

      {/* Hero Section with Video Placeholder */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop"
            alt="Gym Background"
            fill
            className="object-cover opacity-20"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background-dark via-background-dark/80 to-background-dark"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 uppercase tracking-tight animate-in fade-in slide-in-from-bottom-4 duration-700">
            Cơ Sở Vật Chất <span className="text-primary">Đẳng Cấp</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-12 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150">
            Khám phá không gian tập luyện chuẩn quốc tế tại GymVerse. Trang thiết bị hiện đại, môi trường chuyên nghiệp giúp bạn đạt kết quả tốt nhất.
          </p>

          {/* Video Player Trigger */}
          <div className="relative max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-white/10 group cursor-pointer animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300" onClick={() => setIsVideoOpen(true)}>
            <div className="aspect-video relative">
              <Image 
                src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1470&auto=format&fit=crop"
                alt="Video Thumbnail"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500"></div>
              
              {/* Play Button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-primary/90 text-white rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(198,16,46,0.5)] group-hover:scale-110 transition-transform duration-300">
                  <Play className="w-8 h-8 ml-1" fill="currentColor" />
                </div>
              </div>
              
              <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                <div>
                  <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2 inline-block">Virtual Tour</span>
                  <h3 className="text-2xl font-bold text-white drop-shadow-md">Video Giới Thiệu Không Gian</h3>
                </div>
                <span className="text-white font-medium drop-shadow-md">02:45</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Facilities Grid */}
      <section className="py-20 bg-surface-dark relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tight mb-4">
              Khám Phá Các Khu Vực
            </h2>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
          </div>

          <div className="space-y-24">
            {FACILITIES.map((facility, index) => (
              <div key={facility.id} className={`flex flex-col ${index % 2 !== 0 ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-12 items-center`}>
                
                {/* Image Side */}
                <div className="w-full lg:w-1/2">
                  <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-white/5 group">
                    <Image 
                      src={facility.image}
                      alt={facility.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                </div>

                {/* Content Side */}
                <div className="w-full lg:w-1/2 space-y-6">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                    {facility.icon}
                  </div>
                  <h3 className="text-3xl font-bold text-white">{facility.title}</h3>
                  <p className="text-lg text-slate-400 leading-relaxed">
                    {facility.description}
                  </p>
                  
                  <ul className="space-y-3 pt-4">
                    <li className="flex items-center gap-3 text-slate-300">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      Trang thiết bị nhập khẩu 100%
                    </li>
                    <li className="flex items-center gap-3 text-slate-300">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      Bảo trì và vệ sinh định kỳ mỗi ngày
                    </li>
                    <li className="flex items-center gap-3 text-slate-300">
                      <div className="w-2 h-2 rounded-full bg-primary"></div>
                      Không gian thoáng đãng, hệ thống lọc không khí
                    </li>
                  </ul>
                </div>

              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />

      {/* Video Modal Overlay */}
      {isVideoOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4">
          <button 
            onClick={() => setIsVideoOpen(false)}
            className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="w-full max-w-5xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl relative border border-white/10">
            <video
              className="absolute inset-0 w-full h-full"
              src="/gym-tour.mp4"
              controls
              autoPlay
              playsInline
            >
              Trình duyệt của bạn không hỗ trợ phát video.
            </video>
          </div>
        </div>
      )}
    </div>
  );
}
