import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, MagnifyingGlassIcon, ArrowPathIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Table from '@/components/ui/Table';
import Pagination from '@/components/ui/Pagination';
import Modal from '@/components/ui/Modal';
import { Card } from '@/components/ui/Card';
import { Siswa, getSiswaAll, deleteSiswa, restoreSiswa } from '@/api/siswa.api';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

const SiswaListPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  
  const [isLoading, setIsLoading] = useState(true);
  const [siswaList, setSiswaList] = useState<Siswa[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  
  const [selectedSiswa, setSelectedSiswa] = useState<Siswa | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  
  const fetchSiswa = async () => {
    try {
      setIsLoading(true);
      const response = await getSiswaAll(
        currentPage,
        pageSize,
        searchQuery,
        showInactive ? undefined : true
      );
      
      setSiswaList(response.data);
      setTotalItems(response.meta.total);
      setTotalPages(response.meta.totalPages);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal memuat data siswa');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchSiswa();
  }, [currentPage, searchQuery, showInactive]);
  
  const handleChangePage = (page: number) => {
    setCurrentPage(page);
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchSiswa();
  };
  
  const handleViewSiswa = (siswa: Siswa) => {
    navigate(`/dashboard/siswa/${siswa.id}`);
  };
  
  const handleEditSiswa = (e: React.MouseEvent, siswa: Siswa) => {
    e.stopPropagation();
    navigate(`/dashboard/siswa/${siswa.id}/edit`);
  };
  
  const openDeleteModal = (e: React.MouseEvent, siswa: Siswa) => {
    e.stopPropagation();
    setSelectedSiswa(siswa);
    setIsDeleteModalOpen(true);
  };
  
  const openRestoreModal = (e: React.MouseEvent, siswa: Siswa) => {
    e.stopPropagation();
    setSelectedSiswa(siswa);
    setIsRestoreModalOpen(true);
  };
  
  const handleDeleteSiswa = async () => {
    if (!selectedSiswa) return;
    
    try {
      await deleteSiswa(selectedSiswa.id);
      toast.success('Siswa berhasil dihapus');
      setIsDeleteModalOpen(false);
      fetchSiswa();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal menghapus siswa');
    }
  };
  
  const handleRestoreSiswa = async () => {
    if (!selectedSiswa) return;
    
    try {
      await restoreSiswa(selectedSiswa.id);
      toast.success('Siswa berhasil diaktifkan');
      setIsRestoreModalOpen(false);
      fetchSiswa();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Gagal mengaktifkan siswa');
    }
  };
  
  const columns = [
    { key: 'nis', header: 'NIS' },
    { key: 'nama', header: 'Nama' },
    { 
      key: 'kelas.nama', 
      header: 'Kelas',
      render: (siswa: Siswa) => siswa.kelas?.nama || '-' 
    },
    { 
      key: 'jenisKelamin', 
      header: 'Jenis Kelamin',
      render: (siswa: Siswa) => siswa.jenisKelamin || '-'
    },
    {
      key: 'status',
      header: 'Status',
      render: (siswa: Siswa) => (
        <span
          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
            siswa.status
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {siswa.status ? 'Aktif' : 'Tidak Aktif'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      render: (siswa: Siswa) => (
        <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="outline"
            size="sm"
            className="p-1"
            onClick={(e) => handleEditSiswa(e, siswa)}
          >
            <PencilIcon className="h-4 w-4" />
          </Button>
          
          {siswa.status ? (
            <Button
              variant="outline"
              size="sm"
              className="p-1 text-red-600 border-red-600 hover:bg-red-50"
              onClick={(e) => openDeleteModal(e, siswa)}
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="p-1 text-green-600 border-green-600 hover:bg-green-50"
              onClick={(e) => openRestoreModal(e, siswa)}
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
        <h1 className="text-2xl font-semibold text-gray-900">Daftar Siswa</h1>
        
        {isAdmin && (
          <Button onClick={() => navigate('/dashboard/siswa/create')}>
            <PlusIcon className="h-5 w-5 mr-2" />
            Tambah Siswa
          </Button>
        )}
      </div>
      
      <Card>
        <div className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <form onSubmit={handleSearch} className="relative w-full sm:w-96">
              <Input
                type="text"
                placeholder="Cari siswa (nama/NIS)..."
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
                Tampilkan siswa tidak aktif
              </label>
            </div>
          </div>
          
          <Table
            columns={columns}
            data={siswaList}
            isLoading={isLoading}
            emptyMessage="Tidak ada siswa"
            onRowClick={handleViewSiswa}
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
        title="Hapus Siswa"
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
              onClick={handleDeleteSiswa}
            >
              Hapus
            </Button>
          </div>
        }
      >
        <p className="text-gray-700">
          Apakah Anda yakin ingin menghapus siswa <span className="font-semibold">{selectedSiswa?.nama}</span>?
          Tindakan ini akan menonaktifkan siswa dan akun terkait.
        </p>
      </Modal>
      
      {/* Restore Modal */}
      <Modal
        isOpen={isRestoreModalOpen}
        onClose={() => setIsRestoreModalOpen(false)}
        title="Aktifkan Siswa"
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
              onClick={handleRestoreSiswa}
            >
              Aktifkan
            </Button>
          </div>
        }
      >
        <p className="text-gray-700">
          Apakah Anda yakin ingin mengaktifkan kembali siswa <span className="font-semibold">{selectedSiswa?.nama}</span>?
          Tindakan ini akan mengaktifkan siswa dan akun terkait.
        </p>
      </Modal>
    </div>
  );
};

export default SiswaListPage;