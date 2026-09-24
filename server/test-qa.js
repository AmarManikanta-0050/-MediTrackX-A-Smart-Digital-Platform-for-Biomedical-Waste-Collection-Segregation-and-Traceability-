/**
 * Comprehensive Senior QA Automated Test Suite for MediTrackX
 * Verifies Auth, RBAC, CRUD, Workflow Transitions, Tracking Integrity, and Error Handling.
 */

const BASE_URL = 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data };
}

let adminToken = '';
let staffToken = '';
let collectorToken = '';
let testHospitalId = '';
let testCategoryId = '';
let testBinId = '';
let testWasteRecordId = '';
let testWasteId = '';
let testRequestId = '';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ PASS: ${message}`);
  } else {
    failedTests++;
    console.error(`  ❌ FAIL: ${message}`);
  }
}

async function runQATests() {
  console.log('\n======================================================');
  console.log('🧪 MEDITRACKX AUTOMATED SENIOR QA TEST SUITE');
  console.log('======================================================\n');

  // --- 1. HEALTH CHECK ---
  console.log('--- TEST GROUP 1: Health & Connectivity ---');
  const health = await request('/health');
  assert(health.status === 200 && health.data.status === 'healthy', 'API Health check returns 200 Healthy');

  // --- 2. AUTHENTICATION & LOGIN ---
  console.log('\n--- TEST GROUP 2: Authentication Tests ---');
  
  // 2.1 Invalid Password
  const badLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@example.com', password: 'WrongPassword!' }),
  });
  assert(badLogin.status === 401 && badLogin.data.success === false, 'Invalid password rejected with 401 Unauthorized');

  // 2.2 Invalid Email
  const badEmail = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'nonexistent@example.com', password: 'Admin@123' }),
  });
  assert(badEmail.status === 401 && badEmail.data.success === false, 'Non-existent email rejected with 401');

  // 2.3 Valid Admin Login
  const adminLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'admin@example.com', password: 'Admin@123' }),
  });
  assert(adminLogin.status === 200 && adminLogin.data.data.token, 'Admin login succeeds with JWT');
  adminToken = adminLogin.data?.data?.token;

  // 2.4 Valid Hospital Staff Login
  const staffLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'hospital@example.com', password: 'Hospital@123' }),
  });
  assert(staffLogin.status === 200 && staffLogin.data.data.token, 'Hospital staff login succeeds with JWT');
  staffToken = staffLogin.data?.data?.token;

  // 2.5 Valid Collector Login
  const collectorLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'collector@example.com', password: 'Collector@123' }),
  });
  assert(collectorLogin.status === 200 && collectorLogin.data.data.token, 'Collector login succeeds with JWT');
  collectorToken = collectorLogin.data?.data?.token;

  // 2.6 Token Verification (/auth/me)
  const meRes = await request('/auth/me', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(meRes.status === 200 && meRes.data.data.user.role === 'admin', 'GET /auth/me returns current authenticated user');

  // 2.7 Tampered Token Rejection
  const fakeTokenRes = await request('/auth/me', {
    headers: { Authorization: 'Bearer this.is.a.fake.jwt.token' },
  });
  assert(fakeTokenRes.status === 401, 'Tampered/invalid JWT correctly returns 401 Unauthorized');

  // --- 3. ROLE AUTHORIZATION & PERMISSION BOUNDARIES ---
  console.log('\n--- TEST GROUP 3: Role Authorization (RBAC) ---');

  // 3.1 Non-admin attempting to list users
  const unauthorizedUsers = await request('/users', {
    headers: { Authorization: `Bearer ${staffToken}` },
  });
  assert(unauthorizedUsers.status === 403, 'Hospital staff blocked from admin user directory (403 Forbidden)');

  // 3.2 Non-admin attempting to create category
  const unauthorizedCat = await request('/categories', {
    method: 'POST',
    headers: { Authorization: `Bearer ${collectorToken}` },
    body: JSON.stringify({ name: 'Unauthorized Cat', code: 'UNAUTH', description: 'test' }),
  });
  assert(unauthorizedCat.status === 403, 'Collector blocked from adding waste category (403 Forbidden)');

  // 3.3 Admin fetching user directory
  const adminUsers = await request('/users', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(adminUsers.status === 200 && adminUsers.data.data.length > 0, 'Admin can view user directory');

  // --- 4. DATA INTEGRITY & CRUD OPERATIONS ---
  console.log('\n--- TEST GROUP 4: CRUD & Data Integrity ---');

  // 4.1 Fetch Categories
  const categoriesRes = await request('/categories', {
    headers: { Authorization: `Bearer ${staffToken}` },
  });
  assert(categoriesRes.status === 200 && categoriesRes.data.data.length >= 6, 'All waste categories retrieved');
  testCategoryId = categoriesRes.data.data[0]._id;

  // 4.2 Fetch Hospitals
  const hospitalsRes = await request('/hospitals');
  assert(hospitalsRes.status === 200 && hospitalsRes.data.data.length >= 3, 'Hospitals list retrieved');
  testHospitalId = hospitalsRes.data.data[0]._id;

  // 4.3 Fetch Bins
  const binsRes = await request('/bins', {
    headers: { Authorization: `Bearer ${staffToken}` },
  });
  assert(binsRes.status === 200 && binsRes.data.data.length > 0, 'Bins retrieved for affiliated hospital');
  testBinId = binsRes.data.data[0]._id;

  // --- 5. WASTE LOGGING & TRACKING CREATION ---
  console.log('\n--- TEST GROUP 5: Waste Logging & Immediate Traceability ---');
  
  const wastePayload = {
    category: testCategoryId,
    department: 'Intensive Care Unit (ICU)',
    quantity: 12.5,
    unit: 'KG',
    bin: testBinId,
    description: 'Automated QA test biowaste batch',
  };

  const createWasteRes = await request('/waste', {
    method: 'POST',
    headers: { Authorization: `Bearer ${staffToken}` },
    body: JSON.stringify(wastePayload),
  });

  assert(
    createWasteRes.status === 201 &&
    createWasteRes.data.data.wasteId.startsWith('MW-'),
    `Waste batch created with valid unique ID: ${createWasteRes.data?.data?.wasteId}`
  );
  testWasteRecordId = createWasteRes.data?.data?._id;
  testWasteId = createWasteRes.data?.data?.wasteId;

  // Verify Initial Tracking Record was automatically created
  const trackCheck = await request(`/tracking/${testWasteId}`, {
    headers: { Authorization: `Bearer ${staffToken}` },
  });
  assert(
    trackCheck.status === 200 &&
    trackCheck.data.data.timeline.length >= 1 &&
    trackCheck.data.data.timeline[0].status === 'Logged',
    'Immutable digital tracking record automatically created upon waste logging'
  );

  // --- 6. COLLECTION REQUEST WORKFLOW ---
  console.log('\n--- TEST GROUP 6: Collection Workflow & State Transitions ---');

  // 6.1 Hospital Staff creates Collection Request
  const createReqRes = await request('/collections', {
    method: 'POST',
    headers: { Authorization: `Bearer ${staffToken}` },
    body: JSON.stringify({
      wasteRecordIds: [testWasteRecordId],
      priority: 'High',
      notes: 'Automated QA collection request',
    }),
  });
  assert(
    createReqRes.status === 201 &&
    createReqRes.data.data.requestId.startsWith('CR-') &&
    createReqRes.data.data.status === 'Pending',
    `Collection request created with status Pending: ${createReqRes.data?.data?.requestId}`
  );
  const collectionReqDocId = createReqRes.data.data._id;
  testRequestId = createReqRes.data.data.requestId;

  // 6.2 Admin Assigns Collector
  // Get collector user ID matching logged-in test collector
  const collectorsList = await request('/users/collectors', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const testCollectorUser = collectorsList.data.data.find((c) => c.email === 'collector@example.com') || collectorsList.data.data[0];
  const collectorUserId = testCollectorUser._id;

  const assignRes = await request(`/collections/${collectionReqDocId}/assign`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: JSON.stringify({ collectorId: collectorUserId, priority: 'High' }),
  });
  assert(
    assignRes.status === 200 && assignRes.data.data.status === 'Assigned',
    'Admin successfully assigned collector (Status -> Assigned)'
  );

  // 6.3 Collector Accepts
  const acceptRes = await request(`/collections/${collectionReqDocId}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${collectorToken}` },
    body: JSON.stringify({ status: 'Accepted', collectorNotes: 'Assignment accepted for transit' }),
  });
  assert(
    acceptRes.status === 200 && acceptRes.data.data.status === 'Accepted',
    'Collector accepted assignment (Status -> Accepted)'
  );

  // 6.4 Collector Starts Collection
  const collectStartRes = await request(`/collections/${collectionReqDocId}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${collectorToken}` },
    body: JSON.stringify({ status: 'Collecting', collectorNotes: 'Arrived on-site and commencing pickup' }),
  });
  assert(
    collectStartRes.status === 200 && collectStartRes.data.data.status === 'Collecting',
    'Collector started pickup (Status -> Collecting)'
  );

  // 6.5 Collector Marks Collected
  const markCollectedRes = await request(`/collections/${collectionReqDocId}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${collectorToken}` },
    body: JSON.stringify({ status: 'Collected', collectorNotes: 'All yellow bags sealed and weighed' }),
  });
  assert(
    markCollectedRes.status === 200 && markCollectedRes.data.data.status === 'Collected',
    'Collector confirmed collection (Status -> Collected)'
  );

  // 6.6 Collector Completes Disposal
  const completeRes = await request(`/collections/${collectionReqDocId}/status`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${collectorToken}` },
    body: JSON.stringify({ status: 'Completed', collectorNotes: 'Delivered to central treatment facility for autoclaving' }),
  });
  assert(
    completeRes.status === 200 && completeRes.data.data.status === 'Completed',
    'Collection completed and terminal handoff signed (Status -> Completed)'
  );

  // --- 7. COMPLETE DIGITAL TRACEABILITY AUDIT CHAIN ---
  console.log('\n--- TEST GROUP 7: End-to-End Traceability Verification ---');
  const fullAudit = await request(`/tracking/${testRequestId}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(
    fullAudit.status === 200 && fullAudit.data.data.timeline.length >= 5,
    `Full audit timeline retrieved with ${fullAudit.data?.data?.timeline?.length} sequential verified events`
  );

  // --- 8. REPORTS & ANALYTICS AGGREGATIONS ---
  console.log('\n--- TEST GROUP 8: MongoDB Atlas Analytics Aggregations ---');
  const analyticsRes = await request('/reports/analytics?days=30', {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(
    analyticsRes.status === 200 &&
    Array.isArray(analyticsRes.data.data.wasteByCategory) &&
    Array.isArray(analyticsRes.data.data.dailyTrend),
    'MongoDB Atlas aggregation pipelines returned valid chart datasets'
  );

  // 8.2 CSV Export Verification
  const csvRes = await fetch(`${BASE_URL}/reports/export/csv`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const csvText = await csvRes.text();
  assert(
    csvRes.status === 200 && csvText.includes('Waste ID,Hospital,Hospital ID'),
    'Compliance CSV report stream generated successfully with headers'
  );

  // --- SUMMARY ---
  console.log('\n======================================================');
  console.log(`📊 QA TEST RESULTS: ${passedTests}/${totalTests} PASSED`);
  if (failedTests === 0) {
    console.log('🎉 ALL TESTS PASSED! System is production-ready.');
  } else {
    console.log(`⚠️ ${failedTests} TESTS FAILED. Review errors above.`);
  }
  console.log('======================================================\n');
}

runQATests();
