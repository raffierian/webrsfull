/**
 * COPYRIGHT (c) 2025 Roni Hidayat (RH Production). All Rights Reserved.
 */

import crypto from 'crypto';

export async function validateLicense(licenseKey) {
    if (!licenseKey) {
        return { valid: false, message: 'No license key provided.' };
    }

    const managerUrl = process.env.LICENSE_MANAGER_URL || 'https://license.rhwebs.com';

    try {
        const response = await fetch(`${managerUrl}/api/validate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ licenseKey })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`License Server Error: Status ${response.status}`);
            console.error(`Response Body: ${errorText}`);
            return { valid: false, message: `License server returned error ${response.status}.` };
        }

        return await response.json();
    } catch (error) {
        console.error('License Connection Error:', error.message);
        return { valid: false, message: `Could not connect to license server: ${error.message}` };
    }
}
