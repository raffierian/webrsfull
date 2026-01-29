import prisma from './src/config/database.js';
async function test() {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            username: true,
            email: true,
            name: true,
            role: true
        }
    });
    console.log(JSON.stringify(users, null, 2));
}
test().catch(console.error).finally(() => prisma.$disconnect());
