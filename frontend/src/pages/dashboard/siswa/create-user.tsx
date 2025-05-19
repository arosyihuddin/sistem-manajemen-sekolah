import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { getSiswaById, createUserForSiswa } from '../../../api/siswa.api';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

// Schema validasi
const userSchema = z.object({
  username: z.string().min(3, 'Username minimal 3 karakter'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
  confirmPassword: z.string().min(6, 'Konfirmasi password minimal 6 karakter'),
  email: z.string().email('Email tidak valid').optional().or(z.literal('')),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Password dan konfirmasi password harus sama',
  path: ['confirmPassword'],
});

type UserFormValues = z.infer<typeof userSchema>;

const CreateUserForSiswaPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { register, handleSubmit, formState: { errors } } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
  });

  // Fetch siswa data
  const { data: siswaData, isLoading: isSiswaLoading } = useQuery({
    queryKey: ['siswa', id],
    queryFn: () => getSiswaById(Number(id)),
    enabled: !!id,
  });

  // Redirect if student already has a user
  useEffect(() => {
    if (siswaData && siswaData.user) {
      toast.error('Siswa ini sudah memiliki akun pengguna');
      navigate(`/dashboard/siswa/${id}`);
    }
  }, [siswaData, id, navigate]);

  const mutation = useMutation({
    mutationFn: (data: Omit<UserFormValues, 'confirmPassword'>) => 
      createUserForSiswa(Number(id), data),
    onSuccess: () => {
      toast.success('Akun pengguna berhasil dibuat');
      navigate(`/dashboard/siswa/${id}`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Terjadi kesalahan saat membuat akun pengguna');
    },
  });

  const onSubmit = (data: UserFormValues) => {
    const { confirmPassword, ...userData } = data;
    mutation.mutate(userData);
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
            onClick={() => navigate(`/dashboard/siswa/${id}`)}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <h1 className="text-2xl font-bold">Buat Akun untuk Siswa: {siswaData?.nama}</h1>
        </div>

        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="p-6">
            <div className="max-w-md mx-auto">
              <div className="mb-6">
                <p className="text-gray-700 mb-4">
                  Anda akan membuat akun pengguna untuk siswa <strong>{siswaData?.nama}</strong> dengan NIS <strong>{siswaData?.nis}</strong>.
                </p>
                <p className="text-gray-700 mb-4">
                  Akun ini akan digunakan oleh siswa untuk login ke sistem.
                </p>
              </div>

              <div className="mb-4">
                <Input
                  label="Username"
                  name="username"
                  register={register}
                  error={errors.username?.message}
                  required
                />
              </div>
              
              <div className="mb-4">
                <Input
                  label="Password"
                  name="password"
                  type="password"
                  register={register}
                  error={errors.password?.message}
                  required
                />
              </div>
              
              <div className="mb-4">
                <Input
                  label="Konfirmasi Password"
                  name="confirmPassword"
                  type="password"
                  register={register}
                  error={errors.confirmPassword?.message}
                  required
                />
              </div>
              
              <div className="mb-4">
                <Input
                  label="Email (opsional)"
                  name="email"
                  type="email"
                  register={register}
                  error={errors.email?.message}
                />
              </div>

              <div className="mt-8 flex justify-end">
                <Button
                  variant="secondary"
                  onClick={() => navigate(`/dashboard/siswa/${id}`)}
                  className="mr-2"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={mutation.isPending}
                >
                  Buat Akun
                </Button>
              </div>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CreateUserForSiswaPage;