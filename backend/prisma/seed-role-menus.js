import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const allMenus = [
    "/admin/dashboard",
    "/admin/content",
    "/admin/appointments",
    "/admin/articles",
    "/admin/services",
    "/admin/doctors",
    "/admin/tariffs",
    "/admin/inpatient-rooms",
    "/admin/complaints",
    "/admin/ppid",
    "/admin/training",
    "/admin/pkrs",
    "/admin/survey",
    "/admin/careers",
    "/admin/users",
    "/admin/role-menus",
    "/admin/settings",
];

async function main() {
    console.log('Seeding Role Menus...');

    // Grant ADMIN access to everything by default
    await prisma.roleMenu.upsert({
        where: { role: 'ADMIN' },
        update: { menus: allMenus },
        create: { role: 'ADMIN', menus: allMenus },
    });

    // Grant DOCTOR access to specific menus
    await prisma.roleMenu.upsert({
        where: { role: 'DOCTOR' },
        update: {}, // Don't overwrite if exists
        create: {
            role: 'DOCTOR',
            menus: [
                "/admin/dashboard",
                "/admin/appointments",
                "/admin/articles",
                "/admin/consultations"
            ]
        },
    });

    // Grant STAFF access to specific menus
    await prisma.roleMenu.upsert({
        where: { role: 'STAFF' },
        update: {}, // Don't overwrite if exists
        create: {
            role: 'STAFF',
            menus: [
                "/admin/dashboard",
                "/admin/appointments",
                "/admin/complaints",
                "/admin/inpatient-rooms"
            ]
        },
    });

    console.log('Role Menus seeded successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
