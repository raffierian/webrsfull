import { google } from 'googleapis';
import nodemailer from 'nodemailer';
import { config } from '../config/index.js';

// =====================================================
// Mode 1: Gmail REST API (Diutamakan - tidak butuh port SMTP)
// =====================================================
const createGmailAPIClient = () => {
    const clientId = process.env.GMAIL_CLIENT_ID;
    const clientSecret = process.env.GMAIL_CLIENT_SECRET;
    const refreshToken = process.env.GMAIL_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) return null;

    const oAuth2Client = new google.auth.OAuth2(
        clientId,
        clientSecret,
        'https://developers.google.com/oauthplayground'
    );
    oAuth2Client.setCredentials({ refresh_token: refreshToken });

    return google.gmail({ version: 'v1', auth: oAuth2Client });
};

const sendViaGmailAPI = async ({ to, subject, html }) => {
    const gmail = createGmailAPIClient();
    if (!gmail) return null; // null = tidak tersedia, coba fallback

    const fromName = process.env.SMTP_FROM_NAME || 'RS Soewandhie';
    const fromEmail = process.env.SMTP_USER;

    const messageParts = [
        `From: "${fromName}" <${fromEmail}>`,
        `To: ${to}`,
        `Subject: ${subject}`,
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=utf-8',
        '',
        html
    ];

    const rawMessage = Buffer.from(messageParts.join('\n')).toString('base64url');

    const result = await gmail.users.messages.send({
        userId: 'me',
        requestBody: { raw: rawMessage }
    });

    return result.data.id; // Kembalikan message ID
};

// =====================================================
// Mode 2: SMTP Nodemailer (Fallback)
// =====================================================
const createSMTPTransporter = () => {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return null;

    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_PORT == '465',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        connectionTimeout: 5000,
        greetingTimeout: 5000,
        socketTimeout: 10000,
    });
};

// =====================================================
// sendEmail - otomatis pilih metode terbaik
// =====================================================
export const sendEmail = async ({ to, subject, html }) => {
    try {
        // Coba Gmail REST API dulu
        if (process.env.GMAIL_REFRESH_TOKEN) {
            try {
                const msgId = await sendViaGmailAPI({ to, subject, html });
                if (msgId) {
                    console.log(`✅ Email sent via Gmail API to ${to} (ID: ${msgId})`);
                    return true;
                }
            } catch (apiErr) {
                console.error('Gmail API error, trying SMTP fallback:', apiErr.message);
            }
        }

        // Fallback: SMTP
        const transporter = createSMTPTransporter();
        if (!transporter) {
            console.warn(`[MOCK EMAIL] To: ${to} | Subject: ${subject}`);
            return false;
        }

        const info = await transporter.sendMail({
            from: `"${process.env.SMTP_FROM_NAME || 'RS Soewandhie'}" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html,
        });

        console.log(`✅ Email sent via SMTP to ${to} (ID: ${info.messageId})`);
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
