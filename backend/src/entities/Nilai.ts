import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne
} from 'typeorm';
import { Siswa } from './Siswa';
import { MataPelajaran } from './MataPelajaran';

@Entity('nilai')
export class Nilai {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  semester: number;

  @Column({ default: 0 })
  nilaiTugas: number;

  @Column({ default: 0 })
  nilaiUts: number;

  @Column({ default: 0 })
  nilaiUas: number;

  @Column({ default: 0 })
  nilaiAkhir: number;

  @Column({ nullable: true })
  tahunAjaran: string;

  @Column({ type: 'text', nullable: true })
  keterangan: string;

  @ManyToOne(() => Siswa, (siswa) => siswa.nilai)
  siswa: Siswa;

  @ManyToOne(() => MataPelajaran, (mataPelajaran) => mataPelajaran.nilai)
  mataPelajaran: MataPelajaran;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}