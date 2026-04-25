import prisma from '../config/database.js';
import { successResponse, errorResponse } from '../utils/response.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

// Import email service at top
import { sendEmail, emailTemplates } from '../services/email.service.js';

export const getSession = async (req, res) => {
    try {
        const { sessionId } = req.params;

        const session = await prisma.chatSession.findUnique({
            where: { id: sessionId },
            include: {
                doctor: {
                    select: {
                        name: true,
                        specialization: true,
                        photoUrl: true
                    }
                },
                patient: {
                    select: {
                        name: true
                    }
                },
                payment: true
            }
        });

        if (!session) {
            return errorResponse(res, 'Session not found', 404);
        }

        // Basic authorization check
        const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role);
        const isOwner = session.patientId === req.user.id || session.doctorId === req.user.id;

        if (!isAdmin && !isOwner) {
            return errorResponse(res, 'Unauthorized', 403);
        }

        return successResponse(res, session, 'Session details retrieved');
    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
};

export const createSession = async (req, res) => {
    try {
        const { doctorId, guestData, userId } = req.body;
        let patientId = req.user?.id || userId;
        let authToken = null;
        let isGuestRegistration = false;
        let newUser = null;

        // data cleaning

        // Handle guest registration
        if (!patientId && guestData) {
            const { name, email, phone, nik, gender, dateOfBirth, complaint } = guestData;

            if (!email || !name || !phone || !nik) {
                return errorResponse(res, 'Name, email, phone and NIK are required for guest registration', 400);
            }

            // Check if user exists
            const existingUser = await prisma.user.findUnique({
                where: { email }
            });

            if (existingUser) {
                // Return specific error code for frontend to handle user prompt
                return errorResponse(res, 'Email already registered', 409);
            }

            // Create new patient account
            const tempPassword = `Patient${new Date().getFullYear()}!`;
            const hashedPassword = bcrypt.hashSync(tempPassword, 10);

            // Generate unique username from email or random
            const username = email.split('@')[0] + Math.floor(1000 + Math.random() * 9000);

            newUser = await prisma.user.create({
                data: {
                    email,
                    username,
                    password: hashedPassword,
                    name,
                    phone,
                    nik,
                    gender: gender || null,
                    dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
                    role: 'PATIENT',
                    isActive: true
                }
            });

            // Create patient profile
            await prisma.patient.create({
                data: {
                    userId: newUser.id,
                    name,
                    phone,
                    email
                }
            });

            patientId = newUser.id;
            isGuestRegistration = true;

            // Send Credential Email
            const emailHtml = emailTemplates.credentials(name, username, tempPassword);
            await sendEmail({
                to: email,
                subject: 'Detail Login Akun RS Soewandhie',
                html: emailHtml
            });

            // Generate auth token
            authToken = jwt.sign(
                { userId: newUser.id, email: newUser.email, role: newUser.role }, // Payload match middleware
                config.jwt.secret,
                { expiresIn: '7d' }
            );
        } else if (!patientId) {
            return errorResponse(res, 'Unauthorized or missing guest data', 401);
        }

        // Check if active PAID session exists
        let session = await prisma.chatSession.findFirst({
            where: {
                patientId,
                doctorId,
                status: 'OPEN',
                isPaid: true
            },
            include: { doctor: true }
        });

        if (!session) {
            // Create new session (unpaid)
            session = await prisma.chatSession.create({
                data: {
                    patientId,
                    doctorId,
                    status: 'OPEN',
                    isPaid: false
                },
                include: { doctor: true }
            });
        }

        // Get consultation fee (doctor fee or default)
        const consultationFee = session.doctor.consultationFee || 50000;

        return successResponse(res, {
            ...session,
            requiresPayment: !session.isPaid,
            consultationFee: Number(consultationFee),
            ...(authToken && {
                authToken,
                user: {
                    id: newUser.id,
                    email: newUser.email,
                    name: newUser.name,
                    role: newUser.role,
                    username: newUser.username,
                    // Return temp password only for initial guest registration display
                    ...(isGuestRegistration && { tempPassword: `Patient${new Date().getFullYear()}!` })
                },
                message: 'Account created successfully'
            })
        }, 'Session created');
    } catch (error) {
        console.error('Create Session Error:', error);
        return errorResponse(res, error.message, 500);
    }
};

export const getMySessions = async (req, res) => {
    try {
        const userId = req.user.id;
        // User can be patient or doctor. Check database to see role or just query both columns?
        // Assuming req.user has role information or we check both.

        const { status, isPaid } = req.query;

        const where = {
            OR: [
                { patientId: userId },
                { doctor: { userId: userId } }
            ]
        };

        if (status) where.status = status;
        if (isPaid !== undefined) where.isPaid = isPaid === 'true';

        const sessions = await prisma.chatSession.findMany({
            where,
            include: {
                doctor: { select: { name: true, photoUrl: true, specialization: true } },
                patient: { select: { name: true } },
                payment: true,
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        return successResponse(res, sessions, 'Sessions retrieved');
    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
};

export const getMessages = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const messages = await prisma.chatMessage.findMany({
            where: { sessionId },
            orderBy: { createdAt: 'asc' }
        });

        return successResponse(res, messages, 'Messages retrieved');
    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { content, type = 'TEXT', fileUrl } = req.body;
        const senderId = req.user.id;

        if (!content && !fileUrl) {
            return errorResponse(res, 'Message content cannot be empty', 400);
        }

        // Verify session
        const session = await prisma.chatSession.findUnique({
            where: { id: sessionId }
        });

        if (!session) {
            return errorResponse(res, 'Session not found', 404);
        }

        // Check if user is participant
        if (session.patientId !== senderId && session.doctorId !== senderId) {
            const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role);
            if (!isAdmin) {
                return errorResponse(res, 'Unauthorized to send messages in this session', 403);
            }
        }

        // Cannot send message if session is closed
        if (session.status === 'CLOSED' || session.status === 'CANCELLED') {
            return errorResponse(res, 'Cannot send message to a closed session', 400);
        }

        const message = await prisma.chatMessage.create({
            data: {
                sessionId,
                senderId,
                content: content || '',
                type,
                fileUrl
            }
        });

        // Update session updatedAt
        await prisma.chatSession.update({
            where: { id: sessionId },
            data: { updatedAt: new Date() }
        });

        return successResponse(res, message, 'Message sent successfully', 201);
    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
};

export const updateSOAP = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { subjective, objective, assessment, plan } = req.body;

        const session = await prisma.chatSession.findUnique({
            where: { id: sessionId }
        });

        if (!session) {
            return errorResponse(res, 'Session not found', 404);
        }

        const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role);
        const isDoctor = session.doctorId === req.user.id;

        if (!isAdmin && !isDoctor) {
            return errorResponse(res, 'Unauthorized to update medical records', 403);
        }

        const updatedSession = await prisma.chatSession.update({
            where: { id: sessionId },
            data: { subjective, objective, assessment, plan }
        });

        return successResponse(res, updatedSession, 'Medical records (SOAP) updated');
    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
};

export const closeSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { closingNotes, subjective, objective, assessment, plan } = req.body;

        const session = await prisma.chatSession.findUnique({
            where: { id: sessionId }
        });

        if (!session) {
            return errorResponse(res, 'Session not found', 404);
        }

        const isDoctor = session.doctorId === req.user.id;
        if (!isDoctor) {
            return errorResponse(res, 'Only the assigned doctor can close the session', 403);
        }

        const updatedSession = await prisma.chatSession.update({
            where: { id: sessionId },
            data: {
                status: 'CLOSED',
                closedAt: new Date(),
                closingNotes: closingNotes || 'Sesi selesai',
                subjective: subjective || session.subjective,
                objective: objective || session.objective,
                assessment: assessment || session.assessment,
                plan: plan || session.plan
            }
        });

        return successResponse(res, updatedSession, 'Session closed successfully');
    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
};

export const deleteSession = async (req, res) => {
    try {
        const { sessionId } = req.params;

        // Verify session exists
        const session = await prisma.chatSession.findUnique({
            where: { id: sessionId },
            include: { payment: true }
        });

        if (!session) {
            return errorResponse(res, 'Session not found', 404);
        }

        // Only Admin/SuperAdmin can delete
        if (!['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
            return errorResponse(res, 'Unauthorized', 403);
        }

        // Delete payment first if it exists
        if (session.payment) {
            await prisma.payment.delete({
                where: { id: session.payment.id }
            });
        }

        // Delete session (messages and prescriptions will cascade if configured, 
        // but prisma delete handles them if relations are set to cascade)
        await prisma.chatSession.delete({
            where: { id: sessionId }
        });

        return successResponse(res, null, 'Session and associated data deleted successfully');
    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
};

