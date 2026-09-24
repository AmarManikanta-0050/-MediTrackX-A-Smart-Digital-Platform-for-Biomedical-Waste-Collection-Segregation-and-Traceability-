import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Hospital from '../models/Hospital.js';
import WasteCategory from '../models/WasteCategory.js';
import Bin from '../models/Bin.js';
import WasteRecord from '../models/WasteRecord.js';
import CollectionRequest from '../models/CollectionRequest.js';
import TrackingRecord from '../models/TrackingRecord.js';
import Notification from '../models/Notification.js';
import { generateWasteId, generateRequestId, generateBinId } from '../utils/generateId.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('[Error] MONGODB_URI not found in .env. Please set your MongoDB Atlas connection string.');
      process.exit(1);
    }

    console.log('[Seed] Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri, { dbName: 'meditrackx' });
    console.log('[Seed] Connected to Atlas. Cleaning existing collection data...');

    // Clear collections
    await Promise.all([
      User.deleteMany({}),
      Hospital.deleteMany({}),
      WasteCategory.deleteMany({}),
      Bin.deleteMany({}),
      WasteRecord.deleteMany({}),
      CollectionRequest.deleteMany({}),
      TrackingRecord.deleteMany({}),
      Notification.deleteMany({}),
    ]);

    console.log('[Seed] Database cleared. Seeding initial categories...');

    // 1. Waste Categories
    const categoriesData = [
      {
        name: 'Infectious Waste',
        code: 'INF',
        description: 'Waste contaminated with blood, body fluids, or cultures from infectious patients.',
        recommendedContainer: 'Yellow Biohazard Double-layer Bag',
        colorCode: '#EF4444',
        hazardLevel: 'High',
        status: 'active',
      },
      {
        name: 'Sharps Waste',
        code: 'SHP',
        description: 'Needles, scalpels, blades, broken glass, and disposable sharp medical instruments.',
        recommendedContainer: 'White Puncture-Proof Rigid Container',
        colorCode: '#F59E0B',
        hazardLevel: 'Biohazardous',
        status: 'active',
      },
      {
        name: 'Pathological Waste',
        code: 'PAT',
        description: 'Human tissues, organs, body parts, fetuses, and anatomical fluids.',
        recommendedContainer: 'Yellow Rigid Leak-Proof Container',
        colorCode: '#DC2626',
        hazardLevel: 'Biohazardous',
        status: 'active',
      },
      {
        name: 'Pharmaceutical Waste',
        code: 'PHM',
        description: 'Expired, unused, spilled, and contaminated pharmaceutical products, drugs, and vaccines.',
        recommendedContainer: 'Brown Secure Cardboard Box / Tamper Bottle',
        colorCode: '#8B5CF6',
        hazardLevel: 'Medium',
        status: 'active',
      },
      {
        name: 'Chemical Waste',
        code: 'CHM',
        description: 'Disinfectants, reagents, solvents, heavy metals, battery acid, and lab chemicals.',
        recommendedContainer: 'Heavy Duty HDPE Corrosive-Resistant Container',
        colorCode: '#EC4899',
        hazardLevel: 'Medium',
        status: 'active',
      },
      {
        name: 'General Non-Hazardous Waste',
        code: 'GEN',
        description: 'Office paper, packaging, non-contaminated plastic wrap, food waste from non-infectious areas.',
        recommendedContainer: 'Black / Green Heavy Duty Waste Receptacle',
        colorCode: '#10B981',
        hazardLevel: 'Low',
        status: 'active',
      },
    ];

    const categories = await WasteCategory.insertMany(categoriesData);
    console.log(`[Seed] Seeded ${categories.length} waste categories.`);

    // 2. Hospitals
    console.log('[Seed] Seeding sample healthcare facilities...');
    const hospitalsData = [
      {
        name: 'Apex Super Specialty Hospital',
        hospitalId: 'HOSP-101',
        address: '450 Healthcare Boulevard, Medical District',
        city: 'Metropolis',
        state: 'State Central',
        phone: '+1 (555) 234-5678',
        email: 'admin@apexhospital.org',
        contactPerson: 'Dr. Evelyn Vance (Chief Medical Officer)',
        status: 'active',
      },
      {
        name: 'St. Jude Children Research Center',
        hospitalId: 'HOSP-202',
        address: '88 Wellness Avenue, North Sector',
        city: 'Northview',
        state: 'State Central',
        phone: '+1 (555) 876-5432',
        email: 'operations@stjudemed.org',
        contactPerson: 'Marcus Thorne (Operations Director)',
        status: 'active',
      },
      {
        name: 'Metro Health Trauma & Cancer Institute',
        hospitalId: 'HOSP-303',
        address: '12 Emergency Crescent, South Bay',
        city: 'Baytown',
        state: 'South Coast',
        phone: '+1 (555) 345-6789',
        email: 'safety@metrohealth.net',
        contactPerson: 'Sarah Jenkins (Bio-Safety Officer)',
        status: 'active',
      },
    ];

    const hospitals = await Hospital.insertMany(hospitalsData);
    console.log(`[Seed] Seeded ${hospitals.length} hospitals.`);

    // 3. Users (Admin, Hospital Staff, Collector)
    console.log('[Seed] Seeding user accounts with hashed credentials...');
    // Note: User.pre('save') hashes on save, or hash with bcrypt directly
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('Admin@123', salt);
    const staffPassword = await bcrypt.hash('Hospital@123', salt);
    const collectorPassword = await bcrypt.hash('Collector@123', salt);

    const usersData = [
      {
        name: 'Administrator Sarah Cole',
        email: 'admin@example.com',
        password: adminPassword,
        phone: '+1 (555) 901-0001',
        role: 'admin',
        hospital: null,
        status: 'active',
      },
      {
        name: 'Nurse Elena Rostova',
        email: 'hospital@example.com',
        password: staffPassword,
        phone: '+1 (555) 901-0002',
        role: 'hospital_staff',
        hospital: hospitals[0]._id, // Apex Hospital
        status: 'active',
      },
      {
        name: 'David Miller (Biowaste Collector)',
        email: 'collector@example.com',
        password: collectorPassword,
        phone: '+1 (555) 901-0003',
        role: 'collector',
        hospital: null,
        status: 'active',
      },
      {
        name: 'Carlos Mendez (Hazardous Waste Collector)',
        email: 'carlos@example.com',
        password: collectorPassword,
        phone: '+1 (555) 901-0004',
        role: 'collector',
        hospital: null,
        status: 'active',
      },
      {
        name: 'Dr. Aris Thorne (Metro Staff)',
        email: 'staff2@example.com',
        password: staffPassword,
        phone: '+1 (555) 901-0005',
        role: 'hospital_staff',
        hospital: hospitals[1]._id,
        status: 'active',
      },
    ];

    const users = await User.insertMany(usersData);
    const adminUser = users[0];
    const staffUser = users[1];
    const collectorUser = users[2];
    const collector2 = users[3];
    console.log(`[Seed] Seeded ${users.length} users.`);

    // 4. Smart Bins
    console.log('[Seed] Seeding smart bins with fill level metrics...');
    const binsData = [
      {
        binId: 'BIN-101',
        hospital: hospitals[0]._id,
        department: 'Intensive Care Unit (ICU)',
        category: categories[0]._id, // Infectious
        capacity: 50,
        currentLevel: 38.5,
        status: 'Active',
        locationDescription: 'ICU Ward 3B, Next to Isolation Bay',
      },
      {
        binId: 'BIN-102',
        hospital: hospitals[0]._id,
        department: 'Emergency & Trauma',
        category: categories[1]._id, // Sharps
        capacity: 25,
        currentLevel: 22.8,
        status: 'Active',
        locationDescription: 'Trauma Bay 1, Sharps Receptacle Station',
      },
      {
        binId: 'BIN-103',
        hospital: hospitals[0]._id,
        department: 'Surgery & Operation Theatre',
        category: categories[2]._id, // Pathological
        capacity: 40,
        currentLevel: 39.2,
        status: 'Full',
        locationDescription: 'OT-4 Scrub and Disposal Suite',
      },
      {
        binId: 'BIN-104',
        hospital: hospitals[0]._id,
        department: 'Central Pharmacy',
        category: categories[3]._id, // Pharmaceutical
        capacity: 30,
        currentLevel: 8.5,
        status: 'Active',
        locationDescription: 'Dispensing Block A, Secured Return Shelf',
      },
      {
        binId: 'BIN-105',
        hospital: hospitals[1]._id,
        department: 'Hematology Lab',
        category: categories[4]._id, // Chemical
        capacity: 35,
        currentLevel: 14.0,
        status: 'Active',
        locationDescription: 'Lab Room 204, Reagent Waste Cabinet',
      },
      {
        binId: 'BIN-106',
        hospital: hospitals[2]._id,
        department: 'Outpatient Clinic (OPD)',
        category: categories[5]._id, // General
        capacity: 60,
        currentLevel: 45.0,
        status: 'Active',
        locationDescription: 'Main Corridor OPD Block',
      },
    ];

    const bins = await Bin.insertMany(binsData);
    console.log(`[Seed] Seeded ${bins.length} smart bins.`);

    // 5. Waste Records
    console.log('[Seed] Seeding realistic waste generation records...');
    const now = new Date();
    const wasteRecordsData = [];

    // Historical records spread across last 14 days
    for (let i = 14; i >= 1; i--) {
      const pastDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      wasteRecordsData.push({
        wasteId: `MW-${now.getFullYear()}-${100000 + i}`,
        hospital: hospitals[0]._id,
        bin: bins[0]._id,
        category: categories[0]._id,
        quantity: Math.round((8 + Math.random() * 12) * 10) / 10,
        unit: 'KG',
        department: 'Intensive Care Unit (ICU)',
        description: 'Contaminated IV lines, swabs, suction catheters',
        status: 'Disposed',
        createdBy: staffUser._id,
        createdAt: pastDate,
        updatedAt: pastDate,
      });

      wasteRecordsData.push({
        wasteId: `MW-${now.getFullYear()}-${200000 + i}`,
        hospital: hospitals[0]._id,
        bin: bins[1]._id,
        category: categories[1]._id,
        quantity: Math.round((3 + Math.random() * 5) * 10) / 10,
        unit: 'KG',
        department: 'Emergency & Trauma',
        description: 'Used disposable syringes and suture needles',
        status: 'Disposed',
        createdBy: staffUser._id,
        createdAt: pastDate,
        updatedAt: pastDate,
      });
    }

    // Active records for today and yesterday
    const activeWaste1 = {
      wasteId: `MW-${now.getFullYear()}-900101`,
      hospital: hospitals[0]._id,
      bin: bins[0]._id,
      category: categories[0]._id,
      quantity: 14.5,
      unit: 'KG',
      department: 'Intensive Care Unit (ICU)',
      description: 'Dialysis tubings and post-operative dressings',
      status: 'Pending Collection',
      createdBy: staffUser._id,
      createdAt: new Date(now.getTime() - 4 * 60 * 60 * 1000),
    };

    const activeWaste2 = {
      wasteId: `MW-${now.getFullYear()}-900102`,
      hospital: hospitals[0]._id,
      bin: bins[1]._id,
      category: categories[1]._id,
      quantity: 5.2,
      unit: 'KG',
      department: 'Emergency & Trauma',
      description: 'Laceration repair needles and scalpels',
      status: 'Pending Collection',
      createdBy: staffUser._id,
      createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
    };

    const activeWaste3 = {
      wasteId: `MW-${now.getFullYear()}-900103`,
      hospital: hospitals[0]._id,
      bin: bins[2]._id,
      category: categories[2]._id,
      quantity: 18.0,
      unit: 'KG',
      department: 'Surgery & Operation Theatre',
      description: 'Laparoscopic tissue specimen and anatomical waste',
      status: 'Logged',
      createdBy: staffUser._id,
      createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
    };

    wasteRecordsData.push(activeWaste1, activeWaste2, activeWaste3);

    const insertedWaste = await WasteRecord.insertMany(wasteRecordsData);
    console.log(`[Seed] Seeded ${insertedWaste.length} waste records.`);

    // 6. Collection Requests
    console.log('[Seed] Seeding collection workflow requests...');
    const targetWasteIds = [
      insertedWaste[insertedWaste.length - 3]._id,
      insertedWaste[insertedWaste.length - 2]._id,
    ];

    const completedReqWasteIds = [
      insertedWaste[0]._id,
      insertedWaste[1]._id,
    ];

    const requestsData = [
      {
        requestId: `CR-${now.getFullYear()}-000101`,
        hospital: hospitals[0]._id,
        wasteRecords: targetWasteIds,
        collector: collectorUser._id,
        priority: 'High',
        status: 'Assigned',
        requestedBy: staffUser._id,
        assignedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        notes: 'High volume accumulated in ICU and Trauma Bay.',
        collectorNotes: '',
        createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
      },
      {
        requestId: `CR-${now.getFullYear()}-000088`,
        hospital: hospitals[0]._id,
        wasteRecords: completedReqWasteIds,
        collector: collectorUser._id,
        priority: 'Urgent',
        status: 'Completed',
        requestedBy: staffUser._id,
        assignedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        acceptedAt: new Date(now.getTime() - 23 * 60 * 60 * 1000),
        collectedAt: new Date(now.getTime() - 22 * 60 * 60 * 1000),
        completedAt: new Date(now.getTime() - 21 * 60 * 60 * 1000),
        notes: 'Daily routine biohazard pickup',
        collectorNotes: 'All yellow biohazard bags weighed and sealed.',
        createdAt: new Date(now.getTime() - 25 * 60 * 60 * 1000),
      },
    ];

    const collectionRequests = await CollectionRequest.insertMany(requestsData);

    // Link waste records to collection request
    await WasteRecord.updateMany(
      { _id: { $in: targetWasteIds } },
      { collectionRequest: collectionRequests[0]._id }
    );
    await WasteRecord.updateMany(
      { _id: { $in: completedReqWasteIds } },
      { collectionRequest: collectionRequests[1]._id }
    );

    console.log(`[Seed] Seeded ${collectionRequests.length} collection requests.`);

    // 7. Tracking Records
    console.log('[Seed] Seeding digital traceability audit trail...');
    const trackingEvents = [
      {
        wasteId: activeWaste1.wasteId,
        requestId: collectionRequests[0].requestId,
        status: 'Logged',
        action: 'Waste Recorded',
        performedBy: staffUser._id,
        notes: '14.5 KG logged from ICU Ward 3B',
        timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000),
      },
      {
        wasteId: activeWaste1.wasteId,
        requestId: collectionRequests[0].requestId,
        status: 'Pending',
        action: 'Collection Requested',
        performedBy: staffUser._id,
        notes: 'Collection requested with High priority',
        timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000),
      },
      {
        wasteId: activeWaste1.wasteId,
        requestId: collectionRequests[0].requestId,
        status: 'Assigned',
        action: 'Collector Assigned',
        performedBy: adminUser._id,
        notes: `Assigned to collector ${collectorUser.name}`,
        timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000),
      },
    ];

    await TrackingRecord.insertMany(trackingEvents);
    console.log(`[Seed] Seeded ${trackingEvents.length} tracking records.`);

    // 8. Notifications
    console.log('[Seed] Seeding system notifications...');
    const notificationsData = [
      {
        user: collectorUser._id,
        title: `New Assignment: ${collectionRequests[0].requestId}`,
        message: `You have been assigned to collect High-priority waste from ${hospitals[0].name}.`,
        type: 'urgent',
        read: false,
        link: '/collector/assigned',
      },
      {
        user: staffUser._id,
        title: `Collector Assigned: ${collectionRequests[0].requestId}`,
        message: `${collectorUser.name} has been dispatched for pickup request ${collectionRequests[0].requestId}.`,
        type: 'info',
        read: false,
        link: `/collections/${collectionRequests[0].requestId}`,
      },
      {
        user: adminUser._id,
        title: `High Capacity Alert: BIN-103`,
        message: 'Pathological Waste Bin in Surgery & OT has reached 98% capacity.',
        type: 'warning',
        read: false,
        link: '/admin/bins',
      },
    ];

    await Notification.insertMany(notificationsData);
    console.log(`[Seed] Seeded ${notificationsData.length} notifications.`);

    console.log('\n======================================================');
    console.log('✅ MEDITRACKX DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('======================================================');
    console.log('Fictional Development Accounts:');
    console.log('------------------------------------------------------');
    console.log('1. ADMIN:');
    console.log('   Email:    admin@example.com');
    console.log('   Password: Admin@123');
    console.log('------------------------------------------------------');
    console.log('2. HOSPITAL STAFF (Apex Super Specialty):');
    console.log('   Email:    hospital@example.com');
    console.log('   Password: Hospital@123');
    console.log('------------------------------------------------------');
    console.log('3. COLLECTOR:');
    console.log('   Email:    collector@example.com');
    console.log('   Password: Collector@123');
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('[Seed Error] Failed to seed database:', error);
    process.exit(1);
  }
};

seedDatabase();
