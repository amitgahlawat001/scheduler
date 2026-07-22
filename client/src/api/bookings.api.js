import axiosInstance from './axiosInstance';

export const listBookings = (params) => axiosInstance.get('/bookings', { params }).then((r) => r.data.data);
export const cancelBooking = (id) => axiosInstance.delete(`/bookings/${id}`).then((r) => r.data.data);
export const setNoShow = (id, noShow) => axiosInstance.patch(`/bookings/${id}/no-show`, { noShow }).then((r) => r.data.data);
