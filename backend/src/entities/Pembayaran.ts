import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne
} from 'typeorm';
import { Siswa } from './Siswa';
import { JenisPembayaran } from './JenisPembayaran';
import { User } from './User';

@Entity('pembayaran')
export class Pembayaran {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  nomorPembayaran: string;

  @Column({ type: 'date' })
  tanggalPembayaran: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  jumlah: number;

  @Column({ nullable: true })
  metodePembayaran: string;

  @Column({ default: false })
  lunas: boolean;

  @Column({ type: 'text', nullable: true })
  keterangan: string;

  @Column({ nullable: true })
  buktiPembayaran: string;

  @ManyToOne(() => Siswa, (siswa) => siswa.pembayaran)
  siswa: Siswa;

  @ManyToOne(() => JenisPembayaran, (jenisPembayaran) => jenisPembayaran.pembayaran)
  jenisPembayaran: JenisPembayaran;

  @ManyToOne(() => User)
  dibuatOleh: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}