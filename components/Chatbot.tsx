'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Dumbbell, Sparkles } from 'lucide-react';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

// ===== CƠ SỞ TRI THỨC GYMVERSE =====
const KNOWLEDGE_BASE = {
  goiTap: {
    keywords: ['gói tập', 'giá gói', 'giá tập', 'bao nhiêu tiền', 'đăng ký gói', 'phí tập', 'tư vấn gói', 'membership', 'basic', 'premium', 'vip', 'elite', 'couple', 'đôi', 'cơ bản', 'nâng cao', 'chi phí tập', 'mua gói', 'thanh toán gói', 'gói cơ bản', 'gói nâng cao', 'gói vip'],
    response: `💰 **CÁC GÓI TẬP TẠI GYMVERSE:**

1️⃣ **Gói Cơ Bản (Basic)** - 299.000đ/tháng:
   • Tập tất cả thiết bị gym
   • Giờ tập: 5:00 - 22:00
   • Phòng tắm + tủ khóa

2️⃣ **Gói Nâng Cao (Premium)** - 599.000đ/tháng:
   • Tất cả quyền lợi Basic
   • Tham gia lớp Group X (Yoga, Zumba, HIIT...)
   • 2 buổi PT miễn phí/tháng
   • Khăn tập + nước uống miễn phí

3️⃣ **Gói VIP (Elite)** - 999.000đ/tháng:
   • Tất cả quyền lợi Premium
   • PT cá nhân 4 buổi/tháng
   • Phòng xông hơi + sauna
   • Ưu tiên đặt lớp + chế độ dinh dưỡng cá nhân

4️⃣ **Gói Đôi (Couple)** - 1.599.000đ/tháng:
   • Quyền lợi VIP cho 2 người
   • Tiết kiệm 399.000đ so với mua lẻ

👉 Bạn quan tâm gói nào? Mình tư vấn chi tiết hơn nhé! 😊`
  },

  hlv: {
    keywords: ['hlv', 'huấn luyện', 'pt', 'personal trainer', 'coach', 'giáo viên', 'tư vấn hlv', 'người hướng dẫn', 'trainer'],
    response: `🏋️ **ĐỘI NGŨ 10 HLV CHUYÊN NGHIỆP TẠI GYMVERSE:**

Để mình gợi ý HLV phù hợp nhất, bạn cho mình biết **mục tiêu tập luyện** nhé:

1️⃣ **Tăng cơ / Sức mạnh** → HLV Trần Quốc Cường ⭐4.9 (8 năm KN)
2️⃣ **Giảm mỡ / Giữ dáng** → HLV Nguyễn Thị Mai ⭐5.0 (6 năm KN) 
3️⃣ **Body thẩm mỹ kiểu Hàn** → HLV Kim Min-ho ⭐4.9 (7 năm KN)
4️⃣ **Dẻo dai / Yoga** → HLV Yuki Tanaka ⭐5.0 (10 năm KN)
5️⃣ **CrossFit / Cường độ cao** → HLV Marcus Adebayo ⭐4.8 (12 năm KN)
6️⃣ **Sức bền / Cardio** → HLV Aisha Bello ⭐4.9 (6 năm KN)
7️⃣ **Kỹ thuật Bodybuilding** → HLV Alexander Schmidt ⭐4.7 (15 năm KN)
8️⃣ **Lớp nhóm / Zumba** → HLV Sarah Jenkins ⭐4.9 (8 năm KN)
9️⃣ **Functional / Calisthenics** → HLV Mateo Silva ⭐4.8 (9 năm KN)
🔟 **Yoga + Thể hình nữ** → HLV Li Wei-Hsuan ⭐5.0 (7 năm KN)

Bạn muốn tập theo hướng nào? Mình sẽ giới thiệu chi tiết hơn! 💪`
  },

  tangCo: {
    keywords: ['tăng cơ', 'tăng sức mạnh', 'cơ bắp', 'muscle', 'powerlifting', 'nặng', 'bulk'],
    response: `💪 **GỢI Ý HLV PHÙ HỢP CHO MỤC TIÊU TĂNG CƠ:**

⭐ **TOP 1: Trần Quốc Cường** (Việt Nam) - ⭐4.9
   • Chuyên môn: Sức mạnh & Tăng cơ, Powerlifting
   • 8 năm kinh nghiệm | 500+ học viên
   • Phù hợp: Người muốn tăng cơ, tập nặng chuyên sâu

⭐ **TOP 2: Marcus "The Machine" Adebayo** - ⭐4.8
   • Chuyên môn: Sức mạnh vượt trội, CrossFit
   • 12 năm kinh nghiệm | 800+ học viên
   • Phù hợp: Tập cường độ cao, vượt giới hạn bản thân

⭐ **TOP 3: Alexander Schmidt** (Đức) - ⭐4.7
   • Chuyên môn: Kỹ thuật Bodybuilding chuyên sâu
   • 15 năm kinh nghiệm | 1000+ học viên
   • Phù hợp: Kỹ thuật chuẩn, bodybuilding chuyên nghiệp

👉 Bạn muốn đặt lịch tập thử với HLV nào? Truy cập trang **Huấn luyện viên** để xem chi tiết nhé! 🏋️`
  },

  giamMo: {
    keywords: ['giảm mỡ', 'giảm cân', 'giữ dáng', 'ốm', 'gầy', 'diet', 'lose weight', 'body shape', 'thon', 'nữ'],
    response: `🔥 **GỢI Ý HLV PHÙ HỢP CHO MỤC TIÊU GIẢM MỠ / GIỮ DÁNG:**

⭐ **TOP 1: Nguyễn Thị Mai** (Việt Nam) - ⭐5.0
   • Chuyên môn: Thể hình nữ & Giảm mỡ, Dinh dưỡng
   • 6 năm kinh nghiệm | 350+ học viên
   • Phù hợp: Nữ giới muốn giảm mỡ, giữ dáng, tư vấn dinh dưỡng

⭐ **TOP 2: Aisha Bello** - ⭐4.9
   • Chuyên môn: Sức bền & Cardio, Functional Training
   • 6 năm kinh nghiệm | 380+ học viên
   • Phù hợp: Tăng sức bền, cardio đốt mỡ hiệu quả

⭐ **TOP 3: Li Wei-Hsuan** (Đài Loan-Việt) - ⭐5.0
   • Chuyên môn: Yoga & Thể hình nữ
   • 7 năm kinh nghiệm | 380+ học viên
   • Phù hợp: Yoga kết hợp thể hình, giảm mỡ nhẹ nhàng

💡 **Gợi ý gói tập:** Gói **Premium (599K)** với 2 buổi PT miễn phí/tháng sẽ rất phù hợp! 🌟`
  },

  yoga: {
    keywords: ['yoga', 'dẻo dai', 'pilates', 'linh hoạt', 'flexibility', 'thiền', 'meditation', 'thư giãn'],
    response: `🧘 **GỢI Ý HLV PHÙ HỢP CHO YOGA / DẺO DAI:**

⭐ **TOP 1: Yuki Tanaka** (Nhật Bản) - ⭐5.0
   • Chuyên môn: Thể hình & Dẻo dai, Yoga, Pilates
   • 10 năm kinh nghiệm | 600+ học viên
   • Phù hợp: Muốn dẻo dai, yoga + gym kết hợp

⭐ **TOP 2: Li Wei-Hsuan** (Đài Loan-Việt) - ⭐5.0
   • Chuyên môn: Yoga & Thể hình nữ, Meditation
   • 7 năm kinh nghiệm | 380+ học viên
   • Phù hợp: Nữ giới muốn yoga kết hợp thể hình

📅 **Lịch lớp Yoga trong tuần:**
   • Thứ 2: Hatha Yoga (06:00 sáng)
   • Thứ 5: Vinyasa Flow Yoga (19:00 tối)
   • Chủ Nhật: Yoga Phục Hồi (09:30 sáng)

👉 Truy cập trang **Lịch tập** để đăng ký lớp nhé! 🙏`
  },

  lichTap: {
    keywords: ['lịch', 'lớp nhóm', 'group', 'class', 'zumba', 'hiit', 'combat', 'spinning', 'đạp xe', 'cardio', 'schedule'],
    response: `📅 **LỊCH CÁC LỚP TẬP NHÓM TRONG TUẦN:**

🟢 **Thứ 2:**
   • 06:00 - Hatha Yoga
   • 18:30 - Body Combat Đốt Mỡ
   • 19:30 - Zumba Dance Party 🎶

🟡 **Thứ 3:**
   • 07:00 - Đạp Xe Tốc Độ (Spinning)
   • 18:00 - Sức Mạnh Toàn Diện

🔵 **Thứ 4:**
   • 06:30 - Pilates Căn Bản
   • 17:00 - Tăng Cơ Chuyên Sâu

🟣 **Thứ 5:**
   • 08:00 - Functional Training
   • 19:00 - Vinyasa Flow Yoga

🔴 **Thứ 6:**
   • 16:00 - Giảm Mỡ Cho Nữ
   • 18:30 - Cardio Đốt Mỡ

🟠 **Thứ 7:**
   • 08:00 - Zumba Cuối Tuần
   • 10:00 - Kỹ Thuật Nâng Cao

⚪ **Chủ Nhật:**
   • 09:30 - Yoga Phục Hồi

👉 Truy cập trang **Lịch tập** trên website để đặt lịch ngay! 📝`
  },

  coSoVatChat: {
    keywords: ['cơ sở', 'vật chất', 'thiết bị', 'máy', 'phòng', 'facility', 'studio', 'sauna', 'xông hơi', 'trang thiết bị', 'máy chạy'],
    response: `🏢 **CƠ SỞ VẬT CHẤT TẠI GYMVERSE:**

🏋️ **Khu tập Gym chính:**
   • Thiết bị nhập khẩu từ Mỹ và châu Âu
   • Đầy đủ máy tập: máy chạy bộ, xe đạp, máy tạ, dây kéo...

🎵 **2 Studio Group X:**
   • Studio 1 & Studio 2 riêng biệt
   • Trang bị âm thanh, ánh sáng chuyên nghiệp cho lớp nhóm

🚴 **Phòng Spinning / Cycling:**
   • Xe đạp chuyên dụng
   • Lớp đạp xe cường độ cao

♨️ **Phòng xông hơi & Sauna:**
   • Dành cho hội viên gói VIP
   • Giúp thư giãn sau buổi tập

🌳 **Khu Functional Training:**
   • Không gian ngoài trời thoáng mát
   • Tập luyện chức năng đa dạng

🧴 **Tiện ích khác:**
   • Phòng tắm cao cấp + tủ khóa cá nhân
   • Quầy bar dinh dưỡng: protein shake, nước ép tươi

👉 Truy cập trang **Cơ sở vật chất** để xem hình ảnh chi tiết! 📸`
  },

  khuyenMai: {
    keywords: ['khuyến mãi', 'giảm giá', 'ưu đãi', 'voucher', 'mã', 'discount', 'sale', 'điểm', 'quà', 'lì xì', 'reward'],
    response: `🎁 **CHƯƠNG TRÌNH KHUYẾN MÃI & ƯU ĐÃI:**

🎊 **Hệ thống Điểm Lì Xì:**
   • Điểm danh mỗi ngày nhận **50 điểm**
   • Tích lũy điểm để đổi quà hấp dẫn:
     - 🧴 Bình nước thể thao
     - 🎽 Áo tập GymVerse
     - 🎧 Tai nghe thể thao
     - 💊 Bộ Supplement cao cấp

🏷️ **Voucher đang có:**
   • **NEWBIE2026** - Giảm giá cho hội viên mới đăng ký
   • **TET2026** - Ưu đãi đặc biệt mùa Tết

💡 **Mẹo tiết kiệm:** Đăng ký **Gói Đôi (Couple)** tiết kiệm đến 399.000đ so với mua 2 gói VIP riêng lẻ!

👉 Truy cập **Dashboard** sau khi đăng nhập để kiểm tra điểm tích lũy! 🌟`
  },

  chao: {
    keywords: ['xin chào', 'chào bạn', 'chào gym', 'chào gymverse', 'hello', 'hi gymverse', 'hey gymverse', 'có ai không', 'alo'],
    response: `👋 Chào bạn! Rất vui được gặp bạn tại **GymVerse**! 😊

Mình có thể hỗ trợ bạn:
1️⃣ **Tư vấn gói tập** phù hợp với nhu cầu
2️⃣ **Giới thiệu HLV** theo mục tiêu tập luyện
3️⃣ **Xem lịch** các lớp tập nhóm
4️⃣ **Thông tin cơ sở vật chất** hiện đại

Bạn cần hỗ trợ gì nào? Cứ hỏi thoải mái nhé! 💪`
  },

  camOn: {
    keywords: ['cảm ơn', 'thanks', 'thank', 'tks', 'cám ơn', 'ok', 'được rồi', 'tạm biệt', 'bye'],
    response: `😊 Không có gì nha bạn! Rất vui vì đã hỗ trợ được bạn!

Nếu cần thêm thông tin gì, cứ quay lại hỏi mình bất cứ lúc nào nhé! GymVerse AI luôn sẵn sàng hỗ trợ 24/7! 💪🔥

👉 Đừng quên truy cập website để **đăng ký** và bắt đầu hành trình thể hình cùng GymVerse! 🏋️`
  },

  dangKy: {
    keywords: ['đăng ký', 'tạo tài khoản', 'sign up', 'register', 'bắt đầu', 'tham gia', 'gia nhập'],
    response: `📝 **HƯỚNG DẪN ĐĂNG KÝ TÀI KHOẢN GYMVERSE:**

**Bước 1:** Nhấn nút **"Đăng ký"** ở góc trên bên phải website
**Bước 2:** Điền thông tin cá nhân (Họ tên, Email, Số điện thoại, Mật khẩu)
**Bước 3:** Xác nhận email và đăng nhập

Sau khi đăng ký, bạn có thể:
✅ Chọn gói tập phù hợp
✅ Đặt lịch các lớp nhóm
✅ Liên hệ HLV cá nhân
✅ Tích điểm đổi quà hấp dẫn

💡 **Mẹo:** Sử dụng mã **NEWBIE2026** khi thanh toán để nhận ưu đãi hội viên mới!

👉 Bấm vào nút **Đăng ký** trên thanh menu ngay bây giờ nhé! 🚀`
  },

  lienHe: {
    keywords: ['liên hệ', 'hotline', 'số điện thoại', 'email', 'địa chỉ', 'contact', 'hỗ trợ', 'phản hồi', 'góp ý'],
    response: `📞 **THÔNG TIN LIÊN HỆ GYMVERSE:**

📍 **Địa chỉ:** Hệ thống phòng tập GymVerse - Đẳng Cấp Thể Hình
🌐 **Website:** gymverse.vn
📧 **Email:** support@gymverse.vn

💬 Bạn cũng có thể gửi phản hồi trực tiếp qua trang **Liên hệ** trên website. Đội ngũ GymVerse sẽ phản hồi trong vòng 24h!

👉 Truy cập trang **Liên hệ** ngay trên thanh menu nhé! 📨`
  }
};

// ===== TRẢ LỜI THÔNG MINH THEO NGỮ CẢNH =====

// Phân tích giá tiền trong câu hỏi
function extractPrice(text: string): number | null {
  const patterns = [
    /([\d.,]+)\s*(?:nghìn|nghin|k|K)/,
    /([\d.,]+)\s*(?:triệu|trieu|tr)/,
    /([\d.,]+)\s*(?:đồng|dong|đ|d|vnd)/,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) {
      const num = parseFloat(m[1].replace(/[.,]/g, ''));
      if (text.match(/triệu|trieu|tr/)) return num * 1000000;
      if (text.match(/nghìn|nghin|k|K/)) return num * 1000;
      return num;
    }
  }
  const numOnly = text.match(/(\d{2,})/); 
  if (numOnly) {
    const n = parseInt(numOnly[1]);
    if (n >= 100 && n <= 999) return n * 1000;
    if (n >= 1000) return n;
  }
  return null;
}

// Trả lời chi tiết khi hỏi về giá cụ thể
function handlePriceQuery(price: number): string {
  if (price < 299000) {
    return `💡 Mình hiểu bạn muốn tìm gói tập với mức giá khoảng **${price.toLocaleString('vi-VN')}đ** nhé!\n\nHiện tại bên GymVerse **chưa có gói tập ở mức giá này** ạ. Gói thấp nhất của bên mình là:\n\n🏷️ **Gói Cơ Bản (Basic) — 299.000đ/tháng:**\n• Tập tất cả thiết bị gym\n• Giờ tập: 5:00 – 22:00\n• Phòng tắm + tủ khóa cá nhân\n\nĐây là mức giá rất hợp lý so với chất lượng dịch vụ 5 sao của GymVerse rồi đó! 😊\n\n💡 **Mẹo tiết kiệm:** Dùng mã **NEWBIE2026** khi thanh toán để được giảm giá thêm nhé!\n\n👉 Bạn muốn tìm hiểu thêm về gói Basic hoặc các gói khác không?`;
  }
  if (price >= 299000 && price < 599000) {
    return `👍 Với mức giá khoảng **${price.toLocaleString('vi-VN')}đ**, mình gợi ý cho bạn:\n\n🏷️ **Gói Cơ Bản (Basic) — 299.000đ/tháng:**\n• Tập tất cả thiết bị gym hiện đại\n• Giờ tập: 5:00 – 22:00\n• Phòng tắm cao cấp + tủ khóa cá nhân\n• Rất phù hợp cho bạn mới bắt đầu!\n\n💡 Nếu thêm chút ngân sách, bạn có thể nâng lên **Gói Premium (599K)** để được thêm:\n• Tham gia lớp Group X (Yoga, Zumba, HIIT)\n• 2 buổi PT miễn phí/tháng\n• Khăn tập + nước uống free\n\n👉 Bạn muốn đăng ký gói nào? Truy cập trang **Gói tập** nhé! 💪`;
  }
  if (price >= 599000 && price < 999000) {
    return `🌟 Với ngân sách khoảng **${price.toLocaleString('vi-VN')}đ**, gói phù hợp nhất cho bạn là:\n\n🏷️ **Gói Nâng Cao (Premium) — 599.000đ/tháng:**\n• Tất cả quyền lợi Basic\n• Tham gia lớp Group X (Yoga, Zumba, HIIT...)\n• 2 buổi PT miễn phí/tháng\n• Khăn tập + nước uống miễn phí\n\nĐây là gói **best-seller** được nhiều hội viên yêu thích nhất! 🔥\n\n💡 Nếu muốn trải nghiệm cao cấp hơn, bạn có thể xem thêm **Gói VIP (999K)** với phòng xông hơi + PT cá nhân 4 buổi/tháng!\n\n👉 Truy cập trang **Gói tập** để đăng ký ngay nhé! 💪`;
  }
  return `✨ Với mức giá khoảng **${price.toLocaleString('vi-VN')}đ**, mình gợi ý gói cao cấp:\n\n🏷️ **Gói VIP (Elite) — 999.000đ/tháng:**\n• Tất cả quyền lợi Premium\n• PT cá nhân 4 buổi/tháng\n• Phòng xông hơi + Sauna\n• Ưu tiên đặt lớp + chế độ dinh dưỡng cá nhân\n\n💑 Hoặc **Gói Đôi (Couple) — 1.599.000đ/tháng** nếu bạn đi cùng bạn bè/người thân, tiết kiệm đến **399.000đ**!\n\n👉 Truy cập trang **Gói tập** để đăng ký ngay! 🏋️`;
}

// Trả lời ngắn gọn nhưng vẫn trả lời cho câu hỏi ngoài hệ thống
const OFF_TOPIC_REPLIES: Record<string, string> = {
  finance: `📈 Về giá vàng/xăng/chứng khoán thì mình không cập nhật real-time được ạ! Bạn có thể tra trên các trang tài chính như CafeF hay VnExpress nhé.\n\n💪 Nhưng nếu bạn muốn **"đầu tư cho sức khỏe"** thì GymVerse là lựa chọn tuyệt vời – gói tập chỉ từ **299K/tháng** thôi! Sức khỏe là tài sản quý nhất mà 😊`,
  weather: `🌤️ Thời tiết hôm nay thì mình không rõ lắm, bạn check trên app thời tiết nhé!\n\n☔ Dù nắng hay mưa thì phòng tập GymVerse vẫn **mở cửa từ 5h–22h** mỗi ngày, tập trong nhà nên không lo thời tiết ảnh hưởng! 💪`,
  sports: `⚽ Về bóng đá/thể thao thì mình theo dõi không nhiều lắm ạ!\n\nNhưng nếu bạn muốn **thể lực sung mãn để chơi thể thao** tốt hơn, bên mình có HLV chuyên về **sức bền & cardio** – đặc biệt là HLV **Aisha Bello** (⭐4.9) rất giỏi mảng này! 🏃`,
  game: `🎮 Game thì mình không rành lắm đâu ạ 😄\n\nNhưng mà tập gym xong rồi chơi game sẽ **tỉnh táo và phản xạ tốt** hơn nhiều đấy! Nhiều hội viên bên mình cũng là game thủ, họ nói tập xong đánh rank lên hẳn 😆 Thử gói **Basic 299K** xem sao nhé!`,
  entertainment: `🎬 Về phim ảnh/giải trí thì mình biết ít lắm ạ!\n\nNhưng bạn biết không, tập gym cũng rất giải trí đấy! Bên mình có lớp **Zumba Dance Party** 🎶 vừa nhảy vừa đốt mỡ cực vui – mỗi thứ 2 và thứ 7 luôn! Thử tham gia xem nhé 💃`,
  politics: `🏛️ Về chính trị thì mình không bàn được ạ 😅\n\n💪 Mình chuyên về **sức khỏe và thể hình** thôi! Nếu bạn quan tâm đến việc nâng cao sức khỏe, mình sẵn sàng tư vấn gói tập phù hợp nhé!`,
  tech: `💻 Về công nghệ/điện thoại thì mình không chuyên ạ!\n\nNhưng nói về **công nghệ tập luyện** thì GymVerse rất hiện đại: thiết bị nhập khẩu từ Mỹ và châu Âu, hệ thống AI chatbot tư vấn 24/7 (chính là mình đây 😄), thanh toán online qua MoMo/VNPAY... Muốn trải nghiệm không? 🏋️`,
  cooking: `🍳 Nấu ăn thì mình không giỏi lắm ạ 😅\n\n🥗 Nhưng về **chế độ dinh dưỡng cho tập gym** thì mình tư vấn được! Hội viên VIP bên mình được HLV thiết kế **chế độ dinh dưỡng cá nhân** luôn đấy. Bạn muốn tìm hiểu gói VIP không?`,
  love: `💕 Chuyện tình cảm thì mình xin phép không tư vấn được ạ 😄\n\n💪 Nhưng mà tập gym xong body đẹp thì **tự tin hơn** nhiều đấy! Rất nhiều hội viên bên mình sau vài tháng tập đã thay đổi hoàn toàn cả ngoại hình lẫn tinh thần. Gói **Premium 599K** là sự khởi đầu tuyệt vời! 🔥`,
  travel: `✈️ Về du lịch/khách sạn thì mình không rõ lắm ạ!\n\nNhưng trước khi đi du lịch, tập luyện để có **thể lực tốt** rất quan trọng đấy! Bạn sẽ leo núi, bơi, đi bộ dễ dàng hơn nhiều. Đăng ký gói tập GymVerse ngay để chuẩn bị cho chuyến đi tiếp theo nào! 🏔️`,
  study: `📚 Về học tập/thi cử thì mình không hỗ trợ được ạ!\n\n🧠 Nhưng nghiên cứu cho thấy **tập thể dục giúp tăng khả năng tập trung và ghi nhớ** rất tốt! Nhiều bạn sinh viên bên mình tập trước giờ học, hiệu quả cải thiện rõ rệt. Thử gói **Basic 299K/tháng** nhé! 💪`,
  job: `💼 Về việc làm/lương bổng thì mình không nắm được ạ!\n\n😊 Nhưng nếu bạn muốn **làm việc trong ngành fitness**, GymVerse luôn tìm kiếm những bạn đam mê thể hình. Hoặc đơn giản là tập gym để **tự tin hơn khi phỏng vấn** – ngoại hình chỉnh chu cũng là lợi thế đấy! 💪`,
  ai: `🤖 Mình là AI chatbot của **GymVerse** ạ, không phải ChatGPT hay Claude đâu 😄\n\nMình được thiết kế chuyên để tư vấn về **phòng tập GymVerse**: gói tập, HLV, lịch tập, cơ sở vật chất... Bạn hỏi gì về tập luyện mình đều giải đáp được nhé! 💪`,
};

const OFF_TOPIC_MAP: Record<string, string[]> = {
  finance: ['giá vàng','gia vang','giá xăng','gia xang','giá dầu','gia dau','bitcoin','crypto','chứng khoán','chung khoan','cổ phiếu','co phieu','đầu tư','dau tu'],
  weather: ['thời tiết','thoi tiet','dự báo','du bao','mưa','nắng','nong','lanh'],
  sports: ['bóng đá','bong da','world cup','ngoại hạng','ngoai hang','messi','ronaldo','champion','tennis','bơi lội'],
  game: ['game','liên quân','lien quan','free fire','valorant','minecraft','pubg','lol','rank'],
  entertainment: ['phim','netflix','anime','manga','kpop','blackpink','bts','tiktok','youtube','ca sĩ','diễn viên'],
  politics: ['chính trị','chinh tri','quốc hội','quoc hoi','tổng thống','tong thong','bầu cử','bau cu'],
  tech: ['lập trình','lap trinh','python','javascript','iphone','samsung','laptop','điện thoại','dien thoai','macbook','android'],
  cooking: ['nấu ăn','nau an','công thức nấu','cong thuc nau','recipe','món ăn','mon an'],
  love: ['tình yêu','tinh yeu','người yêu','nguoi yeu','crush','hẹn hò','hen ho','yêu','chia tay'],
  travel: ['du lịch','du lich','khách sạn','khach san','vé máy bay','ve may bay','đi chơi','di choi'],
  study: ['thi đại học','thi dai hoc','điểm thi','diem thi','học bài','hoc bai','trường','truong'],
  job: ['lương','luong','tuyển dụng','tuyen dung','phỏng vấn','phong van','xin việc','xin viec'],
  ai: ['chatgpt','gpt','claude','copilot','bard','ai khác'],
};

// ===== HÀM TÌM CÂU TRẢ LỜI THÔNG MINH =====
function findBestResponse(userMessage: string): string {
  const msg = userMessage.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const msgOriginal = userMessage.toLowerCase();
  
  // BƯỚC 1: Phân tích giá tiền trước (ví dụ: "có gói 50K không?", "gói 500 nghìn")
  const price = extractPrice(msgOriginal);
  const hasPriceContext = price !== null && (msgOriginal.includes('gói') || msgOriginal.includes('giá') || msgOriginal.includes('tập') || msgOriginal.includes('phí') || msgOriginal.includes('tiền') || msgOriginal.includes('nghìn') || msgOriginal.includes('k ') || msgOriginal.match(/\d+k/));
  if (hasPriceContext && price !== null) {
    return handlePriceQuery(price);
  }

  // BƯỚC 2: Kiểm tra on-topic (Knowledge Base)
  let bestMatch = { key: '', score: 0 };
  
  for (const [key, data] of Object.entries(KNOWLEDGE_BASE)) {
    let score = 0;
    for (const keyword of data.keywords) {
      const kw = keyword.toLowerCase();
      const kwNormalized = kw.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (msgOriginal.includes(kw) || msg.includes(kwNormalized)) {
        score += kw.length;
      }
    }
    if (score > bestMatch.score) {
      bestMatch = { key, score };
    }
  }
  
  if (bestMatch.score > 0) {
    return KNOWLEDGE_BASE[bestMatch.key as keyof typeof KNOWLEDGE_BASE].response;
  }
  
  // BƯỚC 3: Nếu hỏi giá nhưng không có ngữ cảnh gói tập
  if (price !== null) {
    return handlePriceQuery(price);
  }
  
  // BƯỚC 4: Off-topic → VẪN trả lời ngắn gọn, rồi dẫn về GymVerse
  for (const [category, keywords] of Object.entries(OFF_TOPIC_MAP)) {
    const isMatch = keywords.some(kw => 
      msgOriginal.includes(kw) || msg.includes(kw.normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
    );
    if (isMatch) {
      return OFF_TOPIC_REPLIES[category] || OFF_TOPIC_REPLIES['ai'];
    }
  }
  
  // BƯỚC 5: Fallback thông minh
  return `Cảm ơn bạn đã hỏi! 😊 Mình chưa hiểu rõ câu hỏi này lắm.

Mình là trợ lý AI của **GymVerse** và có thể hỗ trợ bạn về:
1️⃣ **Gói tập & Giá cả** — "Gói nào rẻ nhất?", "Có gói 500K không?"
2️⃣ **Huấn luyện viên** — "Tư vấn HLV tăng cơ"
3️⃣ **Lịch lớp nhóm** — "Lịch tập Yoga", "Hôm nay có lớp gì?"
4️⃣ **Cơ sở vật chất** — "Phòng tập có gì?"
5️⃣ **Khuyến mãi** — "Có voucher gì không?"
6️⃣ **Đăng ký / Liên hệ** — "Cách đăng ký?"

Hoặc bạn cứ hỏi bất cứ điều gì, mình sẽ cố gắng giải đáp! 💪`;
}

// Quick suggestion chips
const QUICK_SUGGESTIONS = [
  '💪 Tư vấn gói tập',
  '👨‍🏫 Tư vấn HLV',
  '📅 Lịch lớp nhóm',
  '🏢 Cơ sở vật chất',
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '👋 Chào bạn! Mình là **GymVerse AI** – Trợ lý ảo của phòng tập GymVerse.\n\nMình có thể giúp bạn:\n1️⃣ Tư vấn gói tập phù hợp\n2️⃣ Giới thiệu Huấn luyện viên\n3️⃣ Xem lịch các lớp tập nhóm\n4️⃣ Thông tin cơ sở vật chất\n\nBạn cần hỗ trợ gì nào? 😊' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (userMessage: string) => {
    if (!userMessage.trim()) return;

    setInput('');
    setShowSuggestions(false);
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // BƯỚC 1: Dùng Knowledge Base thông minh trước
      const kbResponse = findBestResponse(userMessage);
      
      // Nếu Knowledge Base đã có câu trả lời cụ thể (không phải fallback chung)
      const isFallback = kbResponse.includes('Mình chưa hiểu rõ câu hỏi này lắm');
      
      if (!isFallback) {
        // Trả lời từ Knowledge Base (on-topic chi tiết hoặc off-topic ngắn gọn)
        setMessages(prev => [...prev, { role: 'assistant', content: kbResponse }]);
        return;
      }

      // BƯỚC 2: Nếu KB không match → thử gọi Gemini AI
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages,
          userMessage: userMessage,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'API unavailable');
      }

      setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
    } catch {
      // BƯỚC 3: Nếu Gemini cũng lỗi → dùng fallback KB
      const response = findBestResponse(userMessage);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => sendMessage(input.trim());

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
  };

  // Format message content with basic markdown-like styling
  const formatMessage = (content: string) => {
    let formatted = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/\n/g, '<br/>');
    return formatted;
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-primary to-[#8a0b20] text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-all z-50 group ${isOpen ? 'hidden' : 'flex'}`}
      >
        <MessageCircle className="w-6 h-6 group-hover:hidden" />
        <Sparkles className="w-6 h-6 hidden group-hover:block animate-pulse" />
        <span className="absolute w-full h-full rounded-full bg-primary/30 animate-ping" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[380px] h-[550px] bg-surface-dark border border-white/10 rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-[#8a0b20] p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center relative">
                <Dumbbell className="w-5 h-5 text-white" />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-primary" />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">GymVerse AI</h3>
                <p className="text-white/60 text-[10px]">Trợ lý ảo • Luôn sẵn sàng</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors hover:bg-white/10 rounded-lg p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-background-dark/50 scrollbar-thin">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                    <Dumbbell className="w-3 h-3 text-primary" />
                  </div>
                )}
                <div 
                  className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-primary text-white rounded-tr-sm' 
                      : 'bg-surface-dark border border-white/5 text-slate-200 rounded-tl-sm'
                  }`}
                  dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                />
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center mr-2 mt-1 flex-shrink-0">
                  <Dumbbell className="w-3 h-3 text-primary" />
                </div>
                <div className="bg-surface-dark border border-white/5 p-3 rounded-2xl rounded-tl-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  <span className="text-xs text-slate-400">Đang suy nghĩ...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions */}
          {showSuggestions && messages.length <= 1 && (
            <div className="px-3 py-2 flex flex-wrap gap-2 border-t border-white/5 bg-surface-dark/50">
              {QUICK_SUGGESTIONS.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-3 py-1.5 text-xs font-medium bg-white/5 hover:bg-primary/20 text-slate-300 hover:text-white border border-white/10 hover:border-primary/30 rounded-full transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-white/10 bg-surface-dark flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
              placeholder="Hỏi mình bất cứ điều gì..."
              className="flex-1 bg-background-dark border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary transition-colors placeholder:text-slate-500"
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
