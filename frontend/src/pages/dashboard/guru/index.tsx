import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getGuruAll, deleteGuru, restoreGuru } from '../../../api/guru.api';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Table } from '../../../components/ui/Table';
import { Pagination } from '../../../components/ui/Pagination';
import { Modal } from '../../../components/ui/Modal';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { PlusCircle, Edit, Trash, RefreshCw, Upload } from 'lucide-react';

const GuruPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [selectedGuru, setSelectedGuru] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['guru', page, limit, search],
    queryFn: () => getGuruAll(page, limit, search)
  });

  const deleteMutation = useMutation({
    mutationFn: deleteGuru,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guru'] });
      toast.success('Guru berhasil dihapus');
      setIsDeleteModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Terjadi kesalahan saat menghapus guru');
    }
  });

  const restoreMutation = useMutation({
    mutationFn: restoreGuru,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guru'] });
      toast.success('Guru berhasil diaktifkan kembali');
      setIsRestoreModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Terjadi kesalahan saat mengaktifkan guru');
    }
  });

  const handleDelete = (guru: any) => {
    setSelectedGuru(guru);
    setIsDeleteModalOpen(true);
  };

  const handleRestore = (guru: any) => {
    setSelectedGuru(guru);
    setIsRestoreModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedGuru) {
      deleteMutation.mutate(selectedGuru.id);
    }
  };

  const confirmRestore = () => {
    if (selectedGuru) {
      restoreMutation.mutate(selectedGuru.id);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const searchValue = formData.get('search') as string;
    setSearch(searchValue);
    setPage(1);
  };

  const columns = [
    { header: 'NIP', accessor: 'nip' },
    { header: 'Nama', accessor: 'nama' },
    { 
      header: 'Mata Pelajaran', 
      accessor: 'mataPelajaran',
      cell: (value: any) => {
        if (Array.isArray(value) && value.length > 0) {
          return value.map(mp => mp.nama).join(', ');
        }
        return '-';
      }
    },
    { 
      header: 'Jenis Kelamin', 
      accessor: 'jenisKelamin',
      cell: (value: string) => value || '-'
    },
    { 
      header: 'Status', 
      accessor: 'status',
      cell: (value: boolean) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {value ? 'Aktif' : 'Tidak Aktif'}
        </span>
      )
    },
    { 
      header: 'Akun',
      accessor: 'user',
      cell: (value: any) => value ? (
        <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
          Ada
        </span>
      ) : (
        <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-medium">
          Belum ada
        </span>
      )
    },
    {
      header: 'Aksi',
      accessor: 'id',
      cell: (_: any, row: any) => (
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/dashboard/guru/${row.id}`)}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          {!row.user && (
            <Button
              variant="info"
              size="sm"
              onClick={() => navigate(`/dashboard/guru/${row.id}/create-user`)}
            >
              <Upload className="h-4 w-4 mr-1" />
              Buat Akun
            </Button>
          )}
          {row.status ? (
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleDelete(row)}
            >
              <Trash className="h-4 w-4 mr-1" />
              Hapus
            </Button>
          ) : (
            <Button
              variant="warning"
              size="sm"
              onClick={() => handleRestore(row)}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Aktifkan
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Manajemen Guru</h1>
          <Button 
            onClick={() => navigate('/dashboard/guru/tambah')}
            variant="primary"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Tambah Guru
          </Button>
        </div>

        <Card>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <form onSubmit={handleSearch} className="flex space-x-2">
                <input
                  type="text"
                  name="search"
                  placeholder="Cari nama guru..."
                  className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button type="submit" variant="secondary">
                  Cari
                </Button>
              </form>

              <div className="flex items-center space-x-2">
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
                <span>entries per page</span>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <>
                <Table
                  columns={columns}
                  data={data?.data || []}
                />
                
                <div className="mt-4 flex justify-between items-center">
                  <div>
                    Showing {data?.meta?.total === 0 ? 0 : (page - 1) * limit + 1} to{' '}
                    {Math.min(page * limit, data?.meta?.total || 0)} of {data?.meta?.total || 0} entries
                  </div>
                  
                  <Pagination
                    currentPage={page}
                    totalPages={data?.meta?.totalPages || 1}
                    onPageChange={handlePageChange}
                  />
                </div>
              </>
            )}
          </div>
        </Card>
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Hapus Guru"
      >
        <div className="p-6">
          <p>
            Apakah Anda yakin ingin menghapus guru <strong>{selectedGuru?.nama}</strong>?
          </p>
          <p className="text-gray-500 mt-2">
            Guru yang dihapus dapat diaktifkan kembali nanti.
          </p>
          <div className="mt-6 flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              isLoading={deleteMutation.isPending}
            >
              Hapus
            </Button>
          </div>
        </div>
      </Modal>

      {/* Restore Modal */}
      <Modal
        isOpen={isRestoreModalOpen}
        onClose={() => setIsRestoreModalOpen(false)}
        title="Aktifkan Guru"
      >
        <div className="p-6">
          <p>
            Apakah Anda yakin ingin mengaktifkan kembali guru <strong>{selectedGuru?.nama}</strong>?
          </p>
          <div className="mt-6 flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setIsRestoreModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              variant="warning"
              onClick={confirmRestore}
              isLoading={restoreMutation.isPending}
            >
              Aktifkan
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default GuruPage;