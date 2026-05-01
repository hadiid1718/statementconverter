const AuthService = require('../services/auth.service');

/**
 * Auth controllers — thin HTTP handlers.
 * All business logic lives in AuthService.
 */
const authController = {
  /**
   * POST /api/auth/register
   */
  register: async (req, res) => {
    const { email, password, fullName } = req.body;
    const result = await AuthService.register({ email, password, fullName });
    res.status(201).json(result);
  },

  /**
   * POST /api/auth/login
   */
  login: async (req, res) => {
    const { email, password } = req.body;
    const result = await AuthService.login({ email, password });
    res.json(result);
  },

  /**
   * GET /api/auth/me
   */
  me: async (req, res) => {
    const user = await AuthService.getCurrentUser(req.user.id);
    res.json(user);
  },

  /**
   * POST /api/auth/logout
   */
  logout: (_req, res) => {
    res.json({ message: 'Logged out' });
  },
};

module.exports = authController;
