/**
 * Wraps an async route handler so thrown errors are forwarded to Express error handler.
 * Eliminates repetitive try-catch blocks in every controller.
 *
 * Usage: router.get('/path', asyncHandler(myController));
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
