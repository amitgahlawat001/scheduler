import axiosInstance from './axiosInstance';

export const createEventType = (payload) => axiosInstance.post('/event-types', payload).then((r) => r.data.data);
export const listEventTypes = () => axiosInstance.get('/event-types').then((r) => r.data.data.eventTypes);
export const updateEventType = (id, payload) => axiosInstance.patch(`/event-types/${id}`, payload).then((r) => r.data.data);
export const deleteEventType = (id) => axiosInstance.delete(`/event-types/${id}`).then((r) => r.data.data);
