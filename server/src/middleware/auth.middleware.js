import { verifyAccessToken } from '../utils/jwt.utils.js';
import User from '../models/User.model.js';
import { errorResponse } from '../utils/apiResponse.js';

/**
 * Protect routes — requires valid JWT access token
 * Attaches req.user from database
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return errorResponse(res, 'Not authenticated. Please log in.', 401);
    }

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id);

    if (!user) {
      return errorResponse(res, 'User belonging to this token no longer exists.', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Access token expired. Please refresh.', 401);
    }
    return errorResponse(res, 'Invalid token. Please log in again.', 401);
  }
};

/**
 * Restrict routes to admin users only
 */
export const adminOnly = (req, res, next) => {
  if (!req.user?.isAdmin) {
    return errorResponse(res, 'Access denied. Admins only.', 403);
  }
  next();
};
