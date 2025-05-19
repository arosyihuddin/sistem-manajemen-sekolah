import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, MagnifyingGlassIcon, ArrowPathIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Table from '@/components/ui/Table';
import Pagination from '@/components/ui/Pagination';
import Modal from '@/components/ui/Modal';
import { Card } from '@/components/ui/Card';
import { Guru, getGuruAll, deleteGuru, restoreGuru } from '@/api/guru.api';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';

const GuruListPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  
  const [isLoading, setIsLoading] = useState(true);
  const [guruList, setGuruList] = useState<Guru[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  
  const [selectedGuru, setSelectedGuru] = useState<Guru | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  
  const fetchGuru = async () => {
    try {
      setIsLoading(true);
      const response = await getGuruAll(
        currentPage,
        pageSize,
        searchQuery,
        showInactive ? undefined : true
      );
      
      setGuruList(response.data);
      setTotalItems(response.meta.total);
      setTotalPages(response.meta.totalPages);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal memuat data guru');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchGuru();
  }, [currentPage, searchQuery, showInactive]);
  
  const handleChangePage = (page: number) => {
    setCurrentPage(page);
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchGuru();
  };
  
  const handleViewGuru = (guru: Guru) => {
    navigate(`/dashboard/guru/${guru.id}`);
  };
  
  const handleEditGuru = (e: React.MouseEvent, guru: Guru) => {
    e.stopPropagation();
    navigate(`/dashboard/guru/${guru.id}/edit`);
  };
  
  const openDeleteModal = (e: React.MouseEvent, guru: Guru) => {
    e.stopPropagation();
    setSelectedGuru(guru);
    setIsDeleteModalOpen(true);
  };
  
  const openRestoreModal = (e: React.MouseEvent, guru: Guru) => {
    e.stopPropagation();
    setSelectedGuru(guru);
    setIsRestoreModalOpen(true);
  };
  
  const handleDeleteGuru = async () => {
    if (!selectedGuru) return;
    
    try {
      await deleteGuru(selectedGuru.id);
      toast.success('Guru berhasil dihapus');
      setIsDeleteModalOpen(false);
      fetchGuru();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menghapus guru');
    }
  };
  
  const handleRestoreGuru = async () => {
    if (!selectedGuru) return;
    
    try {
      await restoreGuru(selectedGuru.id);
      toast.success('Guru berhasil diaktifkan');
      setIsRestoreModalOpen(false);
      fetchGuru();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mengaktifkan guru');
    }
  };
  
  const columns = [
    { key: 'nip', header: 'NIP' },
    { key: 'nama', header: 'Nama' },
    { 
      key: 'mataPelajaran', 
      header: 'Mata Pelajaran',
      render: (guru: Guru) => {
        if (!guru.mataPelajaran || guru.mataPelajaran.length === 0) {
          return '-';
        }
        
        if (guru.mataPelajaran.length <= 2) {
          return guru.mataPelajaran.map(mp => mp.nama).join(', ');
        }
        
        return `${guru.mataPelajaran[0].nama}, ${guru.mataPelajaran[1].nama}, +${guru.mataPelajaran.length - 2} lainnya`;
      }
    },
    { 
      key: 'pendidikanTerakhir', 
      header: 'Pendidikan',
      render: (guru: Guru) => guru.pendidikanTerakhir || '-'
    },
    {
      key: 'status',
      header: 'Status',
      render: (guru: Guru) => (
        <span
          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
            guru.status
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {guru.status ? 'Aktif' : 'Tidak Aktif'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (guru: Guru) => (
        <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="outline"
            size="sm"
            className="p-1"
            onClick={(e) => handleEditGuru(e, guru)}
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          
          {guru.status ? (
            <Button
              variant="outline"
              size="sm"
              className="p-1 text-red-600 border-red-600 hover:bg-red-50"
              onClick={(e) => openDeleteModal(e, guru)}
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="p-1 text-green-600 border-green-600 hover:bg-green-50"
              onClick={(e) => openRestoreModal(e, guru)}
            >
              <ArrowPathIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Daftar Guru</h1>
        
        {isAdmin && (
          <Button onClick={() => navigate('/dashboard/guru/create')}>
            <PlusIcon className="h-5 w-5 mr-2" />
            Tambah Guru
          </Button>
        )}
      </div>
      
      <Card>
        <div className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <form onSubmit={handleSearch} className="relative w-full sm:w-96">
              <Input
                type="text"
                placeholder="Cari guru (nama/NIP)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
              <button
                type="submit"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </button>
            </form>
            
            <div className="flex items-center">
              <input
                id="show-inactive"
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="show-inactive" className="ml-2 text-sm text-gray-700">
                Tampilkan guru tidak aktif
              </label>
            </div>
          </div>
          
          <Table
            columns={columns}
            data={guruList}
            isLoading={isLoading}
            emptyMessage="Tidak ada guru"
            onRowClick={handleViewGuru}
          />
          
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handleChangePage}
            totalItems={totalItems}
            pageSize={pageSize}
          />
        </div>
      </Card>
      
      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Hapus Guru"
        footer={
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteGuru}
            >
              Hapus
            </Button>
          </div>
        }
      >
        <p className="text-gray-700">
          Apakah Anda yakin ingin menghapus guru <span className="font-semibold">{selectedGuru?.nama}</span>?
          Tindakan ini akan menonaktifkan guru dan akun terkait.
        </p>
      </Modal>
      
      {/* Restore Modal */}
      <Modal
        isOpen={isRestoreModalOpen}
        onClose={() => setIsRestoreModalOpen(false)}
        title="Aktifkan Guru"
        footer={
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsRestoreModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              onClick={handleRestoreGuru}
            >
              Aktifkan
            </Button>
          </div>
        }
      >
        <p className="text-gray-700">
          Apakah Anda yakin ingin mengaktifkan kembali guru <span className="font-semibold">{selectedGuru?.nama}</span>?
          Tindakan ini akan mengaktifkan guru dan akun terkait.
        </p>
      </Modal>
    </div>
  );
};

export default GuruListPage;