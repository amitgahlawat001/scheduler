const ApiError = require('../utils/ApiError');
const authService = require('../services/auth.service');

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return next(new ApiError(401, 'UNAUTHORIZED', 'Missing or malformed Authorization header'));
  }
  try {
    const { userId } = authService.verifyAccessToken(token);
    req.user = { id: userId };
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = authMiddleware;
