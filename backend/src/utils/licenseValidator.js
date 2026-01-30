/**
 * COPYRIGHT (c) 2025 Roni Hidayat (RH Production). All Rights Reserved.
 * HYBRID LICENSE VALIDATOR - Online validation with offline fallback
 */

import crypto from 'crypto';

// KONFIGURASI RAHASIA (HARUS SAMA DENGAN LICENSE GENERATOR)
const SECRET_KEY = crypto.scryptSync('RH_PRODUCTION_SECRET_2025', 'salt', 32);
const ALGORITHM = 'aes-256-cbc';
const ONLINE_TIMEOUT = 5000; // 5 seconds timeout for online validation

/**
 * Offline License Validation
 * Decrypts and validates license key locally without server connection
 */
function validateLicenseOffline(licenseKey) {
    try {
        // Split IV and encrypted data
        const parts = licenseKey.split(':');
        if (parts.length !== 2) {
            throw new Error('Invalid license key format');
        }

        const [ivHex, encryptedHex] = parts;

        // Decrypt license data
        const iv = Buffer.from(ivHex, 'hex');
        const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv);

        let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        // Parse license data
        const data = JSON.parse(decrypted);

        // Validate expiry date
        if (data.expiry !== 'PERMANENT') {
            const expiryDate = new Date(data.expiry);
            const now = new Date();

            if (now > expiryDate) {
                return {
                    valid: false,
                    message: `License expired on ${data.expiry}`,
                    validationMethod: 'OFFLINE'
                };
            }
        }

        return {
            valid: true,
            data: {
                client: data.client,
                expiry: data.expiry,
                created: data.created
            },
            message: 'License validated offline (license server unreachable)',
            validationMethod: 'OFFLINE'
        };

    } catch (error) {
        return {
            valid: false,
            message: `Invalid license key: ${error.message}`,
            validationMethod: 'OFFLINE'
        };
    }
}

/**
 * Hybrid License Validation
 * Attempts online validation first, falls back to offline if server is unreachable
 */
export async function validateLicense(licenseKey) {
    if (!licenseKey) {
        return { valid: false, message: 'No license key provided.' };
    }

    const managerUrl = process.env.LICENSE_MANAGER_URL || 'https://license.rhwebs.com';

    // STEP 1: Try online validation first
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), ONLINE_TIMEOUT);

        const response = await fetch(`${managerUrl}/api/validate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ licenseKey }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
            const result = await response.json();
            console.log('✅ [LICENSE] Validation method: ONLINE');
            return {
                ...result,
                validationMethod: 'ONLINE'
            };
        }

        // Server returned error, try offline fallback
        console.warn(`⚠️ [LICENSE] Server returned error ${response.status}, trying offline validation...`);

    } catch (error) {
        // Connection error or timeout, try offline fallback
        if (error.name === 'AbortError') {
            console.warn('⚠️ [LICENSE] Online validation timeout, trying offline validation...');
        } else {
            console.warn(`⚠️ [LICENSE] Connection error (${error.message}), trying offline validation...`);
        }
    }

    // STEP 2: Fallback to offline validation
    const offlineResult = validateLicenseOffline(licenseKey);

    if (offlineResult.valid) {
        console.log('✅ [LICENSE] Validation method: OFFLINE (fallback)');
    } else {
        console.error('❌ [LICENSE] Offline validation failed:', offlineResult.message);
    }

    return offlineResult;
}
