/**
 * Script sementara untuk mendapatkan Gmail OAuth2 Refresh Token
 * Jalankan sekali saja: node scripts/get-gmail-token.js
 * Setelah dapat refresh token, simpan ke .env dan hapus file ini
 */

import { google } from 'googleapis';
import readline from 'readline';

const CLIENT_ID = process.env.GMAIL_CLIENT_ID || 'YOUR_CLIENT_ID_HERE';
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET || 'YOUR_CLIENT_SECRET_HERE';
const REDIRECT_URI = 'http://localhost';

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];

const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent', // Paksa tampil consent screen agar dapat refresh_token
});

console.log('\n=== GMAIL OAUTH2 SETUP ===');
console.log('1. Buka URL berikut di browser:');
console.log('\n' + authUrl + '\n');
console.log('2. Login dengan akun Gmail yang digunakan untuk mengirim email');
console.log('3. Klik Allow');
console.log('4. Salin kode dari URL redirect (setelah "code=")');
console.log('   Contoh URL redirect: http://localhost/?code=4/XXXX...&scope=...');
console.log('   Yang disalin: bagian setelah "code=" sampai "&"\n');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

rl.question('Masukkan kode di sini: ', async (code) => {
    rl.close();
    try {
        const decodedCode = decodeURIComponent(code.trim());
        const { tokens } = await oAuth2Client.getToken(decodedCode);

        console.log('\n✅ BERHASIL! Simpan nilai-nilai ini ke .env server:\n');
        console.log('GMAIL_CLIENT_ID=' + CLIENT_ID);
        console.log('GMAIL_CLIENT_SECRET=' + CLIENT_SECRET);
        console.log('GMAIL_REFRESH_TOKEN=' + tokens.refresh_token);
        console.log('\nRefresh token TIDAK kadaluarsa (kecuali akses dicabut).');
    } catch (err) {
        console.error('❌ Gagal:', err.message);
    }
});
