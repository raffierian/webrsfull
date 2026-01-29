import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const roomConfig = [
    { type: 'PAVILIUN_EXECUTIVE', prefix: 'PV-EX', count: 4, floor: 4, price: 2500000, desc: 'Paviliun Executive dengan fasilitas VVIP', facilities: ['AC Central', 'Smart TV 50"', 'Kamar Mandi Mewah + Bathtub', 'Sofa Bed Exclusive', 'Kitchenette', 'Meja Makan', 'Welcom Drink'] },
    { type: 'PAVILIUN_DELUXE', prefix: 'PV-DL', count: 12, floor: 4, price: 1500000, desc: 'Paviliun Deluxe dengan kenyamanan ekstra', facilities: ['AC Central', 'Smart TV 43"', 'Kamar Mandi Mewah', 'Sofa Bed', 'Lemari Es'] },
    { type: 'KELAS_1', prefix: 'K1', count: 44, floor: 3, price: 750000, desc: 'Kamar Kelas 1 (2 Bed) dengan privasi terjaga', facilities: ['AC', 'TV 32"', 'Kamar Mandi Dalam', 'Sofa Penunggu', 'Lemari'] },
    { type: 'KELAS_2', prefix: 'K2', count: 45, floor: 3, price: 400000, desc: 'Kamar Kelas 2 (4 Bed) nyaman dan bersih', facilities: ['AC', 'TV Shared', 'Kamar Mandi Dalam', 'Kursi Penunggu', 'Lemari Kecil'] },
    { type: 'KELAS_3', prefix: 'K3', count: 198, floor: 2, price: 150000, desc: 'Kamar Kelas 3 (6 Bed) ekonomis dan layak', facilities: ['Kipas Angin/AC', 'Kamar Mandi Shared', 'Kursi Penunggu'] },
    { type: 'ISOLASI', prefix: 'ISO', count: 17, floor: 1, price: 500000, desc: 'Ruang Isolasi standar medis ketat', facilities: ['Hepafilter', 'Tekanan Negatif', 'Bed Khusus', 'Monitor Pasien'] },
    { type: 'INTENSIF', prefix: 'ICU', count: 25, floor: 1, price: 1200000, desc: 'Ruang Perawatan Intensif (ICU/ICCU)', facilities: ['Ventilator', 'Monitor Vital Sign Lengkap', 'Infus Pump', 'Syringe Pump', 'Bed Elektrik'] },
    { type: 'INTENSIF_LAINNYA', prefix: 'INT', count: 24, floor: 1, price: 1000000, desc: 'Unit Intensif Lainnya (HCU/PICU/NICU)', facilities: ['Monitor', 'Oksigen Central', 'Suction', 'Bed Khusus'] },
    { type: 'PERINATOLOGI', prefix: 'PERI', count: 15, floor: 5, price: 600000, desc: 'Ruang Perawatan Bayi Baru Lahir', facilities: ['Inkubator', 'Blue Light', 'Warmer', 'Tempat Mandi Bayi'] }
];

async function main() {
    console.log('Start seeding inpatient rooms...');

    // Clear existing data
    await prisma.inpatientRoom.deleteMany({});
    console.log('Deleted existing rooms.');

    const rooms = [];

    for (const config of roomConfig) {
        let occupiedCount = 0;
        const targetOccupied = Math.floor(config.count * 0.7); // Simulate ~70% occupancy

        for (let i = 1; i <= config.count; i++) {
            const isOccupied = occupiedCount < targetOccupied;
            if (isOccupied) occupiedCount++;

            rooms.push({
                roomNumber: `${config.prefix}-${String(i).padStart(3, '0')}`,
                roomType: config.type,
                floor: config.floor,
                building: 'Gedung A',
                capacity: 1, // Simplifying: 1 entry per bed basically, or 1 room entry? 
                // Wait, existing schema has `capacity` and `occupiedBeds`. 
                // If KELAS_3 has 6 beds, does "198" mean 198 rooms or 198 beds?
                // The table says "JUMLAH" (Quantity). Usually denotes Beds in hospital stats.
                // But my schema models "Rooms".
                // IF "198" is Beds, and K3 has 6 beds/room -> 33 rooms.
                // IF "198" is Rooms -> 198 * 6 = 1188 beds. That's huge.
                // RS Soewandhie is a large hospital. 384 Total.
                // "Jumlah" likely refers to Beds (Tempat Tidur).
                // So I should treat `InpatientRoom` as a "Bed" or "Room Unit"?
                // Current Schema: `InpatientRoom` has `capacity` and `occupiedBeds`.
                // If I treat each entry as a Room:
                // Paviliun (1 bed/room) -> 4 rooms = 4 beds. Correct.
                // Kelas 3 (6 bed/room) -> If 198 is beds, then 33 rooms.
                // BUT if I model strictly as "Bed Availability", maybe `InpatientRoom` should be 1 record per Bed?
                // OR 1 record per Room with capacity.
                // The user's table shows "Jumlah" which sums to 384. This is definitely Total Beds (TT).
                // So for KELAS_3, I should create rooms with capacity 6 until I hit 198 capacity?
                // 198 / 6 = 33 Rooms.
                // BUT, for simplicity and to match the "Count" exactly in charts,
                // maybe I should just create 384 records and treat them as "Bed Slots" or "Rooms with capacity 1"?
                // NO, UI shows "Available: 5" (Beds).
                // Let's stick to Room model.
                // I will calculate number of rooms based on capacity.
                // PAVILIUN: Cap 1. Count 4. -> 4 Rooms.
                // KELAS 1: Cap 2. Count 44. -> 22 Rooms.
                // KELAS 2: Cap 4. Count 45. -> ~11 Rooms (11*4 = 44, +1 extra bed room?).
                // KELAS 3: Cap 6. Count 198 -> 33 Rooms.
                // This is safer.
                // Wait, if the user sees "Jumlah: 198", they might expect 198 items in a list?
                // No, usually dashboard aggregates.
                // I will create ROOMS that sum up to these capacities.

                // ACTUAL PLAN:
                // Create rooms where sum(capacity) == Target.
                // Paviliun Executive: 4 beds. Capacity 1 -> 4 Rooms.
                // Paviliun Deluxe: 12 beds. Capacity 1 -> 12 Rooms.
                // Kelas 1 (2 beds/room): 44 beds -> 22 Rooms.
                // Kelas 2 (4 beds/room): 45 beds -> 11 Rooms (44) + 1 Room (1).
                // Kelas 3 (6 beds/room): 198 beds -> 33 Rooms.
                // Isolasi (1 bed/room?): 17 beds -> 17 Rooms.
                // Intensif (1 bed/room?): 25 beds -> 25 Rooms.
                // Intensif Lainnya: 24 beds -> 24 Rooms.
                // Perinatologi: 15 beds -> 15 Rooms.

                // Let's refine the config for capacity.

                pricePerDay: config.price,
                status: isOccupied ? 'OCCUPIED' : 'AVAILABLE',
                facilities: config.facilities,
                description: config.desc,
                occupiedBeds: isOccupied ? 1 : 0, // Initial simple logic
                // For shared rooms, this logic is tricky.
                // Let's change the script to create individual 'Bed' records if the model supported it,
                // But model is 'InpatientRoom'.
                // I'll create "Virtual Rooms" (Bed Slots) to keep it simple and 1:1 with the table?
                // "RoomType" table usually tracks Beds.
                // If I create 198 records for Kelas 3, it's easier to manage "Available: 198".
                // If I create 33 rooms, I need to manage `occupiedBeds` within them.
                // The Dashboard sums `availableBeds`.
                // Let's use the Room = Unit model (Capacity based).
            });
        }
    }

    // REVISED LOGIC BELOW IN CODE
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
