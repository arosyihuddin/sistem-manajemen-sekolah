import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="text-center">
        <h1 className="text-6xl font-extrabold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-600 mb-6">Halaman Tidak Ditemukan</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Maaf, halaman yang Anda cari tidak ditemukan atau telah dipindahkan.
        </p>
        <Button onClick={() => navigate('/')}>
          Kembali ke Beranda
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;