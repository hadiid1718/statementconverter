const jwt = require('jsonwebtoken');
const config = require('../config');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

class AuthService {
  /**
   * Generate a JWT for a given user/admin payload.
   */
  static generateToken(payload) {
    return jwt.sign(payload, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRES_IN,
    });
  }

  /**
   * Register a new user.
   * @returns {{ user: object, token: string }}
   */
  static async register({ email, password, fullName }) {
    if (!email || !password) {
      throw ApiError.badRequest('Email and password are required');
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      throw ApiError.conflict('Email already registered');
    }

    const hashedPassword = await User.hashPassword(password);

    const user = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      fullName: fullName || email.split('@')[0],
    });

    const token = AuthService.generateToken({
      id: user._id,
      email: user.email,
    });

    return { user: user.toSafeObject(), token };
  }

  /**
   * Login a user with email + password.
   * @returns {{ user: object, token: string }}
   */
  static async login({ email, password }) {
    if (!email || !password) {
      throw ApiError.badRequest('Email and password are required');
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      '+password'
    );
    if (!user) {
      throw ApiError.unauthorized('Invalid credentials');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid credentials');
    }

    const token = AuthService.generateToken({
      id: user._id,
      email: user.email,
    });

    return { user: user.toSafeObject(), token };
  }

  /**
   * Admin login: supports email-based (from DB) and hardcoded username fallback.
   * @returns {{ admin: object, token: string }}
   */
  static async adminLogin({ username, password }) {
    if (!username || !password) {
      throw ApiError.badRequest('Username/email and password are required');
    }

    // --- Email-based admin login (database) ---
    if (username.includes('@')) {
      const admin = await User.findOne({
        email: username.toLowerCase(),
        role: 'admin',
      }).select('+password');

      if (admin) {
        const isMatch = await admin.comparePassword(password);
        if (isMatch) {
          const token = AuthService.generateToken({
            id: admin._id,
            email: admin.email,
            role: 'admin',
          });
          return {
            admin: {
              id: admin._id,
              username: admin.fullName,
              email: admin.email,
              role: 'admin',
            },
            token,
          };
        }
      }
    }

    // --- Hardcoded admin fallback ---
    if (
      username === config.ADMIN_USERNAME &&
      password === config.ADMIN_PASSWORD
    ) {
      const token = AuthService.generateToken({
        id: 'admin',
        username: config.ADMIN_USERNAME,
        role: 'admin',
      });
      return {
        admin: {
          id: 'admin',
          username: config.ADMIN_USERNAME,
          role: 'admin',
        },
        token,
      };
    }

    throw ApiError.unauthorized('Invalid admin credentials');
  }

  /**
   * Get current user by id (no password).
   */
  static async getCurrentUser(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    return user.toSafeObject();
  }
}

module.exports = AuthService;
