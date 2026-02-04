import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { seedRoleMenus } from './seed-role-menus.js';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seeding...');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@rssoewandhie.com' },
        update: {},
        create: {
            username: 'admin',
            email: 'admin@rssoewandhie.com',
            password: adminPassword,
            name: 'Administrator',
            role: 'SUPER_ADMIN',
            phone: '021-1234-5678',
            isActive: true,
        },
    });
    console.log('✅ Admin user created');

    // Create polis
    const polis = await Promise.all([
        prisma.poli.upsert({
            where: { code: 'UMUM' },
            update: {},
            create: {
                name: 'Poli Umum',
                code: 'UMUM',
                description: 'Pelayanan kesehatan umum',
                icon: 'Stethoscope',
                color: '#0EA5E9',
            },
        }),
        prisma.poli.upsert({
            where: { code: 'ANAK' },
            update: {},
            create: {
                name: 'Poli Anak',
                code: 'ANAK',
                description: 'Pelayanan kesehatan anak',
                icon: 'Baby',
                color: '#F59E0B',
            },
        }),
        prisma.poli.upsert({
            where: { code: 'JANTUNG' },
            update: {},
            create: {
                name: 'Poli Jantung',
                code: 'JANTUNG',
                description: 'Pelayanan kesehatan jantung',
                icon: 'Heart',
                color: '#EF4444',
            },
        }),
        prisma.poli.upsert({
            where: { code: 'MATA' },
            update: {},
            create: {
                name: 'Poli Mata',
                code: 'MATA',
                description: 'Pelayanan kesehatan mata',
                icon: 'Eye',
                color: '#8B5CF6',
            },
        }),
        prisma.poli.upsert({
            where: { code: 'GIGI' },
            update: {},
            create: {
                name: 'Poli Gigi',
                code: 'GIGI',
                description: 'Pelayanan kesehatan gigi dan mulut',
                icon: 'Smile',
                color: '#10B981',
            },
        }),
    ]);
    console.log('✅ Polis created');

    // Create doctors
    const doctors = await Promise.all([
        prisma.doctor.upsert({
            where: { licenseNumber: 'DOC001' },
            update: {},
            create: {
                name: 'dr. Ahmad Wijaya, Sp.JP',
                specialization: 'Spesialis Jantung',
                licenseNumber: 'DOC001',
                education: 'Universitas Indonesia',
                experienceYears: 15,
                photoUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=300&h=300&fit=crop',
                bio: 'Dokter spesialis jantung dengan pengalaman 15 tahun',
                rating: 4.9,
                isAvailable: true,
                consultationFee: 250000,
            },
        }),
        prisma.doctor.upsert({
            where: { licenseNumber: 'DOC002' },
            update: {},
            create: {
                name: 'dr. Siti Rahayu, Sp.A',
                specialization: 'Spesialis Anak',
                licenseNumber: 'DOC002',
                education: 'Universitas Gadjah Mada',
                experienceYears: 12,
                photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=300&h=300&fit=crop',
                bio: 'Dokter spesialis anak yang berpengalaman',
                rating: 4.8,
                isAvailable: true,
                consultationFee: 200000,
            },
        }),
        prisma.doctor.upsert({
            where: { licenseNumber: 'DOC003' },
            update: {},
            create: {
                name: 'dr. Budi Santoso, Sp.B',
                specialization: 'Spesialis Bedah',
                licenseNumber: 'DOC003',
                education: 'Universitas Airlangga',
                experienceYears: 18,
                photoUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&h=300&fit=crop',
                bio: 'Ahli bedah dengan keahlian khusus',
                rating: 4.9,
                isAvailable: true,
                consultationFee: 300000,
            },
        }),
    ]);
    console.log('✅ Doctors created');

    // Create services
    const services = await Promise.all([
        prisma.service.upsert({
            where: { slug: 'rawat-jalan' },
            update: {},
            create: {
                name: 'Rawat Jalan',
                slug: 'rawat-jalan',
                type: 'OUTPATIENT',
                description: 'Pelayanan rawat jalan untuk berbagai keluhan kesehatan',
                icon: 'Stethoscope',
                imageUrl: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d',
                facilities: ['Poli Umum', 'Poli Spesialis', 'Laboratorium', 'Farmasi'],
            },
        }),
        prisma.service.upsert({
            where: { slug: 'rawat-inap' },
            update: {},
            create: {
                name: 'Rawat Inap',
                slug: 'rawat-inap',
                type: 'INPATIENT',
                description: 'Pelayanan rawat inap dengan fasilitas lengkap',
                icon: 'Building2',
                imageUrl: 'https://images.unsplash.com/photo-1551076805-e1869033e561',
                facilities: ['Kamar VIP', 'Kamar Kelas 1', 'Kamar Kelas 2', 'Kamar Kelas 3'],
            },
        }),
        prisma.service.upsert({
            where: { slug: 'gawat-darurat' },
            update: {},
            create: {
                name: 'Gawat Darurat',
                slug: 'gawat-darurat',
                type: 'EMERGENCY',
                description: 'Pelayanan gawat darurat 24 jam',
                icon: 'AlertCircle',
                imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118',
                facilities: ['UGD 24 Jam', 'Ambulans', 'Tim Medis Siaga'],
            },
        }),
    ]);
    console.log('✅ Services created');

    // Create tariffs
    const tariffs = await Promise.all([
        prisma.tariff.upsert({
            where: { id: 't1' },
            update: {},
            create: {
                id: 't1',
                name: 'Kamar Rawat Inap',
                category: 'Akomodasi',
                price1: 750000,
                price2: 500000,
                price3: 250000,
                priceVip: 1500000,
                unit: 'Hari',
            },
        }),
        prisma.tariff.upsert({
            where: { id: 't2' },
            update: {},
            create: {
                id: 't2',
                name: 'Konsultasi Dokter Spesialis',
                category: 'Pelayanan Medik',
                priceFlat: 150000,
                isFlat: true,
                unit: 'Sesi',
            },
        }),
        prisma.tariff.upsert({
            where: { id: 't3' },
            update: {},
            create: {
                id: 't3',
                name: 'Administrasi Pasien Baru',
                category: 'Administrasi',
                priceFlat: 50000,
                isFlat: true,
                unit: 'Sekali',
            },
        }),
    ]);
    console.log('✅ Tariffs created');

    // Create survey questions
    const surveyQuestions = await Promise.all([
        prisma.surveyQuestion.upsert({
            where: { id: '1' },
            update: {},
            create: {
                id: '1',
                question: 'Bagaimana penilaian Anda terhadap kecepatan pelayanan?',
                category: 'Pelayanan',
                order: 1,
            },
        }),
        prisma.surveyQuestion.upsert({
            where: { id: '2' },
            update: {},
            create: {
                id: '2',
                question: 'Bagaimana penilaian Anda terhadap keramahan petugas?',
                category: 'Pelayanan',
                order: 2,
            },
        }),
        prisma.surveyQuestion.upsert({
            where: { id: '3' },
            update: {},
            create: {
                id: '3',
                question: 'Bagaimana penilaian Anda terhadap kebersihan fasilitas?',
                category: 'Fasilitas',
                order: 3,
            },
        }),
    ]);
    console.log('✅ Survey questions created');

    await seedRoleMenus(prisma);
    console.log('✅ Role Menus created');

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📝 Default credentials:');
    console.log('   Email: admin@rssoewandhie.com');
    console.log('   Password: admin123');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
