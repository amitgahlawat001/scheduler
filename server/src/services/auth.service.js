const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { BCRYPT_COST, ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY } = require('../config/constants');
const ApiError = require('../utils/ApiError');

function hashPassword(plain) {
  return bcrypt.hash(plain, BCRYPT_COST);
}

function comparePassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

function issueTokens(userId) {
  const accessToken = jwt.sign({ sub: userId }, env.JWT_ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
  const refreshToken = jwt.sign({ sub: userId }, env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
  return { accessToken, refreshToken };
}

function verifyAccessToken(token) {
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
    return { userId: payload.sub };
  } catch (err) {
    throw new ApiError(401, 'UNAUTHORIZED', 'Invalid or expired access token');
  }
}

function verifyRefreshToken(token) {
  try {
    const payload = jwt.verify(token, env.JWT_REFRESH_SECRET);
    return { userId: payload.sub };
  } catch (err) {
    throw new ApiError(401, 'INVALID_REFRESH_TOKEN', 'Invalid or expired refresh token');
  }
}

module.exports = { hashPassword, comparePassword, issueTokens, verifyAccessToken, verifyRefreshToken };
