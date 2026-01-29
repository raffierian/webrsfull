import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaultRoles = [
    { name: 'SUPER_ADMIN', description: 'Super Administrator with full access' },
    { name: 'ADMIN', description: 'Administrator' },
    { name: 'DOCTOR', description: 'Medical Doctor' },
    { name: 'STAFF', description: 'Hospital Staff' },
    { name: 'PATIENT', description: 'Registered Patient' },
];

async function main() {
    console.log('Starting Role Migration...');

    // 1. Create Default Roles
    console.log('Creating default roles...');
    for (const role of defaultRoles) {
        await prisma.role.upsert({
            where: { name: role.name },
            update: {},
            create: role,
        });
    }
    console.log('Default roles created.');

    // 2. Migrate Users
    console.log('Migrating users...');
    const users = await prisma.user.findMany({
        where: { roleId: null }, // Only migrate users without roleId
    });

    for (const user of users) {
        if (user.role) {
            const role = await prisma.role.findUnique({
                where: { name: user.role },
            });

            if (role) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { roleId: role.id },
                });
            }
        }
    }
    console.log(`Migrated ${users.length} users.`);

    // 3. Migrate Role Menus
    console.log('Migrating role menus...');
    const roleMenus = await prisma.roleMenu.findMany({
        where: { roleId: null },
    });

    for (const rm of roleMenus) {
        if (rm.role) {
            const role = await prisma.role.findUnique({
                where: { name: rm.role },
            });

            if (role) {
                // Check if a RoleMenu already exists for this roleId (to avoid unique constraint error)
                const existing = await prisma.roleMenu.findUnique({
                    where: { roleId: role.id }
                });

                if (!existing) {
                    await prisma.roleMenu.update({
                        where: { id: rm.id },
                        data: { roleId: role.id },
                    });
                } else {
                    // If exists, maybe merge menus or just skip? 
                    // For now, let's update the existing one with the menus from the old one if needed, 
                    // but simpler to just delete the old one if we can't link it.
                    // Actually, let's just update the old one to link to roleId if possible.
                    // But roleId is unique in RoleMenu.
                    console.log(`RoleMenu for ${rm.role} already exists via roleId, skipping link.`);
                }
            }
        }
    }
    console.log(`Migrated ${roleMenus.length} role menus.`);

    console.log('Migration completed successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
