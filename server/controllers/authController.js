import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Hospital from '../models/Hospital.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'meditrackx_fallback_secret', {
    expiresIn: '7d',
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public (or Admin for staff/collectors)
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role, hospitalId } = req.body;

    if (!name || !email || !password) {
      return errorResponse(res, 400, 'Please provide name, email, and password');
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return errorResponse(res, 400, 'An account with this email address already exists.');
    }

    let hospitalObjectId = null;
    if (role === 'hospital_staff') {
      if (!hospitalId) {
        return errorResponse(res, 400, 'Hospital selection is required for hospital staff accounts.');
      }
      const foundHospital = await Hospital.findById(hospitalId);
      if (!foundHospital) {
        return errorResponse(res, 404, 'Selected hospital does not exist.');
      }
      hospitalObjectId = foundHospital._id;
    }

    // Role restrictions: only existing admins can create another admin or collector
    let assignedRole = role || 'hospital_staff';
    if (assignedRole === 'admin') {
      // Check if any admin exists in the system. If users exist, require admin auth.
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount > 0 && (!req.user || req.user.role !== 'admin')) {
        return errorResponse(res, 403, 'Only existing administrators can create admin accounts.');
      }
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone: phone || '',
      role: assignedRole,
      hospital: hospitalObjectId,
      status: 'active',
    });

    const token = generateToken(user._id);

    return successResponse(res, 201, 'User account registered successfully.', {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        hospital: user.hospital,
        status: user.status,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 400, 'Please provide both email and password.');
    }

    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+password')
      .populate('hospital', 'name hospitalId city state address');

    if (!user) {
      return errorResponse(res, 401, 'Invalid email or password.');
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return errorResponse(res, 401, 'Invalid email or password.');
    }

    if (user.status !== 'active') {
      return errorResponse(res, 403, 'Your account is deactivated. Please contact your administrator.');
    }

    const token = generateToken(user._id);

    return successResponse(res, 200, 'Login successful.', {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        hospital: user.hospital,
        status: user.status,
      },
      token,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged in user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('hospital', 'name hospitalId city state address contactPerson phone');
    if (!user) {
      return errorResponse(res, 404, 'User not found.');
    }

    return successResponse(res, 200, 'Profile retrieved.', { user });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, password } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return errorResponse(res, 404, 'User not found.');
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (password) {
      if (password.length < 6) {
        return errorResponse(res, 400, 'Password must be at least 6 characters.');
      }
      user.password = password;
    }

    await user.save();

    return successResponse(res, 200, 'Profile updated successfully.', {
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        hospital: user.hospital,
        status: user.status,
      },
    });
  } catch (error) {
    next(error);
  }
};
