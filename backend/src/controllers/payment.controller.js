import midtransClient from 'midtrans-client';
import prisma from '../config/database.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { createInternalNotification } from './notification.controller.js';

// Initialize Midtrans Snap
const getSnapClient = async () => {
    const settings = await prisma.hospitalSettings.findFirst();

    if (!settings || !settings.midtransServerKey) {
        throw new Error('Midtrans not configured. Please use manual payment.');
    }

    return new midtransClient.Snap({
        isProduction: settings.midtransIsProduction || false,
        serverKey: settings.midtransServerKey,
        clientKey: settings.midtransClientKey
    });
};

export const createPayment = async (req, res) => {
    try {
        const { chatSessionId, paymentMethod, guestData } = req.body;

        // User ID from auth (if authenticated) or will be created for guest
        let userId = req.user?.id;
        let isGuestUser = !userId;
        let authToken = null;

        // Get session and doctor info
        const session = await prisma.chatSession.findUnique({
            where: { id: chatSessionId },
            include: { doctor: true }
        });

        if (!session) {
            return errorResponse(res, 'Session not found', 404);
        }

        // Handle guest user - create or link patient account
        if (isGuestUser && guestData) {
            const { name, email, phone, nik } = guestData;

            // Check if user with email already exists
            let existingUser = await prisma.user.findUnique({
                where: { email }
            });

            if (existingUser) {
                // Link to existing patient account
                userId = existingUser.id;
                console.log('Linked to existing patient:', email);
            } else {
                // Create new patient account
                const bcrypt = await import('bcryptjs');
                const tempPassword = `Patient${new Date().getFullYear()}!`;
                const hashedPassword = bcrypt.hashSync(tempPassword, 10);

                const newUser = await prisma.user.create({
                    data: {
                        email,
                        password: hashedPassword,
                        name,
                        phone,
                        role: 'PATIENT',
                        isActive: true
                    }
                });

                // Create patient profile
                await prisma.patient.create({
                    data: {
                        userId: newUser.id,
                        name,
                        nik: nik || null,
                        phone,
                        email
                    }
                });

                userId = newUser.id;
                console.log('Created new patient account:', email);

                // Generate auth token for auto-login
                const jwt = await import('jsonwebtoken');
                authToken = jwt.sign(
                    { id: newUser.id, email: newUser.email, role: newUser.role },
                    process.env.JWT_SECRET || 'your-secret-key',
                    { expiresIn: '7d' }
                );
            }

            // Update session with patient ID
            await prisma.chatSession.update({
                where: { id: chatSessionId },
                data: { patientId: userId }
            });
        }

        // Check if payment already exists
        const existingPayment = await prisma.payment.findUnique({
            where: { chatSessionId }
        });

        if (existingPayment) {
            return successResponse(res, {
                ...existingPayment,
                paymentId: existingPayment.id
            }, 'Payment already exists');
        }

        // Calculate amount (doctor fee or default 50000)
        const amount = session.doctor.consultationFee || 50000;

        // Create payment record
        const payment = await prisma.payment.create({
            data: {
                userId,
                chatSessionId,
                amount,
                paymentMethod,
                status: 'PENDING'
            }
        });

        // If Midtrans, create transaction
        if (paymentMethod === 'midtrans') {
            try {
                const snap = await getSnapClient();
                const orderId = `CONSULT-${payment.id}`;

                const parameter = {
                    transaction_details: {
                        order_id: orderId,
                        gross_amount: Number(amount)
                    },
                    customer_details: {
                        first_name: guestData?.name || req.user?.name || 'Guest',
                        email: guestData?.email || req.user?.email || 'guest@example.com',
                        phone: guestData?.phone || req.user?.phone || '08123456789'
                    },
                    item_details: [{
                        id: session.doctorId,
                        price: Number(amount),
                        quantity: 1,
                        name: `Konsultasi dengan ${session.doctor.name}`
                    }]
                };

                const transaction = await snap.createTransaction(parameter);

                await prisma.payment.update({
                    where: { id: payment.id },
                    data: {
                        externalId: orderId,
                        snapToken: transaction.token
                    }
                });

                return successResponse(res, {
                    paymentId: payment.id,
                    snapToken: transaction.token,
                    redirectUrl: transaction.redirect_url,
                    ...(authToken && {
                        authToken,
                        user: {
                            id: userId,
                            email: guestData?.email || req.body.guestData?.email,
                            name: guestData?.name || req.body.guestData?.name,
                            role: 'PATIENT'
                        },
                        message: 'Account created successfully'
                    })
                }, 'Payment created');
            } catch (midtransError) {
                console.error('Midtrans error:', midtransError);
                return errorResponse(res, 'Midtrans not configured or error occurred. Please use manual payment.', 500);
            }
        }

        // Manual payment - return upload instructions
        return successResponse(res, {
            paymentId: payment.id,
            amount: Number(amount),
            ...(authToken && {
                authToken,
                user: {
                    id: userId,
                    email: guestData?.email || req.body.guestData?.email,
                    name: guestData?.name || req.body.guestData?.name,
                    role: 'PATIENT'
                },
                message: 'Account created successfully'
            }),
            bankAccount: {
                bank: 'BCA',
                accountNumber: '1234567890',
                accountName: 'RS Soewandhie'
            }
        });
    } catch (error) {
        console.error('Create payment error:', error);
        return errorResponse(res, error.message, 500);
    }
};

export const uploadPaymentProof = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { proofUrl } = req.body;

        const payment = await prisma.payment.update({
            where: { id: paymentId },
            data: { paymentProof: proofUrl }
        });

        return successResponse(res, payment, 'Payment proof uploaded');
    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
};

// Import email service
import { sendEmail, emailTemplates } from '../services/email.service.js';

export const handleMidtransNotification = async (req, res) => {
    try {
        const snap = await getSnapClient();
        const statusResponse = await snap.transaction.notification(req.body);

        const orderId = statusResponse.order_id;
        const transactionStatus = statusResponse.transaction_status;
        const fraudStatus = statusResponse.fraud_status;

        let paymentStatus = 'PENDING';

        if (transactionStatus === 'capture') {
            paymentStatus = fraudStatus === 'accept' ? 'PAID' : 'FAILED';
        } else if (transactionStatus === 'settlement') {
            paymentStatus = 'PAID';
        } else if (['cancel', 'deny', 'expire'].includes(transactionStatus)) {
            paymentStatus = transactionStatus === 'expire' ? 'EXPIRED' : 'FAILED';
        }

        // Update payment status
        const payment = await prisma.payment.update({
            where: { externalId: orderId },
            data: {
                status: paymentStatus,
                paidAt: paymentStatus === 'PAID' ? new Date() : null
            },
            include: {
                user: true,
                chatSession: {
                    include: {
                        doctor: {
                            include: { user: true }
                        }
                    }
                }
            }
        });

        // Update chat session and SEND EMAILS if PAID
        if (paymentStatus === 'PAID') {
            await prisma.chatSession.update({
                where: { id: payment.chatSessionId },
                data: {
                    isPaid: true,
                    status: 'PENDING' // Update to PENDING after payment
                }
            });

            // 3. Send In-App Notifications
            // To Doctor
            if (payment.chatSession?.doctor?.userId) {
                await createInternalNotification(
                    payment.chatSession.doctor.userId,
                    'Pembayaran Terverifikasi (Midtrans)',
                    `Pasien ${payment.user.name} telah melunasi pembayaran. Silakan mulai konsultasi.`,
                    'CONSULTATION',
                    { sessionId: payment.chatSessionId }
                );
            }

            // To Patient
            if (payment.userId) {
                await createInternalNotification(
                    payment.userId,
                    'Pembayaran Berhasil',
                    `Pembayaran via Midtrans sebesar Rp${payment.amount.toLocaleString('id-ID')} telah dikonfirmasi.`,
                    'PAYMENT',
                    { sessionId: payment.chatSessionId }
                );
            }
        }

        return res.json({ status: 'success' });
    } catch (error) {
        console.error('Midtrans notification error:', error);
        return res.status(500).json({ error: error.message });
    }
};

export const confirmManualPayment = async (req, res) => {
    try {
        const { paymentId } = req.params;

        const payment = await prisma.payment.update({
            where: { id: paymentId },
            data: {
                status: 'PAID',
                paidAt: new Date()
            },
            include: {
                user: true,
                chatSession: {
                    include: {
                        doctor: {
                            include: { user: true }
                        }
                    }
                }
            }
        });

        if (payment.chatSessionId) {
            await prisma.chatSession.update({
                where: { id: payment.chatSessionId },
                data: {
                    isPaid: true,
                    status: 'PENDING' // Set to PENDING so doctor sees it
                }
            });

            // 3. Send In-App Notifications
            // To Doctor
            if (payment.chatSession?.doctor?.userId) {
                await createInternalNotification(
                    payment.chatSession.doctor.userId,
                    'Pembayaran Terverifikasi (Manual)',
                    `Pasien ${payment.user.name} telah diverifikasi pembayarannya. Silakan mulai konsultasi.`,
                    'CONSULTATION',
                    { sessionId: payment.chatSessionId }
                );
            }

            // To Patient
            if (payment.userId) {
                await createInternalNotification(
                    payment.userId,
                    'Pembayaran Berhasil',
                    `Pembayaran Anda sebesar Rp${payment.amount.toLocaleString('id-ID')} telah dikonfirmasi.`,
                    'PAYMENT',
                    { sessionId: payment.chatSessionId }
                );
            }
        }

        return successResponse(res, payment, 'Payment confirmed and notifications sent');
    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
};

export const getPaymentStatus = async (req, res) => {
    try {
        const { paymentId } = req.params;

        const payment = await prisma.payment.findUnique({
            where: { id: paymentId },
            include: {
                chatSession: {
                    include: {
                        doctor: {
                            select: {
                                name: true,
                                specialization: true
                            }
                        }
                    }
                }
            }
        });

        if (!payment) {
            return errorResponse(res, 'Payment not found', 404);
        }

        return successResponse(res, payment, 'Payment status');
    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
};

export const getAllPayments = async (req, res) => {
    try {
        const { status, paymentMethod, page = 1, limit = 20 } = req.query;

        const where = {};
        if (status) where.status = status;
        if (paymentMethod) where.paymentMethod = paymentMethod;

        const payments = await prisma.payment.findMany({
            where,
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        phone: true
                    }
                },
                chatSession: {
                    include: {
                        doctor: {
                            select: {
                                name: true,
                                specialization: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: parseInt(limit)
        });

        const total = await prisma.payment.count({ where });

        return successResponse(res, {
            payments,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        }, 'Payments retrieved');
    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
};

export const deletePayment = async (req, res) => {
    try {
        const { paymentId } = req.params;

        const payment = await prisma.payment.findUnique({
            where: { id: paymentId }
        });

        if (!payment) {
            return errorResponse(res, 'Payment not found', 404);
        }

        // Only Admin/SuperAdmin can delete
        if (!['ADMIN', 'SUPER_ADMIN'].includes(req.user.role)) {
            return errorResponse(res, 'Unauthorized', 403);
        }

        await prisma.payment.delete({
            where: { id: paymentId }
        });

        return successResponse(res, null, 'Payment deleted successfully');
    } catch (error) {
        return errorResponse(res, error.message, 500);
    }
};

