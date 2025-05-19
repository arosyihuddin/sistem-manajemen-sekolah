import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany
} from 'typeorm';
import { KategoriInventaris } from './KategoriInventaris';
import { PeminjamanInventaris } from './PeminjamanInventaris';

@Entity('inventaris')
export class Inventaris {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nama: string;

  @Column({ unique: true })
  kode: string;

  @Column({ nullable: true })
  merk: string;

  @Column({ type: 'date', nullable: true })
  tanggalPembelian: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  hargaBeli: number;

  @Column({ default: 1 })
  jumlah: number;

  @Column({
    type: 'enum',
    enum: ['Baik', 'Rusak Ringan', 'Rusak Berat', 'Hilang'],
    default: 'Baik'
  })
  kondisi: string;

  @Column({ type: 'text', nullable: true })
  keterangan: string;

  @Column({ nullable: true })
  lokasiPenyimpanan: string;

  @Column({ nullable: true })
  gambar: string;

  @ManyToOne(() => KategoriInventaris, (kategoriInventaris) => kategoriInventaris.inventaris)
  kategori: KategoriInventaris;

  @OneToMany(() => PeminjamanInventaris, (peminjamanInventaris) => peminjamanInventaris.inventaris)
  peminjaman: PeminjamanInventaris[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}