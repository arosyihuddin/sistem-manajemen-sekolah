# Sistem Manajemen Sekolah

Sistem Manajemen Sekolah Modern adalah aplikasi berbasis web yang dibangun untuk memudahkan pengelolaan data dan proses administrasi di lingkungan sekolah. Aplikasi ini dibangun dengan stack teknologi modern dan mendukung berbagai fitur esensial untuk manajemen sekolah.

## 🚀 Fitur Utama

- **Manajemen Siswa**: Kelola data siswa, dokumen, dan riwayat akademik
- **Manajemen Guru & Staff**: Kelola informasi guru, jadwal mengajar
- **Manajemen Kelas**: Pengaturan kelas, mata pelajaran, dan kurikulum
- **Jadwal Pelajaran**: Sistem jadwal pelajaran dengan deteksi konflik
- **Absensi**: Pencatatan kehadiran siswa dan guru dengan statistik
- **Penilaian & Rapor**: Pengelolaan nilai dan cetak rapor digital
- **Keuangan Sekolah**: Pengelolaan pembayaran SPP dan biaya lainnya
- **Inventaris Sekolah**: Pengelolaan aset dan barang sekolah

## 🔧 Teknologi

### Backend
- **Bahasa**: TypeScript
- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **ORM**: TypeORM
- **Database**: PostgreSQL
- **Autentikasi**: JWT, Bcrypt
- **Validasi**: Zod

### Frontend
- **Bahasa**: TypeScript
- **Framework**: React v18+
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **State Management**: Zustand, React Query
- **Form Handling**: React Hook Form + Zod
- **Component UI**: Custom components inspired by shadcn/ui
- **Visualisasi**: Recharts

## 📋 Prasyarat

- Node.js v18.x atau lebih baru
- PostgreSQL 14.x atau lebih baru
- NPM 8.x atau lebih baru

## 🛠️ Instalasi dan Penggunaan

### Setup Database
```bash
# Pastikan PostgreSQL berjalan dan buat database baru
createdb -U postgres school_management
```

### Backend
```bash
# Masuk ke direktori backend
cd backend

# Install dependencies
npm install

# Setup environment variables (edit sesuai kebutuhan)
cp .env.example .env

# Jalankan migrasi database
npm run schema:sync

# Seed data awal
npm run seed

# Jalankan server dalam mode development
npm run dev
```

### Frontend
```bash
# Masuk ke direktori frontend
cd frontend

# Install dependencies
npm install

# Jalankan dalam mode development
npm run dev
```

## 👥 Role dan Akses

Sistem mendukung tiga role utama:
1. **Admin**: Akses penuh ke seluruh fitur sistem
2. **Guru**: Akses ke jadwal, input nilai, absensi siswa
3. **Siswa**: Akses ke jadwal, nilai, histori pembayaran

## 🌐 Kredensial Default

Setelah menjalankan seed data, tersedia beberapa user default:

- Admin: 
  - Username: admin
  - Password: admin123

- Guru:
  - Username: guru
  - Password: guru123

- Siswa:
  - Username: siswa
  - Password: siswa123

## 📄 Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).
