import api from './api';

export const iotService = {
  getLiveTelemetry: () => api.get('/iot/live'),
  updateBinTelemetry: (binId, data) => api.post(`/iot/bins/${binId}/telemetry`, data),
  simulatePulse: () => api.post('/iot/simulator/tick'),
  calibrateBin: (binId) => api.post(`/iot/bins/${binId}/calibrate`),
};
