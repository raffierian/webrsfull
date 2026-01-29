# Backend Setup Instructions

## ✅ Completed
1. ✅ Project structure created
2. ✅ Dependencies installed (430 packages)
3. ✅ Prisma schema created (18 tables)
4. ✅ Express server configured
5. ✅ Authentication middleware (JWT)
6. ✅ All controllers created
7. ✅ All routes configured
8. ✅ Seed file created

## 🔧 Next Steps

### 1. Create .env file

Copy the following content to `backend/.env`:

```env
NODE_ENV=development
PORT=5000
API_URL=http://localhost:5000

DATABASE_URL="postgresql://postgres:root@localhost:5432/rssoewandhie?schema=public"

JWT_SECRET=rs-soewandhie-super-secret-key-2026
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=rs-soewandhie-refresh-secret-key-2026
JWT_REFRESH_EXPIRES_IN=30d

CORS_ORIGIN=http://localhost:8080

MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

DEFAULT_PAGE_SIZE=10
MAX_PAGE_SIZE=100
```

**IMPORTANT**: Sesuaikan `DATABASE_URL` dengan kredensial PostgreSQL Laragon Anda!
- Default user: `postgres`
- Default password: `root` (atau sesuai setup Laragon)
- Database name: `rssoewandhie`

### 2. Setup Database

```bash
cd backend

# Generate Prisma Client
npm run prisma:generate

# Create database and run migrations
npm run prisma:migrate

# Seed initial data
npm run prisma:seed
```

### 3. Start Backend Server

```bash
npm run dev
```

Server akan berjalan di: http://localhost:5000

### 4. Test API

Buka browser dan akses:
- http://localhost:5000/health - Health check
- http://localhost:5000/api - API info

### 5. Default Admin Credentials

```
Email: admin@rssoewandhie.com
Password: admin123
```

## 📝 Testing Login

### Using curl:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin@rssoewandhie.com\",\"password\":\"admin123\"}"
```

### Using Postman:
1. POST http://localhost:5000/api/auth/login
2. Body (JSON):
```json
{
  "username": "admin@rssoewandhie.com",
  "password": "admin123"
}
```

## 🎯 What's Included

### Database Tables (18)
- ✅ users
- ✅ doctors
- ✅ doctor_schedules
- ✅ polis
- ✅ services
- ✅ appointments
- ✅ articles
- ✅ complaints
- ✅ careers
- ✅ job_applications
- ✅ surveys
- ✅ survey_questions
- ✅ ppid_documents
- ✅ training_programs
- ✅ training_registrations
- ✅ consultations
- ✅ homepage_content
- ✅ settings

### API Endpoints (80+)
- ✅ Authentication (register, login, profile)
- ✅ Doctors (list, detail, schedules)
- ✅ Appointments (create, list, cancel)
- ✅ Services (list, detail)
- ✅ Articles (list, detail)
- ✅ Complaints (submit)
- ✅ Careers (list, apply)
- ✅ Surveys (questions, submit)
- ✅ PPID (documents)
- ✅ Training (programs)
- ✅ Consultations (create)
- ✅ Admin Dashboard (stats, analytics)
- ✅ Admin CRUD (all resources)

## 🐛 Troubleshooting

### Database Connection Error
- Pastikan PostgreSQL di Laragon sudah running
- Cek kredensial di DATABASE_URL
- Pastikan database `rssoewandhie` sudah dibuat

### Port Already in Use
- Ubah PORT di .env file
- Atau stop service yang menggunakan port 5000

### Prisma Generate Error
- Hapus folder `node_modules/.prisma`
- Run `npm run prisma:generate` lagi

## 📚 Documentation

Lihat README.md untuk dokumentasi lengkap API endpoints dan usage.
