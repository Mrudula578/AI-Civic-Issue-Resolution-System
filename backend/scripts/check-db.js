import { PrismaClient } from '@prisma/client';
import config from '../src/config/index.js';

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('🔍 Checking database connection...');
    console.log('📍 Database URL:', config.databaseUrl?.replace(/\/\/.*@/, '//***@')); // Hide credentials
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database query test successful:', result);
    
    // Check if tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    if (tables.length > 0) {
      console.log('📋 Existing tables:', tables.map(t => t.table_name).join(', '));
    } else {
      console.log('📋 No tables found - database needs migration');
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('   Error:', error.message);
    
    if (error.code === 'P1001') {
      console.log('\n💡 Troubleshooting tips:');
      console.log('   1. Make sure PostgreSQL is installed and running');
      console.log('   2. Check if the service is started');
      console.log('   3. Verify the DATABASE_URL in .env file');
      console.log('   4. See docs/DATABASE_SETUP.md for setup instructions');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();