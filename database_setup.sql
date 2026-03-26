-- =============================================
-- GymVerse - Tạo/kiểm tra tất cả bảng database
-- Chạy script này trong Supabase SQL Editor
-- =============================================

-- 1. Bảng users
CREATE TABLE IF NOT EXISTS fitnexus_users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  fullname TEXT,
  phone TEXT,
  weight TEXT DEFAULT '70',
  height TEXT DEFAULT '175',
  goal TEXT DEFAULT 'Tăng cơ',
  dob TEXT,
  gender TEXT,
  role TEXT DEFAULT 'member',
  points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Bảng plans (gói tập)
CREATE TABLE IF NOT EXISTS fitnexus_plans (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price TEXT NOT NULL,
  duration TEXT,
  features JSONB,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Bảng orders (đơn hàng/thanh toán) ⚠️ QUAN TRỌNG
CREATE TABLE IF NOT EXISTS fitnexus_orders (
  id TEXT PRIMARY KEY,
  user_email TEXT NOT NULL,
  plan_id TEXT,
  plan_name TEXT,
  amount TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Bảng trainers (huấn luyện viên)
CREATE TABLE IF NOT EXISTS fitnexus_trainers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  specialty TEXT,
  image TEXT,
  rating NUMERIC DEFAULT 5.0,
  status TEXT DEFAULT 'active',
  description TEXT DEFAULT '',
  tags JSONB DEFAULT '[]'::jsonb,
  experience_years INTEGER DEFAULT 0,
  students_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Bảng classes (lớp tập nhóm)
CREATE TABLE IF NOT EXISTS fitnexus_classes (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT,
  trainer TEXT,
  room TEXT,
  time TEXT,
  duration TEXT,
  day TEXT,
  booked INTEGER DEFAULT 0,
  capacity INTEGER DEFAULT 20,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Bảng bookings (đặt lịch)
CREATE TABLE IF NOT EXISTS fitnexus_bookings (
  id SERIAL PRIMARY KEY,
  user_email TEXT NOT NULL,
  class_id INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Bảng checkins (điểm danh)
CREATE TABLE IF NOT EXISTS fitnexus_checkins (
  id SERIAL PRIMARY KEY,
  user_email TEXT NOT NULL,
  date TEXT NOT NULL,
  points_earned INTEGER DEFAULT 50,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Bảng workout_logs (nhật ký tập luyện)
CREATE TABLE IF NOT EXISTS fitnexus_workout_logs (
  id SERIAL PRIMARY KEY,
  user_email TEXT NOT NULL,
  date TEXT,
  type TEXT,
  duration TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Bảng reviews (đánh giá)
CREATE TABLE IF NOT EXISTS fitnexus_reviews (
  id SERIAL PRIMARY KEY,
  user_email TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  type TEXT,
  content TEXT,
  date TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Bảng vouchers (mã giảm giá)
CREATE TABLE IF NOT EXISTS fitnexus_vouchers (
  id SERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount TEXT NOT NULL,
  condition TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Bảng gifts (quà tặng)
CREATE TABLE IF NOT EXISTS fitnexus_gifts (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  points_required INTEGER DEFAULT 100,
  stock INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Bảng redemptions (đổi quà)
CREATE TABLE IF NOT EXISTS fitnexus_redemptions (
  id SERIAL PRIMARY KEY,
  user_email TEXT NOT NULL,
  gift_id INTEGER,
  points_spent INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Bảng notifications (thông báo)
CREATE TABLE IF NOT EXISTS fitnexus_notifications (
  id SERIAL PRIMARY KEY,
  user_email TEXT NOT NULL,
  title TEXT,
  message TEXT,
  type TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Bảng contacts (liên hệ)
CREATE TABLE IF NOT EXISTS fitnexus_contacts (
  id SERIAL PRIMARY KEY,
  name TEXT,
  email TEXT,
  phone TEXT,
  subject TEXT,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- Bật RLS (Row Level Security) cho tất cả bảng
-- và cho phép truy cập công khai cho đọc
-- =============================================

-- Tắt RLS cho một số bảng cần đọc/ghi bởi mọi người (public)
ALTER TABLE fitnexus_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitnexus_trainers ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitnexus_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitnexus_gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitnexus_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitnexus_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitnexus_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitnexus_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitnexus_workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitnexus_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitnexus_vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitnexus_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitnexus_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE fitnexus_contacts ENABLE ROW LEVEL SECURITY;

-- =============================================
-- Policies: cho phép tất cả mọi người đọc/ghi
-- (trong production nên hạn chế hơn)
-- =============================================

-- DROP existing policies first (nếu có)
DO $$
DECLARE
  tbl TEXT;
  pol TEXT;
BEGIN
  FOR tbl IN 
    SELECT unnest(ARRAY[
      'fitnexus_plans', 'fitnexus_trainers', 'fitnexus_classes', 'fitnexus_gifts',
      'fitnexus_orders', 'fitnexus_users', 'fitnexus_bookings', 'fitnexus_checkins',
      'fitnexus_workout_logs', 'fitnexus_reviews', 'fitnexus_vouchers',
      'fitnexus_redemptions', 'fitnexus_notifications', 'fitnexus_contacts'
    ])
  LOOP
    FOR pol IN
      SELECT policyname FROM pg_policies WHERE tablename = tbl
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol, tbl);
    END LOOP;
  END LOOP;
END $$;

-- Tạo policies mới: cho phép tất cả operations cho tất cả roles
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN 
    SELECT unnest(ARRAY[
      'fitnexus_plans', 'fitnexus_trainers', 'fitnexus_classes', 'fitnexus_gifts',
      'fitnexus_orders', 'fitnexus_users', 'fitnexus_bookings', 'fitnexus_checkins',
      'fitnexus_workout_logs', 'fitnexus_reviews', 'fitnexus_vouchers',
      'fitnexus_redemptions', 'fitnexus_notifications', 'fitnexus_contacts'
    ])
  LOOP
    EXECUTE format('CREATE POLICY "Allow all select" ON %I FOR SELECT USING (true)', tbl);
    EXECUTE format('CREATE POLICY "Allow all insert" ON %I FOR INSERT WITH CHECK (true)', tbl);
    EXECUTE format('CREATE POLICY "Allow all update" ON %I FOR UPDATE USING (true) WITH CHECK (true)', tbl);
    EXECUTE format('CREATE POLICY "Allow all delete" ON %I FOR DELETE USING (true)', tbl);
  END LOOP;
END $$;

-- =============================================
-- Dữ liệu mẫu cho gifts (quà tặng)
-- =============================================
INSERT INTO fitnexus_gifts (name, description, points_required, stock) VALUES
  ('Khăn Tập GymVerse', 'Khăn thể thao cao cấp thêu logo GYMVERSE', 200, 50),
  ('Bình Nước GymVerse', 'Bình nước inox 750ml giữ nhiệt 24h', 300, 30),
  ('Áo Thun GymVerse', 'Áo thun thể thao dry-fit, phom chuẩn', 500, 20),
  ('1 Buổi PT Free', 'Buổi tập cá nhân miễn phí với HLV', 800, 10),
  ('Giảm 50% Gói Tập', 'Voucher giảm 50% khi gia hạn gói tập', 1000, 5)
ON CONFLICT DO NOTHING;

-- =============================================
-- Dữ liệu mẫu cho vouchers (mã giảm giá)
-- =============================================
INSERT INTO fitnexus_vouchers (code, discount, condition, status) VALUES
  ('TET2026', '30%', 'Áp dụng cho tất cả gói tập', 'active'),
  ('GYMVERSE50K', '50K', 'Đơn hàng trên 500K', 'active'),
  ('NEWMEMBER', '20%', 'Chỉ dành cho thành viên mới', 'active')
ON CONFLICT DO NOTHING;
