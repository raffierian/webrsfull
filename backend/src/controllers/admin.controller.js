import prisma from '../config/database.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response.js';
import bcrypt from 'bcryptjs';
import xlsx from 'xlsx';

// ============================================
// DASHBOARD ANALYTICS
// ============================================

export const getDashboardStats = async (req, res, next) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const [
            todayVisits,
            scheduledAppointments,
            totalPatients,
            activeComplaints,
            dailyStat
        ] = await Promise.all([
            prisma.appointment.count({
                where: {
                    appointmentDate: {
                        gte: today,
                        lt: tomorrow,
                    },
                },
            }),
            prisma.appointment.count({
                where: {
                    status: { in: ['PENDING', 'CONFIRMED'] },
                },
            }),
            prisma.user.count({
                where: { role: 'PATIENT' },
            }),
            prisma.complaint.count({
                where: { status: { in: ['NEW', 'IN_PROGRESS'] } },
            }),
            prisma.dailyStat.findFirst({
                where: {
                    date: today
                }
            })
        ]);

        return successResponse(res, {
            todayVisits,
            scheduledAppointments,
            totalPatients,
            activeComplaints,
            bedOccupancyRate: dailyStat?.bor || 0,
            emergencyPatients: dailyStat?.igdCount || 0,
        });
    } catch (error) {
        next(error);
    }
};

export const updateDailyStats = async (req, res, next) => {
    try {
        const { bor, igdCount } = req.body;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const stats = await prisma.dailyStat.upsert({
            where: {
                date: today,
            },
            update: {
                bor: parseFloat(bor),
                igdCount: parseInt(igdCount),
            },
            create: {
                date: today,
                bor: parseFloat(bor),
                igdCount: parseInt(igdCount),
            },
        });

        return successResponse(res, stats, 'Daily stats updated successfully');
    } catch (error) {
        next(error);
    }
};

export const getVisitTrends = async (req, res, next) => {
    try {
        // Get last 6 months of data
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const appointments = await prisma.appointment.groupBy({
            by: ['appointmentDate'],
            where: {
                appointmentDate: { gte: sixMonthsAgo },
            },
            _count: true,
        });

        // Format data by month
        const monthlyData = {};
        appointments.forEach(apt => {
            const month = new Date(apt.appointmentDate).toLocaleString('id-ID', { month: 'short' });
            if (!monthlyData[month]) {
                monthlyData[month] = 0;
            }
            monthlyData[month] += apt._count;
        });

        return successResponse(res, monthlyData);
    } catch (error) {
        next(error);
    }
};

export const getPoliDistribution = async (req, res, next) => {
    try {
        const distribution = await prisma.appointment.groupBy({
            by: ['serviceId'],
            _count: true,
            orderBy: {
                _count: {
                    serviceId: 'desc',
                },
            },
        });

        const poliData = await Promise.all(
            distribution.map(async (item) => {
                const service = await prisma.service.findUnique({
                    where: { id: item.serviceId },
                    select: { name: true },
                });
                return {
                    name: service?.name || 'Unknown',
                    value: item._count,
                };
            })
        );

        return successResponse(res, poliData);
    } catch (error) {
        next(error);
    }
};

// ============================================
// APPOINTMENTS MANAGEMENT
// ============================================

export const getAllAppointments = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, status, date } = req.query;
        const skip = (page - 1) * limit;

        const where = {};
        if (status) {
            if (status.includes(',')) {
                where.status = { in: status.split(',') };
            } else {
                where.status = status;
            }
        }
        if (date) where.appointmentDate = new Date(date);

        const [appointments, total] = await Promise.all([
            prisma.appointment.findMany({
                where,
                skip: parseInt(skip),
                take: parseInt(limit),
                orderBy: { appointmentDate: 'desc' },
                include: {
                    patient: {
                        select: { id: true, name: true, email: true, phone: true, nik: true },
                    },
                    doctor: {
                        select: { id: true, name: true, specialization: true },
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

export const updateAppointmentStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, notes, appointmentDate, appointmentTime } = req.body;

        const updateData = { status, notes };
        if (appointmentDate) updateData.appointmentDate = new Date(appointmentDate);
        if (appointmentTime) updateData.appointmentTime = appointmentTime;

        const appointment = await prisma.appointment.update({
            where: { id },
            data: updateData,
            include: {
                patient: {
                    select: { name: true, email: true },
                },
                doctor: {
                    select: { name: true },
                },
            },
        });

        return successResponse(res, appointment, 'Appointment updated successfully');
    } catch (error) {
        next(error);
    }
};

// ============================================
// DOCTORS MANAGEMENT
// ============================================

export const createDoctor = async (req, res, next) => {
    try {
        const {
            name,
            specialization,
            licenseNumber,
            education,
            experienceYears,
            photoUrl,
            bio,
            consultationFee,
        } = req.body;

        const doctor = await prisma.doctor.create({
            data: {
                name,
                specialization,
                licenseNumber,
                education,
                experienceYears: parseInt(experienceYears),
                photoUrl,
                bio,
                consultationFee: parseFloat(consultationFee),
                isActive: req.body.isActive ?? true,
                isAvailable: req.body.isAvailable ?? true,
            },
        });

        return successResponse(res, doctor, 'Doctor created successfully', 201);
    } catch (error) {
        next(error);
    }
};

export const updateDoctor = async (req, res, next) => {
    try {
        const { id } = req.params;
        const {
            name,
            specialization,
            licenseNumber,
            education,
            experienceYears,
            photoUrl,
            bio,
            consultationFee,
            isActive,
            isAvailable,
            schedule
        } = req.body;

        const updateData = {
            name,
            specialization,
            licenseNumber,
            education,
            photoUrl,
            bio,
            isActive,
            isAvailable,
            schedule
        };

        if (experienceYears !== undefined) updateData.experienceYears = parseInt(experienceYears);
        if (consultationFee !== undefined) updateData.consultationFee = parseFloat(consultationFee);

        const doctor = await prisma.doctor.update({
            where: { id },
            data: updateData,
        });

        return successResponse(res, doctor, 'Doctor updated successfully');
    } catch (error) {
        next(error);
    }
};

export const deleteDoctor = async (req, res, next) => {
    try {
        const { id } = req.params;

        await prisma.doctor.delete({
            where: { id },
        });

        return successResponse(res, null, 'Doctor deleted successfully');
    } catch (error) {
        next(error);
    }
};

export const importDoctors = async (req, res, next) => {
    try {
        if (!req.file) {
            return errorResponse(res, 'No file uploaded', 400);
        }

        console.log('Importing file:', req.file.path);

        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        console.log('Sheet Name:', sheetName);

        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);
        console.log('Parsed Data Length:', data.length);
        if (data.length > 0) {
            console.log('First Row Keys:', Object.keys(data[0]));
        }

        const results = [];
        for (const row of data) {
            const {
                Nama,
                Spesialisasi,
                SIP,
                Pendidikan,
                Pengalaman,
                Biaya,
                Bio,
                Foto_URL,
            } = row;

            if (!Nama || !SIP) continue;

            const doctor = await prisma.doctor.upsert({
                where: { licenseNumber: String(SIP) },
                update: {
                    name: Nama,
                    specialization: Spesialisasi,
                    education: Pendidikan,
                    experienceYears: parseInt(Pengalaman) || 0,
                    consultationFee: parseFloat(Biaya) || 0,
                    bio: Bio,
                    photoUrl: Foto_URL,
                },
                create: {
                    name: Nama,
                    specialization: Spesialisasi,
                    licenseNumber: String(SIP),
                    education: Pendidikan,
                    experienceYears: parseInt(Pengalaman) || 0,
                    consultationFee: parseFloat(Biaya) || 0,
                    bio: Bio,
                    photoUrl: Foto_URL,
                },
            });
            results.push(doctor);
        }

        return successResponse(res, { count: results.length }, `${results.length} doctors imported/updated successfully`);
    } catch (error) {
        next(error);
    }
};

export const importTariffs = async (req, res, next) => {
    try {
        if (!req.file) {
            return errorResponse(res, 'No file uploaded', 400);
        }

        const workbook = xlsx.readFile(req.file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);

        const results = [];
        for (const row of data) {
            const {
                Layanan,
                Kategori,
                Kelas1,
                Kelas2,
                Kelas3,
                VIP,
                Flat,
                Unit,
            } = row;

            if (!Layanan || !Kategori) continue;

            const existingTariff = await prisma.tariff.findFirst({
                where: {
                    name: Layanan,
                    category: Kategori
                }
            });

            const tariffData = {
                name: Layanan,
                category: Kategori,
                price1: Kelas1 ? parseFloat(Kelas1) : null,
                price2: Kelas2 ? parseFloat(Kelas2) : null,
                price3: Kelas3 ? parseFloat(Kelas3) : null,
                priceVip: VIP ? parseFloat(VIP) : null,
                priceFlat: Flat ? parseFloat(Flat) : null,
                isFlat: !!Flat,
                unit: Unit || null,
            };

            let tariff;
            if (existingTariff) {
                tariff = await prisma.tariff.update({
                    where: { id: existingTariff.id },
                    data: tariffData
                });
            } else {
                tariff = await prisma.tariff.create({
                    data: tariffData
                });
            }
            results.push(tariff);
        }

        return successResponse(res, { count: results.length }, `${results.length} tariffs imported/updated successfully`);
    } catch (error) {
        next(error);
    }
};

// ============================================
// ARTICLES MANAGEMENT
// ============================================

export const getAllArticlesAdmin = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const [articles, total] = await Promise.all([
            prisma.article.findMany({
                skip: parseInt(skip),
                take: parseInt(limit),
                orderBy: { createdAt: 'desc' },
                include: {
                    author: {
                        select: { name: true },
                    },
                },
            }),
            prisma.article.count(),
        ]);

        return paginatedResponse(res, articles, page, limit, total);
    } catch (error) {
        next(error);
    }
};

export const createArticle = async (req, res, next) => {
    try {
        const { title, slug, content, excerpt, category, tags, imageUrl } = req.body;
        const authorId = req.user.id;

        // Map category to tags array if tags not provided
        const tagsToSave = tags || (category ? [category] : []);

        const article = await prisma.article.create({
            data: {
                title,
                slug,
                content,
                // excerpt, // Removed: Field does not exist in schema
                authorId,
                tags: tagsToSave, // Fixed: category -> tags array
                thumbnailUrl: imageUrl, // Fixed: imageUrl -> thumbnailUrl
                isPublished: true, // Default to published for simplicity
                createdAt: new Date(),
            },
        });

        return successResponse(res, article, 'Article created successfully', 201);
    } catch (error) {
        next(error);
    }
};

export const updateArticle = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, slug, content, excerpt, category, tags, imageUrl, isPublished } = req.body;

        const dataToUpdate = {};
        if (title) dataToUpdate.title = title;
        if (slug) dataToUpdate.slug = slug;
        if (content) dataToUpdate.content = content;
        if (imageUrl) dataToUpdate.thumbnailUrl = imageUrl;
        if (tags) dataToUpdate.tags = tags;
        if (category && !tags) dataToUpdate.tags = [category];
        if (isPublished !== undefined) dataToUpdate.isPublished = isPublished;

        const article = await prisma.article.update({
            where: { id },
            data: dataToUpdate,
        });

        return successResponse(res, article, 'Article updated successfully');
    } catch (error) {
        next(error);
    }
};

export const deleteArticle = async (req, res, next) => {
    try {
        const { id } = req.params;

        await prisma.article.delete({
            where: { id },
        });

        return successResponse(res, null, 'Article deleted successfully');
    } catch (error) {
        next(error);
    }
};

export const toggleArticlePublish = async (req, res, next) => {
    try {
        const { id } = req.params;

        const article = await prisma.article.findUnique({
            where: { id },
        });

        const updated = await prisma.article.update({
            where: { id },
            data: {
                isPublished: !article.isPublished,
                publishedAt: !article.isPublished ? new Date() : null,
            },
        });

        return successResponse(res, updated, 'Article publish status updated');
    } catch (error) {
        next(error);
    }
};

// ============================================
// USERS MANAGEMENT
// ============================================

export const getAllUsers = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, role } = req.query;
        const skip = (page - 1) * limit;

        const where = {};
        if (role) where.role = role;

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip: parseInt(skip),
                take: parseInt(limit),
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    username: true,
                    email: true,
                    name: true,
                    role: true,
                    userRole: {
                        select: { name: true }
                    },
                    phone: true,
                    isActive: true,
                    createdAt: true,
                },
            }),
            prisma.user.count({ where }),
        ]);

        const mappedUsers = users.map(user => ({
            ...user,
            role: user.userRole?.name || user.role,
            userRole: undefined // clean up response
        }));

        return paginatedResponse(res, mappedUsers, page, limit, total);
    } catch (error) {
        next(error);
    }
};

export const updateUserRole = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        const roleRecord = await prisma.role.findUnique({
            where: { name: role }
        });

        if (!roleRecord) {
            return errorResponse(res, 'Invalid role', 400);
        }

        const validEnumRoles = ['PATIENT', 'ADMIN', 'SUPER_ADMIN', 'DOCTOR', 'STAFF'];
        const enumRole = validEnumRoles.includes(role) ? role : 'STAFF';

        const user = await prisma.user.update({
            where: { id },
            data: {
                role: enumRole,
                roleId: roleRecord.id
            },
            select: {
                id: true,
                username: true,
                email: true,
                name: true,
                role: true,
                roleId: true,
            },
        });

        return successResponse(res, user, 'User role updated successfully');
    } catch (error) {
        next(error);
    }
};

export const createUser = async (req, res, next) => {
    try {
        const { username, email, password, name, role, phone, address } = req.body;

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ email }, { username }],
            },
        });

        if (existingUser) {
            return errorResponse(res, 'User with this email or username already exists', 400);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Find role by name
        const roleRecord = await prisma.role.findUnique({
            where: { name: role }
        });

        if (!roleRecord) {
            return errorResponse(res, 'Invalid role', 400);
        }

        // Check if role is valid for enum (backward compatibility)
        const validEnumRoles = ['PATIENT', 'ADMIN', 'SUPER_ADMIN', 'DOCTOR', 'STAFF', 'PKRS'];
        const enumRole = validEnumRoles.includes(role) ? role : 'STAFF';

        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
                name,
                role: enumRole,
                roleId: roleRecord.id,
                phone,
                address,
            },
            select: {
                id: true,
                username: true,
                email: true,
                name: true,
                role: true,
                roleId: true,
            },
        });

        return successResponse(res, user, 'User created successfully', 201);
    } catch (error) {
        next(error);
    }
};

export const updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, email, phone, role, isActive } = req.body;

        // Find role by name if provided
        let roleUpdateData = {};
        if (role) {
            const roleRecord = await prisma.role.findUnique({
                where: { name: role }
            });

            if (!roleRecord) {
                return errorResponse(res, 'Invalid role', 400);
            }

            const validEnumRoles = ['PATIENT', 'ADMIN', 'SUPER_ADMIN', 'DOCTOR', 'STAFF'];
            roleUpdateData = {
                role: validEnumRoles.includes(role) ? role : 'STAFF',
                roleId: roleRecord.id
            };
        }

        const user = await prisma.user.update({
            where: { id },
            data: {
                name,
                email,
                phone,
                ...roleUpdateData,
                isActive,
            },
            select: {
                id: true,
                username: true,
                email: true,
                name: true,
                role: true,
                roleId: true,
                isActive: true,
            },
        });

        return successResponse(res, user, 'User updated successfully');
    } catch (error) {
        next(error);
    }
};

export const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Prevent deleting self
        if (id === req.user.id) {
            return errorResponse(res, 'You cannot delete yourself', 400);
        }

        await prisma.user.delete({
            where: { id },
        });

        return successResponse(res, null, 'User deleted successfully');
    } catch (error) {
        next(error);
    }
};

// ============================================
// COMPLAINTS MANAGEMENT
// ============================================

export const getAllComplaintsAdmin = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, status } = req.query;
        const skip = (page - 1) * limit;

        const where = {};
        if (status) where.status = status;

        const [complaints, total] = await Promise.all([
            prisma.complaint.findMany({
                where,
                skip: parseInt(skip),
                take: parseInt(limit),
                orderBy: { createdAt: 'desc' },
            }),
            prisma.complaint.count({ where }),
        ]);

        const formattedComplaints = complaints.map(c => ({
            ...c,
            ticketNumber: `TKT-${new Date(c.createdAt).getFullYear()}-${c.id.slice(0, 4).toUpperCase()}`
        }));

        return successResponse(res, formattedComplaints);
    } catch (error) {
        next(error);
    }
};

export const respondToComplaint = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { response, status } = req.body;
        const respondedBy = req.user.id;

        const complaint = await prisma.complaint.update({
            where: { id },
            data: {
                response,
                status: status || 'RESOLVED',
                respondedBy,
                respondedAt: new Date(),
            },
        });

        return successResponse(res, complaint, 'Response submitted successfully');
    } catch (error) {
        next(error);
    }
};

export const deleteComplaint = async (req, res, next) => {
    try {
        const { id } = req.params;

        await prisma.complaint.delete({
            where: { id },
        });

        return successResponse(res, null, 'Complaint deleted successfully');
    } catch (error) {
        next(error);
    }
};

// ============================================
// SERVICES MANAGEMENT
// ============================================

export const getAllServicesAdmin = async (req, res, next) => {
    try {
        const services = await prisma.service.findMany({
            orderBy: { name: 'asc' },
        });

        return successResponse(res, services);
    } catch (error) {
        next(error);
    }
};

export const createService = async (req, res, next) => {
    try {
        const { name, slug, type, description, icon, imageUrl, facilities, isFeatured, isBookable } = req.body;

        const service = await prisma.service.create({
            data: {
                name,
                slug,
                type: type.toUpperCase(),
                description,
                icon,
                imageUrl,
                facilities,
                isFeatured: isFeatured || false,
                isBookable: isBookable !== undefined ? isBookable : true,
            },
        });

        return successResponse(res, service, 'Service created successfully', 201);
    } catch (error) {
        next(error);
    }
};

export const updateService = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const service = await prisma.service.update({
            where: { id },
            data: updateData,
        });

        return successResponse(res, service, 'Service updated successfully');
    } catch (error) {
        next(error);
    }
};

export const deleteService = async (req, res, next) => {
    try {
        const { id } = req.params;

        await prisma.service.delete({
            where: { id },
        });

        return successResponse(res, null, 'Service deleted successfully');
    } catch (error) {
        next(error);
    }
};

// ============================================
// TARIFFS MANAGEMENT
// ============================================

export const getAllTariffs = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, category, search } = req.query;
        const skip = (page - 1) * limit;

        const where = {};
        if (category) where.category = category;
        if (search) {
            where.name = { contains: search, mode: 'insensitive' };
        }

        const [tariffs, total] = await Promise.all([
            prisma.tariff.findMany({
                where,
                skip: parseInt(skip),
                take: parseInt(limit),
                orderBy: { name: 'asc' },
            }),
            prisma.tariff.count({ where }),
        ]);

        return paginatedResponse(res, tariffs, page, limit, total);
    } catch (error) {
        next(error);
    }
};

export const createTariff = async (req, res, next) => {
    try {
        const { name, category, price1, price2, price3, priceVip, priceFlat, isFlat, unit } = req.body;

        const tariff = await prisma.tariff.create({
            data: {
                name,
                category,
                price1: price1 ? parseFloat(price1) : null,
                price2: price2 ? parseFloat(price2) : null,
                price3: price3 ? parseFloat(price3) : null,
                priceVip: priceVip ? parseFloat(priceVip) : null,
                priceFlat: priceFlat ? parseFloat(priceFlat) : null,
                isFlat: Boolean(isFlat),
                unit,
            },
        });

        return successResponse(res, tariff, 'Tariff created successfully', 201);
    } catch (error) {
        next(error);
    }
};

export const updateTariff = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const tariff = await prisma.tariff.update({
            where: { id },
            data: updateData,
        });

        return successResponse(res, tariff, 'Tariff updated successfully');
    } catch (error) {
        next(error);
    }
};

export const deleteTariff = async (req, res, next) => {
    try {
        const { id } = req.params;

        await prisma.tariff.delete({
            where: { id },
        });

        return successResponse(res, null, 'Tariff deleted successfully');
    } catch (error) {
        next(error);
    }
};

// ============================================
// TRAININGS MANAGEMENT
// ============================================

export const getAllTrainingsAdmin = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const [trainings, total] = await Promise.all([
            prisma.trainingProgram.findMany({
                skip: parseInt(skip),
                take: parseInt(limit),
                orderBy: { createdAt: 'desc' },
            }),
            prisma.trainingProgram.count(),
        ]);

        return paginatedResponse(res, trainings, page, limit, total);
    } catch (error) {
        next(error);
    }
};

export const createTraining = async (req, res, next) => {
    try {
        const { title, slug, description, trainer, startDate, endDate, location, maxParticipants, fee, imageUrl } = req.body;

        const training = await prisma.trainingProgram.create({
            data: {
                title,
                slug,
                description,
                trainer,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                location,
                maxParticipants: parseInt(maxParticipants),
                fee: parseFloat(fee),
                imageUrl,
            },
        });

        return successResponse(res, training, 'Training created successfully', 201);
    } catch (error) {
        next(error);
    }
};

export const updateTraining = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);
        if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);

        const training = await prisma.trainingProgram.update({
            where: { id },
            data: updateData,
        });

        return successResponse(res, training, 'Training updated successfully');
    } catch (error) {
        next(error);
    }
};

export const deleteTraining = async (req, res, next) => {
    try {
        const { id } = req.params;

        await prisma.trainingProgram.delete({
            where: { id },
        });

        return successResponse(res, null, 'Training deleted successfully');
    } catch (error) {
        next(error);
    }
};