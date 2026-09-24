import User from '../models/User.js';
import Hospital from '../models/Hospital.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const getUsers = async (req, res, next) => {
  try {
    const { role, hospital, status, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (role) query.role = role;
    if (hospital) query.hospital = hospital;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .populate('hospital', 'name hospitalId city')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    return successResponse(res, 200, 'Users retrieved successfully.', users, {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    });
  } catch (error) {
    next(error);
  }
};

export const getCollectors = async (req, res, next) => {
  try {
    const collectors = await User.find({ role: 'collector', status: 'active' })
      .select('name email phone status')
      .sort({ name: 1 });

    return successResponse(res, 200, 'Collectors retrieved.', collectors);
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('hospital', 'name hospitalId city');
    if (!user) {
      return errorResponse(res, 404, 'User not found.');
    }
    return successResponse(res, 200, 'User retrieved.', user);
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, phone, role, hospital, status } = req.body;

    if (!name || !email || !password) {
      return errorResponse(res, 400, 'Please provide name, email and password.');
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return errorResponse(res, 400, 'User with this email already exists.');
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone: phone || '',
      role: role || 'hospital_staff',
      hospital: role === 'hospital_staff' ? hospital : null,
      status: status || 'active',
    });

    const populated = await User.findById(user._id).populate('hospital', 'name hospitalId');

    return successResponse(res, 201, 'User created successfully.', populated);
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    let user = await User.findById(req.params.id);
    if (!user) {
      return errorResponse(res, 404, 'User not found.');
    }

    const { name, phone, role, hospital, status, password } = req.body;

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (role) user.role = role;
    if (hospital !== undefined) user.hospital = role === 'hospital_staff' ? hospital : null;
    if (status) user.status = status;
    if (password && password.length >= 6) {
      user.password = password;
    }

    await user.save();

    const populated = await User.findById(user._id).populate('hospital', 'name hospitalId');
    return successResponse(res, 200, 'User updated successfully.', populated);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return errorResponse(res, 404, 'User not found.');
    }

    // Prevent deleting own account
    if (user._id.toString() === req.user._id.toString()) {
      return errorResponse(res, 400, 'You cannot delete your own account.');
    }

    await User.findByIdAndDelete(req.params.id);
    return successResponse(res, 200, 'User deleted successfully.');
  } catch (error) {
    next(error);
  }
};
