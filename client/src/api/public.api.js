import axiosInstance from './axiosInstance';

export const getPublicProfile = (slug) => axiosInstance.get(`/public/${slug}`).then((r) => r.data.data);
export const getEventTypeDetail = (slug, eventTypeSlug) =>
  axiosInstance.get(`/public/${slug}/${eventTypeSlug}`).then((r) => r.data.data);
export const getAvailableDates = (slug, eventTypeSlug) =>
  axiosInstance.get(`/public/${slug}/${eventTypeSlug}/dates`).then((r) => r.data.data.dates);
export const getAvailableChips = (slug, eventTypeSlug, date) =>
  axiosInstance.get(`/public/${slug}/${eventTypeSlug}/${date}`).then((r) => r.data.data.slots);
export const createBooking = (slug, eventTypeSlug, payload) =>
  axiosInstance.post(`/public/${slug}/${eventTypeSlug}/book`, payload).then((r) => r.data.data);
export const getBookingByToken = (cancelToken) =>
  axiosInstance.get(`/public/bookings/${cancelToken}`).then((r) => r.data.data);
export const rescheduleBooking = (cancelToken, slotStartUTC) =>
  axiosInstance.post(`/public/bookings/${cancelToken}/reschedule`, { slotStartUTC }).then((r) => r.data.data);
export const cancelBookingByToken = (cancelToken) =>
  axiosInstance.delete(`/public/bookings/${cancelToken}`).then((r) => r.data.data);
