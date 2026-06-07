import api from './axios.js';

// ─── Tasks ─────────────────────────────────────────────────────────────────────
export const getCreatorTasks = (params) => api.get('/tasks/creator/my-tasks', { params });
export const createTask = (data) => api.post('/tasks', data);
export const updateTask = (id, data) => api.patch(`/tasks/${id}`, data);
export const cancelTask = (id) => api.delete(`/tasks/${id}/cancel`);
export const selectWorker = (taskId, workerId) => api.patch(`/tasks/${taskId}/select-worker`, { workerId });
export const reviewSubmission = (taskId, data) => api.patch(`/tasks/${taskId}/review`, data);
export const getTaskById = (id) => api.get(`/tasks/${id}`);

// ─── Wallet ────────────────────────────────────────────────────────────────────
export const getCreatorWalletBalance = () => api.get('/wallet/balance');
export const getCreatorTransactions = (params) => api.get('/wallet/transactions', { params });
export const createDepositIntent = (data) => api.post('/wallet/deposit', data);
