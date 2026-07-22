import axiosInstance from './axiosInstance';

export const getStats = (params) => axiosInstance.get('/analytics', { params }).then((r) => r.data.data);
