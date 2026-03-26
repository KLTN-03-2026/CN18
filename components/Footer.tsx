import { Dumbbell, MapPin, Phone, Mail, Clock, Facebook, Instagram, Youtube } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-background-dark border-t border-[#482329] pt-16 pb-8 px-6 md:px-10 lg:px-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <Dumbbell className="text-accent w-8 h-8" />
              <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                Gym<span className="text-primary">Verse</span>
              </h2>
            </div>
            <p className="text-slate-400 mb-6 max-w-sm">
              Hệ thống phòng tập đẳng cấp 5 sao hàng đầu Việt Nam. Chúng tôi cam kết mang lại trải nghiệm tập luyện tốt nhất cho sức khỏe và vóc dáng của bạn.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="w-10 h-10 rounded-full bg-surface-dark flex items-center justify-center text-slate-300 hover:bg-primary hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </Link>
              <Link href="#" className="w-10 h-10 rounded-full bg-surface-dark flex items-center justify-center text-slate-300 hover:bg-primary hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </Link>
              <Link href="#" className="w-10 h-10 rounded-full bg-surface-dark flex items-center justify-center text-slate-300 hover:bg-primary hover:text-white transition-colors">
                <Youtube className="w-5 h-5" />
              </Link>
            </div>
          </div>
          <div>
            <h3 className="text-white font-bold mb-4">Liên kết nhanh</h3>
            <ul className="flex flex-col gap-3">
              <li><Link href="/gioi-thieu" className="text-slate-400 hover:text-accent transition-colors text-sm">Về chúng tôi</Link></li>
              <li><Link href="/cau-lac-bo" className="text-slate-400 hover:text-accent transition-colors text-sm">Câu lạc bộ</Link></li>
              <li><Link href="/goi-tap" className="text-slate-400 hover:text-accent transition-colors text-sm">Gói tập hội viên</Link></li>
              <li><Link href="/lich-tap" className="text-slate-400 hover:text-accent transition-colors text-sm">Lớp học Group X</Link></li>
              <li><Link href="/tin-tuc" className="text-slate-400 hover:text-accent transition-colors text-sm">Tin tức & Sự kiện</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-bold mb-4">Thông tin liên hệ</h3>
            <ul className="flex flex-col gap-3">
              <li className="flex items-start gap-3 text-slate-400 text-sm">
                <MapPin className="text-accent w-5 h-5 shrink-0 mt-0.5" />
                123 Nguyễn Văn Linh, Hải Châu, Đà Nẵng
              </li>
              <li className="flex items-center gap-3 text-slate-400 text-sm">
                <Phone className="text-accent w-5 h-5 shrink-0" />
                1900 123 456
              </li>
              <li className="flex items-center gap-3 text-slate-400 text-sm">
                <Mail className="text-accent w-5 h-5 shrink-0" />
                GymVerseAI@gmail.com
              </li>
              <li className="flex items-center gap-3 text-slate-400 text-sm">
                <Clock className="text-accent w-5 h-5 shrink-0" />
                06:00 - 22:00 (Hàng ngày)
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 text-sm">© 2026 GymVerse. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/dieu-khoan" className="text-slate-500 hover:text-white text-sm">Điều khoản sử dụng</Link>
            <Link href="/bao-mat" className="text-slate-500 hover:text-white text-sm">Chính sách bảo mật</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
