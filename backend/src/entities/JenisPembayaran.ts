import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany
} from 'typeorm';
import { Pembayaran } from './Pembayaran';

@Entity('jenis_pembayaran')
export class JenisPembayaran {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  nama: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  jumlah: number;

  @Column({ nullable: true })
  deskripsi: string;

  @Column({ default: true })
  status: boolean;

  @OneToMany(() => Pembayaran, (pembayaran) => pembayaran.jenisPembayaran)
  pembayaran: Pembayaran[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}