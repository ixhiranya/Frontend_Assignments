import apiClient from './axiosConfig';

export const uploadDocument = ({ applicationId, documentId, file }) => {
  const formData = new FormData();
  formData.append('application_id', applicationId);
  formData.append('document_id', documentId);
  formData.append('file', file);
  return apiClient.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getMasterDocuments = () => apiClient.get('/upload/master-documents');

export const addMasterDocument = (data) => apiClient.post('/upload/master-documents', data);

export const getDownloadUrl = (uploadId) => `${apiClient.defaults.baseURL}/upload/download/${uploadId}`;
