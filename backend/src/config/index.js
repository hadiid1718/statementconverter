const path = require('path');

const config = {
  PORT: parseInt(process.env.PORT, 10) || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // MongoDB
  MONGODB_URI: process.env.MONGODB_URI,

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'dev_secret',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  // File upload
  UPLOAD_DIR: path.join(__dirname, '..', '..', 'uploads'),
  ALLOWED_FILE_TYPES: ['application/pdf'],
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024, // 5MB

  // CORS
  ALLOWED_ORIGINS: [
    'http://localhost:5173',
    'http://localhost:5174',
    process.env.FRONTEND_URL,
  ].filter(Boolean),

  // Hardcoded admin (fallback)
  ADMIN_USERNAME: process.env.ADMIN_USERNAME || 'Admin',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || '@admin#5656',
};

// Validate required config at startup
const requiredVars = ['MONGODB_URI'];
for (const key of requiredVars) {
  if (!config[key]) {
    console.error(`❌ Missing required env variable: ${key}`);
    process.exit(1);
  }
}

module.exports = Object.freeze(config);
