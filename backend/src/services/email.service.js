import nodemailer from 'nodemailer';
import { config } from '../config/index.js';

const transporter = nodemailer.createTransport({
    host: config.mail.host,
    port: config.mail.port,
    secure: config.mail.port === 465, // true for 465, false for other ports
    auth: {
        user: config.mail.user,
        pass: config.mail.pass,
    },
});

export const sendEmail = async (to, subject, html) => {
    try {
        const mailOptions = {
            from: config.mail.from,
            to,
            subject,
            html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return info;
    } catch (error) {
        console.error('Error sending email:', error.message);

        // In development, if email fails (e.g. SMTP not configured), we log the content to console
        // so the user can still get the OTP/code they need.
        if (config.nodeEnv === 'development' || !config.mail.host) {
            console.log('\n=======================================');
            console.log('📧  DEVELOPMENT EMAIL FALLBACK');
            console.log(`To: ${to}`);
            console.log(`Subject: ${subject}`);
            console.log('Content:');
            // Extract OTP if possible for easier reading
            const otpMatch = html.match(/>\s*(\d{6})\s*<\/div>/);
            if (otpMatch) {
                console.log(`\n🔑  OTP CODE: ${otpMatch[1]}\n`);
            } else {
                console.log(html);
            }
            console.log('=======================================\n');
            return { messageId: 'development-mock-id', response: 'Logged to console' };
        }

        throw error;
    }
};

export const sendOTP = async (to, otp) => {
    const subject = 'Your 2FA Login Code - RS Soewandhie';
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
            <h2 style="color: #0ea5e9; text-align: center;">RS Soewandhie Admin Login</h2>
            <p>Hello,</p>
            <p>You are attempting to log in to the RS Soewandhie Admin Panel. Please use the following One-Time Password (OTP) to complete your authentication:</p>
            <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #111827; border-radius: 8px; margin: 20px 0;">
                ${otp}
            </div>
            <p>This code is valid for 10 minutes. If you did not attempt to log in, please ignore this email and secure your account.</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #6b7280; text-align: center;">
                &copy; ${new Date().getFullYear()} RS Soewandhie Surabaya. All rights reserved.
            </p>
        </div>
    `;

    return sendEmail(to, subject, html);
};
