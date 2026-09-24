import api from './api';

export const aiService = {
  classifyWaste: (data) => api.post('/ai/classify', data),
  getTelemetry: () => api.get('/ai/telemetry'),
  autoLogFromAI: (data) => api.post('/ai/auto-log', data),
};
