import { errorResponse } from '../utils/apiResponse.js';

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 401, 'Authentication required.');
    }

    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res,
        403,
        `Role (${req.user.role}) is not authorized to access this resource. Required role(s): ${roles.join(', ')}`
      );
    }

    next();
  };
};
