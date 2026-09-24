import WasteRecord from '../models/WasteRecord.js';
import Bin from '../models/Bin.js';
import TrackingRecord from '../models/TrackingRecord.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { generateWasteId } from '../utils/generateId.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const getWasteRecords = async (req, res, next) => {
  try {
    const {
      search,
      category,
      hospital,
      department,
      status,
      startDate,
      endDate,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const query = {};

    // Hospital staff only view their hospital's records
    if (req.user.role === 'hospital_staff') {
      query.hospital = req.user.hospital?._id || req.user.hospital;
    } else if (hospital) {
      query.hospital = hospital;
    }

    if (category) query.category = category;
    if (department) query.department = { $regex: department, $options: 'i' };
    if (status) query.status = status;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    if (search) {
      query.$or = [
        { wasteId: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const sortOrder = order === 'asc' ? 1 : -1;
    const sort = { [sortBy]: sortOrder };

    const total = await WasteRecord.countDocuments(query);
    const records = await WasteRecord.find(query)
      .populate('hospital', 'name hospitalId city')
      .populate('category', 'name code colorCode recommendedContainer hazardLevel')
      .populate('bin', 'binId department capacity currentLevel status')
      .populate('createdBy', 'name email role')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    return successResponse(res, 200, 'Waste records retrieved successfully.', records, {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    });
  } catch (error) {
    next(error);
  }
};

export const getWasteById = async (req, res, next) => {
  try {
    const record = await WasteRecord.findOne({
      $or: [{ _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }, { wasteId: req.params.id }],
    })
      .populate('hospital', 'name hospitalId address city state phone contactPerson')
      .populate('category', 'name code colorCode recommendedContainer hazardLevel')
      .populate('bin', 'binId department capacity currentLevel status locationDescription')
      .populate('createdBy', 'name email role')
      .populate({
        path: 'collectionRequest',
        select: 'requestId priority status collector requestedBy assignedAt collectedAt completedAt',
        populate: { path: 'collector', select: 'name email phone' },
      });

    if (!record) {
      return errorResponse(res, 404, 'Waste record not found.');
    }

    if (req.user.role === 'hospital_staff') {
      const userHospId = req.user.hospital?._id?.toString() || req.user.hospital?.toString();
      if (record.hospital?._id?.toString() !== userHospId) {
        return errorResponse(res, 403, 'Unauthorized access to waste record of another hospital.');
      }
    }

    // Also fetch tracking history for this waste
    const trackingHistory = await TrackingRecord.find({ wasteId: record.wasteId })
      .populate('performedBy', 'name email role')
      .sort({ timestamp: 1 });

    return successResponse(res, 200, 'Waste record retrieved.', {
      record,
      trackingHistory,
    });
  } catch (error) {
    next(error);
  }
};

export const createWasteRecord = async (req, res, next) => {
  try {
    let { hospital, bin, category, quantity, unit, department, description } = req.body;

    if (req.user.role === 'hospital_staff') {
      hospital = req.user.hospital?._id || req.user.hospital;
    }

    if (!hospital) {
      return errorResponse(res, 400, 'Hospital reference is required.');
    }

    if (!category) {
      return errorResponse(res, 400, 'Waste category is required.');
    }

    if (!department) {
      return errorResponse(res, 400, 'Department is required.');
    }

    const numQty = Number(quantity);
    if (!numQty || numQty <= 0) {
      return errorResponse(res, 400, 'Quantity must be a positive number.');
    }

    const wasteId = generateWasteId();

    const record = await WasteRecord.create({
      wasteId,
      hospital,
      bin: bin || null,
      category,
      quantity: numQty,
      unit: unit || 'KG',
      department,
      description: description || '',
      createdBy: req.user._id,
      status: 'Logged',
    });

    // Update bin level if bin was provided
    if (bin) {
      const binDoc = await Bin.findById(bin);
      if (binDoc) {
        const newLevel = binDoc.currentLevel + numQty;
        binDoc.currentLevel = newLevel;
        if (newLevel >= binDoc.capacity) {
          binDoc.status = 'Full';
        }
        await binDoc.save();
      }
    }

    // Create Initial Digital Tracking Record
    await TrackingRecord.create({
      wasteId,
      status: 'Logged',
      action: 'Waste Recorded',
      performedBy: req.user._id,
      notes: `Biomedical waste logged in department ${department} (${numQty} ${unit || 'KG'})`,
      timestamp: new Date(),
    });

    const populated = await WasteRecord.findById(record._id)
      .populate('hospital', 'name hospitalId city')
      .populate('category', 'name code colorCode')
      .populate('bin', 'binId department')
      .populate('createdBy', 'name email');

    return successResponse(res, 201, 'Biomedical waste record created successfully.', populated);
  } catch (error) {
    next(error);
  }
};

export const updateWasteRecord = async (req, res, next) => {
  try {
    let record = await WasteRecord.findById(req.params.id);
    if (!record) {
      return errorResponse(res, 404, 'Waste record not found.');
    }

    if (req.user.role === 'hospital_staff') {
      const userHospId = req.user.hospital?._id?.toString() || req.user.hospital?.toString();
      if (record.hospital?.toString() !== userHospId) {
        return errorResponse(res, 403, 'Unauthorized modification to another hospital waste record.');
      }
      if (record.status !== 'Logged') {
        return errorResponse(res, 400, 'Cannot edit waste record once collection workflow has started.');
      }
    }

    const { quantity, unit, department, description, category, bin } = req.body;
    if (quantity !== undefined) record.quantity = Number(quantity);
    if (unit) record.unit = unit;
    if (department) record.department = department;
    if (description !== undefined) record.description = description;
    if (category) record.category = category;
    if (bin !== undefined) record.bin = bin || null;

    await record.save();

    const populated = await WasteRecord.findById(record._id)
      .populate('hospital', 'name hospitalId city')
      .populate('category', 'name code colorCode')
      .populate('bin', 'binId department');

    return successResponse(res, 200, 'Waste record updated successfully.', populated);
  } catch (error) {
    next(error);
  }
};

export const deleteWasteRecord = async (req, res, next) => {
  try {
    const record = await WasteRecord.findById(req.params.id);
    if (!record) {
      return errorResponse(res, 404, 'Waste record not found.');
    }

    if (req.user.role !== 'admin') {
      return errorResponse(res, 403, 'Only administrators can delete waste records for compliance audit safety.');
    }

    await WasteRecord.findByIdAndDelete(req.params.id);
    return successResponse(res, 200, 'Waste record deleted.');
  } catch (error) {
    next(error);
  }
};
