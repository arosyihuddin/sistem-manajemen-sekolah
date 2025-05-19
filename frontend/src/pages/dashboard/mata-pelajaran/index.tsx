import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMataPelajaranAll, deleteMataPelajaran } from '../../../api/mata-pelajaran.api';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Table } from '../../../components/ui/Table';
import { Pagination } from '../../../components/ui/Pagination';
import { Modal } from '../../../components/ui/Modal';
import DashboardLayout from '../../../components/layouts/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { PlusCircle, Edit, Trash } from 'lucide-react';

const MataPelajaranPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMataPelajaran, setSelectedMataPelajaran] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['mata-pelajaran', page, limit, search],
    queryFn: () => getMataPelajaranAll(page, limit, search)
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMataPelajaran,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mata-pelajaran'] });
      toast.success('Mata pelajaran berhasil dihapus');
      setIsDeleteModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Terjadi kesalahan saat menghapus mata pelajaran');
    }
  });

  const handleDelete = (mataPelajaran: any) => {
    setSelectedMataPelajaran(mataPelajaran);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedMataPelajaran) {
      deleteMutation.mutate(selectedMataPelajaran.id);
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
    { header: 'Kode', accessor: 'kode' },
    { header: 'Nama', accessor: 'nama' },
    { 
      header: 'KKM', 
      accessor: 'kkm',
      cell: (value: number) => value || '-'
    },
    { 
      header: 'Guru Pengajar', 
      accessor: 'guru',
      cell: (value: any[]) => {
        if (Array.isArray(value) && value.length > 0) {
          return value.map(g => g.nama).join(', ');
        }
        return '-';
      }
    },
    {
      header: 'Aksi',
      accessor: 'id',
      cell: (_: any, row: any) => (
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/dashboard/mata-pelajaran/${row.id}`)}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDelete(row)}
          >
            <Trash className="h-4 w-4 mr-1" />
            Hapus
          </Button>
        </div>
      )
    }
  ];

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Mata Pelajaran</h1>
          <Button 
            onClick={() => navigate('/dashboard/mata-pelajaran/tambah')}
            variant="primary"
          >
            <PlusCircle className="h-5 w-5 mr-2" />
            Tambah Mata Pelajaran
          </Button>
        </div>

        <Card>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <form onSubmit={handleSearch} className="flex space-x-2">
                <input
                  type="text"
                  name="search"
                  placeholder="Cari mata pelajaran..."
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
        title="Hapus Mata Pelajaran"
      >
        <div className="p-6">
          <p>
            Apakah Anda yakin ingin menghapus mata pelajaran <strong>{selectedMataPelajaran?.nama}</strong>?
          </p>
          <p className="text-gray-500 mt-2">
            Tindakan ini tidak dapat dibatalkan.
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
    </DashboardLayout>
  );
};

export default MataPelajaranPage;