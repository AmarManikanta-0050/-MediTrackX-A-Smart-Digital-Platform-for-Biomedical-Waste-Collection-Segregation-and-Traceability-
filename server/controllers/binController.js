import Bin from '../models/Bin.js';
import Hospital from '../models/Hospital.js';
import WasteCategory from '../models/WasteCategory.js';
import { generateBinId } from '../utils/generateId.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const getBins = async (req, res, next) => {
  try {
    const { hospital, status, category, department, search } = req.query;
    const query = {};

    // Hospital staff only view their hospital's bins
    if (req.user.role === 'hospital_staff') {
      query.hospital = req.user.hospital?._id || req.user.hospital;
    } else if (hospital) {
      query.hospital = hospital;
    }

    if (status) query.status = status;
    if (category) query.category = category;
    if (department) query.department = { $regex: department, $options: 'i' };
    if (search) {
      query.$or = [
        { binId: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { locationDescription: { $regex: search, $options: 'i' } },
      ];
    }

    const bins = await Bin.find(query)
      .populate('hospital', 'name hospitalId city')
      .populate('category', 'name code colorCode recommendedContainer')
      .sort({ createdAt: -1 });

    return successResponse(res, 200, 'Bins retrieved successfully.', bins);
  } catch (error) {
    next(error);
  }
};

export const getBinById = async (req, res, next) => {
  try {
    const bin = await Bin.findById(req.params.id)
      .populate('hospital', 'name hospitalId city address')
      .populate('category', 'name code colorCode recommendedContainer hazardLevel');

    if (!bin) {
      return errorResponse(res, 404, 'Smart Bin not found.');
    }

    if (req.user.role === 'hospital_staff') {
      const userHospId = req.user.hospital?._id?.toString() || req.user.hospital?.toString();
      if (bin.hospital?._id?.toString() !== userHospId) {
        return errorResponse(res, 403, 'Unauthorized access to bins of another hospital.');
      }
    }

    return successResponse(res, 200, 'Bin details retrieved.', bin);
  } catch (error) {
    next(error);
  }
};

export const createBin = async (req, res, next) => {
  try {
    let { binId, hospital, department, category, capacity, currentLevel, locationDescription, status } = req.body;

    if (req.user.role === 'hospital_staff') {
      hospital = req.user.hospital?._id || req.user.hospital;
    }

    if (!hospital) {
      return errorResponse(res, 400, 'Hospital reference is required.');
    }

    if (!category) {
      return errorResponse(res, 400, 'Waste category is required.');
    }

    const finalBinId = binId ? binId.toUpperCase().trim() : generateBinId();
    const existing = await Bin.findOne({ binId: finalBinId });
    if (existing) {
      return errorResponse(res, 400, `Bin ID '${finalBinId}' is already registered.`);
    }

    let binStatus = status || 'Active';
    const numLevel = Number(currentLevel) || 0;
    const numCap = Number(capacity) || 50;
    if (numLevel >= numCap) {
      binStatus = 'Full';
    }

    const bin = await Bin.create({
      binId: finalBinId,
      hospital,
      department,
      category,
      capacity: numCap,
      currentLevel: numLevel,
      locationDescription: locationDescription || '',
      status: binStatus,
    });

    const populated = await Bin.findById(bin._id)
      .populate('hospital', 'name hospitalId')
      .populate('category', 'name code colorCode');

    return successResponse(res, 201, 'Smart Bin registered successfully.', populated);
  } catch (error) {
    next(error);
  }
};

export const updateBin = async (req, res, next) => {
  try {
    let bin = await Bin.findById(req.params.id);
    if (!bin) {
      return errorResponse(res, 404, 'Bin not found.');
    }

    if (req.user.role === 'hospital_staff') {
      const userHospId = req.user.hospital?._id?.toString() || req.user.hospital?.toString();
      if (bin.hospital?.toString() !== userHospId) {
        return errorResponse(res, 403, 'Unauthorized modification to another hospital bin.');
      }
    }

    const updates = { ...req.body };
    if (updates.binId) {
      updates.binId = updates.binId.toUpperCase().trim();
    }

    // Auto mark as Full if level >= capacity
    const newLevel = updates.currentLevel !== undefined ? Number(updates.currentLevel) : bin.currentLevel;
    const newCap = updates.capacity !== undefined ? Number(updates.capacity) : bin.capacity;
    if (newLevel >= newCap && (!updates.status || updates.status === 'Active')) {
      updates.status = 'Full';
    }

    bin = await Bin.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    })
      .populate('hospital', 'name hospitalId')
      .populate('category', 'name code colorCode');

    return successResponse(res, 200, 'Bin updated successfully.', bin);
  } catch (error) {
    next(error);
  }
};

export const deleteBin = async (req, res, next) => {
  try {
    const bin = await Bin.findById(req.params.id);
    if (!bin) {
      return errorResponse(res, 404, 'Bin not found.');
    }

    await Bin.findByIdAndDelete(req.params.id);
    return successResponse(res, 200, 'Bin removed successfully.');
  } catch (error) {
    next(error);
  }
};
