import nodemailer from 'nodemailer';
import { config } from '../config/index.js';

// Create verify transport
const createTransporter = () => {
    // Check if SMTP config exists
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn('⚠️ SMTP credentials missing. Emails will NOT be sent.');
        return null;
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail', // Use 'gmail' for simplicity if using Gmail, or use host/port
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        connectionTimeout: 5000, // 5 seconds
        greetingTimeout: 5000,   // 5 seconds
        socketTimeout: 10000,    // 10 seconds
    });

    return transporter;
};

// Send email
export const sendEmail = async ({ to, subject, html }) => {
    try {
        const transporter = createTransporter();

        if (!transporter) {
            console.log(`[MOCK EMAIL] To: ${to} | Subject: ${subject}`);
            return false;
        }

        const info = await transporter.sendMail({
            from: `"${process.env.SMTP_FROM_NAME || 'RS Soewandhie'}" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html,
        });

        console.log('Message sent: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

// Templates
export const emailTemplates = {
    // 1. New Account Credentials (for Guest)
    credentials: (name, username, password) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
            <h2 style="color: #0d9488; text-align: center;">Selamat Datang di RS Soewandhie Telemedicine</h2>
            <p>Halo <strong>${name}</strong>,</p>
            <p>Terima kasih telah mendaftar untuk layanan konsultasi online kami.</p>
            <p>Berikut adalah detail akun Anda untuk login kembali jika sesi terputus:</p>
            
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
                <p style="margin: 5px 0;"><strong>Username:</strong> ${username}</p>
                <p style="margin: 5px 0;"><strong>Password:</strong> ${password}</p>
            </div>
            
            <p style="color: #6b7280; font-size: 14px;"><em>*Harap segera ganti password Anda setelah login demi keamanan.</em></p>
            
            <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/patient/login" style="display: inline-block; background-color: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Login Sekarang</a>
            </div>
        </div>
    `,

    // 2. Doctor Alert (New PAID Session)
    doctorAlert: (doctorName, patientName, date, link) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
            <h2 style="color: #0d9488; text-align: center;">Pasien Baru Menunggu (PAID)</h2>
            <p>Halo <strong>${doctorName}</strong>,</p>
            <p>Ada pasien baru yang telah menyelesaikan pembayaran dan menunggu konsultasi Anda.</p>
            
            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Pasien:</strong> ${patientName}</p>
                <p style="margin: 5px 0;"><strong>Waktu Bayar:</strong> ${date}</p>
                <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: green; font-weight: bold;">LUNAS</span></p>
            </div>
            
            <p>Mohon segera masuk ke ruang chat untuk memulai konsultasi (SLA 5 Menit).</p>
            
            <div style="text-align: center; margin-top: 30px;">
                <a href="${link}" style="display: inline-block; background-color: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Mulai Konsultasi</a>
            </div>
        </div>
    `,

    // 3. Payment Success (for Patient)
    paymentSuccess: (name, amount, date, link) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
            <h2 style="color: #0d9488; text-align: center;">Pembayaran Berhasil</h2>
            <p>Halo <strong>${name}</strong>,</p>
            <p>Pembayaran konsultasi Anda telah kami terima.</p>
            
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Jumlah:</strong> Rp ${amount.toLocaleString('id-ID')}</p>
                <p style="margin: 5px 0;"><strong>Tanggal:</strong> ${date}</p>
            </div>
            
            <p>Dokter akan segera menghubungi Anda. Silakan tunggu di ruang chat.</p>
            
            <div style="text-align: center; margin-top: 30px;">
                <a href="${link}" style="display: inline-block; background-color: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Masuk ke Ruang Chat</a>
            </div>
        </div>
    `,

    // 4. OTP
    otp: (otp) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
            <h2 style="color: #0d9488; text-align: center;">Kode Verifikasi (OTP)</h2>
            <p>Kode verifikasi Anda adalah:</p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px;">
                ${otp}
            </div>
            <p>Kode ini berlaku selama 10 menit. Jangan berikan kode ini kepada siapa pun.</p>
        </div>
    `
};

export const sendOTP = async (to, otp) => {
    return sendEmail({
        to,
        subject: 'Kode Verifikasi RS Soewandhie',
        html: emailTemplates.otp(otp)
    });
};
