import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
  OneToMany
} from 'typeorm';
import { User } from './User';
import { Kelas } from './Kelas';
import { Absensi } from './Absensi';
import { Nilai } from './Nilai';
import { Pembayaran } from './Pembayaran';

@Entity('siswa')
export class Siswa {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  nis: string;

  @Column()
  nama: string;

  @Column({ nullable: true })
  tempatLahir: string;

  @Column({ type: 'date', nullable: true })
  tanggalLahir: Date;

  @Column({
    type: 'enum',
    enum: ['Laki-laki', 'Perempuan'],
    nullable: true
  })
  jenisKelamin: string;

  @Column({ nullable: true })
  agama: string;

  @Column({ type: 'text', nullable: true })
  alamat: string;

  @Column({ nullable: true })
  telepon: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  namaAyah: string;

  @Column({ nullable: true })
  namaIbu: string;

  @Column({ nullable: true })
  pekerjaanAyah: string;

  @Column({ nullable: true })
  pekerjaanIbu: string;

  @Column({ nullable: true })
  teleponOrtu: string;

  @Column({ nullable: true })
  alamatOrtu: string;

  @Column({ nullable: true })
  tahunMasuk: number;

  @Column({ nullable: true })
  foto: string;

  @Column({ nullable: true })
  dokumenAkta: string;

  @Column({ default: true })
  status: boolean;

  @ManyToOne(() => Kelas, (kelas) => kelas.siswa, { nullable: true })
  kelas: Kelas;

  @OneToOne(() => User, (user) => user.siswa)
  @JoinColumn()
  user: User;

  @OneToMany(() => Absensi, (absensi) => absensi.siswa)
  absensi: Absensi[];

  @OneToMany(() => Nilai, (nilai) => nilai.siswa)
  nilai: Nilai[];

  @OneToMany(() => Pembayaran, (pembayaran) => pembayaran.siswa)
  pembayaran: Pembayaran[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}