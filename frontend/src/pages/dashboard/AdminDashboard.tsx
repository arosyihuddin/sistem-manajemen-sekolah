import { Card } from '@/components/ui/Card';
import { 
  User, 
  Users, 
  BookOpen, 
  Calendar,
  DollarSign,
  Package 
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Sample data for charts
const attendanceData = [
  { name: 'Senin', hadir: 120, izin: 5, sakit: 3, alpa: 2 },
  { name: 'Selasa', hadir: 125, izin: 3, sakit: 2, alpa: 0 },
  { name: 'Rabu', hadir: 123, izin: 2, sakit: 5, alpa: 0 },
  { name: 'Kamis', hadir: 122, izin: 4, sakit: 4, alpa: 0 },
  { name: 'Jumat', hadir: 118, izin: 6, sakit: 6, alpa: 0 },
];

const financialData = [
  { name: 'SPP', value: 35000000 },
  { name: 'Bangunan', value: 15000000 },
  { name: 'Kegiatan', value: 8000000 },
  { name: 'Seragam', value: 5000000 },
  { name: 'Lainnya', value: 2000000 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <User size={24} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-700">Total Siswa</h3>
              <p className="text-2xl font-semibold text-gray-900">130</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-full">
              <Users size={24} className="text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-700">Total Guru</h3>
              <p className="text-2xl font-semibold text-gray-900">25</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-yellow-100 rounded-full">
              <BookOpen size={24} className="text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-700">Total Kelas</h3>
              <p className="text-2xl font-semibold text-gray-900">12</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Kehadiran Minggu Ini</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={attendanceData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="hadir" fill="#0088FE" />
                <Bar dataKey="izin" fill="#00C49F" />
                <Bar dataKey="sakit" fill="#FFBB28" />
                <Bar dataKey="alpa" fill="#FF8042" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Pendapatan Bulanan</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={financialData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {financialData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value as number)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-700 mb-4">Aktivitas Terakhir</h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-4 border-b pb-4">
            <div className="p-2 bg-blue-100 rounded-full">
              <User size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Siswa Baru Terdaftar</p>
              <p className="text-sm text-gray-500">Budi Santoso telah mendaftar sebagai siswa baru</p>
              <p className="text-xs text-gray-400 mt-1">2 jam yang lalu</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4 border-b pb-4">
            <div className="p-2 bg-green-100 rounded-full">
              <DollarSign size={18} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Pembayaran SPP</p>
              <p className="text-sm text-gray-500">10 siswa telah melakukan pembayaran SPP bulan ini</p>
              <p className="text-xs text-gray-400 mt-1">5 jam yang lalu</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <div className="p-2 bg-yellow-100 rounded-full">
              <Calendar size={18} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">Jadwal Ujian</p>
              <p className="text-sm text-gray-500">Jadwal ujian akhir semester telah diperbarui</p>
              <p className="text-xs text-gray-400 mt-1">1 hari yang lalu</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;