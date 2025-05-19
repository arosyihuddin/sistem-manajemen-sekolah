import axios from 'axios';
import { Guru } from './guru.api';

const API_URL = '/api';

// Interfaces
export interface MataPelajaran {
  id: number;
  nama: string;
  kode?: string;
  deskripsi?: string;
  kkm: number;
  jumlahJam: number;
  status: boolean;
  guru?: Guru[];
  createdAt: string;
  updatedAt: string;
}

export interface MataPelajaranCreateInput {
  nama: string;
  kode?: string;
  deskripsi?: string;
  kkm?: number;
  jumlahJam?: number;
  guruIds?: number[];
}

// Get all mata pelajaran with filters
export const getMataPelajaranAll = async (
  page = 1,
  limit = 10,
  search?: string,
  status?: boolean
) => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  
  if (search) params.append('search', search);
  if (status !== undefined) params.append('status', status.toString());
  
  const response = await axios.get(`${API_URL}/mata-pelajaran?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  return response.data;
};

// Get mata pelajaran by ID
export const getMataPelajaranById = async (id: number) => {
  const response = await axios.get(`${API_URL}/mata-pelajaran/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  return response.data;
};

// Create mata pelajaran
export const createMataPelajaran = async (mataPelajaranData: MataPelajaranCreateInput) => {
  const response = await axios.post(`${API_URL}/mata-pelajaran`, mataPelajaranData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  return response.data;
};

// Update mata pelajaran
export const updateMataPelajaran = async (id: number, mataPelajaranData: Partial<MataPelajaranCreateInput>) => {
  const response = await axios.put(`${API_URL}/mata-pelajaran/${id}`, mataPelajaranData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  return response.data;
};

// Delete mata pelajaran (soft delete)
export const deleteMataPelajaran = async (id: number) => {
  const response = await axios.delete(`${API_URL}/mata-pelajaran/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  return response.data;
};

// Restore mata pelajaran
export const restoreMataPelajaran = async (id: number) => {
  const response = await axios.post(`${API_URL}/mata-pelajaran/${id}/restore`, {}, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  return response.data;
};

// Get guru by mata pelajaran ID
export const getGuruByMataPelajaranId = async (id: number) => {
  const response = await axios.get(`${API_URL}/mata-pelajaran/${id}/guru`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  return response.data;
};

// Add guru to mata pelajaran
export const addGuru = async (id: number, guruId: number) => {
  const response = await axios.post(`${API_URL}/mata-pelajaran/${id}/guru/${guruId}`, {}, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  return response.data;
};

// Remove guru from mata pelajaran
export const removeGuru = async (id: number, guruId: number) => {
  const response = await axios.delete(`${API_URL}/mata-pelajaran/${id}/guru/${guruId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  return response.data;
};