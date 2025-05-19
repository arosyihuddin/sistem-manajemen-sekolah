import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany
} from 'typeorm';
import { Kelas } from './Kelas';

@Entity('tahun_ajaran')
export class TahunAjaran {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nama: string;

  @Column({ type: 'date' })
  tanggalMulai: Date;

  @Column({ type: 'date' })
  tanggalSelesai: Date;

  @Column({ default: false })
  aktif: boolean;

  @OneToMany(() => Kelas, (kelas) => kelas.tahunAjaran)
  kelas: Kelas[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}