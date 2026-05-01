const AuthService = require('../services/auth.service');
const UserService = require('../services/user.service');
const FileService = require('../services/file.service');

/**
 * Admin controllers.
 */
const adminController = {
  /**
   * POST /api/admin/login
   */
  login: async (req, res) => {
    const { username, password } = req.body;
    const result = await AuthService.adminLogin({ username, password });
    res.json(result);
  },

  /**
   * GET /api/admin/users
   */
  getUsers: async (_req, res) => {
    const users = await UserService.getAllUsers();
    res.json(users);
  },

  /**
   * GET /api/admin/stats
   */
  getStats: async (_req, res) => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [totalUsers, fileCounts, recentUsers, recentFiles] =
      await Promise.all([
        UserService.countUsers({ role: 'user' }),
        FileService.getFileCounts(),
        UserService.countUsers({
          role: 'user',
          createdAt: { $gte: thirtyDaysAgo },
        }),
        FileService.countRecentFiles(thirtyDaysAgo),
      ]);

    res.json({
      totalUsers,
      totalFiles: fileCounts.total,
      totalFilesCompleted: fileCounts.completed,
      totalFilesFailed: fileCounts.failed,
      recentUsers,
      recentFiles,
      successRate:
        fileCounts.total > 0
          ? ((fileCounts.completed / fileCounts.total) * 100).toFixed(2)
          : 0,
    });
  },

  /**
   * GET /api/admin/files
   */
  getFiles: async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const result = await FileService.getAllFiles({ page, limit });
    res.json(result);
  },
};

module.exports = adminController;
