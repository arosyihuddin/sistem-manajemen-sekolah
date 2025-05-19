import axios from 'axios';

const API_URL = '/api';

// Interfaces
export interface Guru {
  id: number;
  nip: string;
  nama: string;
  tempatLahir?: string;
  tanggalLahir?: string;
  jenisKelamin?: string;
  agama?: string;
  alamat?: string;
  telepon?: string;
  email?: string;
  pendidikanTerakhir?: string;
  jurusan?: string;
  tahunMulaiMengajar?: number;
  foto?: string;
  status: boolean;
  mataPelajaran?: {
    id: number;
    nama: string;
    kode?: string;
  }[];
  kelasWali?: {
    id: number;
    nama: string;
  }[];
  user?: {
    id: string;
    username: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface GuruCreateInput {
  nip: string;
  nama: string;
  tempatLahir?: string;
  tanggalLahir?: string;
  jenisKelamin?: string;
  agama?: string;
  alamat?: string;
  telepon?: string;
  email?: string;
  pendidikanTerakhir?: string;
  jurusan?: string;
  tahunMulaiMengajar?: number;
  mataPelajaranIds?: number[];
  user?: {
    username: string;
    password: string;
    email?: string;
  };
}

// Get all guru with filters
export const getGuruAll = async (
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
  
  const response = await axios.get(`${API_URL}/guru?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  return response.data;
};

// Get guru by ID
export const getGuruById = async (id: number) => {
  const response = await axios.get(`${API_URL}/guru/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  return response.data;
};

// Get guru by NIP
export const getGuruByNIP = async (nip: string) => {
  const response = await axios.get(`${API_URL}/guru/nip/${nip}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  return response.data;
};

// Create guru
export const createGuru = async (guruData: GuruCreateInput) => {
  const response = await axios.post(`${API_URL}/guru`, guruData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  return response.data;
};

// Update guru
export const updateGuru = async (id: number, guruData: Partial<GuruCreateInput>) => {
  const response = await axios.put(`${API_URL}/guru/${id}`, guruData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  return response.data;
};

// Delete guru (soft delete)
export const deleteGuru = async (id: number) => {
  const response = await axios.delete(`${API_URL}/guru/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  return response.data;
};

// Restore guru
export const restoreGuru = async (id: number) => {
  const response = await axios.post(`${API_URL}/guru/${id}/restore`, {}, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  return response.data;
};

// Upload foto guru
export const uploadFotoGuru = async (id: number, file: File) => {
  const formData = new FormData();
  formData.append('foto', file);
  
  const response = await axios.post(`${API_URL}/guru/${id}/upload-foto`, formData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'multipart/form-data'
    }
  });
  
  return response.data;
};

// Create user for guru
export const createUserForGuru = async (
  id: number, 
  username: string, 
  password: string, 
  email?: string
) => {
  const response = await axios.post(`${API_URL}/guru/${id}/create-user`, {
    username,
    password,
    email
  }, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  return response.data;
};

// Add mata pelajaran to guru
export const addMataPelajaran = async (id: number, mataPelajaranId: number) => {
  const response = await axios.post(`${API_URL}/guru/${id}/mata-pelajaran/${mataPelajaranId}`, {}, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  return response.data;
};

// Remove mata pelajaran from guru
export const removeMataPelajaran = async (id: number, mataPelajaranId: number) => {
  const response = await axios.delete(`${API_URL}/guru/${id}/mata-pelajaran/${mataPelajaranId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });
  
  return response.data;
};