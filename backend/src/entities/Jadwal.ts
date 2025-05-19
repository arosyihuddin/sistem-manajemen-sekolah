import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne
} from 'typeorm';
import { Guru } from './Guru';
import { Kelas } from './Kelas';
import { MataPelajaran } from './MataPelajaran';

@Entity('jadwal')
export class Jadwal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
  })
  hari: string;

  @Column({ type: 'time' })
  jamMulai: string;

  @Column({ type: 'time' })
  jamSelesai: string;

  @Column({ nullable: true })
  ruangan: string;

  @Column({ default: true })
  status: boolean;

  @ManyToOne(() => Guru, (guru) => guru.jadwal)
  guru: Guru;

  @ManyToOne(() => Kelas, (kelas) => kelas.jadwal)
  kelas: Kelas;

  @ManyToOne(() => MataPelajaran, (mataPelajaran) => mataPelajaran.jadwal)
  mataPelajaran: MataPelajaran;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}