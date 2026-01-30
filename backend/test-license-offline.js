/**
 * Test script for hybrid license validation
 * Tests both online and offline validation scenarios
 */

import { validateLicense } from './src/utils/licenseValidator.js';

// Test with a valid license key (you should replace this with actual license key from .env)
const testLicenseKey = process.env.LICENSE_KEY || 'test-key';

console.log('='.repeat(60));
console.log('HYBRID LICENSE VALIDATION TEST');
console.log('='.repeat(60));
console.log('\n📋 Test Scenario: Simulating offline validation');
console.log('   (License server will timeout/fail)\n');

// Override LICENSE_MANAGER_URL to simulate unreachable server
process.env.LICENSE_MANAGER_URL = 'http://invalid-domain-that-does-not-exist.com';

console.log('Testing with unreachable license server...\n');

validateLicense(testLicenseKey)
    .then(result => {
        console.log('\n' + '='.repeat(60));
        console.log('TEST RESULT:');
        console.log('='.repeat(60));
        console.log('Valid:', result.valid);
        console.log('Message:', result.message);
        console.log('Validation Method:', result.validationMethod);
        if (result.data) {
            console.log('Client:', result.data.client);
            console.log('Expiry:', result.data.expiry);
        }
        console.log('='.repeat(60));

        if (result.valid && result.validationMethod === 'OFFLINE') {
            console.log('\n✅ SUCCESS: Offline validation is working correctly!');
            console.log('   Application will continue to run even if license server is down.');
        } else if (!result.valid) {
            console.log('\n⚠️ WARNING: License validation failed.');
            console.log('   Please check your LICENSE_KEY in .env file.');
        }
    })
    .catch(error => {
        console.error('\n❌ ERROR:', error.message);
    });
