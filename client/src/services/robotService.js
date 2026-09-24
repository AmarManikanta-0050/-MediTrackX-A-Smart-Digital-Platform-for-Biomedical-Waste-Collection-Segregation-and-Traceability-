import api from './api';

export const robotService = {
  getTasks: (params) => api.get('/robot/tasks', { params }),
  dispatchTask: (data) => api.post('/robot/dispatch', data),
  updateStatus: (id, status) => api.patch(`/robot/tasks/${id}/status`, { status }),
  getFleet: () => api.get('/robot/fleet'),
};
