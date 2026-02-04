// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();

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

// Exportable function
export async function seedRoleMenus(prisma) {
    console.log('Seeding Roles and Role Menus...');

    const rolesData = [
        {
            name: 'SUPER_ADMIN',
            description: 'Super Administrator with full access',
            menus: allMenus
        },
        {
            name: 'ADMIN',
            description: 'Administrator',
            menus: allMenus
        },
        {
            name: 'DOCTOR',
            description: 'Medical Doctor',
            menus: [
                "/admin/dashboard",
                "/admin/appointments",
                "/admin/articles",
                "/admin/consultations"
            ]
        },
        {
            name: 'STAFF',
            description: 'Hospital Staff',
            menus: [
                "/admin/dashboard",
                "/admin/appointments",
                "/admin/complaints",
                "/admin/inpatient-rooms"
            ]
        },
        {
            name: 'PATIENT',
            description: 'Patient User',
            menus: [] // Patients typically don't have admin menus
        }
    ];

    for (const r of rolesData) {
        // 1. Create Role
        const roleRecord = await prisma.role.upsert({
            where: { name: r.name },
            update: {},
            create: {
                name: r.name,
                description: r.description
            }
        });

        // 2. Create RoleMenu
        if (r.menus.length > 0) {
            await prisma.roleMenu.upsert({
                where: { role: r.name },
                update: {
                    menus: r.menus,
                    roleId: roleRecord.id
                },
                create: {
                    role: r.name,
                    roleId: roleRecord.id,
                    menus: r.menus
                }
            });
        }
    }

    console.log('Roles and Role Menus seeded successfully.');
}
