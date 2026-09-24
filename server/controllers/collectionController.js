import CollectionRequest from '../models/CollectionRequest.js';
import WasteRecord from '../models/WasteRecord.js';
import TrackingRecord from '../models/TrackingRecord.js';
import Notification from '../models/Notification.js';
import Bin from '../models/Bin.js';
import User from '../models/User.js';
import { generateRequestId } from '../utils/generateId.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

// Helper to notify all admins
const notifyAdmins = async (title, message, link = '') => {
  try {
    const admins = await User.find({ role: 'admin', status: 'active' });
    const notifications = admins.map((adm) => ({
      user: adm._id,
      title,
      message,
      link,
      type: 'info',
    }));
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }
  } catch (err) {
    console.error('Failed to notify admins:', err);
  }
};

// Helper to notify a single user
const notifyUser = async (userId, title, message, type = 'info', link = '') => {
  try {
    if (!userId) return;
    await Notification.create({
      user: userId,
      title,
      message,
      type,
      link,
    });
  } catch (err) {
    console.error('Failed to notify user:', err);
  }
};

/**
 * @desc    Get all collection requests
 * @route   GET /api/collections
 * @access  Private
 */
export const getCollectionRequests = async (req, res, next) => {
  try {
    const { status, priority, hospital, collector, search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (req.user.role === 'hospital_staff') {
      query.hospital = req.user.hospital?._id || req.user.hospital;
    } else if (req.user.role === 'collector') {
      // Collector sees their assigned requests or Pending/Assigned requests
      if (collector === 'all') {
        // can view all assigned to them
        query.collector = req.user._id;
      } else {
        query.collector = req.user._id;
      }
    } else if (hospital) {
      query.hospital = hospital;
    }

    if (collector && req.user.role === 'admin') {
      query.collector = collector;
    }

    if (status) query.status = status;
    if (priority) query.priority = priority;

    if (search) {
      query.$or = [
        { requestId: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await CollectionRequest.countDocuments(query);
    const requests = await CollectionRequest.find(query)
      .populate('hospital', 'name hospitalId city address phone')
      .populate({
        path: 'wasteRecords',
        populate: [
          { path: 'category', select: 'name code colorCode' },
          { path: 'bin', select: 'binId department locationDescription' },
        ],
      })
      .populate('collector', 'name email phone')
      .populate('requestedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    return successResponse(res, 200, 'Collection requests retrieved.', requests, {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single collection request by ID
 * @route   GET /api/collections/:id
 * @access  Private
 */
export const getCollectionRequestById = async (req, res, next) => {
  try {
    const request = await CollectionRequest.findOne({
      $or: [{ _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }, { requestId: req.params.id }],
    })
      .populate('hospital', 'name hospitalId city address phone contactPerson')
      .populate({
        path: 'wasteRecords',
        populate: [
          { path: 'category', select: 'name code colorCode recommendedContainer hazardLevel' },
          { path: 'bin', select: 'binId department capacity currentLevel status locationDescription' },
          { path: 'createdBy', select: 'name email' },
        ],
      })
      .populate('collector', 'name email phone')
      .populate('requestedBy', 'name email phone');

    if (!request) {
      return errorResponse(res, 404, 'Collection request not found.');
    }

    // Role safety checks
    if (req.user.role === 'hospital_staff') {
      const userHospId = req.user.hospital?._id?.toString() || req.user.hospital?.toString();
      if (request.hospital?._id?.toString() !== userHospId) {
        return errorResponse(res, 403, 'Unauthorized access to requests of another hospital.');
      }
    } else if (req.user.role === 'collector') {
      if (request.collector?._id?.toString() !== req.user._id.toString()) {
        return errorResponse(res, 403, 'You are not assigned to this collection request.');
      }
    }

    // Fetch tracking records linked to this request or its waste records
    const wasteIds = request.wasteRecords.map((w) => w.wasteId);
    const trackingHistory = await TrackingRecord.find({
      $or: [{ requestId: request.requestId }, { wasteId: { $in: wasteIds } }],
    })
      .populate('performedBy', 'name email role')
      .sort({ timestamp: 1 });

    return successResponse(res, 200, 'Collection request retrieved.', {
      request,
      trackingHistory,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a collection request
 * @route   POST /api/collections
 * @access  Private (Hospital Staff or Admin)
 */
export const createCollectionRequest = async (req, res, next) => {
  try {
    let { hospital, wasteRecordIds, priority, notes } = req.body;

    if (req.user.role === 'hospital_staff') {
      hospital = req.user.hospital?._id || req.user.hospital;
    }

    if (!hospital) {
      return errorResponse(res, 400, 'Hospital reference is required.');
    }

    if (!wasteRecordIds || !Array.isArray(wasteRecordIds) || wasteRecordIds.length === 0) {
      return errorResponse(res, 400, 'Please select at least one waste record for collection.');
    }

    // Verify waste records belong to this hospital and are Logged
    const wasteDocs = await WasteRecord.find({
      _id: { $in: wasteRecordIds },
      hospital,
    });

    if (wasteDocs.length !== wasteRecordIds.length) {
      return errorResponse(res, 400, 'One or more selected waste records are invalid or not from this hospital.');
    }

    const requestId = generateRequestId();

    const collectionRequest = await CollectionRequest.create({
      requestId,
      hospital,
      wasteRecords: wasteRecordIds,
      priority: priority || 'Medium',
      status: 'Pending',
      requestedBy: req.user._id,
      notes: notes || '',
    });

    // Mark waste records as 'Pending Collection' and link to this request
    await WasteRecord.updateMany(
      { _id: { $in: wasteRecordIds } },
      { status: 'Pending Collection', collectionRequest: collectionRequest._id }
    );

    // Create tracking entries for each waste item
    const trackingEntries = wasteDocs.map((w) => ({
      wasteId: w.wasteId,
      requestId,
      status: 'Pending',
      action: 'Collection Requested',
      performedBy: req.user._id,
      notes: `Collection request ${requestId} created with priority: ${priority || 'Medium'}`,
      timestamp: new Date(),
    }));
    await TrackingRecord.insertMany(trackingEntries);

    // Notify Admins of new collection request
    await notifyAdmins(
      `New Collection Request: ${requestId}`,
      `Hospital submitted request ${requestId} with priority ${priority || 'Medium'}.`,
      `/collections/${requestId}`
    );

    const populated = await CollectionRequest.findById(collectionRequest._id)
      .populate('hospital', 'name hospitalId')
      .populate('wasteRecords')
      .populate('requestedBy', 'name email');

    return successResponse(res, 201, 'Collection request created successfully.', populated);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Assign a collector to request
 * @route   PUT /api/collections/:id/assign
 * @access  Private (Admin only)
 */
export const assignCollector = async (req, res, next) => {
  try {
    const { collectorId, priority } = req.body;

    if (!collectorId) {
      return errorResponse(res, 400, 'Collector ID is required.');
    }

    const collector = await User.findOne({ _id: collectorId, role: 'collector', status: 'active' });
    if (!collector) {
      return errorResponse(res, 404, 'Active collector not found.');
    }

    const request = await CollectionRequest.findById(req.params.id).populate('wasteRecords');
    if (!request) {
      return errorResponse(res, 404, 'Collection request not found.');
    }

    if (request.status === 'Completed' || request.status === 'Cancelled') {
      return errorResponse(res, 400, `Cannot assign collector to a ${request.status} request.`);
    }

    request.collector = collector._id;
    request.status = 'Assigned';
    request.assignedAt = new Date();
    if (priority) request.priority = priority;

    await request.save();

    // Traceability logs
    const trackingEntries = request.wasteRecords.map((w) => ({
      wasteId: w.wasteId,
      requestId: request.requestId,
      status: 'Assigned',
      action: 'Collector Assigned',
      performedBy: req.user._id,
      notes: `Collector ${collector.name} assigned by administrator.`,
      timestamp: new Date(),
    }));
    await TrackingRecord.insertMany(trackingEntries);

    // Notify Collector
    await notifyUser(
      collector._id,
      `New Assignment: ${request.requestId}`,
      `You have been assigned to biomedical waste collection at request ${request.requestId} (${request.priority} priority).`,
      'info',
      `/collector/assigned`
    );

    // Notify requesting staff
    await notifyUser(
      request.requestedBy,
      `Collector Assigned: ${request.requestId}`,
      `Collector ${collector.name} has been assigned to your request ${request.requestId}.`,
      'info',
      `/collections/${request.requestId}`
    );

    const populated = await CollectionRequest.findById(request._id)
      .populate('hospital', 'name hospitalId')
      .populate('wasteRecords')
      .populate('collector', 'name email phone')
      .populate('requestedBy', 'name email');

    return successResponse(res, 200, 'Collector assigned successfully.', populated);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update collection request status (Workflow transition)
 * @route   PATCH /api/collections/:id/status
 * @access  Private (Collector or Admin)
 */
export const updateCollectionStatus = async (req, res, next) => {
  try {
    const { status, notes, collectorNotes } = req.body;

    const validStatuses = ['Accepted', 'Collecting', 'Collected', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return errorResponse(res, 400, `Invalid status '${status}'. Valid values: ${validStatuses.join(', ')}`);
    }

    const request = await CollectionRequest.findById(req.params.id)
      .populate('wasteRecords')
      .populate('hospital');

    if (!request) {
      return errorResponse(res, 404, 'Collection request not found.');
    }

    // Role validation
    if (req.user.role === 'collector') {
      if (request.collector?.toString() !== req.user._id.toString()) {
        return errorResponse(res, 403, 'You are not assigned to this collection request.');
      }
      // Collector can transition:
      // Assigned -> Accepted
      // Accepted -> Collecting
      // Collecting -> Collected
      // Collected -> Completed
      const workflowMap = {
        Assigned: ['Accepted', 'Cancelled'],
        Accepted: ['Collecting', 'Cancelled'],
        Collecting: ['Collected', 'Cancelled'],
        Collected: ['Completed'],
      };

      if (!workflowMap[request.status]?.includes(status)) {
        return errorResponse(
          res,
          400,
          `Invalid workflow transition from '${request.status}' to '${status}'.`
        );
      }
    }

    // Update status and timestamps
    request.status = status;
    const now = new Date();

    if (collectorNotes) request.collectorNotes = collectorNotes;
    if (notes) request.notes = notes;

    let wasteStatus = 'Pending Collection';

    if (status === 'Accepted') {
      request.acceptedAt = now;
    } else if (status === 'Collecting') {
      wasteStatus = 'In Transit';
    } else if (status === 'Collected') {
      request.collectedAt = now;
      wasteStatus = 'In Transit';

      // Empty or reset any bins associated with these waste records
      for (const waste of request.wasteRecords) {
        if (waste.bin) {
          const binDoc = await Bin.findById(waste.bin);
          if (binDoc) {
            binDoc.currentLevel = Math.max(0, binDoc.currentLevel - waste.quantity);
            if (binDoc.status === 'Full') {
              binDoc.status = 'Active';
            }
            await binDoc.save();
          }
        }
      }
    } else if (status === 'Completed') {
      request.completedAt = now;
      wasteStatus = 'Disposed';
    } else if (status === 'Cancelled') {
      wasteStatus = 'Logged';
    }

    await request.save();

    // Update status on Waste Records
    await WasteRecord.updateMany(
      { _id: { $in: request.wasteRecords.map((w) => w._id) } },
      { status: wasteStatus }
    );

    // Create Tracking Record for each waste record
    const trackingEntries = request.wasteRecords.map((w) => ({
      wasteId: w.wasteId,
      requestId: request.requestId,
      status,
      action: `Status Updated to ${status}`,
      performedBy: req.user._id,
      notes: collectorNotes || notes || `Collection request status transitioned to ${status}`,
      timestamp: now,
    }));
    await TrackingRecord.insertMany(trackingEntries);

    // Notifications based on status
    if (status === 'Accepted') {
      await notifyUser(
        request.requestedBy,
        `Request Accepted: ${request.requestId}`,
        `Collector accepted your collection request ${request.requestId}.`,
        'info'
      );
    } else if (status === 'Collected') {
      await notifyUser(
        request.requestedBy,
        `Waste Collected: ${request.requestId}`,
        `Biomedical waste for request ${request.requestId} has been collected.`,
        'success'
      );
    } else if (status === 'Completed') {
      await notifyUser(
        request.requestedBy,
        `Collection Completed: ${request.requestId}`,
        `Collection request ${request.requestId} has been fully completed and verified.`,
        'success'
      );
      await notifyAdmins(
        `Collection Completed: ${request.requestId}`,
        `Collection ${request.requestId} from ${request.hospital?.name} completed successfully.`,
        `/collections/${request.requestId}`
      );
    }

    const populated = await CollectionRequest.findById(request._id)
      .populate('hospital', 'name hospitalId')
      .populate({
        path: 'wasteRecords',
        populate: [{ path: 'category', select: 'name code colorCode' }, { path: 'bin', select: 'binId' }],
      })
      .populate('collector', 'name email phone')
      .populate('requestedBy', 'name email');

    return successResponse(res, 200, `Collection request updated to ${status}.`, populated);
  } catch (error) {
    next(error);
  }
};
