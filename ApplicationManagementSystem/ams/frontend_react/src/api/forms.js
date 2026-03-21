import apiClient from './axiosConfig';

export const getAllForms = () => {
  return apiClient.get('/forms');
};

export const getFormById = (formId) => {
  return apiClient.get(`/forms/${formId}/detail`);
};

export const createForm = (formData) => {
  return apiClient.post('/forms', formData);
};

export const updateForm = (formId, formData) => {
  return apiClient.put(`/forms/${formId}`, formData);
};

export const deleteForm = (formId) => {
  return apiClient.delete(`/forms/${formId}`);
};

export const getFormFields = (formId) => {
  return apiClient.get(`/forms/${formId}/detail`);
};

export const addFormSection = (formId, payload) => {
  return apiClient.post(`/forms/${formId}/sections`, payload);
};

export const addFormDocumentConfig = (formId, payload) => {
  return apiClient.post(`/forms/${formId}/documents`, payload);
};
