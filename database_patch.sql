-- Thêm cột admin_reply vào bảng fitnexus_reviews
ALTER TABLE fitnexus_reviews ADD COLUMN IF NOT EXISTS admin_reply TEXT;

-- Thêm cột status vào bảng fitnexus_contacts
ALTER TABLE fitnexus_contacts ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- Thêm cột status vào bảng fitnexus_bookings (cho logic hoàn thành lịch tập)
ALTER TABLE fitnexus_bookings ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'confirmed';
