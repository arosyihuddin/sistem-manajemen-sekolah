import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { createSiswa } from '../../../api/siswa.api';
import { getKelasAll } from '../../../api/kelas.api';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

// Schema validasi
const siswaSchema = z.object({
  nis: z.string().min(3, 'NIS minimal 3 karakter'),
  nama: z.string().min(3, 'Nama minimal 3 karakter'),
  tempatLahir: z.string().optional(),
  tanggalLahir: z.string().optional(),
  jenisKelamin: z.enum(['Laki-laki', 'Perempuan']).optional(),
  agama: z.string().optional(),
  alamat: z.string().optional(),
  telepon: z.string().optional(),
  email: z.string().email('Email tidak valid').optional().or(z.literal('')),
  namaAyah: z.string().optional(),
  namaIbu: z.string().optional(),
  pekerjaanAyah: z.string().optional(),
  pekerjaanIbu: z.string().optional(),
  teleponOrtu: z.string().optional(),
  alamatOrtu: z.string().optional(),
  tahunMasuk: z.string().transform(val => val ? parseInt(val) : undefined).optional(),
  kelasId: z.string().transform(val => val ? parseInt(val) : undefined).optional(),
  
  // User data (optional)
  createUser: z.boolean().optional(),
  username: z.string().min(3, 'Username minimal 3 karakter').optional(),
  password: z.string().min(6, 'Password minimal 6 karakter').optional(),
  userEmail: z.string().email('Email tidak valid').optional().or(z.literal('')),
}).refine(
  (data) => {
    if (data.createUser) {
      return !!data.username && !!data.password;
    }
    return true;
  },
  {
    message: 'Username dan password diperlukan jika membuat akun',
    path: ['username'],
  }
);

type SiswaFormValues = z.infer<typeof siswaSchema>;

const TambahSiswaPage = () => {
  const navigate = useNavigate();
  const [createAccount, setCreateAccount] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<SiswaFormValues>({
    resolver: zodResolver(siswaSchema),
    defaultValues: {
      createUser: false,
    },
  });

  // Watch createUser value
  const watchCreateUser = watch('createUser');

  // Fetch kelas
  const { data: kelasData } = useQuery({
    queryKey: ['kelas'],
    queryFn: () => getKelasAll(1, 100, ''),
  });

  const mutation = useMutation({
    mutationFn: (data: any) => createSiswa(data),
    onSuccess: () => {
      toast.success('Siswa berhasil ditambahkan');
      navigate('/dashboard/siswa');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Terjadi kesalahan saat menambahkan siswa');
    },
  });

  const onSubmit = (data: SiswaFormValues) => {
    const formattedData: any = {
      nis: data.nis,
      nama: data.nama,
      tempatLahir: data.tempatLahir || null,
      tanggalLahir: data.tanggalLahir || null,
      jenisKelamin: data.jenisKelamin || null,
      agama: data.agama || null,
      alamat: data.alamat || null,
      telepon: data.telepon || null,
      email: data.email || null,
      namaAyah: data.namaAyah || null,
      namaIbu: data.namaIbu || null,
      pekerjaanAyah: data.pekerjaanAyah || null,
      pekerjaanIbu: data.pekerjaanIbu || null,
      teleponOrtu: data.teleponOrtu || null,
      alamatOrtu: data.alamatOrtu || null,
      tahunMasuk: data.tahunMasuk || null,
    };

    // Add kelas if selected
    if (data.kelasId) {
      formattedData.kelas = { id: data.kelasId };
    }

    // Add user if createUser is checked
    if (data.createUser) {
      formattedData.user = {
        username: data.username,
        password: data.password,
        email: data.userEmail || undefined,
      };
    }

    mutation.mutate(formattedData);
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Button 
            variant="secondary" 
            onClick={() => navigate('/dashboard/siswa')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <h1 className="text-2xl font-bold">Tambah Siswa Baru</h1>
        </div>

        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-semibold mb-4">Data Pribadi</h2>
                
                <div className="mb-4">
                  <Input
                    label="NIS"
                    name="nis"
                    register={register}
                    error={errors.nis?.message}
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <Input
                    label="Nama Lengkap"
                    name="nama"
                    register={register}
                    error={errors.nama?.message}
                    required
                  />
                </div>

                <div className="mb-4">
                  <Input
                    label="Tempat Lahir"
                    name="tempatLahir"
                    register={register}
                  />
                </div>

                <div className="mb-4">
                  <Input
                    label="Tanggal Lahir"
                    name="tanggalLahir"
                    type="date"
                    register={register}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    Jenis Kelamin
                  </label>
                  <select
                    {...register('jenisKelamin')}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pilih Jenis Kelamin</option>
                    <option value="Laki-laki">Laki-laki</option>
                    <option value="Perempuan">Perempuan</option>
                  </select>
                  {errors.jenisKelamin && (
                    <p className="text-red-500 text-sm mt-1">{errors.jenisKelamin.message}</p>
                  )}
                </div>

                <div className="mb-4">
                  <Input
                    label="Agama"
                    name="agama"
                    register={register}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    Alamat
                  </label>
                  <textarea
                    {...register('alamat')}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  ></textarea>
                </div>

                <div className="mb-4">
                  <Input
                    label="Telepon"
                    name="telepon"
                    register={register}
                  />
                </div>

                <div className="mb-4">
                  <Input
                    label="Email"
                    name="email"
                    type="email"
                    register={register}
                    error={errors.email?.message}
                  />
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-4">Data Orang Tua & Akademik</h2>
                
                <div className="mb-4">
                  <Input
                    label="Nama Ayah"
                    name="namaAyah"
                    register={register}
                  />
                </div>

                <div className="mb-4">
                  <Input
                    label="Nama Ibu"
                    name="namaIbu"
                    register={register}
                  />
                </div>

                <div className="mb-4">
                  <Input
                    label="Pekerjaan Ayah"
                    name="pekerjaanAyah"
                    register={register}
                  />
                </div>

                <div className="mb-4">
                  <Input
                    label="Pekerjaan Ibu"
                    name="pekerjaanIbu"
                    register={register}
                  />
                </div>

                <div className="mb-4">
                  <Input
                    label="Telepon Orang Tua"
                    name="teleponOrtu"
                    register={register}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    Alamat Orang Tua
                  </label>
                  <textarea
                    {...register('alamatOrtu')}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  ></textarea>
                </div>

                <div className="mb-4">
                  <Input
                    label="Tahun Masuk"
                    name="tahunMasuk"
                    type="number"
                    register={register}
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">
                    Kelas
                  </label>
                  <select
                    {...register('kelasId')}
                    className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Pilih Kelas</option>
                    {kelasData?.data?.map((kelas: any) => (
                      <option key={kelas.id} value={kelas.id}>
                        {kelas.nama}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-8">
                  <h2 className="text-lg font-semibold mb-4">Akun Pengguna</h2>
                  
                  <div className="mb-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        {...register('createUser')}
                        className="mr-2"
                        onChange={(e) => {
                          setValue('createUser', e.target.checked);
                          setCreateAccount(e.target.checked);
                        }}
                      />
                      <span>Buat akun pengguna untuk siswa ini</span>
                    </label>
                  </div>

                  {watchCreateUser && (
                    <>
                      <div className="mb-4">
                        <Input
                          label="Username"
                          name="username"
                          register={register}
                          error={errors.username?.message}
                          required={createAccount}
                        />
                      </div>
                      
                      <div className="mb-4">
                        <Input
                          label="Password"
                          name="password"
                          type="password"
                          register={register}
                          error={errors.password?.message}
                          required={createAccount}
                        />
                      </div>
                      
                      <div className="mb-4">
                        <Input
                          label="Email Akun (opsional)"
                          name="userEmail"
                          type="email"
                          register={register}
                          error={errors.userEmail?.message}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <Button
                variant="secondary"
                onClick={() => navigate('/dashboard/siswa')}
                className="mr-2"
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={mutation.isPending}
              >
                Simpan
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TambahSiswaPage;