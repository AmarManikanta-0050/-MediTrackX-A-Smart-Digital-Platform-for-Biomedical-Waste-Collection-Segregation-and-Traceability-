import api from './api';

export const gpsService = {
  getFleet: () => api.get('/gps/vehicles'),
  simulateStep: () => api.post('/gps/simulate-step'),
  updateLocation: (vehicleId, data) => api.post(`/gps/vehicles/${vehicleId}/location`, data),
  getVehicleRoute: (vehicleId) => api.get(`/gps/vehicles/${vehicleId}/route`),
};
