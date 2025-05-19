import axios from 'axios';
import { Siswa } from './siswa.api';
import { MataPelajaran } from './mata-pelajaran.api';

const API_URL = '/api';

// Interfaces
export interface Kelas {
  id: number;
  nama: string;
  tingkat?: string;
  jurusan?: string;
  kodeKelas?: string;
  ruangan?: string;
  status: boolean;
  waliKelas?: {
    id: number;
    nama: string;
    nip: string;
  };
  tahunAjaran?: {
    id: number;
    nama: string;
    tahunMulai: number;
    tahunSelesai: number;
  };
  siswa?: Siswa[];
  mataPelajaran?: MataPelajaran[];
  createdAt: string;
  updatedAt: string;
}

export interface KelasCreateInput {
  nama: string;
  tingkat?: string;
  jurusan?: string;
  kodeKelas?: string;
  ruangan?: string;
  waliKelas?: {
    id: number;
  };
  tahunAjaran?: {
    id: number;
  };
  mataPelajaranIds?: number[];
}

// Get all kelas with filters
export const getKelasAll = async (
  page = 1,
  limit = 10,
  search?: string,
  tingkat?: string,
  jurusan?: string,
  tahunAjaranId?: number,
  status?: boolean
) => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('limit', limit.toString());
  
  if (search) params.append('search', search);
  if (tingkat) params.append('tingkat', tingkat);
  if (jurusan) params.append('jurusan', jurusan);
  if (tahunAjaranId) params.append('tahunAjaranId', tahunAjaranId.toString());
  if (status !== undefined) params.append('status', status.toString());
  
  const response = await axios.get(`${API_URL}/kelas?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  return response.data;
};

// Get kelas by ID
export const getKelasById = async (id: number) => {
  const response = await axios.get(`${API_URL}/kelas/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  return response.data;
};

// Create kelas
export const createKelas = async (kelasData: KelasCreateInput) => {
  const response = await axios.post(`${API_URL}/kelas`, kelasData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  return response.data;
};

// Update kelas
export const updateKelas = async (id: number, kelasData: Partial<KelasCreateInput>) => {
  const response = await axios.put(`${API_URL}/kelas/${id}`, kelasData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  return response.data;
};

// Delete kelas (soft delete)
export const deleteKelas = async (id: number) => {
  const response = await axios.delete(`${API_URL}/kelas/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  return response.data;
};

// Restore kelas
export const restoreKelas = async (id: number) => {
  const response = await axios.post(`${API_URL}/kelas/${id}/restore`, {}, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  return response.data;
};

// Get siswa by kelas ID
export const getSiswaByKelasId = async (id: number) => {
  const response = await axios.get(`${API_URL}/kelas/${id}/siswa`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  return response.data;
};

// Get mata pelajaran by kelas ID
export const getMataPelajaranByKelasId = async (id: number) => {
  const response = await axios.get(`${API_URL}/kelas/${id}/mata-pelajaran`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  return response.data;
};

// Add mata pelajaran to kelas
export const addMataPelajaran = async (id: number, mataPelajaranId: number) => {
  const response = await axios.post(`${API_URL}/kelas/${id}/mata-pelajaran/${mataPelajaranId}`, {}, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  return response.data;
};

// Remove mata pelajaran from kelas
export const removeMataPelajaran = async (id: number, mataPelajaranId: number) => {
  const response = await axios.delete(`${API_URL}/kelas/${id}/mata-pelajaran/${mataPelajaranId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  return response.data;
};