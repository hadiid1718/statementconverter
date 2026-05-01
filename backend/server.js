/**
 * Server entry point.
 * Loads env, connects to DB, then starts listening.
 */
require('dotenv').config();

const config = require('./src/config');
const { connectDB } = require('./src/config/database');
const createApp = require('./src/app');

const start = async () => {
  // Connect to MongoDB first
  await connectDB();

  // Create Express app
  const app = createApp();

  // Start listening
  app.listen(config.PORT, () => {
    console.log(` Server running on port ${config.PORT} [${config.NODE_ENV}]`);
    console.log(`http://localhost:${config.PORT}`);
  });

  // Graceful shutdown
  const shutdown = async (signal) => {
    console.log(`\n${signal} received — shutting down gracefully...`);
    const { disconnectDB } = require('./src/config/database');
    await disconnectDB();
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('unhandledRejection', (err) => {
    console.error('Unhandled rejection:', err);
  });
};

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
