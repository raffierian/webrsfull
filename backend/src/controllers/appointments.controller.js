import prisma from '../config/database.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response.js';
import bcrypt from 'bcryptjs';

/**
 * Create appointment
 * POST /api/appointments
 */
export const createAppointment = async (req, res, next) => {
    try {
        const { doctorId, serviceId, appointmentDate, appointmentTime, complaint, patientName, patientNIK, patientPhone, patientEmail } = req.body;
        let patientId = req.user?.id;

        // Validasi input dasar
        if (!doctorId || !serviceId || !appointmentDate || !appointmentTime) {
            return errorResponse(res, 'Missing required appointment details', 400);
        }

        // --- Handle Guest / Public Appointment ---
        if (!patientId) {
            // Jika tidak login, wajib isi data pasien
            if (!patientName || !patientNIK || !patientPhone) {
                return errorResponse(res, 'Mohon lengkapi Nama, NIK, dan No. HP Pasien', 400);
            }

            // Cek apakah user dengan NIK ini sudah ada
            let user = await prisma.user.findUnique({
                where: { nik: patientNIK },
            });

            if (user) {
                // User sudah ada, pakai ID-nya
                patientId = user.id;
            } else {
                // User belum ada -> Auto Register
                // Password default = NIK
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(patientNIK, salt);

                // Buat username unik (misal: nama + random) atau pakai NIK sebagai username
                // Disini kita pakai NIK sebagai username untuk simplify
                // Cek username conflict chances (NIK unique, so okay)

                user = await prisma.user.create({
                    data: {
                        name: patientName,
                        nik: patientNIK,
                        username: patientNIK, // Use NIK as username
                        email: patientEmail || null, // Email optional
                        password: hashedPassword,
                        phone: patientPhone,
                        role: 'PATIENT', // Default role
                        isActive: true
                    }
                });
                patientId = user.id;
            }
        }

        // Check if doctor exists and is available
        const doctor = await prisma.doctor.findUnique({
            where: { id: doctorId },
        });

        if (!doctor || !doctor.isAvailable) {
            return errorResponse(res, 'Maaf, Dokter tidak tersedia', 400);
        }

        // Check for existing appointment at the same time
        const existingAppointment = await prisma.appointment.findFirst({
            where: {
                doctorId,
                appointmentDate: new Date(appointmentDate),
                appointmentTime,
                status: { in: ['PENDING', 'CONFIRMED', 'WAITING'] },
            },
        });

        if (existingAppointment) {
            return errorResponse(res, 'Jam praktek ini sudah terisi, silakan pilih jam lain', 409);
        }

        // Get queue number for the day
        const appointmentsCount = await prisma.appointment.count({
            where: {
                doctorId,
                appointmentDate: new Date(appointmentDate),
            },
        });

        const appointment = await prisma.appointment.create({
            data: {
                patientId,
                doctorId,
                serviceId,
                appointmentDate: new Date(appointmentDate),
                appointmentTime,
                complaint,
                queueNumber: appointmentsCount + 1,
                status: 'PENDING',
            },
            include: {
                doctor: {
                    select: {
                        id: true,
                        name: true,
                        specialization: true,
                    },
                },
                service: true,
            },
        });

        return successResponse(res, appointment, 'Appointment created successfully', 201);
    } catch (error) {
        next(error);
    }
};

/**
 * Get user appointments
 * GET /api/appointments
 */
export const getUserAppointments = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        const skip = (page - 1) * limit;
        const userId = req.user.id;

        const where = { patientId: userId };

        if (status) {
            where.status = status;
        }

        const [appointments, total] = await Promise.all([
            prisma.appointment.findMany({
                where,
                skip: parseInt(skip),
                take: parseInt(limit),
                orderBy: { appointmentDate: 'desc' },
                include: {
                    doctor: {
                        select: {
                            id: true,
                            name: true,
                            specialization: true,
                            photoUrl: true,
                        },
                    },
                    service: true,
                },
            }),
            prisma.appointment.count({ where }),
        ]);

        return paginatedResponse(res, appointments, page, limit, total);
    } catch (error) {
        next(error);
    }
};

/**
 * Get appointment by ID
 * GET /api/appointments/:id
 */
export const getAppointmentById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const appointment = await prisma.appointment.findUnique({
            where: { id },
            include: {
                patient: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
                doctor: {
                    select: {
                        id: true,
                        name: true,
                        specialization: true,
                        photoUrl: true,
                    },
                },
                service: true,
            },
        });

        if (!appointment) {
            return errorResponse(res, 'Appointment not found', 404);
        }

        // Check if user owns this appointment or is admin
        if (appointment.patientId !== req.user.id && !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
            return errorResponse(res, 'Forbidden', 403);
        }

        return successResponse(res, appointment);
    } catch (error) {
        next(error);
    }
};

/**
 * Cancel appointment (Status = CANCELLED)
 * PUT /api/appointments/:id/cancel
 */
export const cancelAppointment = async (req, res, next) => {
    try {
        const { id } = req.params;

        const appointment = await prisma.appointment.findUnique({
            where: { id },
        });

        if (!appointment) {
            return errorResponse(res, 'Appointment not found', 404);
        }

        // Check permisison
        if (appointment.patientId !== req.user.id && !['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
            return errorResponse(res, 'Forbidden', 403);
        }

        const updatedAppointment = await prisma.appointment.update({
            where: { id },
            data: { status: 'CANCELLED' },
        });

        return successResponse(res, updatedAppointment, 'Appointment cancelled successfully');
    } catch (error) {
        next(error);
    }
};

/**
 * Delete appointment (Hard Delete)
 * DELETE /api/appointments/:id
 */
export const deleteAppointment = async (req, res, next) => {
    try {
        const { id } = req.params;

        const appointment = await prisma.appointment.findUnique({
            where: { id },
        });

        if (!appointment) {
            return errorResponse(res, 'Appointment not found', 404);
        }

        // Only Admin can hard delete
        if (!['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
            return errorResponse(res, 'Only Admin can delete appointments permanently', 403);
        }

        await prisma.appointment.delete({
            where: { id },
        });

        return successResponse(res, null, 'Appointment deleted permanently');
    } catch (error) {
        next(error);
    }
};
