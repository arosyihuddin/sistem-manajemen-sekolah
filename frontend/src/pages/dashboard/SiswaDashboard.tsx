import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Calendar, BookOpen, Calculator, DollarSign } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const SiswaDashboard = () => {
  // Sample data for today's schedule
  const todaySchedule = [
    { id: 1, subject: 'Matematika', time: '07:00 - 08:40', teacher: 'Bpk. Supriadi, S.Pd.', room: 'Ruang 101' },
    { id: 2, subject: 'Bahasa Indonesia', time: '08:40 - 10:20', teacher: 'Ibu Rahmawati, S.Pd.', room: 'Ruang 101' },
    { id: 3, subject: 'Fisika', time: '10:40 - 12:20', teacher: 'Bpk. Joko, M.Pd.', room: 'Lab Fisika' },
  ];

  // Sample data for recent grades
  const recentGrades = [
    { subject: 'Matematika', tugas: 85, uts: 78, uas: 82 },
    { subject: 'B. Indonesia', tugas: 90, uts: 88, uas: 85 },
    { subject: 'B. Inggris', tugas: 82, uts: 75, uas: 80 },
    { subject: 'Fisika', tugas: 75, uts: 70, uas: 78 },
    { subject: 'Kimia', tugas: 88, uts: 80, uas: 82 },
  ];

  // Sample data for attendance
  const attendanceData = [
    { month: 'Jan', hadir: 20, izin: 1, sakit: 1, alpa: 0 },
    { month: 'Feb', hadir: 18, izin: 2, sakit: 2, alpa: 0 },
    { month: 'Mar', hadir: 21, izin: 1, sakit: 0, alpa: 0 },
    { month: 'Apr', hadir: 20, izin: 0, sakit: 2, alpa: 0 },
    { month: 'Mei', hadir: 22, izin: 0, sakit: 0, alpa: 0 },
  ];

  // Sample data for payment history
  const paymentHistory = [
    { id: 1, type: 'SPP Mei 2025', amount: 'Rp500.000', status: 'Lunas', date: '5 Mei 2025' },
    { id: 2, type: 'SPP April 2025', amount: 'Rp500.000', status: 'Lunas', date: '3 April 2025' },
    { id: 3, type: 'Kegiatan OSIS', amount: 'Rp150.000', status: 'Lunas', date: '20 Maret 2025' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Selamat Datang, Siswa</h1>
      
      {/* Today's Schedule */}
      <Card>
        <CardHeader className="bg-blue-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" /> Jadwal Hari Ini
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {todaySchedule.length > 0 ? (
            <div className="divide-y">
              {todaySchedule.map((schedule) => (
                <div key={schedule.id} className="p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{schedule.subject}</h3>
                    <p className="text-sm text-gray-500">{schedule.teacher} • {schedule.room}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">{schedule.time}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              Tidak ada jadwal hari ini
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Recent Grades */}
      <Card>
        <CardHeader className="bg-green-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" /> Nilai Terakhir
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={recentGrades}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="tugas" fill="#8884d8" name="Nilai Tugas" />
                <Bar dataKey="uts" fill="#82ca9d" name="Nilai UTS" />
                <Bar dataKey="uas" fill="#ffc658" name="Nilai UAS" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Payment History */}
      <Card>
        <CardHeader className="bg-purple-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" /> Riwayat Pembayaran Terakhir
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {paymentHistory.map((payment) => (
              <div key={payment.id} className="p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{payment.type}</h3>
                  <p className="text-sm text-gray-500">{payment.date}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">{payment.amount}</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    {payment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-blue-50 hover:bg-blue-100 transition-colors cursor-pointer">
          <div className="flex flex-col items-center justify-center text-center h-32">
            <Calendar className="h-8 w-8 mb-2 text-blue-600" />
            <h3 className="font-medium">Jadwal Lengkap</h3>
          </div>
        </Card>
        
        <Card className="p-4 bg-green-50 hover:bg-green-100 transition-colors cursor-pointer">
          <div className="flex flex-col items-center justify-center text-center h-32">
            <BookOpen className="h-8 w-8 mb-2 text-green-600" />
            <h3 className="font-medium">Lihat Rapor</h3>
          </div>
        </Card>
        
        <Card className="p-4 bg-purple-50 hover:bg-purple-100 transition-colors cursor-pointer">
          <div className="flex flex-col items-center justify-center text-center h-32">
            <DollarSign className="h-8 w-8 mb-2 text-purple-600" />
            <h3 className="font-medium">Bayar SPP</h3>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SiswaDashboard;