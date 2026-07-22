const User = require('../models/User.model');
const authService = require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const env = require('../config/env');
const { REFRESH_TOKEN_EXPIRY_MS } = require('../config/constants');

function setRefreshCookie(res, token) {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: REFRESH_TOKEN_EXPIRY_MS
  });
}

function toPublicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    bio: user.bio,
    photoUrl: user.photoUrl,
    publicDisplayName: user.publicDisplayName
  };
}

const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, 'EMAIL_ALREADY_EXISTS', 'An account with this email already exists.');

  const passwordHash = await authService.hashPassword(password);
  const user = await User.create({ name, email, passwordHash });

  const { accessToken, refreshToken } = authService.issueTokens(user._id.toString());
  setRefreshCookie(res, refreshToken);

  res.status(201).json({ success: true, data: { user: toPublicUser(user), accessToken } });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email, isDeleted: false });
  const valid = user ? await authService.comparePassword(password, user.passwordHash) : false;
  if (!valid) throw new ApiError(401, 'INVALID_CREDENTIALS', 'Incorrect email or password.');

  const { accessToken, refreshToken } = authService.issueTokens(user._id.toString());
  setRefreshCookie(res, refreshToken);

  res.status(200).json({ success: true, data: { user: toPublicUser(user), accessToken } });
});

const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) throw new ApiError(401, 'INVALID_REFRESH_TOKEN', 'No refresh token provided.');

  const { userId } = authService.verifyRefreshToken(token);
  const { accessToken, refreshToken } = authService.issueTokens(userId);
  setRefreshCookie(res, refreshToken);

  res.status(200).json({ success: true, data: { accessToken } });
});

const logout = asyncHandler(async (req, res) => {
  res.clearCookie('refreshToken');
  res.status(200).json({ success: true, data: { message: 'Logged out.' } });
});

const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user || user.isDeleted) throw new ApiError(401, 'UNAUTHORIZED', 'User not found.');

  res.status(200).json({ success: true, data: { user: toPublicUser(user) } });
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw new ApiError(401, 'UNAUTHORIZED', 'User not found.');

  Object.assign(user, req.body);
  await user.save();

  res.status(200).json({ success: true, data: { user: toPublicUser(user) } });
});

module.exports = { signup, login, refresh, logout, me, updateProfile };
