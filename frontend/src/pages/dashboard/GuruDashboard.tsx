import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Calendar, BookOpen, Clock, User } from 'lucide-react';

const GuruDashboard = () => {
  // Sample data for today's schedule
  const todaySchedule = [
    { id: 1, className: 'X IPA 1', subject: 'Matematika', time: '07:00 - 08:40', room: 'Ruang 101' },
    { id: 2, className: 'XI IPA 2', subject: 'Matematika', time: '08:40 - 10:20', room: 'Ruang 202' },
    { id: 3, className: 'XII IPA 1', subject: 'Matematika', time: '10:40 - 12:20', room: 'Ruang 301' },
  ];

  // Sample data for classes
  const myClasses = [
    { id: 1, className: 'X IPA 1', students: 30, schedule: 'Senin, Rabu' },
    { id: 2, className: 'XI IPA 2', students: 28, schedule: 'Senin, Kamis' },
    { id: 3, className: 'XII IPA 1', students: 25, schedule: 'Selasa, Jumat' },
    { id: 4, className: 'X IPS 1', students: 32, schedule: 'Rabu, Jumat' },
  ];

  // Sample upcoming deadlines
  const upcomingDeadlines = [
    { id: 1, task: 'Input Nilai UTS', dueDate: '15 Juni 2025', className: 'Semua Kelas' },
    { id: 2, task: 'Rapat Guru', dueDate: '20 Juni 2025', className: '-' },
    { id: 3, task: 'Pengumpulan Soal UAS', dueDate: '25 Juni 2025', className: 'Semua Kelas' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Selamat Datang, Guru</h1>
      
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
                    <p className="text-sm text-gray-500">Kelas {schedule.className} • {schedule.room}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
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
      
      {/* My Classes */}
      <Card>
        <CardHeader className="bg-green-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" /> Kelas Saya
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {myClasses.map((cls) => (
              <div key={cls.id} className="p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Kelas {cls.className}</h3>
                  <p className="text-sm text-gray-500">{cls.schedule}</p>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium">{cls.students} siswa</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Upcoming Deadlines */}
      <Card>
        <CardHeader className="bg-red-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" /> Tenggat Waktu Mendatang
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {upcomingDeadlines.map((deadline) => (
              <div key={deadline.id} className="p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{deadline.task}</h3>
                  <p className="text-sm text-gray-500">{deadline.className}</p>
                </div>
                <div>
                  <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                    {deadline.dueDate}
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
            <User className="h-8 w-8 mb-2 text-blue-600" />
            <h3 className="font-medium">Input Absensi</h3>
          </div>
        </Card>
        
        <Card className="p-4 bg-green-50 hover:bg-green-100 transition-colors cursor-pointer">
          <div className="flex flex-col items-center justify-center text-center h-32">
            <BookOpen className="h-8 w-8 mb-2 text-green-600" />
            <h3 className="font-medium">Input Nilai</h3>
          </div>
        </Card>
        
        <Card className="p-4 bg-purple-50 hover:bg-purple-100 transition-colors cursor-pointer">
          <div className="flex flex-col items-center justify-center text-center h-32">
            <Calendar className="h-8 w-8 mb-2 text-purple-600" />
            <h3 className="font-medium">Jadwal Mengajar</h3>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default GuruDashboard;