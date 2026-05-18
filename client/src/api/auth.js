import api from './axios.js';

export const loginUser = (data) => api.post('/auth/login', data);
export const registerUser = (data) => api.post('/auth/register', data);
export const forgotPassword = (data) => api.post('/auth/forgot-password', data);
export const resetPassword = (token, data) => api.patch(`/auth/reset-password/${token}`, data);
export const getMe = () => api.get('/auth/me');
export const logoutUser = () => api.post('/auth/logout');
export const getPublicStats = () => api.get('/public/stats');
