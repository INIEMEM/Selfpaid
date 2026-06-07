import api from './axios.js';

// ─── Tasks ─────────────────────────────────────────────────────────────────────
export const browseTasks = (params) => api.get('/tasks', { params });
export const getTaskById = (id) => api.get(`/tasks/${id}`);
export const applyForTask = (taskId) => api.post(`/tasks/${taskId}/apply`);
export const getMyTasks = (params) => api.get('/tasks/worker/my-tasks', { params });
export const submitTaskWork = (taskId, formData) =>
  api.post(`/tasks/${taskId}/submit`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const raiseDispute = (taskId, data) => api.post(`/tasks/${taskId}/dispute`, data);

// ─── Wallet ────────────────────────────────────────────────────────────────────
export const getWalletBalance = () => api.get('/wallet/balance');
export const getTransactionHistory = (params) => api.get('/wallet/transactions', { params });
export const requestWithdrawal = (data) => api.post('/wallet/withdraw', data);
export const getMyWithdrawals = (params) => api.get('/wallet/withdraw', { params });
export const cancelWithdrawal = (id) => api.delete(`/wallet/withdraw/${id}`);
export const enterRaffle = () => api.post('/wallet/raffle');

// ─── Ratings ───────────────────────────────────────────────────────────────────
export const getUserRatings = (userId, params) => api.get(`/ratings/users/${userId}`, { params });
export const submitRating = (taskId, data) => api.post(`/ratings/tasks/${taskId}`, data);

// ─── Notifications ─────────────────────────────────────────────────────────────
export const getNotifications = (params) => api.get('/notifications', { params });
export const markNotificationRead = (id) => api.patch(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.patch('/notifications/read-all');
export const deleteNotification = (id) => api.delete(`/notifications/${id}`);

// ─── Profile ───────────────────────────────────────────────────────────────────
export const getMyProfile = () => api.get('/users/me');
export const updateProfile = (data) => api.patch('/users/me', data);
export const updateProfilePhoto = (formData) =>
  api.patch('/users/me/photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const changePassword = (data) => api.patch('/users/me/password', data);
