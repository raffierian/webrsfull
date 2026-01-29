import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 6000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configuration
const MASTER_KEY = process.env.MASTER_KEY;
const SECRET_KEY_STRING = process.env.SECRET_KEY || 'RH_PRODUCTION_SECRET_2025';

console.log('[DEBUG] Environment Check:');
console.log('- MASTER_KEY loaded:', MASTER_KEY ? 'YES' : 'NO');
console.log('- SECRET_KEY loaded:', process.env.SECRET_KEY ? 'YES' : 'NO');

const SECRET_KEY = crypto.scryptSync(SECRET_KEY_STRING, 'salt', 32);
const ALGORITHM = 'aes-256-cbc';

function validateLicenseLocal(licenseKey) {
    if (!licenseKey) return { valid: false, message: 'No license key provided.' };
    try {
        const [ivHex, encryptedData] = licenseKey.split(':');
        const iv = Buffer.from(ivHex, 'hex');
        const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv);
        let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        const data = JSON.parse(decrypted);

        if (data.expiry !== 'PERMANENT') {
            if (new Date() > new Date(data.expiry)) {
                return { valid: false, message: `License expired on ${data.expiry}` };
            }
        }
        return { valid: true, data };
    } catch (e) {
        return { valid: false, message: 'Invalid license key.' };
    }
}

function generateLicense(clientName, expiryDate) {
    const data = JSON.stringify({
        client: clientName,
        expiry: expiryDate || 'PERMANENT',
        created: new Date().toISOString()
    });

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);

    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return `${iv.toString('hex')}:${encrypted}`;
}

app.post('/api/validate', (req, res) => {
    const { licenseKey } = req.body;
    const result = validateLicenseLocal(licenseKey);
    res.json(result);
});

app.post('/api/generate', (req, res) => {
    const { client, expiry, masterKey } = req.body;

    if (masterKey !== MASTER_KEY) {
        return res.status(401).json({ success: false, message: 'Invalid Master Key! Access Denied.' });
    }

    if (!client) {
        return res.status(400).json({ success: false, message: 'Client name is required.' });
    }

    try {
        const licenseKey = generateLicense(client, expiry);
        res.json({ success: true, licenseKey });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`License Manager running on http://localhost:${PORT}`);
});
