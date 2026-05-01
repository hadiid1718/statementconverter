const jwt = require('jsonwebtoken');
const config = require('../config');
const ApiError = require('../utils/ApiError');

/**
 * Middleware: Authenticate user via JWT Bearer token.
 * Attaches decoded payload to req.user.
 */
const auth = (req, res, next) => {
  const authHeader = req.headers.authorization || '';

  if (!authHeader.startsWith('Bearer ')) {
    throw ApiError.unauthorized('No token provided');
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.user = decoded; // { id, email, role? }
    next();
  } catch (err) {
    throw ApiError.unauthorized('Invalid or expired token');
  }
};

module.exports = auth;
