import prisma from '../config/database.js';
import { successResponse, errorResponse } from '../utils/response.js';
import xlsx from 'xlsx';

// Get all inpatient rooms with filtering
export const getAllRooms = async (req, res, next) => {
    try {
        const { type, status, floor, available, search } = req.query;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const where = { isActive: true };

        if (type && type !== 'ALL') where.roomType = type;
        if (status && status !== 'ALL') where.status = status;
        if (floor) where.floor = parseInt(floor);

        // Search by room number
        if (search) {
            where.roomNumber = {
                contains: search,
                mode: 'insensitive'
            };
        }

        // Filter for available rooms (capacity > occupiedBeds)
        if (available === 'true') {
            where.status = 'AVAILABLE';
        }

        const [rooms, total] = await Promise.all([
            prisma.inpatientRoom.findMany({
                where,
                skip,
                take: limit,
                orderBy: [
                    { floor: 'asc' },
                    { roomNumber: 'asc' }
                ]
            }),
            prisma.inpatientRoom.count({ where })
        ]);

        return successResponse(res, {
            rooms,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get room availability summary by type
export const getRoomSummary = async (req, res, next) => {
    try {
        const rooms = await prisma.inpatientRoom.findMany({
            where: { isActive: true },
            select: {
                roomType: true,
                status: true,
                capacity: true,
                occupiedBeds: true
            }
        });

        const summary = {};
        // Comprehensive list of room types matching the Prisma enum
        const types = [
            'PAVILIUN_EXECUTIVE',
            'PAVILIUN_DELUXE',
            'KELAS_1',
            'KELAS_2',
            'KELAS_3',
            'ISOLASI',
            'INTENSIF',
            'INTENSIF_LAINNYA',
            'PERINATOLOGI'
        ];

        types.forEach(type => {
            const typeRooms = rooms.filter(r => r.roomType === type);
            const total = typeRooms.length;
            const available = typeRooms.filter(r => r.status === 'AVAILABLE').length;
            const occupied = typeRooms.filter(r => r.status === 'OCCUPIED').length;
            const maintenance = typeRooms.filter(r => r.status === 'MAINTENANCE').length;
            const reserved = typeRooms.filter(r => r.status === 'RESERVED').length;

            const totalBeds = typeRooms.reduce((sum, r) => sum + r.capacity, 0);
            const occupiedBeds = typeRooms.reduce((sum, r) => sum + r.occupiedBeds, 0);
            const availableBeds = totalBeds - occupiedBeds;

            summary[type] = {
                total,
                available,
                occupied,
                maintenance,
                reserved,
                totalBeds,
                occupiedBeds,
                availableBeds,
                occupancyRate: totalBeds > 0 ? ((occupiedBeds / totalBeds) * 100).toFixed(1) : 0
            };
        });

        return successResponse(res, summary);
    } catch (error) {
        next(error);
    }
};

// Get single room by ID
export const getRoomById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const room = await prisma.inpatientRoom.findUnique({
            where: { id }
        });

        if (!room) {
            return errorResponse(res, 'Kamar tidak ditemukan', 404);
        }

        return successResponse(res, room);
    } catch (error) {
        next(error);
    }
};

// Create new room (Admin only)
export const createRoom = async (req, res, next) => {
    try {
        const {
            roomNumber,
            roomName,
            roomType,
            floor,
            building,
            capacity,
            facilities,
            pricePerDay,
            imageUrl,
            description
        } = req.body;

        // Check if room number already exists
        const existing = await prisma.inpatientRoom.findUnique({
            where: { roomNumber }
        });

        if (existing) {
            return errorResponse(res, 'Nomor kamar sudah digunakan', 400);
        }

        const room = await prisma.inpatientRoom.create({
            data: {
                roomNumber,
                roomName,
                roomType,
                floor: parseInt(floor),
                building,
                capacity: parseInt(capacity),
                pricePerDay: parseFloat(pricePerDay),
                facilities,
                imageUrl,
                description
            }
        });

        return successResponse(res, room, 'Kamar berhasil ditambahkan', 201);
    } catch (error) {
        next(error);
    }
};

// Update room (Admin only)
export const updateRoom = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Check if room exists
        const existing = await prisma.inpatientRoom.findUnique({
            where: { id }
        });

        if (!existing) {
            return errorResponse(res, 'Kamar tidak ditemukan', 404);
        }

        // If updating room number, check uniqueness
        if (updateData.roomNumber && updateData.roomNumber !== existing.roomNumber) {
            const duplicate = await prisma.inpatientRoom.findUnique({
                where: { roomNumber: updateData.roomNumber }
            });

            if (duplicate) {
                return errorResponse(res, 'Nomor kamar sudah digunakan', 400);
            }
        }

        const room = await prisma.inpatientRoom.update({
            where: { id },
            data: updateData
        });

        return successResponse(res, room, 'Kamar berhasil diupdate');
    } catch (error) {
        next(error);
    }
};

// Update room status and occupancy (Admin only)
export const updateRoomStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, occupiedBeds } = req.body;

        const room = await prisma.inpatientRoom.findUnique({
            where: { id }
        });

        if (!room) {
            return errorResponse(res, 'Kamar tidak ditemukan', 404);
        }

        // Validate occupiedBeds doesn't exceed capacity
        if (occupiedBeds !== undefined && occupiedBeds > room.capacity) {
            return errorResponse(res, 'Jumlah bed terisi melebihi kapasitas', 400);
        }

        const updateData = {};
        if (status) updateData.status = status;
        if (occupiedBeds !== undefined) updateData.occupiedBeds = occupiedBeds;

        // Auto-update status based on occupancy if not explicitly set
        if (occupiedBeds !== undefined && !status) {
            if (occupiedBeds >= room.capacity) {
                updateData.status = 'OCCUPIED';
            } else {
                updateData.status = 'AVAILABLE';
            }
        }

        const updated = await prisma.inpatientRoom.update({
            where: { id },
            data: updateData
        });

        return successResponse(res, updated, 'Status kamar berhasil diupdate');
    } catch (error) {
        next(error);
    }
};

// Delete room (Admin only)
export const deleteRoom = async (req, res, next) => {
    try {
        const { id } = req.params;

        const room = await prisma.inpatientRoom.findUnique({
            where: { id }
        });

        if (!room) {
            return errorResponse(res, 'Kamar tidak ditemukan', 404);
        }

        // Soft delete
        await prisma.inpatientRoom.update({
            where: { id },
            data: { isActive: false }
        });

        return successResponse(res, null, 'Kamar berhasil dihapus');
    } catch (error) {
        next(error);
    }
};

// Import rooms from Excel
export const importRooms = async (req, res, next) => {
    try {
        if (!req.file) {
            return errorResponse(res, 'File Excel tidak ditemukan', 400);
        }

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);

        if (data.length === 0) {
            return errorResponse(res, 'File Excel kosong', 400);
        }

        let successCount = 0;
        let failCount = 0;
        const errors = [];

        // Define mapping for RoomType
        const roomTypeMap = {
            'Paviliun Executive': 'PAVILIUN_EXECUTIVE',
            'Paviliun Deluxe': 'PAVILIUN_DELUXE',
            'VIP': 'VIP',
            'VIP Suite': 'VIP',
            'Kelas 1': 'KELAS_1',
            'Kelas I': 'KELAS_1',
            'Kelas 2': 'KELAS_2',
            'Kelas II': 'KELAS_2',
            'Kelas 3': 'KELAS_3',
            'Kelas III': 'KELAS_3',
            'ICU': 'ICU',
            'NICU': 'NICU',
            'PICU': 'PICU',
            'HCU': 'HCU',
            'Isolasi': 'ISOLASI',
            'Perinatologi': 'PERINATOLOGI',
            'Intensif': 'INTENSIF',
            'Intensif Lainnya': 'INTENSIF_LAINNYA'
        };

        for (const row of data) {
            try {
                // Validate required fields (Case insensitive keys if needed, but assuming template standards)
                const roomNumber = row['Nomor Kamar'] || row['nomor_kamar'];
                const typeRaw = row['Tipe'] || row['tipe'];
                const floor = row['Lantai'] || row['lantai'];
                const capacity = row['Kapasitas'] || row['kapasitas'];
                const price = row['Tarif'] || row['tarif'];

                if (!roomNumber || !typeRaw || !floor || !capacity || !price) {
                    failCount++;
                    errors.push({ roomNumber: roomNumber || 'Unknown', error: 'Missing required fields' });
                    continue;
                }

                // Map Room Type
                const roomType = roomTypeMap[typeRaw] || typeRaw; // Fallback to raw if matches Enum

                const roomName = row['Nama Ruangan'] || row['nama_ruangan'] || null;

                // Prepare object
                const roomData = {
                    roomNumber: String(roomNumber),
                    roomName: roomName ? String(roomName) : null,
                    roomType: roomType,
                    floor: parseInt(floor),
                    building: row['Gedung'] || row['gedung'] || '',
                    capacity: parseInt(capacity),
                    pricePerDay: parseFloat(price),
                    facilities: row['Fasilitas'] ? row['Fasilitas'].split(',').map(f => f.trim()) : [],
                    description: row['Deskripsi'] || '',
                    isActive: true
                };

                // Upsert
                const existing = await prisma.inpatientRoom.findUnique({
                    where: { roomNumber: String(roomNumber) }
                });

                if (existing) {
                    await prisma.inpatientRoom.update({
                        where: { id: existing.id },
                        data: roomData
                    });
                } else {
                    await prisma.inpatientRoom.create({
                        data: roomData
                    });
                }

                successCount++;
            } catch (err) {
                failCount++;
                errors.push({ roomNumber: row['Nomor Kamar'] || 'Unknown', error: err.message });
            }
        }

        return successResponse(res, {
            total: data.length,
            success: successCount,
            failed: failCount,
            errors
        }, 'Import selesai');

    } catch (error) {
        next(error);
    }
};
