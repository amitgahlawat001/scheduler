import axiosInstance from './axiosInstance';

export const signup = (payload) => axiosInstance.post('/auth/signup', payload).then((r) => r.data.data);
export const login = (payload) => axiosInstance.post('/auth/login', payload).then((r) => r.data.data);
export const refresh = () => axiosInstance.post('/auth/refresh').then((r) => r.data.data);
export const logout = () => axiosInstance.post('/auth/logout').then((r) => r.data.data);
export const me = () => axiosInstance.get('/auth/me').then((r) => r.data.data);
export const updateProfile = (payload) => axiosInstance.patch('/auth/profile', payload).then((r) => r.data.data);
