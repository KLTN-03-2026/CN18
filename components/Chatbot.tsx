'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Dumbbell, Sparkles } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const GYMVERSE_SYSTEM_PROMPT = `Bạn là "GymVerse AI" – Trợ lý ảo thông minh của hệ thống phòng tập GymVerse. 
Bạn thân thiện, chuyên nghiệp, và luôn nhiệt tình hỗ trợ khách hàng.

=== NGUYÊN TẮC TRẢ LỜI ===
1. Khi người dùng hỏi về GymVerse (gói tập, HLV, lịch tập, cơ sở vật chất, giá cả...): trả lời CHI TIẾT, có cấu trúc rõ ràng, đánh số 1️⃣ 2️⃣ 3️⃣, dùng emoji phù hợp.
2. Khi hỏi về HLV: PHẢI hỏi lại mục tiêu tập luyện trước (tăng cơ? giảm mỡ? dẻo dai? sức bền?...) rồi mới gợi ý HLV phù hợp.
3. Khi hỏi ngoài chủ đề GymVerse (thời tiết, giá vàng, tin tức...): trả lời ngắn gọn 1-2 câu, rồi khéo léo dẫn về GymVerse.
4. Luôn format đẹp: dùng emoji, xuống dòng rõ ràng, đánh số khi liệt kê.
5. Gợi ý người dùng truy cập các trang trên web khi phù hợp.

=== THÔNG TIN GYMVERSE ===

📍 ĐỊA CHỈ: Hệ thống phòng tập GymVerse - Đẳng Cấp Thể Hình
🌐 Website: gymverse.vn

💰 CÁC GÓI TẬP:
1️⃣ Gói Cơ Bản (Basic) - 299.000đ/tháng:
   - Tập tất cả thiết bị gym
   - Giờ tập: 5:00 - 22:00
   - Phòng tắm + tủ khóa
   
2️⃣ Gói Nâng Cao (Premium) - 599.000đ/tháng:
   - Tất cả quyền lợi Basic
   - Tham gia lớp Group X (Yoga, Zumba, HIIT...)
   - 2 buổi PT miễn phí/tháng
   - Khăn tập + nước uống miễn phí
   
3️⃣ Gói VIP (Elite) - 999.000đ/tháng:
   - Tất cả quyền lợi Premium
   - PT cá nhân 4 buổi/tháng
   - Phòng xông hơi + sauna
   - Ưu tiên đặt lớp
   - Chế độ dinh dưỡng cá nhân

4️⃣ Gói Đôi (Couple) - 1.599.000đ/tháng:
   - Quyền lợi VIP cho 2 người
   - Tiết kiệm 399.000đ
   
🏋️ ĐỘI NGŨ HUẤN LUYỆN VIÊN (10 HLV):

👤 1. Trần Quốc Cường (Việt Nam) ⭐ 4.9
   - Chuyên môn: Sức mạnh & Tăng cơ
   - Kinh nghiệm: 8 năm | 500+ học viên
   - Tags: Sức mạnh, Tăng cơ, Powerlifting
   - Phù hợp: Người muốn TĂNG CƠ, tăng sức mạnh, tập nặng

👤 2. Nguyễn Thị Mai (Việt Nam) ⭐ 5.0
   - Chuyên môn: Thể hình nữ & Giảm mỡ
   - Kinh nghiệm: 6 năm | 350+ học viên
   - Tags: Giảm mỡ, Body Shape, Dinh dưỡng
   - Phù hợp: Nữ giới muốn GIẢM MỠ, giữ dáng, dinh dưỡng

👤 3. Kim Min-ho (Hàn Quốc) ⭐ 4.9
   - Chuyên môn: Hình thể chuẩn Idol
   - Kinh nghiệm: 7 năm | 420+ học viên
   - Tags: Body Line, Aesthetic, K-Fitness
   - Phù hợp: Muốn body THẨM MỸ kiểu Hàn, lean body

👤 4. Yuki Tanaka (Nhật Bản) ⭐ 5.0
   - Chuyên môn: Thể hình & Dẻo dai
   - Kinh nghiệm: 10 năm | 600+ học viên
   - Tags: Flexibility, Yoga, Pilates
   - Phù hợp: Muốn DẺO DAI, yoga + gym kết hợp

👤 5. Marcus "The Machine" Adebayo ⭐ 4.8
   - Chuyên môn: Sức mạnh vượt trội
   - Kinh nghiệm: 12 năm | 800+ học viên
   - Tags: Strength, CrossFit, HIIT
   - Phù hợp: Muốn tập CƯỜNG ĐỘ CAO, CrossFit, vượt giới hạn

👤 6. Aisha Bello ⭐ 4.9
   - Chuyên môn: Sức bền & Thể lực
   - Kinh nghiệm: 6 năm | 380+ học viên
   - Tags: Endurance, Cardio, Functional
   - Phù hợp: Muốn tăng SỨC BỀN, cardio, thể lực tổng thể

👤 7. Alexander "Alex" Schmidt (Đức) ⭐ 4.7
   - Chuyên môn: Huấn luyện kỹ thuật
   - Kinh nghiệm: 15 năm | 1000+ học viên
   - Tags: Technique, Bodybuilding, Rehab
   - Phù hợp: Muốn tập KỸ THUẬT CHUẨN, bodybuilding chuyên sâu

👤 8. Sarah Jenkins ⭐ 4.9
   - Chuyên môn: Group Fitness & Thể hình nữ
   - Kinh nghiệm: 8 năm | 650+ học viên
   - Tags: Group X, Zumba, Body Pump
   - Phù hợp: Thích tập NHÓM, Zumba, Body Pump

👤 9. Mateo Silva (Brazil) ⭐ 4.8
   - Chuyên môn: Functional Training
   - Kinh nghiệm: 9 năm | 450+ học viên
   - Tags: Functional, Outdoor, Calisthenics
   - Phù hợp: Muốn tập CHỨC NĂNG, outdoor, calisthenics

👤 10. Li Wei-Hsuan (Đài Loan-Việt) ⭐ 5.0
   - Chuyên môn: Yoga & Thể hình nữ
   - Kinh nghiệm: 7 năm | 380+ học viên
   - Tags: Yoga, Women Fitness, Meditation
   - Phù hợp: Nữ giới muốn YOGA kết hợp thể hình

📅 LỊCH CÁC LỚP TẬP NHÓM:
- Thứ 2: Hatha Yoga (06:00) | Body Combat Đốt Mỡ (18:30) | Zumba Dance Party (19:30)
- Thứ 3: Đạp Xe Tốc Độ (07:00) | Sức Mạnh Toàn Diện (18:00)
- Thứ 4: Pilates Căn Bản (06:30) | Tăng Cơ Chuyên Sâu (17:00)
- Thứ 5: Vinyasa Flow Yoga (19:00) | Functional Training (08:00)
- Thứ 6: Cardio Đốt Mỡ (18:30) | Giảm Mỡ Cho Nữ (16:00)
- Thứ 7: Zumba Cuối Tuần (08:00) | Kỹ Thuật Nâng Cao (10:00)
- Chủ Nhật: Yoga Phục Hồi (09:30)

🏢 CƠ SỞ VẬT CHẤT:
- Khu tập Gym hiện đại với thiết bị nhập khẩu từ Mỹ và châu Âu
- 2 Studio Group X (Studio 1 & Studio 2) cho lớp nhóm
- Phòng Spinning / Cycling chuyên dụng
- Phòng xông hơi & Sauna (gói VIP)
- Khu vực Functional Training ngoài trời
- Phòng tắm cao cấp với tủ khóa cá nhân
- Quầy bar dinh dưỡng phục vụ protein shake, nước ép

🎁 CHƯƠNG TRÌNH KHUYẾN MÃI:
- Hệ thống Điểm Lì Xì: Điểm danh mỗi ngày nhận 50 điểm, đổi quà hấp dẫn
- Voucher NEWBIE2026: Giảm cho hội viên mới
- Voucher TET2026: Ưu đãi Tết

=== QUY TẮC TƯ VẤN HLV ===
Khi người dùng hỏi về HLV, BẮT BUỘC phải hỏi lại:
"Bạn muốn tập với mục tiêu gì? Hãy chọn 1 trong các mục tiêu sau:
1️⃣ Tăng cơ / Tăng sức mạnh
2️⃣ Giảm mỡ / Giữ dáng
3️⃣ Dẻo dai / Yoga / Pilates
4️⃣ Sức bền / Cardio / Thể lực
5️⃣ Tập nhóm / Lớp Group X
6️⃣ Hình thể thẩm mỹ (Aesthetic)
7️⃣ Kỹ thuật chuyên sâu / Bodybuilding"

Sau đó PHẢI gợi ý 2-3 HLV phù hợp nhất với mục tiêu đó, kèm lý do chi tiết.

=== QUY TẮC TƯ VẤN GÓI TẬP ===
Khi hỏi về gói tập, hỏi lại:
"Bạn cần tư vấn gói tập phù hợp? Cho mình biết:
1️⃣ Bạn muốn tự tập gym hay tham gia lớp nhóm?
2️⃣ Bạn có muốn có HLV cá nhân (PT) không?
3️⃣ Ngân sách mỗi tháng bạn dự kiến bao nhiêu?"

Rồi gợi ý gói phù hợp nhất.`;

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
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '' });
      
      const contents = [
        ...messages.map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        })),
        { role: 'user', parts: [{ text: userMessage }] }
      ];

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: contents as any,
        config: {
          systemInstruction: GYMVERSE_SYSTEM_PROMPT,
          maxOutputTokens: 1024,
          temperature: 0.7,
        }
      });

      const responseText = response.text || 'Xin lỗi, mình không thể trả lời lúc này. Bạn hãy thử lại nhé! 🙏';
      setMessages(prev => [...prev, { role: 'assistant', content: responseText }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ Đã có lỗi xảy ra. Vui lòng thử lại sau nhé!\n\nNếu cần hỗ trợ gấp, bạn có thể liên hệ qua trang **Liên hệ** trên website.' }]);
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
    // Bold text
    let formatted = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Line breaks
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
        {/* Pulse effect */}
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
