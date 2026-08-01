import crypto from 'crypto';
import nodemailer from 'nodemailer';
import User from '../models/User.model.js';
import Profile from '../models/Profile.model.js';
import { generateTokenPair, verifyRefreshToken } from '../utils/jwt.utils.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

// ─── Signup ───────────────────────────────────────────────────────────────────
export const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return errorResponse(res, 'Email already registered. Please log in.', 409);

    const user = await User.create({ name, email, password });

    // Create a default profile for the new user
    await Profile.create({ user: user._id, name, avatarColor: '#0a84ff' });

    const { accessToken, refreshToken } = generateTokenPair(user._id);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return successResponse(res, {
      accessToken,
      refreshToken,
      user: { id: user._id, name: user.name, email: user.email, subscription: user.subscription },
    }, 'Account created successfully', 201);
  } catch (err) {
    next(err);
  }
};

// ─── Login ────────────────────────────────────────────────────────────────────
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password +refreshToken');
    if (!user || !(await user.comparePassword(password))) {
      return errorResponse(res, 'Invalid email or password', 401);
    }

    const { accessToken, refreshToken } = generateTokenPair(user._id);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    const profiles = await Profile.find({ user: user._id }).select('name avatar avatarColor isKids');

    return successResponse(res, {
      accessToken,
      refreshToken,
      user: { id: user._id, name: user.name, email: user.email, subscription: user.subscription },
      profiles,
    }, 'Login successful');
  } catch (err) {
    next(err);
  }
};

// ─── Refresh Token ────────────────────────────────────────────────────────────
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) return errorResponse(res, 'Refresh token required', 400);

    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== token) {
      return errorResponse(res, 'Invalid or expired refresh token', 401);
    }

    const { accessToken, refreshToken: newRefresh } = generateTokenPair(user._id);
    user.refreshToken = newRefresh;
    await user.save({ validateBeforeSave: false });

    return successResponse(res, { accessToken, refreshToken: newRefresh }, 'Token refreshed');
  } catch (err) {
    if (err.name === 'TokenExpiredError') return errorResponse(res, 'Session expired. Please log in again.', 401);
    next(err);
  }
};

// ─── Logout ───────────────────────────────────────────────────────────────────
export const logout = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null }, { validateBeforeSave: false });
    return successResponse(res, null, 'Logged out successfully');
  } catch (err) {
    next(err);
  }
};

// ─── Forgot Password ──────────────────────────────────────────────────────────
export const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    // Always return success to prevent email enumeration
    if (!user) return successResponse(res, null, 'If that email exists, a reset link has been sent.');

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      });

      await transporter.sendMail({
        from: `"EMoSports" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Password Reset — EMoSports',
        html: `<p>You requested a password reset. <a href="${resetUrl}">Click here to reset</a>. Link expires in 10 minutes.</p>`,
      });
    } else {
      // Dev mode: log the token so devs can test without email setup
      console.log(`[DEV] Password reset token for ${user.email}: ${resetToken}`);
    }

    return successResponse(res, null, 'If that email exists, a reset link has been sent.');
  } catch (err) {
    next(err);
  }
};

// ─── Reset Password ───────────────────────────────────────────────────────────
export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) return errorResponse(res, 'Reset token is invalid or has expired', 400);

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshToken = undefined;
    await user.save();

    return successResponse(res, null, 'Password reset successfully. Please log in.');
  } catch (err) {
    next(err);
  }
};

// ─── Get Current User ─────────────────────────────────────────────────────────
export const getMe = async (req, res) => {
  const profiles = await Profile.find({ user: req.user._id }).select('name avatar avatarColor isKids');
  return successResponse(res, {
    user: { id: req.user._id, name: req.user.name, email: req.user.email, subscription: req.user.subscription },
    profiles,
  });
};
