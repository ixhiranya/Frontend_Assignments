import apiClient from './axiosConfig';

export const loginUser = (username, password) => {
  return apiClient.post('/auth/login', { username, password });
};

export const registerUser = (username, password, fullName) => {
  return apiClient.post('/auth/register', { username, password, full_name: fullName });
};

export const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userId');
};
