import axiosInstance from './axiosInstance';

export const createRule = (payload) => axiosInstance.post('/availability/rules', payload).then((r) => r.data.data);
export const listRules = () => axiosInstance.get('/availability/rules').then((r) => r.data.data.rules);
export const deleteRule = (id) => axiosInstance.delete(`/availability/rules/${id}`).then((r) => r.data.data);

export const createOverride = (payload) => axiosInstance.post('/availability/overrides', payload).then((r) => r.data.data);
export const listOverrides = () => axiosInstance.get('/availability/overrides').then((r) => r.data.data.overrides);
export const deleteOverride = (id) => axiosInstance.delete(`/availability/overrides/${id}`).then((r) => r.data.data);

export const generateLink = () => axiosInstance.post('/availability/generate-link').then((r) => r.data.data);
