import WasteRecord from '../models/WasteRecord.js';
import CollectionRequest from '../models/CollectionRequest.js';
import Hospital from '../models/Hospital.js';
import User from '../models/User.js';
import Bin from '../models/Bin.js';
import WasteCategory from '../models/WasteCategory.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import mongoose from 'mongoose';

/**
 * @desc    Get dashboard metrics & summary
 * @route   GET /api/reports/dashboard
 * @access  Private
 */
export const getDashboardStats = async (req, res, next) => {
  try {
    const isHospitalStaff = req.user.role === 'hospital_staff';
    const isCollector = req.user.role === 'collector';

    const hospitalFilter = isHospitalStaff
      ? { hospital: new mongoose.Types.ObjectId(req.user.hospital?._id || req.user.hospital) }
      : {};

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // Common Counts
    const [
      totalHospitals,
      totalUsers,
      totalWasteRecords,
      pendingRequests,
      activeCollectors,
      completedCollections,
      totalBins,
      todayWasteAggregate,
      monthWasteAggregate,
      collectorStats,
    ] = await Promise.all([
      Hospital.countDocuments({ status: 'active' }),
      User.countDocuments({ status: 'active' }),
      WasteRecord.countDocuments(hospitalFilter),
      CollectionRequest.countDocuments({
        ...hospitalFilter,
        status: { $in: ['Pending', 'Assigned', 'Accepted', 'Collecting'] },
      }),
      User.countDocuments({ role: 'collector', status: 'active' }),
      CollectionRequest.countDocuments({ ...hospitalFilter, status: 'Completed' }),
      Bin.countDocuments({ ...hospitalFilter, status: { $ne: 'Inactive' } }),

      // Today's waste volume
      WasteRecord.aggregate([
        {
          $match: {
            ...hospitalFilter,
            createdAt: { $gte: startOfToday },
          },
        },
        { $group: { _id: null, total: { $sum: '$quantity' } } },
      ]),

      // Month waste volume
      WasteRecord.aggregate([
        {
          $match: {
            ...hospitalFilter,
            createdAt: { $gte: startOfMonth },
          },
        },
        { $group: { _id: null, total: { $sum: '$quantity' } } },
      ]),

      // Collector specific stats if collector
      isCollector
        ? CollectionRequest.aggregate([
            { $match: { collector: req.user._id } },
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 },
              },
            },
          ])
        : Promise.resolve([]),
    ]);

    const todayWaste = todayWasteAggregate[0]?.total || 0;
    const monthWaste = monthWasteAggregate[0]?.total || 0;

    return successResponse(res, 200, 'Dashboard statistics loaded.', {
      totalHospitals,
      totalUsers,
      totalWasteRecords,
      pendingRequests,
      activeCollectors,
      completedCollections,
      totalBins,
      todayWaste: Math.round(todayWaste * 10) / 10,
      monthWaste: Math.round(monthWaste * 10) / 10,
      collectorStats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get aggregated charts data
 * @route   GET /api/reports/analytics
 * @access  Private
 */
export const getAnalyticsData = async (req, res, next) => {
  try {
    const { hospitalId, days = 30 } = req.query;
    const matchFilter = {};

    if (req.user.role === 'hospital_staff') {
      matchFilter.hospital = new mongoose.Types.ObjectId(req.user.hospital?._id || req.user.hospital);
    } else if (hospitalId && hospitalId !== 'all') {
      matchFilter.hospital = new mongoose.Types.ObjectId(hospitalId);
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days, 10));
    matchFilter.createdAt = { $gte: startDate };

    // 1. Waste by Category
    const wasteByCategory = await WasteRecord.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$category',
          totalQuantity: { $sum: '$quantity' },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'wastecategories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryInfo',
        },
      },
      { $unwind: { path: '$categoryInfo', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          name: { $ifNull: ['$categoryInfo.name', 'Uncategorized'] },
          code: { $ifNull: ['$categoryInfo.code', 'UNK'] },
          color: { $ifNull: ['$categoryInfo.colorCode', '#0D9488'] },
          totalQuantity: { $round: ['$totalQuantity', 1] },
          count: 1,
        },
      },
      { $sort: { totalQuantity: -1 } },
    ]);

    // 2. Waste by Hospital (Admin view)
    const wasteByHospital = await WasteRecord.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$hospital',
          totalQuantity: { $sum: '$quantity' },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'hospitals',
          localField: '_id',
          foreignField: '_id',
          as: 'hospitalInfo',
        },
      },
      { $unwind: { path: '$hospitalInfo', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          name: { $ifNull: ['$hospitalInfo.name', 'Unknown Facility'] },
          hospitalId: '$hospitalInfo.hospitalId',
          totalQuantity: { $round: ['$totalQuantity', 1] },
          count: 1,
        },
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
    ]);

    // 3. Daily Waste Generation Trend
    const dailyTrend = await WasteRecord.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          quantity: { $sum: '$quantity' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          date: '$_id',
          quantity: { $round: ['$quantity', 1] },
          count: 1,
          _id: 0,
        },
      },
    ]);

    // 4. Collection Request Status Breakdown
    const requestMatchFilter = {};
    if (matchFilter.hospital) requestMatchFilter.hospital = matchFilter.hospital;

    const requestStatusBreakdown = await CollectionRequest.aggregate([
      { $match: requestMatchFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          status: '$_id',
          count: 1,
          _id: 0,
        },
      },
    ]);

    // 5. Department Breakdown
    const departmentBreakdown = await WasteRecord.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$department',
          totalQuantity: { $sum: '$quantity' },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          department: '$_id',
          totalQuantity: { $round: ['$totalQuantity', 1] },
          count: 1,
          _id: 0,
        },
      },
      { $sort: { totalQuantity: -1 } },
    ]);

    return successResponse(res, 200, 'Analytics data aggregated.', {
      wasteByCategory,
      wasteByHospital,
      dailyTrend,
      requestStatusBreakdown,
      departmentBreakdown,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Export waste records in CSV format
 * @route   GET /api/reports/export/csv
 * @access  Private
 */
export const exportWasteCSV = async (req, res, next) => {
  try {
    const query = {};
    if (req.user.role === 'hospital_staff') {
      query.hospital = req.user.hospital?._id || req.user.hospital;
    }

    const records = await WasteRecord.find(query)
      .populate('hospital', 'name hospitalId')
      .populate('category', 'name code')
      .populate('bin', 'binId')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(500);

    const headers = 'Waste ID,Hospital,Hospital ID,Category,Code,Quantity (KG),Department,Status,Created By,Date\n';
    const rows = records.map((r) => {
      const escape = (str) => `"${(str || '').toString().replace(/"/g, '""')}"`;
      return [
        r.wasteId,
        escape(r.hospital?.name),
        r.hospital?.hospitalId || '',
        escape(r.category?.name),
        r.category?.code || '',
        r.quantity,
        escape(r.department),
        r.status,
        escape(r.createdBy?.name),
        new Date(r.createdAt).toISOString().split('T')[0],
      ].join(',');
    });

    const csvContent = headers + rows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="meditrackx-waste-records.csv"');
    return res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};
