import Hospital from '../models/Hospital.js';
import { generateHospitalId } from '../utils/generateId.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * @desc    Get all hospitals
 * @route   GET /api/hospitals
 * @access  Public (for registration select) or Authenticated
 */
export const getHospitals = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { hospitalId: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
      ];
    }

    const hospitals = await Hospital.find(query).sort({ createdAt: -1 });

    return successResponse(res, 200, 'Hospitals retrieved successfully.', hospitals);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single hospital by ID
 * @route   GET /api/hospitals/:id
 * @access  Private
 */
export const getHospitalById = async (req, res, next) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return errorResponse(res, 404, 'Hospital not found.');
    }

    // Role check: Hospital staff can only view their own hospital
    if (req.user.role === 'hospital_staff' && req.user.hospital?.toString() !== hospital._id.toString()) {
      return errorResponse(res, 403, 'Unauthorized access to other hospital records.');
    }

    return successResponse(res, 200, 'Hospital retrieved successfully.', hospital);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new hospital
 * @route   POST /api/hospitals
 * @access  Private (Admin only)
 */
export const createHospital = async (req, res, next) => {
  try {
    const { name, hospitalId, address, city, state, phone, email, contactPerson, status } = req.body;

    const idToUse = hospitalId ? hospitalId.toUpperCase().trim() : generateHospitalId();

    const existing = await Hospital.findOne({ hospitalId: idToUse });
    if (existing) {
      return errorResponse(res, 400, `Hospital ID '${idToUse}' is already in use.`);
    }

    const hospital = await Hospital.create({
      name,
      hospitalId: idToUse,
      address,
      city,
      state,
      phone,
      email,
      contactPerson,
      status: status || 'active',
    });

    return successResponse(res, 201, 'Hospital registered successfully.', hospital);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update hospital
 * @route   PUT /api/hospitals/:id
 * @access  Private (Admin only)
 */
export const updateHospital = async (req, res, next) => {
  try {
    let hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return errorResponse(res, 404, 'Hospital not found.');
    }

    hospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    return successResponse(res, 200, 'Hospital details updated.', hospital);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete hospital
 * @route   DELETE /api/hospitals/:id
 * @access  Private (Admin only)
 */
export const deleteHospital = async (req, res, next) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return errorResponse(res, 404, 'Hospital not found.');
    }

    await Hospital.findByIdAndDelete(req.params.id);
    return successResponse(res, 200, 'Hospital removed successfully.');
  } catch (error) {
    next(error);
  }
};
