import type {Metadata} from 'next';
import { Lexend } from 'next/font/google';
import './globals.css';
import Chatbot from '@/components/Chatbot';

const lexend = Lexend({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-lexend',
});

export const metadata: Metadata = {
  title: 'GymVerse - Đẳng Cấp Thể Hình',
  description: 'Phòng tập thể hình cao cấp kết hợp văn hóa Tết 2026 - Year of the Dragon',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="vi" className="dark" suppressHydrationWarning>
      <body className={`${lexend.variable} font-body bg-background-dark text-slate-100 antialiased`} suppressHydrationWarning>
        {children}
        <Chatbot />
      </body>
    </html>
  );
}
