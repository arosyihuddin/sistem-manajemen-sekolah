import axios from 'axios';

// const API_URL = '/api'; // Menggunakan proxy
const API_URL = 'http://localhost:5000/api'; // Langsung ke backend

export const login = async (username: string, password: string) => {
  const response = await axios.post(`${API_URL}/auth/login`, {
    username,
    password
  });
  return response.data;
};

export const register = async (username: string, password: string, email: string, role?: string) => {
  const response = await axios.post(`${API_URL}/auth/register`, {
    username,
    password,
    email,
    role
  });
  return response.data;
};

export const changePassword = async (currentPassword: string, newPassword: string, confirmPassword: string) => {
  const response = await axios.post(
    `${API_URL}/auth/change-password`,
    {
      currentPassword,
      newPassword,
      confirmPassword
    },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    }
  );
  return response.data;
};

export const getMe = async () => {
  const response = await axios.get(`${API_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.data;
};

export const logout = async () => {
  const response = await axios.post(
    `${API_URL}/auth/logout`,
    {},
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    }
  );
  return response.data;
};