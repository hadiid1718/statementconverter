const express = require('express');
const cors = require('cors');
const config = require('./config');
const routes = require('./routes');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');
const ApiError = require('./utils/ApiError');

/**
 * Create and configure the Express application.
 * Separated from server.js so the app can be imported for testing.
 */
const createApp = () => {
  const app = express();

  // --- Global middleware ---

  // CORS
  app.use(
    cors({
      origin(origin, callback) {
        // Allow requests with no origin (curl, mobile apps, etc.)
        if (!origin) return callback(null, true);
        if (config.ALLOWED_ORIGINS.includes(origin)) {
          return callback(null, true);
        }
        console.warn('Blocked CORS origin:', origin);
        return callback(new Error('Not allowed by CORS'));
      },
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Body parser
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Request logging
  app.use(requestLogger);

  // --- Routes ---
  app.get('/', (_req, res) => {
    res.json({ message: 'Bank Statement Converter API is running' });
  });

  app.use('/api', routes);

  // --- 404 handler ---
  app.use((req, _res, next) => {
    next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
  });

  // --- Global error handler (must be last) ---
  app.use(errorHandler);

  return app;
};

module.exports = createApp;
