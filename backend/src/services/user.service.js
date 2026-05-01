const User = require('../models/User');

class UserService {
  /**
   * Get all non-admin users, sorted by newest first.
   */
  static async getAllUsers() {
    const users = await User.find({ role: 'user' }).sort({ createdAt: -1 });

    return users.map((user, index) => ({
      id: user._id,
      number: index + 1,
      email: user.email,
      fullName: user.fullName,
      filesConverted: user.filesConverted,
      createdAt: user.createdAt,
    }));
  }

  /**
   * Increment the filesConverted count for a user.
   */
  static async incrementFileCount(userId) {
    return User.findByIdAndUpdate(
      userId,
      { $inc: { filesConverted: 1 } },
      { new: true }
    );
  }

  /**
   * Count users matching a filter.
   */
  static async countUsers(filter = {}) {
    return User.countDocuments(filter);
  }
}

module.exports = UserService;
