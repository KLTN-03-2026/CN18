import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background-dark text-white p-6">
      <h1 className="text-6xl font-black text-primary mb-4">404</h1>
      <h2 className="text-2xl font-bold mb-6">Không tìm thấy trang</h2>
      <p className="text-slate-400 mb-8 text-center max-w-md">
        Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
      </p>
      <Link 
        href="/" 
        className="px-8 py-3 bg-primary hover:bg-primary-light text-white rounded-full font-bold transition-colors"
      >
        Về trang chủ
      </Link>
    </div>
  );
}
