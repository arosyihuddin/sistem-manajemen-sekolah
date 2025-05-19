import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, PencilIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { toast } from 'sonner';
import { Siswa, getSiswaById, createUserForSiswa, uploadFotoSiswa } from '@/api/siswa.api';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/authStore';

// Schema for user creation
const userSchema = z.object({
  username: z.string().min(3, 'Username minimal 3 karakter'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  confirmPassword: z.string().min(6, 'Konfirmasi password minimal 6 karakter'),
  email: z.string().email('Email tidak valid').optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Password dan konfirmasi tidak cocok',
  path: ['confirmPassword'],
});

type UserFormValues = z.infer<typeof userSchema>;

const SiswaDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  
  const [siswa, setSiswa] = useState<Siswa | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
  });
  
  useEffect(() => {
    const fetchSiswa = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const response = await getSiswaById(parseInt(id));
        setSiswa(response.data);
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Gagal memuat data siswa');
        navigate('/dashboard/siswa');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSiswa();
  }, [id, navigate]);
  
  const handleCreateUser = async (data: UserFormValues) => {
    if (!id) return;
    
    try {
      setIsCreatingUser(true);
      await createUserForSiswa(
        parseInt(id),
        data.username,
        data.password,
        data.email
      );
      
      toast.success('Akun pengguna berhasil dibuat');
      setIsUserModalOpen(false);
      reset();
      
      // Refresh data
      const response = await getSiswaById(parseInt(id));
      setSiswa(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal membuat akun pengguna');
    } finally {
      setIsCreatingUser(false);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (file) {
      setSelectedFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  };
  
  const handleUploadFoto = async () => {
    if (!id || !selectedFile) return;
    
    try {
      setIsUploading(true);
      await uploadFotoSiswa(parseInt(id), selectedFile);
      
      toast.success('Foto berhasil diupload');
      setIsUploadModalOpen(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      
      // Refresh data
      const response = await getSiswaById(parseInt(id));
      setSiswa(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mengupload foto');
    } finally {
      setIsUploading(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded-full w-48 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded-md w-64"></div>
        </div>
      </div>
    );
  }
  
  if (!siswa) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="text-center">
          <h2 className="text-lg font-medium text-gray-900">Data tidak ditemukan</h2>
          <p className="mt-1 text-gray-500">Siswa yang Anda cari tidak ditemukan.</p>
          <Button
            className="mt-4"
            onClick={() => navigate('/dashboard/siswa')}
          >
            Kembali ke Daftar Siswa
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Button
            variant="ghost"
            className="mr-4"
            onClick={() => navigate('/dashboard/siswa')}
          >
            <ArrowLeftIcon className="h-5 w-5 mr-1" />
            Kembali
          </Button>
          <h1 className="text-2xl font-semibold text-gray-900">
            Detail Siswa: {siswa.nama}
          </h1>
        </div>
        
        {isAdmin && (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => navigate(`/dashboard/siswa/${siswa.id}/edit`)}
            >
              <PencilIcon className="h-5 w-5 mr-2" />
              Edit
            </Button>
            
            {!siswa.user && (
              <Button
                onClick={() => setIsUserModalOpen(true)}
              >
                <UserPlusIcon className="h-5 w-5 mr-2" />
                Buat Akun
              </Button>
            )}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Card>
            <div className="p-6 space-y-4">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="h-40 w-40 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                    {siswa.foto ? (
                      <img
                        src={`/api/uploads/siswa/${siswa.foto}`}
                        alt={siswa.nama}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="text-gray-400 text-4xl">
                        {siswa.nama.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  
                  {isAdmin && (
                    <button
                      className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md hover:bg-gray-50"
                      onClick={() => setIsUploadModalOpen(true)}
                    >
                      <PencilIcon className="h-5 w-5 text-gray-600" />
                    </button>
                  )}
                </div>
                
                <h2 className="mt-4 text-xl font-semibold text-gray-900">
                  {siswa.nama}
                </h2>
                <p className="text-gray-600">NIS: {siswa.nis}</p>
                
                <div className="mt-2">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                      siswa.status
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {siswa.status ? 'Aktif' : 'Tidak Aktif'}
                  </span>
                </div>
              </div>
              
              <div className="mt-6 border-t pt-4">
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Kelas</dt>
                    <dd className="font-medium">{siswa.kelas?.nama || '-'}</dd>
                  </div>
                  
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Jenis Kelamin</dt>
                    <dd className="font-medium">{siswa.jenisKelamin || '-'}</dd>
                  </div>
                  
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Tahun Masuk</dt>
                    <dd className="font-medium">{siswa.tahunMasuk || '-'}</dd>
                  </div>
                  
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Akun Pengguna</dt>
                    <dd className="font-medium">
                      {siswa.user ? (
                        <span className="text-green-600">Terdaftar</span>
                      ) : (
                        <span className="text-red-600">Belum ada</span>
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="md:col-span-2 space-y-6">
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-medium border-b pb-2 mb-4">Data Pribadi</h2>
              
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Tempat, Tanggal Lahir</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {siswa.tempatLahir 
                      ? `${siswa.tempatLahir}, ${siswa.tanggalLahir 
                          ? format(new Date(siswa.tanggalLahir), 'dd MMMM yyyy')
                          : '-'}`
                      : '-'}
                  </dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500">Agama</dt>
                  <dd className="mt-1 text-sm text-gray-900">{siswa.agama || '-'}</dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500">Alamat</dt>
                  <dd className="mt-1 text-sm text-gray-900">{siswa.alamat || '-'}</dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500">Telepon</dt>
                  <dd className="mt-1 text-sm text-gray-900">{siswa.telepon || '-'}</dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{siswa.email || '-'}</dd>
                </div>
              </dl>
            </div>
          </Card>
          
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-medium border-b pb-2 mb-4">Data Orang Tua</h2>
              
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Nama Ayah</dt>
                  <dd className="mt-1 text-sm text-gray-900">{siswa.namaAyah || '-'}</dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500">Nama Ibu</dt>
                  <dd className="mt-1 text-sm text-gray-900">{siswa.namaIbu || '-'}</dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500">Pekerjaan Ayah</dt>
                  <dd className="mt-1 text-sm text-gray-900">{siswa.pekerjaanAyah || '-'}</dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500">Pekerjaan Ibu</dt>
                  <dd className="mt-1 text-sm text-gray-900">{siswa.pekerjaanIbu || '-'}</dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500">Telepon Orang Tua</dt>
                  <dd className="mt-1 text-sm text-gray-900">{siswa.teleponOrtu || '-'}</dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-500">Alamat Orang Tua</dt>
                  <dd className="mt-1 text-sm text-gray-900">{siswa.alamatOrtu || '-'}</dd>
                </div>
              </dl>
            </div>
          </Card>
          
          {siswa.user && (
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-medium border-b pb-2 mb-4">Informasi Akun</h2>
                
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Username</dt>
                    <dd className="mt-1 text-sm text-gray-900">{siswa.user.username}</dd>
                  </div>
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">{siswa.user.email || '-'}</dd>
                  </div>
                </dl>
              </div>
            </Card>
          )}
        </div>
      </div>
      
      {/* Modal for creating user */}
      <Modal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        title="Buat Akun Pengguna"
        footer={
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsUserModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              form="create-user-form"
              isLoading={isCreatingUser}
            >
              Buat Akun
            </Button>
          </div>
        }
      >
        <form 
          id="create-user-form" 
          onSubmit={handleSubmit(handleCreateUser)}
          className="space-y-4"
        >
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username <span className="text-red-500">*</span>
            </label>
            <Input
              id="username"
              {...register('username')}
              error={errors.username?.message}
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password <span className="text-red-500">*</span>
            </label>
            <Input
              id="password"
              type="password"
              {...register('password')}
              error={errors.password?.message}
            />
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Konfirmasi Password <span className="text-red-500">*</span>
            </label>
            <Input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              error={errors.email?.message}
            />
          </div>
        </form>
      </Modal>
      
      {/* Modal for uploading photo */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => {
          setIsUploadModalOpen(false);
          setSelectedFile(null);
          setPreviewUrl(null);
        }}
        title="Upload Foto Siswa"
        footer={
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsUploadModalOpen(false);
                setSelectedFile(null);
                setPreviewUrl(null);
              }}
            >
              Batal
            </Button>
            <Button
              onClick={handleUploadFoto}
              isLoading={isUploading}
              disabled={!selectedFile}
            >
              Upload
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="h-40 w-40 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
              ) : siswa.foto ? (
                <img
                  src={`/api/uploads/siswa/${siswa.foto}`}
                  alt={siswa.nama}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="text-gray-400 text-4xl">
                  {siswa.nama.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">
              Pilih Foto
            </label>
            <div className="mt-1 flex items-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary-50 file:text-primary-700
                  hover:file:bg-primary-100"
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              JPG, PNG, atau GIF. Maksimal 2MB.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SiswaDetailPage;