import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne
} from 'typeorm';
import { Siswa } from './Siswa';
import { Guru } from './Guru';

@Entity('absensi')
export class Absensi {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  tanggal: Date;

  @Column({
    type: 'enum',
    enum: ['Hadir', 'Sakit', 'Izin', 'Alpa'],
    default: 'Hadir'
  })
  status: string;

  @Column({ type: 'text', nullable: true })
  keterangan: string;

  @ManyToOne(() => Siswa, (siswa) => siswa.absensi, { nullable: true })
  siswa: Siswa;

  @ManyToOne(() => Guru, (guru) => guru.absensi, { nullable: true })
  guru: Guru;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}