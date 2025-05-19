import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinTable
} from 'typeorm';
import { Guru } from './Guru';
import { Siswa } from './Siswa';
import { Jadwal } from './Jadwal';
import { MataPelajaran } from './MataPelajaran';
import { TahunAjaran } from './TahunAjaran';

@Entity('kelas')
export class Kelas {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nama: string;

  @Column({ nullable: true })
  tingkat: string;

  @Column({ nullable: true })
  jurusan: string;

  @Column({ nullable: true })
  kodeKelas: string;

  @Column({ nullable: true })
  ruangan: string;

  @Column({ default: true })
  status: boolean;

  @ManyToOne(() => Guru, (guru) => guru.kelasWali, { nullable: true })
  waliKelas: Guru;

  @OneToMany(() => Siswa, (siswa) => siswa.kelas)
  siswa: Siswa[];

  @OneToMany(() => Jadwal, (jadwal) => jadwal.kelas)
  jadwal: Jadwal[];

  @ManyToMany(() => MataPelajaran)
  @JoinTable({
    name: 'kelas_mata_pelajaran',
    joinColumn: { name: 'kelas_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'mata_pelajaran_id', referencedColumnName: 'id' }
  })
  mataPelajaran: MataPelajaran[];

  @ManyToOne(() => TahunAjaran, (tahunAjaran) => tahunAjaran.kelas)
  tahunAjaran: TahunAjaran;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}