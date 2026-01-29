# RS Soewandhie Backend API

Backend API untuk RS Soewandhie Hospital Management System menggunakan Node.js, Express, PostgreSQL, dan Prisma ORM.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 atau lebih baru)
- PostgreSQL (sudah terinstall di Laragon)
- npm atau yarn

### Installation

1. **Install dependencies**
```bash
npm install
```

2. **Setup environment variables**

Buat file `.env` di root folder backend dengan isi:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
API_URL=http://localhost:5000

# Database Configuration (PostgreSQL)
# Sesuaikan dengan kredensial PostgreSQL Laragon Anda
DATABASE_URL="postgresql://postgres:root@localhost:5432/rssoewandhie?schema=public"

# JWT Configuration
JWT_SECRET=rs-soewandhie-super-secret-key-2026
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=rs-soewandhie-refresh-secret-key-2026
JWT_REFRESH_EXPIRES_IN=30d

# CORS Configuration
CORS_ORIGIN=http://localhost:8080

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Pagination
DEFAULT_PAGE_SIZE=10
MAX_PAGE_SIZE=100
```

3. **Setup database**

Pastikan PostgreSQL di Laragon sudah running, lalu:

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database with initial data
npm run prisma:seed
```

4. **Start development server**
```bash
npm run dev
```

Server akan berjalan di http://localhost:5000

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
Gunakan Bearer token di header:
```
Authorization: Bearer <your_token>
```

### Endpoints

#### Public Endpoints
- `POST /api/auth/register` - Register user baru
- `POST /api/auth/login` - Login
- `GET /api/doctors` - List dokter
- `GET /api/services` - List layanan
- `GET /api/articles` - List artikel
- `POST /api/complaints` - Submit pengaduan
- `GET /api/careers` - List lowongan kerja
- `GET /api/surveys/questions` - Get survey questions
- `GET /api/ppid/documents` - List dokumen PPID
- `GET /api/training` - List program pelatihan

#### Protected Endpoints (Require Authentication)
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `POST /api/appointments` - Buat janji temu
- `GET /api/appointments` - List janji temu user
- `POST /api/consultations` - Buat konsultasi online

#### Admin Endpoints (Require Admin Role)
- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `GET /api/admin/dashboard/visits` - Visit trends
- `GET /api/admin/appointments` - Manage appointments
- `POST /api/admin/doctors` - Create doctor
- `POST /api/admin/articles` - Create article
- `GET /api/admin/users` - Manage users
- `GET /api/admin/complaints` - Manage complaints

## 🗄️ Database Schema

Database menggunakan PostgreSQL dengan 18 tables:
- users
- doctors
- doctor_schedules
- polis
- services
- appointments
- articles
- complaints
- careers
- job_applications
- surveys
- survey_questions
- ppid_documents
- training_programs
- training_registrations
- consultations
- homepage_content
- settings

## 🔐 Default Credentials

Setelah seeding database:
- **Email**: admin@rssoewandhie.com
- **Password**: admin123

## 📝 Available Scripts

```bash
npm run dev          # Start development server with nodemon
npm start            # Start production server
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run database migrations
npm run prisma:seed      # Seed database
npm run prisma:studio    # Open Prisma Studio (database GUI)
npm test             # Run tests
```

## 🛠️ Tech Stack

- **Node.js** - Runtime
- **Express** - Web framework
- **Prisma** - ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

## 📦 Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma      # Database schema
│   ├── migrations/        # Migration files
│   └── seed.js           # Seed data
├── src/
│   ├── config/           # Configuration
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Express middleware
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── utils/            # Utilities
│   └── server.js         # Entry point
├── .env                  # Environment variables
├── .env.example         # Environment template
└── package.json
```

## 🔧 Development

### Prisma Studio
Untuk melihat dan mengedit database secara visual:
```bash
npm run prisma:studio
```

### Create Migration
```bash
npx prisma migrate dev --name migration_name
```

### Reset Database
```bash
npx prisma migrate reset
```

## 🚀 Deployment

1. Set `NODE_ENV=production` di environment variables
2. Update `DATABASE_URL` dengan production database
3. Run migrations: `npm run prisma:migrate`
4. Start server: `npm start`

## 📄 License

ISC

## 👥 Support

Untuk bantuan, silakan hubungi tim development.
