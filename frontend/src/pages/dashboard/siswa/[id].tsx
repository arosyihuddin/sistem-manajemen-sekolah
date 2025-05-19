import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getSiswaById, updateSiswa, uploadFoto, uploadDokumenAkta } from '../../../api/siswa.api';
import { getKelasAll } from '../../../api/kelas.api';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import { toast } from 'sonner';
import { ArrowLeft, Upload } from 'lucide-react';

// Schema validasi
const siswaSchema = z.object({
  nis: z.string().min(3, 'NIS minimal 3 karakter'),
  nama: z.string().min(3, 'Nama minimal 3 karakter'),
  tempatLahir: z.string().optional().nullable(),
  tanggalLahir: z.string().optional().nullable(),
  jenisKelamin: z.enum(['Laki-laki', 'Perempuan']).optional().nullable(),
  agama: z.string().optional().nullable(),
  alamat: z.string().optional().nullable(),
  telepon: z.string().optional().nullable(),
  email: z.string().email('Email tidak valid').optional().nullable().or(z.literal('')),
  namaAyah: z.string().optional().nullable(),
  namaIbu: z.string().optional().nullable(),
  pekerjaanAyah: z.string().optional().nullable(),
  pekerjaanIbu: z.string().optional().nullable(),
  teleponOrtu: z.string().optional().nullable(),
  alamatOrtu: z.string().optional().nullable(),
  tahunMasuk: z.any().transform(val => val ? parseInt(val) : null).optional().nullable(),
  kelasId: z.any().transform(val => val ? parseInt(val) : null).optional().nullable(),
});

type SiswaFormValues = z.infer<typeof siswaSchema>;

const EditSiswaPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [aktaFile, setAktaFile] = useState<File | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<SiswaFormValues>({
    resolver: zodResolver(siswaSchema),
  });

  // Fetch siswa data
  const { data: siswaData, isLoading: isSiswaLoading } = useQuery({
    queryKey: ['siswa', id],
    queryFn: () => getSiswaById(Number(id)),
    enabled: !!id,
  });

  // Fetch kelas
  const { data: kelasData } = useQuery({
    queryKey: ['kelas'],
    queryFn: () => getKelasAll(1, 100, ''),
  });

  // Set form values when data is loaded
  useEffect(() => {
    if (siswaData) {
      reset({
        nis: siswaData.nis,
        nama: siswaData.nama,
        tempatLahir: siswaData.tempatLahir,
        tanggalLahir: siswaData.tanggalLahir ? siswaData.tanggalLahir.split('T')[0] : null,
        jenisKelamin: siswaData.jenisKelamin,
        agama: siswaData.agama,
        alamat: siswaData.alamat,
        telepon: siswaData.telepon,
        email: siswaData.email,
        namaAyah: siswaData.namaAyah,
        namaIbu: siswaData.namaIbu,
        pekerjaanAyah: siswaData.pekerjaanAyah,
        pekerjaanIbu: siswaData.pekerjaanIbu,
        teleponOrtu: siswaData.teleponOrtu,
        alamatOrtu: siswaData.alamatOrtu,
        tahunMasuk: siswaData.tahunMasuk,
        kelasId: siswaData.kelas?.id,
      });
    }
  }, [siswaData, reset]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => updateSiswa(Number(id), data),
    onSuccess: () => {
      toast.success('Data siswa berhasil diperbarui');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Terjadi kesalahan saat memperbarui siswa');
    },
  });

  const fotoMutation = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('foto', file);
      return uploadFoto(Number(id), formData);
    },
    onSuccess: () => {
      toast.success('Foto berhasil diupload');
      setFotoFile(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Terjadi kesalahan saat upload foto');
    },
  });

  const aktaMutation = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append('akta', file);
      return uploadDokumenAkta(Number(id), formData);
    },
    onSuccess: () => {
      toast.success('Dokumen akta berhasil diupload');
      setAktaFile(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Terjadi kesalahan saat upload dokumen akta');
    },
  });

  const onSubmit = (data: SiswaFormValues) => {
    const formattedData: any = {
      nis: data.nis,
      nama: data.nama,
      tempatLahir: data.tempatLahir,
      tanggalLahir: data.tanggalLahir,
      jenisKelamin: data.jenisKelamin,
      agama: data.agama,
      alamat: data.alamat,
      telepon: data.telepon,
      email: data.email,
      namaAyah: data.namaAyah,
      namaIbu: data.namaIbu,
      pekerjaanAyah: data.pekerjaanAyah,
      pekerjaanIbu: data.pekerjaanIbu,
      teleponOrtu: data.teleponOrtu,
      alamatOrtu: data.alamatOrtu,
      tahunMasuk: data.tahunMasuk,
    };

    // Add kelas if selected
    if (data.kelasId) {
      formattedData.kelas = { id: data.kelasId };
    }

    updateMutation.mutate(formattedData);
  };

  const handleFotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFotoFile(e.target.files[0]);
    }
  };

  const handleAktaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAktaFile(e.target.files[0]);
    }
  };

  const uploadFotoHandler = () => {
    if (fotoFile) {
      fotoMutation.mutate(fotoFile);
    }
  };

  const uploadAktaHandler = () => {
    if (aktaFile) {
      aktaMutation.mutate(aktaFile);
    }
  };

  if (isSiswaLoading) {
    return (
      <DashboardLayout>
        <div className="p-6 flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

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
          <h1 className="text-2xl font-bold">Edit Siswa: {siswaData?.nama}</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Foto Siswa</h2>
              <div className="mb-4">
                {siswaData?.foto ? (
                  <img 
                    src={`/uploads/siswa/${siswaData.foto}`} 
                    alt={siswaData.nama}
                    className="w-full h-64 object-cover rounded-md"
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-200 flex items-center justify-center rounded-md">
                    <span className="text-gray-500">Belum ada foto</span>
                  </div>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Upload Foto Baru
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFotoUpload}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              {fotoFile && (
                <Button
                  variant="secondary"
                  onClick={uploadFotoHandler}
                  isLoading={fotoMutation.isPending}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Foto
                </Button>
              )}
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Dokumen Akta</h2>
              <div className="mb-4">
                {siswaData?.dokumenAkta ? (
                  <div className="p-4 border rounded-md">
                    <p className="font-medium">Dokumen tersedia:</p>
                    <p className="text-blue-500">{siswaData.dokumenAkta}</p>
                    <a 
                      href={`/uploads/siswa/${siswaData.dokumenAkta}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline mt-2 inline-block"
                    >
                      Lihat Dokumen
                    </a>
                  </div>
                ) : (
                  <div className="w-full h-32 bg-gray-200 flex items-center justify-center rounded-md">
                    <span className="text-gray-500">Belum ada dokumen akta</span>
                  </div>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Upload Dokumen Akta
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleAktaUpload}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              {aktaFile && (
                <Button
                  variant="secondary"
                  onClick={uploadAktaHandler}
                  isLoading={aktaMutation.isPending}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Akta
                </Button>
              )}
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Info Akun</h2>
              {siswaData?.user ? (
                <div>
                  <p className="mb-2">
                    <span className="font-medium">Username:</span> {siswaData.user.username}
                  </p>
                  <p className="mb-2">
                    <span className="font-medium">Email:</span> {siswaData.user.email}
                  </p>
                  <p className="text-green-600 font-medium">
                    Siswa sudah memiliki akun pengguna
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-red-600 mb-4">
                    Siswa belum memiliki akun pengguna
                  </p>
                  <Button
                    variant="secondary"
                    onClick={() => navigate(`/dashboard/siswa/${id}/create-user`)}
                    className="w-full"
                  >
                    Buat Akun Pengguna
                  </Button>
                </div>
              )}
            </div>
          </Card>
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
                isLoading={updateMutation.isPending}
              >
                Simpan Perubahan
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default EditSiswaPage;