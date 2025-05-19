import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany
} from 'typeorm';
import { Inventaris } from './Inventaris';

@Entity('kategori_inventaris')
export class KategoriInventaris {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  nama: string;

  @Column({ nullable: true })
  deskripsi: string;

  @OneToMany(() => Inventaris, (inventaris) => inventaris.kategori)
  inventaris: Inventaris[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}