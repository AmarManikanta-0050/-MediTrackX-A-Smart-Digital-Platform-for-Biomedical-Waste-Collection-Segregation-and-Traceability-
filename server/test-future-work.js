const API_BASE = 'http://localhost:5000/api';

async function runFutureWorkTests() {
  console.log('====================================================');
  console.log('🧪 MEDITRACKX FUTURE WORK MODULE TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  // 1. Authenticate as Admin
  let adminToken = '';
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: 'Admin@123' }),
    });
    const data = await res.json();
    adminToken = data.data?.token || data.token;
    if (!adminToken) throw new Error('No token returned');
    console.log('✅ [1/8] Admin Auth Login: SUCCESS');
    passed++;
  } catch (err) {
    console.error('❌ [1/8] Admin Auth Login: FAILED', err.message);
    failed++;
  }

  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${adminToken}`,
  };

  // 2. AI Vision Telemetry
  try {
    const res = await fetch(`${API_BASE}/ai/telemetry`, { headers: authHeaders });
    const data = await res.json();
    if (data.success && data.data.top1Accuracy > 95) {
      console.log(`✅ [2/8] AI Vision Telemetry: SUCCESS (${data.data.modelName}, ${data.data.top1Accuracy}%)`);
      passed++;
    } else {
      throw new Error('Invalid telemetry payload');
    }
  } catch (err) {
    console.error('❌ [2/8] AI Vision Telemetry: FAILED', err.message);
    failed++;
  }

  // 3. AI Waste Classification
  try {
    const res = await fetch(`${API_BASE}/ai/classify`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        simulatedCategory: 'SHP',
        imageDescription: 'Disposed sharp syringe needle with puncture danger',
      }),
    });
    const data = await res.json();
    if (data.success && data.prediction.categoryCode === 'SHP') {
      console.log(`✅ [3/8] AI Waste Classification (Sharps): SUCCESS (${data.prediction.confidence}%)`);
      passed++;
    } else {
      throw new Error('Prediction mismatch');
    }
  } catch (err) {
    console.error('❌ [3/8] AI Waste Classification: FAILED', err.message);
    failed++;
  }

  // 4. IoT Live Telemetry
  try {
    const res = await fetch(`${API_BASE}/iot/live`, { headers: authHeaders });
    const data = await res.json();
    if (data.success && data.data.length > 0) {
      console.log(`✅ [4/8] IoT Live Telemetry: SUCCESS (${data.summary.totalBins} bins connected)`);
      passed++;
    } else {
      throw new Error('No smart bins returned');
    }
  } catch (err) {
    console.error('❌ [4/8] IoT Live Telemetry: FAILED', err.message);
    failed++;
  }

  // 5. IoT Simulation Pulse
  try {
    const res = await fetch(`${API_BASE}/iot/simulator/tick`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({}),
    });
    const data = await res.json();
    if (data.success) {
      console.log(`✅ [5/8] IoT Telemetry Simulator Pulse: SUCCESS`);
      passed++;
    } else {
      throw new Error('Simulation pulse failed');
    }
  } catch (err) {
    console.error('❌ [5/8] IoT Telemetry Simulator Pulse: FAILED', err.message);
    failed++;
  }

  // 6. GPS Fleet Vehicles
  try {
    const res = await fetch(`${API_BASE}/gps/vehicles`, { headers: authHeaders });
    const data = await res.json();
    if (data.success && data.data.length > 0) {
      console.log(`✅ [6/8] GPS Fleet Tracking Vehicles: SUCCESS (${data.data.length} vehicles online)`);
      passed++;
    } else {
      throw new Error('No vehicles returned');
    }
  } catch (err) {
    console.error('❌ [6/8] GPS Fleet Tracking Vehicles: FAILED', err.message);
    failed++;
  }

  // 7. GPS Movement Simulation Step
  try {
    const res = await fetch(`${API_BASE}/gps/simulate-step`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({}),
    });
    const data = await res.json();
    if (data.success) {
      console.log(`✅ [7/8] GPS Simulation Step: SUCCESS (Waypoint progression active)`);
      passed++;
    } else {
      throw new Error('GPS step simulation failed');
    }
  } catch (err) {
    console.error('❌ [7/8] GPS Simulation Step: FAILED', err.message);
    failed++;
  }

  // 8. AMR Robot Task Dispatch & List
  try {
    const res = await fetch(`${API_BASE}/robot/tasks`, { headers: authHeaders });
    const data = await res.json();
    if (data.success && data.data.length > 0) {
      console.log(`✅ [8/8] Autonomous Mobile Robot (AMR) Missions: SUCCESS (${data.data.length} tasks retrieved)`);
      passed++;
    } else {
      throw new Error('No robot tasks returned');
    }
  } catch (err) {
    console.error('❌ [8/8] Autonomous Mobile Robot (AMR) Missions: FAILED', err.message);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`🏁 TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log('====================================================');
}

runFutureWorkTests();
