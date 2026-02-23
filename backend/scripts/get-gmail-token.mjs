/**
 * Script untuk mendapatkan Gmail OAuth2 Refresh Token (Desktop App type)
 * Jalankan: node scripts/get-gmail-token.mjs
 */

import { google } from 'googleapis';
import http from 'http';
import { exec } from 'child_process';
import url from 'url';

// ⬇️ Ganti dengan credentials Anda
const CLIENT_ID = process.env.GMAIL_CLIENT_ID || 'YOUR_CLIENT_ID_HERE';
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET; // Set via: GMAIL_CLIENT_SECRET=xxx node scripts/get-gmail-token.mjs

if (!CLIENT_SECRET) {
    console.error('❌ Set client secret dulu:');
    console.error('   Windows: $env:GMAIL_CLIENT_SECRET="your-secret"; node scripts/get-gmail-token.mjs');
    process.exit(1);
}

const REDIRECT_URI = 'http://localhost:3001/oauth2callback';

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://mail.google.com/'],
    prompt: 'consent',
});

// Buka browser
console.log('\n⏳ Membuka browser untuk otorisasi...');
const openCmd = process.platform === 'win32' ? `start "" "${authUrl}"` : `open "${authUrl}"`;
exec(openCmd);

// Start local server untuk tangkap callback
const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url, true);
    if (parsedUrl.pathname === '/oauth2callback') {
        const code = parsedUrl.query.code;
        if (code) {
            res.end('<h2>✅ Berhasil! Silakan tutup tab ini dan lihat terminal.</h2>');
            server.close();

            try {
                const { tokens } = await oAuth2Client.getToken(code);
                console.log('\n✅ BERHASIL! Tambahkan ke .env production:\n');
                console.log('GMAIL_CLIENT_ID=' + CLIENT_ID);
                console.log('GMAIL_CLIENT_SECRET=' + CLIENT_SECRET);
                console.log('GMAIL_REFRESH_TOKEN=' + tokens.refresh_token);
                console.log('\n⚠️  Simpan refresh token ini baik-baik, tidak bisa dilihat lagi!');
            } catch (err) {
                console.error('❌ Gagal tukar token:', err.message);
            }
        } else {
            res.end('Error: No code received');
            server.close();
        }
    }
});

server.listen(3001, () => {
    console.log('✅ Menunggu otorisasi di browser...');
    console.log('   (Login dengan noreply.rssoewandhie@gmail.com dan klik Allow)\n');
});
