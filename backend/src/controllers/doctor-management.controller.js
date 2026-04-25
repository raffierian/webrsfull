import prisma from '../config/database.js';
import { successResponse, errorResponse } from '../utils/response.js';
import bcrypt from 'bcryptjs';

// Helper: Generate username from name
const generateUsername = (name) => {
    // Extract first name and convert to lowercase
    const firstName = name.split(' ')[0].toLowerCase();
    return `dr.${firstName}`;
};

// Helper: Generate temporary password
const generatePassword = () => {
    const year = new Date().getFullYear();
    return `Doctor${year}!`;
};

// GET /api/admin/doctors - List all doctors
export const getAllDoctors = async (req, res) => {
    try {
        const doctors = await prisma.doctor.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        phone: true,
                        isActive: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        console.log('Total doctors found:', doctors.length);
        console.log('Doctors with user:', doctors.filter(d => d.user !== null).length);
        console.log('Sample doctor:', doctors[0]);

        // Filter out doctors without user accounts and format
        const formattedDoctors = doctors
            .filter(doctor => doctor.user !== null)
            .map(doctor => ({
                id: doctor.id,
                name: doctor.name,
                specialization: doctor.specialization,
                email: doctor.user.email,
                phone: doctor.user.phone,
                username: doctor.user.username,
                userId: doctor.user.id,
                isActive: doctor.user.isActive,
                createdAt: doctor.createdAt
            }));

        return successResponse(res, formattedDoctors, 'Doctors retrieved successfully');
    } catch (error) {
        console.error('Get doctors error:', error);
        return errorResponse(res, error.message, 500);
    }
};

// POST /api/admin/doctors - Create new doctor
export const createDoctor = async (req, res) => {
    try {
        const { name, specialization, email, phone } = req.body;

        // Validate required fields
        if (!name || !specialization || !email || !phone) {
            return errorResponse(res, 'All fields are required', 400);
        }

        // Generate credentials
        let username = generateUsername(name);
        const tempPassword = generatePassword();
        const hashedPassword = bcrypt.hashSync(tempPassword, 10);

        // Generate license number (SIP format)
        const year = new Date().getFullYear();
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        const licenseNumber = `SIP-${year}-${random}`;

        // Check if username already exists and auto-increment if needed
        let usernameExists = await prisma.user.findUnique({
            where: { username }
        });

        let counter = 2;
        while (usernameExists) {
            username = `${generateUsername(name)}${counter}`;
            usernameExists = await prisma.user.findUnique({
                where: { username }
            });
            counter++;
        }

        // Check if email already exists
        const existingEmail = await prisma.user.findUnique({
            where: { email }
        });

        if (existingEmail) {
            return errorResponse(res, 'Email already exists', 400);
        }

        // Create user and doctor in transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create user
            const user = await tx.user.create({
                data: {
                    username,
                    email,
                    password: hashedPassword,
                    name,
                    role: 'DOCTOR',
                    phone,
                    isActive: true
                }
            });

            // Create doctor profile
            const doctor = await tx.doctor.create({
                data: {
                    userId: user.id,  // Explicitly set userId
                    name,
                    specialization,
                    licenseNumber,
                    education: null,
                    experienceYears: 0,
                    photoUrl: null,
                    bio: null,
                    schedule: null,
                    consultationFee: 0,
                    isActive: true,
                    isAvailable: true
                }
            });

            return { user, doctor };
        });

        return successResponse(res, {
            doctor: {
                id: result.doctor.id,
                name: result.doctor.name,
                specialization: result.doctor.specialization,
                email: result.user.email,
                phone: result.user.phone,
                licenseNumber: result.doctor.licenseNumber
            },
            credentials: {
                username,
                password: tempPassword
            }
        }, 'Doctor created successfully', 201);
    } catch (error) {
        console.error('Create doctor error:', error);
        return errorResponse(res, error.message, 500);
    }
};

// GET /api/admin/doctors/:id - Get doctor details
export const getDoctorById = async (req, res) => {
    try {
        const { id } = req.params;

        const doctor = await prisma.doctor.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        phone: true,
                        isActive: true,
                        createdAt: true
                    }
                }
            }
        });

        if (!doctor) {
            return errorResponse(res, 'Doctor not found', 404);
        }

        const formattedDoctor = {
            id: doctor.id,
            name: doctor.name,
            specialization: doctor.specialization,
            email: doctor.user.email,
            phone: doctor.user.phone,
            username: doctor.user.username,
            isActive: doctor.user.isActive,
            createdAt: doctor.createdAt,
            userId: doctor.user.id
        };

        return successResponse(res, formattedDoctor, 'Doctor retrieved successfully');
    } catch (error) {
        console.error('Get doctor error:', error);
        return errorResponse(res, error.message, 500);
    }
};

// PUT /api/admin/doctors/:id - Update doctor
export const updateDoctor = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, specialization, email, phone, username } = req.body;

        // Check if doctor exists
        const existingDoctor = await prisma.doctor.findUnique({
            where: { id },
            include: { user: true }
        });

        if (!existingDoctor) {
            return errorResponse(res, 'Doctor not found', 404);
        }

        // If email is being changed, check if new email already exists
        if (email && email !== existingDoctor.user.email) {
            const emailExists = await prisma.user.findFirst({
                where: {
                    email,
                    id: { not: existingDoctor.userId }
                }
            });

            if (emailExists) {
                return errorResponse(res, 'Email already exists', 400);
            }
        }

        // Update doctor and user in transaction
        const result = await prisma.$transaction(async (tx) => {
            // Update doctor profile (only fields in Doctor model)
            const doctor = await tx.doctor.update({
                where: { id },
                data: {
                    name: name || existingDoctor.name,
                    specialization: specialization || existingDoctor.specialization
                }
            });

            // Update user if name, email, phone or username changed
            if (name || email || phone || username) {
                await tx.user.update({
                    where: { id: existingDoctor.userId },
                    data: {
                        name: name || existingDoctor.user.name,
                        email: email || existingDoctor.user.email,
                        phone: phone || existingDoctor.user.phone,
                        username: username || existingDoctor.user.username
                    }
                });
            }

            return { ...doctor, user: { email: email || existingDoctor.user.email, phone: phone || existingDoctor.user.phone } };
        });

        return successResponse(res, result, 'Doctor updated successfully');
    } catch (error) {
        console.error('Update doctor error:', error);
        return errorResponse(res, error.message, 500);
    }
};

// PUT /api/admin/doctors/:id/toggle-status - Activate/Deactivate doctor
export const toggleDoctorStatus = async (req, res) => {
    try {
        const { id } = req.params;

        // Get doctor with user
        const doctor = await prisma.doctor.findUnique({
            where: { id },
            include: { user: true }
        });

        if (!doctor) {
            return errorResponse(res, 'Doctor not found', 404);
        }

        // Toggle isActive status
        const updatedUser = await prisma.user.update({
            where: { id: doctor.userId },
            data: {
                isActive: !doctor.user.isActive
            }
        });

        return successResponse(res, {
            id: doctor.id,
            name: doctor.name,
            isActive: updatedUser.isActive
        }, `Doctor ${updatedUser.isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
        console.error('Toggle doctor status error:', error);
        return errorResponse(res, error.message, 500);
    }
};

// DELETE /api/admin/doctors/:id - Delete doctor
export const deleteDoctor = async (req, res) => {
    try {
        const { id } = req.params;

        // Get doctor with user
        const doctor = await prisma.doctor.findUnique({
            where: { id },
            include: { user: true }
        });

        if (!doctor) {
            return errorResponse(res, 'Doctor not found', 404);
        }

        // Cascade Delete (Hard Delete) - As per user request for admin control
        await prisma.$transaction(async (tx) => {
            // 1. Delete Chat Messages & Sessions
            const chatSessions = await tx.chatSession.findMany({ where: { doctorId: id }, select: { id: true } });
            const chatSessionIds = chatSessions.map(c => c.id);

            if (chatSessionIds.length > 0) {
                // Delete messages in those sessions
                await tx.chatMessage.deleteMany({ where: { sessionId: { in: chatSessionIds } } });
                // Delete payments linked to sessions
                await tx.payment.deleteMany({ where: { chatSessionId: { in: chatSessionIds } } });
                // Delete sessions
                await tx.chatSession.deleteMany({ where: { doctorId: id } });
            }

            // 2. Delete Appointments
            // First delete consultations linked to appointments
            const appointments = await tx.appointment.findMany({ where: { doctorId: id }, select: { id: true } });
            const appointmentIds = appointments.map(a => a.id);
            if (appointmentIds.length > 0) {
                // Consultations might be linked to appointments
                await tx.consultation.deleteMany({ where: { appointmentId: { in: appointmentIds } } });
                await tx.appointment.deleteMany({ where: { doctorId: id } });
            }

            // 3. Delete Reviews
            await tx.review.deleteMany({ where: { doctorId: id } });

            // 4. Delete Schedules
            await tx.doctorSchedule.deleteMany({ where: { doctorId: id } });

            // 5. Delete Doctor Profile
            await tx.doctor.delete({ where: { id } });

            // 6. Delete User Account if exists
            if (doctor.userId) {
                await tx.user.delete({ where: { id: doctor.userId } });
            }
        });

        return successResponse(res, { id, name: doctor.name }, 'Doctor and all associated data deleted successfully');
    } catch (error) {
        console.error('Delete doctor error:', error);
        return errorResponse(res, error.message, 500);
    }
};
