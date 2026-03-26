import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and code are required' }, { status: 400 });
    }

    try {
      // Configure nodemailer transporter
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'thanh0043182@gmail.com',
          pass: 'duqoswuucafroblo', // App Password if using Gmail
        },
      });

      const mailOptions = {
        from: `"GymVerse" <thanh0043182@gmail.com>`,
        to: email,
        subject: 'Mã xác nhận khôi phục mật khẩu - GymVerse',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
            <h2 style="color: #c6102e; text-align: center; text-transform: uppercase;">GymVerse</h2>
            <p>Chào bạn,</p>
            <p>Bạn đã yêu cầu khôi phục mật khẩu cho tài khoản GymVerse. Dưới đây là mã xác nhận của bạn:</p>
            <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 5px; margin: 20px 0; color: #111827;">
              ${code}
            </div>
            <p>Mã này sẽ hết hạn sau 15 phút.</p>
            <p>Nếu bạn không yêu cầu khôi phục mật khẩu, vui lòng bỏ qua email này.</p>
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
            <p style="font-size: 12px; color: #6b7280; text-align: center;">© 2026 GymVerse. All rights reserved.</p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
    } catch (emailError: any) {
      console.error('Email sending failed:', emailError.message);
      return NextResponse.json({ error: 'Failed to send email', details: emailError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Email sent successfully' });
  } catch (error: any) {
    console.error('Error sending email:', error);
    return NextResponse.json({ error: 'Failed to send email', details: error.message }, { status: 500 });
  }
}
