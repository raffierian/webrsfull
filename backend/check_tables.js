import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Connecting to database...');
    // Query raw SQL to list tables
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE';
    `;
    
    console.log('Tables found in database "rssoewandhie":');
    console.table(tables);
    
    const userCount = await prisma.user.count();
    console.log(`\nTotal Users: ${userCount}`);
    
  } catch (e) {
    console.error('Error connecting to database:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
