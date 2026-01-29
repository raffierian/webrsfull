/**
 * COPYRIGHT (c) 2025 Roni Hidayat (RH Production). All Rights Reserved.
 * LICENSE GENERATOR TOOL
 * Usage: node license-generator.js "Client Name" "YYYY-MM-DD"
 */

import crypto from 'crypto';

// KONFIGURASI RAHASIA (HARUS SAMA DENGAN DI APLIKASI)
const SECRET_KEY = crypto.scryptSync('RH_PRODUCTION_SECRET_2025', 'salt', 32);
const ALGORITHM = 'aes-256-cbc';

function generateLicense(clientName, expiryDate) {
    const data = JSON.stringify({
        client: clientName,
        expiry: expiryDate || 'PERMANENT', // 'PERMANENT' or 'YYYY-MM-DD'
        created: new Date().toISOString()
    });

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);

    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    // Format: IV:ENCRYPTED_DATA
    return `${iv.toString('hex')}:${encrypted}`;
}

// CLI Interface
const args = process.argv.slice(2);
if (args.length < 1) {
    console.log('Usage: node license-generator.js <ClientName> [ExpiryDate YYYY-MM-DD]');
    console.log('Example: node license-generator.js "RS Soewandhie" "2026-12-31"');
    process.exit(1);
}

const client = args[0];
const expiry = args[1] || 'PERMANENT';

try {
    const licenseKey = generateLicense(client, expiry);
    console.log('\n==========================================');
    console.log('RH PRODUCTION - LICENSE GENERATOR');
    console.log('==========================================');
    console.log(`Client  : ${client}`);
    console.log(`Expiry  : ${expiry}`);
    console.log('------------------------------------------');
    console.log('LICENSE KEY (Copy to .env):');
    console.log(licenseKey);
    console.log('==========================================\n');
} catch (error) {
    console.error('Error generating license:', error.message);
}
