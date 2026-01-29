const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedInpatientRooms() {
    console.log('🌱 Seeding inpatient rooms...');

    const rooms = [
        // VIP Rooms
        { roomNumber: 'VIP-101', roomType: 'VIP', floor: 1, building: 'Gedung A', capacity: 1, occupiedBeds: 0, pricePerDay: 750000, status: 'AVAILABLE', facilities: ['AC', 'TV', 'Kulkas', 'Kamar Mandi Dalam', 'Sofa Tamu'], description: 'Kamar VIP dengan fasilitas lengkap' },
        { roomNumber: 'VIP-102', roomType: 'VIP', floor: 1, building: 'Gedung A', capacity: 1, occupiedBeds: 1, pricePerDay: 750000, status: 'OCCUPIED', facilities: ['AC', 'TV', 'Kulkas', 'Kamar Mandi Dalam', 'Sofa Tamu'] },
        { roomNumber: 'VIP-103', roomType: 'VIP', floor: 1, building: 'Gedung A', capacity: 1, occupiedBeds: 0, pricePerDay: 750000, status: 'AVAILABLE', facilities: ['AC', 'TV', 'Kulkas', 'Kamar Mandi Dalam', 'Sofa Tamu'] },
        { roomNumber: 'VIP-201', roomType: 'VIP', floor: 2, building: 'Gedung A', capacity: 1, occupiedBeds: 1, pricePerDay: 800000, status: 'OCCUPIED', facilities: ['AC', 'TV', 'Kulkas', 'Kamar Mandi Dalam', 'Sofa Tamu', 'Balkon'] },
        { roomNumber: 'VIP-202', roomType: 'VIP', floor: 2, building: 'Gedung A', capacity: 1, occupiedBeds: 0, pricePerDay: 800000, status: 'MAINTENANCE', facilities: ['AC', 'TV', 'Kulkas', 'Kamar Mandi Dalam', 'Sofa Tamu', 'Balkon'] },

        // Kelas 1
        { roomNumber: 'K1-101', roomType: 'KELAS_1', floor: 1, building: 'Gedung B', capacity: 2, occupiedBeds: 1, pricePerDay: 400000, status: 'AVAILABLE', facilities: ['AC', 'TV', 'Kamar Mandi Dalam'] },
        { roomNumber: 'K1-102', roomType: 'KELAS_1', floor: 1, building: 'Gedung B', capacity: 2, occupiedBeds: 2, pricePerDay: 400000, status: 'OCCUPIED', facilities: ['AC', 'TV', 'Kamar Mandi Dalam'] },
        { roomNumber: 'K1-103', roomType: 'KELAS_1', floor: 1, building: 'Gedung B', capacity: 2, occupiedBeds: 0, pricePerDay: 400000, status: 'AVAILABLE', facilities: ['AC', 'TV', 'Kamar Mandi Dalam'] },
        { roomNumber: 'K1-201', roomType: 'KELAS_1', floor: 2, building: 'Gedung B', capacity: 2, occupiedBeds: 2, pricePerDay: 400000, status: 'OCCUPIED', facilities: ['AC', 'TV', 'Kamar Mandi Dalam'] },
        { roomNumber: 'K1-202', roomType: 'KELAS_1', floor: 2, building: 'Gedung B', capacity: 2, occupiedBeds: 1, pricePerDay: 400000, status: 'AVAILABLE', facilities: ['AC', 'TV', 'Kamar Mandi Dalam'] },

        // Kelas 2
        { roomNumber: 'K2-101', roomType: 'KELAS_2', floor: 1, building: 'Gedung C', capacity: 4, occupiedBeds: 2, pricePerDay: 250000, status: 'AVAILABLE', facilities: ['AC', 'Kamar Mandi Bersama'] },
        { roomNumber: 'K2-102', roomType: 'KELAS_2', floor: 1, building: 'Gedung C', capacity: 4, occupiedBeds: 4, pricePerDay: 250000, status: 'OCCUPIED', facilities: ['AC', 'Kamar Mandi Bersama'] },
        { roomNumber: 'K2-103', roomType: 'KELAS_2', floor: 1, building: 'Gedung C', capacity: 4, occupiedBeds: 1, pricePerDay: 250000, status: 'AVAILABLE', facilities: ['AC', 'Kamar Mandi Bersama'] },
        { roomNumber: 'K2-201', roomType: 'KELAS_2', floor: 2, building: 'Gedung C', capacity: 4, occupiedBeds: 3, pricePerDay: 250000, status: 'AVAILABLE', facilities: ['AC', 'Kamar Mandi Bersama'] },
        { roomNumber: 'K2-202', roomType: 'KELAS_2', floor: 2, building: 'Gedung C', capacity: 4, occupiedBeds: 4, pricePerDay: 250000, status: 'OCCUPIED', facilities: ['AC', 'Kamar Mandi Bersama'] },

        // Kelas 3
        { roomNumber: 'K3-101', roomType: 'KELAS_3', floor: 1, building: 'Gedung D', capacity: 6, occupiedBeds: 3, pricePerDay: 150000, status: 'AVAILABLE', facilities: ['Kipas Angin', 'Kamar Mandi Bersama'] },
        { roomNumber: 'K3-102', roomType: 'KELAS_3', floor: 1, building: 'Gedung D', capacity: 6, occupiedBeds: 6, pricePerDay: 150000, status: 'OCCUPIED', facilities: ['Kipas Angin', 'Kamar Mandi Bersama'] },
        { roomNumber: 'K3-103', roomType: 'KELAS_3', floor: 1, building: 'Gedung D', capacity: 6, occupiedBeds: 2, pricePerDay: 150000, status: 'AVAILABLE', facilities: ['Kipas Angin', 'Kamar Mandi Bersama'] },
        { roomNumber: 'K3-201', roomType: 'KELAS_3', floor: 2, building: 'Gedung D', capacity: 6, occupiedBeds: 5, pricePerDay: 150000, status: 'AVAILABLE', facilities: ['Kipas Angin', 'Kamar Mandi Bersama'] },
        { roomNumber: 'K3-202', roomType: 'KELAS_3', floor: 2, building: 'Gedung D', capacity: 6, occupiedBeds: 4, pricePerDay: 150000, status: 'AVAILABLE', facilities: ['Kipas Angin', 'Kamar Mandi Bersama'] },
    ];

    try {
        // Delete existing rooms
        await prisma.inpatientRoom.deleteMany({});
        console.log('✓ Cleared existing rooms');

        // Create new rooms
        for (const room of rooms) {
            await prisma.inpatientRoom.create({
                data: room
            });
        }

        console.log(`✓ Created ${rooms.length} inpatient rooms`);
        console.log('✅ Seeding completed successfully!');
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

seedInpatientRooms();
