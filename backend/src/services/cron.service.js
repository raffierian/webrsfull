import prisma from '../config/database.js';

export const startCronJobs = () => {
    console.log('🔄 Cron jobs initialized...');

    // Run every 10 minutes (600,000 ms)
    setInterval(async () => {
        try {
            const oneHourAgo = new Date(new Date().getTime() - 60 * 60 * 1000);

            // Find stale sessions
            const staleSessions = await prisma.chatSession.findMany({
                where: {
                    status: 'OPEN',
                    isPaid: false,
                    createdAt: {
                        lt: oneHourAgo
                    }
                }
            });

            if (staleSessions.length > 0) {
                console.log(`🧹 Found ${staleSessions.length} stale sessions. Cancelling...`);

                const { count } = await prisma.chatSession.updateMany({
                    where: {
                        id: { in: staleSessions.map(s => s.id) }
                    },
                    data: {
                        status: 'CANCELLED'
                    }
                });

                console.log(`✅ Cancelled ${count} stale sessions.`);
            }
        } catch (error) {
            console.error('❌ Error in auto-cancel cron job:', error);
        }
    }, 10 * 60 * 1000); // 10 Minutes
};
