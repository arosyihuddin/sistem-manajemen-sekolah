import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
  ManyToMany
} from 'typeorm';
import { User } from './User';
import { Kelas } from './Kelas';
import { Jadwal } from './Jadwal';
import { MataPelajaran } from './MataPelajaran';
import { Absensi } from './Absensi';

@Entity('guru')
export class Guru {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  nip: string;

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
  pendidikanTerakhir: string;

  @Column({ nullable: true })
  jurusan: string;

  @Column({ nullable: true })
  tahunMulaiMengajar: number;

  @Column({ nullable: true })
  foto: string;

  @Column({ default: true })
  status: boolean;

  @OneToOne(() => User, (user) => user.guru)
  @JoinColumn()
  user: User;

  @OneToMany(() => Kelas, (kelas) => kelas.waliKelas)
  kelasWali: Kelas[];

  @OneToMany(() => Jadwal, (jadwal) => jadwal.guru)
  jadwal: Jadwal[];

  @ManyToMany(() => MataPelajaran, (mataPelajaran) => mataPelajaran.guru)
  mataPelajaran: MataPelajaran[];

  @OneToMany(() => Absensi, (absensi) => absensi.guru)
  absensi: Absensi[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}