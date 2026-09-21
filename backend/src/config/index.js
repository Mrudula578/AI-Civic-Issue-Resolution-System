import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const config = {
  // Server
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',

  // Database
  databaseUrl: process.env.DATABASE_URL,

  // JWT
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
    refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  },

  // File Upload
  upload: {
    dir: process.env.UPLOAD_DIR || './uploads',
    maxFileSizeMB: parseInt(process.env.MAX_FILE_SIZE_MB) || 5,
    maxFilesPerComplaint: parseInt(process.env.MAX_FILES_PER_COMPLAINT) || 3,
  },

  // Storage
  storage: {
    provider: process.env.STORAGE_PROVIDER || 'local',
  },
};

// Validate required environment variables
const requiredVars = [
  'DATABASE_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
];

const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => {
    console.error(`   - ${varName}`);
  });
  console.error('\nPlease check your .env file and ensure all required variables are set.');
  process.exit(1);
}

// Validate JWT secrets are strong enough
if (config.jwt.accessSecret.length < 32) {
  console.error('❌ JWT_ACCESS_SECRET must be at least 32 characters long');
  process.exit(1);
}

if (config.jwt.refreshSecret.length < 32) {
  console.error('❌ JWT_REFRESH_SECRET must be at least 32 characters long');
  process.exit(1);
}

export default config;