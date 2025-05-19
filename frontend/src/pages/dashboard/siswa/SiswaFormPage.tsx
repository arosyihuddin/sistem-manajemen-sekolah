import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { toast } from 'sonner';
import { SiswaCreateInput, createSiswa, getSiswaById, updateSiswa } from '@/api/siswa.api';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Select from 'react-select';
import { getKelasAll } from '@/api/kelas.api';
import { format, parse } from 'date-fns';

const userSchema = z.object({
  username: z.string().min(3, 'Username minimal 3 karakter'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  email: z.string().email('Email tidak valid').optional(),
});

const siswaSchema = z.object({
  nis: z.string().min(3, 'NIS minimal 3 karakter'),
  nama: z.string().min(3, 'Nama minimal 3 karakter'),
  tempatLahir: z.string().optional().nullable(),
  tanggalLahir: z.string().optional().nullable(),
  jenisKelamin: z.enum(['Laki-laki', 'Perempuan']).optional().nullable(),
  agama: z.string().optional().nullable(),
  alamat: z.string().optional().nullable(),
  telepon: z.string().optional().nullable(),
  email: z.string().email('Email tidak valid').optional().nullable(),
  namaAyah: z.string().optional().nullable(),
  namaIbu: z.string().optional().nullable(),
  pekerjaanAyah: z.string().optional().nullable(),
  pekerjaanIbu: z.string().optional().nullable(),
  teleponOrtu: z.string().optional().nullable(),
  alamatOrtu: z.string().optional().nullable(),
  tahunMasuk: z.number().optional().nullable(),
  kelasId: z.number().optional().nullable(),
  createUser: z.boolean().default(false),
  user: userSchema.optional(),
});

type SiswaFormValues = z.infer<typeof siswaSchema>;

const SiswaFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditMode);
  const [kelasList, setKelasList] = useState<{ value: number; label: string }[]>([]);
  
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<SiswaFormValues>({
    resolver: zodResolver(siswaSchema),
    defaultValues: {
      createUser: false,
    },
  });
  
  const createUser = watch('createUser');
  
  useEffect(() => {
    const fetchKelas = async () => {
      try {
        const response = await getKelasAll(1, 100, undefined, undefined, undefined, undefined, true);
        setKelasList(
          response.data.map((kelas: any) => ({
            value: kelas.id,
            label: kelas.nama,
          }))
        );
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Gagal memuat data kelas');
      }
    };
    
    fetchKelas();
    
    if (isEditMode && id) {
      const fetchSiswa = async () => {
        try {
          setIsFetching(true);
          const response = await getSiswaById(parseInt(id));
          const siswa = response.data;
          
          reset({
            nis: siswa.nis,
            nama: siswa.nama,
            tempatLahir: siswa.tempatLahir || null,
            tanggalLahir: siswa.tanggalLahir ? format(new Date(siswa.tanggalLahir), 'yyyy-MM-dd') : null,
            jenisKelamin: siswa.jenisKelamin || null,
            agama: siswa.agama || null,
            alamat: siswa.alamat || null,
            telepon: siswa.telepon || null,
            email: siswa.email || null,
            namaAyah: siswa.namaAyah || null,
            namaIbu: siswa.namaIbu || null,
            pekerjaanAyah: siswa.pekerjaanAyah || null,
            pekerjaanIbu: siswa.pekerjaanIbu || null,
            teleponOrtu: siswa.teleponOrtu || null,
            alamatOrtu: siswa.alamatOrtu || null,
            tahunMasuk: siswa.tahunMasuk || null,
            kelasId: siswa.kelas?.id || null,
            createUser: false,
          });
        } catch (error: any) {
          toast.error(error.response?.data?.message || 'Gagal memuat data siswa');
          navigate('/dashboard/siswa');
        } finally {
          setIsFetching(false);
        }
      };
      
      fetchSiswa();
    }
  }, [id, isEditMode, navigate, reset]);
  
  const onSubmit = async (data: SiswaFormValues) => {
    try {
      setIsLoading(true);
      
      // Transform data to API format
      const siswaData: SiswaCreateInput = {
        nis: data.nis,
        nama: data.nama,
        tempatLahir: data.tempatLahir || undefined,
        tanggalLahir: data.tanggalLahir || undefined,
        jenisKelamin: data.jenisKelamin || undefined,
        agama: data.agama || undefined,
        alamat: data.alamat || undefined,
        telepon: data.telepon || undefined,
        email: data.email || undefined,
        namaAyah: data.namaAyah || undefined,
        namaIbu: data.namaIbu || undefined,
        pekerjaanAyah: data.pekerjaanAyah || undefined,
        pekerjaanIbu: data.pekerjaanIbu || undefined,
        teleponOrtu: data.teleponOrtu || undefined,
        alamatOrtu: data.alamatOrtu || undefined,
        tahunMasuk: data.tahunMasuk || undefined,
        kelas: data.kelasId ? { id: data.kelasId } : undefined,
      };
      
      // Add user data if creating user
      if (data.createUser && data.user) {
        siswaData.user = {
          username: data.user.username,
          password: data.user.password,
          email: data.user.email,
        };
      }
      
      if (isEditMode && id) {
        await updateSiswa(parseInt(id), siswaData);
        toast.success('Siswa berhasil diperbarui');
      } else {
        await createSiswa(siswaData);
        toast.success('Siswa berhasil ditambahkan');
      }
      
      navigate('/dashboard/siswa');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menyimpan data siswa');
    } finally {
      setIsLoading(false);
    }
  };
  
  const jenisKelaminOptions = [
    { value: 'Laki-laki', label: 'Laki-laki' },
    { value: 'Perempuan', label: 'Perempuan' },
  ];
  
  const agamaOptions = [
    { value: 'Islam', label: 'Islam' },
    { value: 'Kristen', label: 'Kristen' },
    { value: 'Katolik', label: 'Katolik' },
    { value: 'Hindu', label: 'Hindu' },
    { value: 'Buddha', label: 'Buddha' },
    { value: 'Konghucu', label: 'Konghucu' },
  ];
  
  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded-full w-48 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded-md w-64"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
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
          {isEditMode ? 'Edit Siswa' : 'Tambah Siswa'}
        </h1>
      </div>
      
      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h2 className="text-lg font-medium border-b pb-2">Data Pribadi</h2>
              
              <div>
                <label htmlFor="nis" className="block text-sm font-medium text-gray-700">
                  NIS <span className="text-red-500">*</span>
                </label>
                <Input
                  id="nis"
                  {...register('nis')}
                  error={errors.nis?.message}
                />
              </div>
              
              <div>
                <label htmlFor="nama" className="block text-sm font-medium text-gray-700">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <Input
                  id="nama"
                  {...register('nama')}
                  error={errors.nama?.message}
                />
              </div>
              
              <div>
                <label htmlFor="jenisKelamin" className="block text-sm font-medium text-gray-700">
                  Jenis Kelamin
                </label>
                <Controller
                  control={control}
                  name="jenisKelamin"
                  render={({ field }) => (
                    <Select
                      id="jenisKelamin"
                      options={jenisKelaminOptions}
                      value={
                        jenisKelaminOptions.find(
                          (option) => option.value === field.value
                        ) || null
                      }
                      onChange={(option) => field.onChange(option?.value)}
                      isClearable
                      placeholder="Pilih jenis kelamin"
                      className="react-select-container"
                      classNamePrefix="react-select"
                    />
                  )}
                />
                {errors.jenisKelamin && (
                  <p className="mt-1 text-sm text-red-600">{errors.jenisKelamin.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="tempatLahir" className="block text-sm font-medium text-gray-700">
                  Tempat Lahir
                </label>
                <Input
                  id="tempatLahir"
                  {...register('tempatLahir')}
                  error={errors.tempatLahir?.message}
                />
              </div>
              
              <div>
                <label htmlFor="tanggalLahir" className="block text-sm font-medium text-gray-700">
                  Tanggal Lahir
                </label>
                <Input
                  id="tanggalLahir"
                  type="date"
                  {...register('tanggalLahir')}
                  error={errors.tanggalLahir?.message}
                />
              </div>
              
              <div>
                <label htmlFor="agama" className="block text-sm font-medium text-gray-700">
                  Agama
                </label>
                <Controller
                  control={control}
                  name="agama"
                  render={({ field }) => (
                    <Select
                      id="agama"
                      options={agamaOptions}
                      value={
                        agamaOptions.find((option) => option.value === field.value) || null
                      }
                      onChange={(option) => field.onChange(option?.value)}
                      isClearable
                      placeholder="Pilih agama"
                      className="react-select-container"
                      classNamePrefix="react-select"
                    />
                  )}
                />
                {errors.agama && (
                  <p className="mt-1 text-sm text-red-600">{errors.agama.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="alamat" className="block text-sm font-medium text-gray-700">
                  Alamat
                </label>
                <textarea
                  id="alamat"
                  {...register('alamat')}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
                {errors.alamat && (
                  <p className="mt-1 text-sm text-red-600">{errors.alamat.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="telepon" className="block text-sm font-medium text-gray-700">
                  Nomor Telepon
                </label>
                <Input
                  id="telepon"
                  {...register('telepon')}
                  error={errors.telepon?.message}
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
            </div>
            
            <div className="space-y-4">
              <h2 className="text-lg font-medium border-b pb-2">Data Akademik & Orang Tua</h2>
              
              <div>
                <label htmlFor="kelasId" className="block text-sm font-medium text-gray-700">
                  Kelas
                </label>
                <Controller
                  control={control}
                  name="kelasId"
                  render={({ field }) => (
                    <Select
                      id="kelasId"
                      options={kelasList}
                      value={
                        kelasList.find((option) => option.value === field.value) || null
                      }
                      onChange={(option) => field.onChange(option?.value)}
                      isClearable
                      placeholder="Pilih kelas"
                      className="react-select-container"
                      classNamePrefix="react-select"
                    />
                  )}
                />
                {errors.kelasId && (
                  <p className="mt-1 text-sm text-red-600">{errors.kelasId.message}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="tahunMasuk" className="block text-sm font-medium text-gray-700">
                  Tahun Masuk
                </label>
                <Input
                  id="tahunMasuk"
                  type="number"
                  {...register('tahunMasuk', { valueAsNumber: true })}
                  error={errors.tahunMasuk?.message}
                />
              </div>
              
              <div>
                <label htmlFor="namaAyah" className="block text-sm font-medium text-gray-700">
                  Nama Ayah
                </label>
                <Input
                  id="namaAyah"
                  {...register('namaAyah')}
                  error={errors.namaAyah?.message}
                />
              </div>
              
              <div>
                <label htmlFor="namaIbu" className="block text-sm font-medium text-gray-700">
                  Nama Ibu
                </label>
                <Input
                  id="namaIbu"
                  {...register('namaIbu')}
                  error={errors.namaIbu?.message}
                />
              </div>
              
              <div>
                <label htmlFor="pekerjaanAyah" className="block text-sm font-medium text-gray-700">
                  Pekerjaan Ayah
                </label>
                <Input
                  id="pekerjaanAyah"
                  {...register('pekerjaanAyah')}
                  error={errors.pekerjaanAyah?.message}
                />
              </div>
              
              <div>
                <label htmlFor="pekerjaanIbu" className="block text-sm font-medium text-gray-700">
                  Pekerjaan Ibu
                </label>
                <Input
                  id="pekerjaanIbu"
                  {...register('pekerjaanIbu')}
                  error={errors.pekerjaanIbu?.message}
                />
              </div>
              
              <div>
                <label htmlFor="teleponOrtu" className="block text-sm font-medium text-gray-700">
                  Nomor Telepon Orang Tua
                </label>
                <Input
                  id="teleponOrtu"
                  {...register('teleponOrtu')}
                  error={errors.teleponOrtu?.message}
                />
              </div>
              
              <div>
                <label htmlFor="alamatOrtu" className="block text-sm font-medium text-gray-700">
                  Alamat Orang Tua
                </label>
                <textarea
                  id="alamatOrtu"
                  {...register('alamatOrtu')}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
                {errors.alamatOrtu && (
                  <p className="mt-1 text-sm text-red-600">{errors.alamatOrtu.message}</p>
                )}
              </div>
              
              {!isEditMode && (
                <div className="pt-4">
                  <h2 className="text-lg font-medium border-b pb-2">Akun Pengguna</h2>
                  
                  <div className="mt-2">
                    <div className="flex items-center">
                      <input
                        id="createUser"
                        type="checkbox"
                        {...register('createUser')}
                        className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <label htmlFor="createUser" className="ml-2 text-sm text-gray-700">
                        Buat akun untuk siswa
                      </label>
                    </div>
                  </div>
                  
                  {createUser && (
                    <div className="mt-4 space-y-4">
                      <div>
                        <label htmlFor="user.username" className="block text-sm font-medium text-gray-700">
                          Username <span className="text-red-500">*</span>
                        </label>
                        <Input
                          id="user.username"
                          {...register('user.username')}
                          error={errors.user?.username?.message}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="user.password" className="block text-sm font-medium text-gray-700">
                          Password <span className="text-red-500">*</span>
                        </label>
                        <Input
                          id="user.password"
                          type="password"
                          {...register('user.password')}
                          error={errors.user?.password?.message}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="user.email" className="block text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <Input
                          id="user.email"
                          type="email"
                          {...register('user.email')}
                          error={errors.user?.email?.message}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard/siswa')}
            >
              Batal
            </Button>
            <Button
              type="submit"
              isLoading={isLoading}
            >
              {isEditMode ? 'Perbarui' : 'Simpan'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default SiswaFormPage;