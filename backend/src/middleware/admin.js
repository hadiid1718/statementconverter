const jwt = require('jsonwebtoken');
const config = require('../config');
const ApiError = require('../utils/ApiError');

/**
 * Middleware: Authenticate admin via JWT Bearer token.
 * The token must contain role === 'admin'.
 * Attaches decoded payload to req.admin.
 */
const admin = (req, res, next) => {
  const authHeader = req.headers.authorization || '';

  if (!authHeader.startsWith('Bearer ')) {
    throw ApiError.unauthorized('No admin token provided');
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);

    if (decoded.role !== 'admin') {
      throw ApiError.forbidden('Admin access required');
    }

    req.admin = decoded;
    next();
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw ApiError.unauthorized('Invalid or expired admin token');
  }
};

module.exports = admin;
