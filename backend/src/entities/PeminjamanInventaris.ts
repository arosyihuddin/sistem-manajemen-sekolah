import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne
} from 'typeorm';
import { Inventaris } from './Inventaris';
import { User } from './User';

@Entity('peminjaman_inventaris')
export class PeminjamanInventaris {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  tanggalPinjam: Date;

  @Column({ type: 'date', nullable: true })
  tanggalKembali: Date;

  @Column({ default: 1 })
  jumlah: number;

  @Column({ default: false })
  statusKembali: boolean;

  @Column({ type: 'text', nullable: true })
  keterangan: string;

  @ManyToOne(() => Inventaris, (inventaris) => inventaris.peminjaman)
  inventaris: Inventaris;

  @ManyToOne(() => User)
  peminjam: User;

  @ManyToOne(() => User, { nullable: true })
  disetujuiOleh: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}