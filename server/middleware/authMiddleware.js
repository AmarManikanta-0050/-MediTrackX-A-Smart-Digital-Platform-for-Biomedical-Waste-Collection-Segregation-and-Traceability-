import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { errorResponse } from '../utils/apiResponse.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'meditrackx_fallback_secret');

      const user = await User.findById(decoded.id).populate('hospital', 'name hospitalId city');
      if (!user) {
        return errorResponse(res, 401, 'User account not found or has been deactivated.');
      }

      if (user.status !== 'active') {
        return errorResponse(res, 403, 'Your account is currently inactive. Please contact system administration.');
      }

      req.user = user;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return errorResponse(res, 401, 'Session has expired. Please log in again.');
      }
      return errorResponse(res, 401, 'Authentication token is invalid. Please log in again.');
    }
  } else {
    return errorResponse(res, 401, 'Access denied. Authorization token required.');
  }
};
