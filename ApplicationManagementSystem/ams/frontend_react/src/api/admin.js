import apiClient from './axiosConfig';

export const getAdminStats = () => apiClient.get('/admin/stats');

export const getAdminApplications = () => apiClient.get('/admin/applications');

export const getAdminApplicationDetail = (applicationId) =>
  apiClient.get(`/admin/applications/${applicationId}`);
