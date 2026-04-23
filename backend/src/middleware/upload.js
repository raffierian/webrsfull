import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Absolute path so uploads always go to the same folder regardless of CWD
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Create unique filename: timestamp-random-originalName
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Check extension
    const allowedExtensions = /\.(jpg|jpeg|png|gif|svg|webp|pdf|doc|docx|xls|xlsx|ppt|pptx)$/i;
    if (!file.originalname.match(allowedExtensions)) {
        return cb(new Error('Invalid file type! Only images and documents are allowed.'), false);
    }
    cb(null, true);
};

export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    }
});

// For Excel imports
const excelFilter = (req, file, cb) => {
    if (!file.originalname.match(/\.(xlsx|xls|csv)$/)) {
        return cb(new Error('Only Excel/CSV files are allowed!'), false);
    }
    cb(null, true);
};

export const excelUpload = multer({
    storage: storage,
    fileFilter: excelFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});
