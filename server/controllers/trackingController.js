import TrackingRecord from '../models/TrackingRecord.js';
import WasteRecord from '../models/WasteRecord.js';
import CollectionRequest from '../models/CollectionRequest.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * @desc    Get complete tracking timeline for a wasteId or requestId
 * @route   GET /api/tracking/:identifier
 * @access  Private
 */
export const getTrackingTimeline = async (req, res, next) => {
  try {
    const { identifier } = req.params;

    // Check if identifier is a wasteId or requestId
    const isWasteId = identifier.startsWith('MW-');
    const isRequestId = identifier.startsWith('CR-');

    let wasteRecord = null;
    let collectionRequest = null;

    if (isWasteId) {
      wasteRecord = await WasteRecord.findOne({ wasteId: identifier })
        .populate('hospital', 'name hospitalId city')
        .populate('category', 'name code colorCode recommendedContainer hazardLevel')
        .populate('bin', 'binId department capacity currentLevel')
        .populate('createdBy', 'name email');
    }

    if (isRequestId) {
      collectionRequest = await CollectionRequest.findOne({ requestId: identifier })
        .populate('hospital', 'name hospitalId city')
        .populate('collector', 'name email phone')
        .populate('requestedBy', 'name email');
    }

    // If neither prefix matches, attempt to find by both
    if (!wasteRecord && !collectionRequest) {
      wasteRecord = await WasteRecord.findOne({ wasteId: identifier });
      collectionRequest = await CollectionRequest.findOne({ requestId: identifier });
    }

    // Role check if hospital staff
    if (req.user.role === 'hospital_staff') {
      const userHospId = req.user.hospital?._id?.toString() || req.user.hospital?.toString();
      if (wasteRecord && wasteRecord.hospital?._id?.toString() !== userHospId) {
        return errorResponse(res, 403, 'Unauthorized access to tracking of another facility.');
      }
      if (collectionRequest && collectionRequest.hospital?._id?.toString() !== userHospId) {
        return errorResponse(res, 403, 'Unauthorized access to tracking of another facility.');
      }
    }

    // Find all tracking events
    const query = {
      $or: [{ wasteId: identifier }, { requestId: identifier }],
    };

    const timeline = await TrackingRecord.find(query)
      .populate('performedBy', 'name email role')
      .sort({ timestamp: 1 });

    return successResponse(res, 200, 'Tracking timeline retrieved.', {
      identifier,
      wasteRecord,
      collectionRequest,
      timeline,
      totalEvents: timeline.length,
    });
  } catch (error) {
    next(error);
  }
};
