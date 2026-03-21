import apiClient from './axiosConfig';

export const submitApplication = (formId, data) => {
  return apiClient.post(`/applications/${formId}/submit`, data);
};

export const getApplications = (filters = {}) => {
  return apiClient.get('/applications', { params: filters });
};

export const getApplicationById = (applicationId) => {
  return apiClient.get(`/applications/${applicationId}`);
};

export const updateApplicationStatus = (applicationId, status) => {
  return apiClient.put(`/applications/${applicationId}/status`, { status });
};

export const getClientApplications = () => {
  return apiClient.get('/applications');
};

export const createApplication = (formId) => {
  return apiClient.post('/applications', { form_id: formId });
};
