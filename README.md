# RS Soewandhie - Hospital Management System

Sistem Informasi Manajemen Rumah Sakit Soewandhie berbasis web dengan fitur lengkap untuk manajemen pasien, dokter, janji temu, dan administrasi rumah sakit.

## 🚀 Fitur Utama

### Frontend (React + TypeScript + Vite)
- ✅ Dashboard Admin dengan statistik real-time
- ✅ Manajemen Dokter & Jadwal
- ✅ Manajemen Pasien & Janji Temu
- ✅ Manajemen Artikel & Konten
- ✅ Manajemen Pengaduan
- ✅ Manajemen Kamar Rawat Inap
- ✅ Manajemen Tarif Layanan
- ✅ Manajemen Pelatihan
- ✅ PPID & Dokumen Publik
- ✅ Role-Based Access Control (RBAC)
- ✅ Input Manual Data Harian (BOR & IGD)
- ✅ Responsive Design dengan Tailwind CSS

### Backend (Node.js + Express + Prisma + PostgreSQL)
- ✅ RESTful API
- ✅ Authentication & Authorization (JWT)
- ✅ Role-Based Permissions
- ✅ File Upload Management
- ✅ Database Migration dengan Prisma
- ✅ Input/Output Validation
- ✅ Error Handling Middleware
- ✅ CORS Configuration

## 📋 Prerequisites

- Node.js >= 18.x
- PostgreSQL >= 14.x
- npm atau yarn

## 🛠️ Installation



### 2. Setup Backend

```bash
cd backend
npm install

# Copy .env.example ke .env dan sesuaikan konfigurasi
cp .env.example .env

# Edit .env dan isi dengan konfigurasi database Anda
# DATABASE_URL=postgresql://username:password@localhost:5432/rssoewandhie

# Jalankan migrasi database
npx prisma migrate dev

# (Opsional) Seed data awal
npx prisma db seed

# Jalankan development server
npm run dev
```

Backend akan berjalan di `http://localhost:5000`

### 3. Setup Frontend

```bash
# Kembali ke root directory
cd ..

# Install dependencies
npm install

# Copy .env.example ke .env
cp .env.example .env

# Edit .env jika perlu (default sudah sesuai)
# VITE_API_URL=http://localhost:5000/api

# Jalankan development server
npm run dev
```

Frontend akan berjalan di `http://localhost:8080`

## 🗄️ Database Schema

Database menggunakan PostgreSQL dengan Prisma ORM. Schema utama meliputi:

- **Users** - Data pengguna (Admin, Dokter, Pasien, Staff)
- **Roles** - Role management untuk RBAC
- **Doctors** - Data dokter dan spesialisasi
- **Appointments** - Janji temu pasien
- **Articles** - Artikel kesehatan
- **Complaints** - Pengaduan masyarakat
- **Services** - Layanan rumah sakit
- **Tariffs** - Tarif layanan
- **InpatientRooms** - Kamar rawat inap
- **TrainingPrograms** - Program pelatihan
- **DailyStats** - Statistik harian (BOR & IGD)

## 📁 Project Structure

```
rssoewandhie/
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── index.js
│   ├── uploads/
│   ├── .env.example
│   └── package.json
├── src/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── hooks/
│   └── App.tsx
├── .env.example
└── package.json
```

## 🔐 Default Credentials

Setelah seeding database, gunakan kredensial berikut untuk login:

**Super Admin:**
- Username: `superadmin`
- Password: `admin123`

**Admin:**
- Username: `admin`
- Password: `admin123`

⚠️ **PENTING:** Segera ubah password default setelah login pertama kali!

## 🚢 Deployment

### Backend Deployment

1. Set environment variables di production
2. Jalankan migrasi database: `npx prisma migrate deploy`
3. Build aplikasi: `npm run build` (jika ada)
4. Jalankan: `npm start`

### Frontend Deployment

1. Build aplikasi: `npm run build`
2. Deploy folder `dist/` ke hosting (Vercel, Netlify, dll)
3. Set environment variable `VITE_API_URL` ke URL backend production

## 📝 API Documentation

API endpoint tersedia di:
- Base URL: `http://localhost:5000/api`

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `GET /api/auth/me` - Get current user

### Admin Endpoints
- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `POST /api/admin/dashboard/stats` - Update daily stats
- `GET /api/admin/users` - Get all users
- `POST /api/admin/doctors` - Create doctor
- `GET /api/admin/complaints` - Get complaints
- `DELETE /api/admin/complaints/:id` - Delete complaint

(Lihat file routes untuk endpoint lengkap)

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
npm test
```

## 🤝 Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is proprietary software for RS Soewandhie.

## 👥 Team

- Developer: Roni Hidayat
- Client: RS Soewandhie

## 📞 Support

Untuk bantuan dan pertanyaan, hubungi tim development.
