import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  OneToMany
} from 'typeorm';
import { Guru } from './Guru';
import { Jadwal } from './Jadwal';
import { Nilai } from './Nilai';

@Entity('mata_pelajaran')
export class MataPelajaran {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nama: string;

  @Column({ nullable: true })
  kode: string;

  @Column({ nullable: true })
  deskripsi: string;

  @Column({ default: 0 })
  kkm: number;

  @Column({ default: 0 })
  jumlahJam: number;

  @Column({ default: true })
  status: boolean;

  @ManyToMany(() => Guru, (guru) => guru.mataPelajaran)
  @JoinTable({
    name: 'guru_mata_pelajaran',
    joinColumn: { name: 'mata_pelajaran_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'guru_id', referencedColumnName: 'id' }
  })
  guru: Guru[];

  @OneToMany(() => Jadwal, (jadwal) => jadwal.mataPelajaran)
  jadwal: Jadwal[];

  @OneToMany(() => Nilai, (nilai) => nilai.mataPelajaran)
  nilai: Nilai[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}