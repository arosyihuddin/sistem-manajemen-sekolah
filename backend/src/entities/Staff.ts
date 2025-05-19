import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn
} from 'typeorm';
import { User } from './User';

@Entity('staff')
export class Staff {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nip: string;

  @Column()
  nama: string;

  @Column({
    type: 'enum',
    enum: ['Laki-laki', 'Perempuan'],
    nullable: true
  })
  jenisKelamin: string;

  @Column({ nullable: true })
  jabatan: string;

  @Column({ type: 'text', nullable: true })
  alamat: string;

  @Column({ nullable: true })
  telepon: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  foto: string;

  @Column({ default: true })
  status: boolean;

  @OneToOne(() => User, (user) => user.staff)
  @JoinColumn()
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}