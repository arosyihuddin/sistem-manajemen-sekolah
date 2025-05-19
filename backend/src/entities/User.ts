import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
  OneToMany
} from 'typeorm';
import { Role } from './Role';
import { Siswa } from './Siswa';
import { Guru } from './Guru';
import { Staff } from './Staff';
import { LogActivity } from './LogActivity';
import bcrypt from 'bcrypt';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  email: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  lastLogin: Date;

  @Column({ nullable: true })
  passwordChangedAt: Date;

  @ManyToOne(() => Role, (role) => role.users)
  role: Role;

  @OneToOne(() => Siswa, (siswa) => siswa.user, { nullable: true })
  siswa: Siswa;

  @OneToOne(() => Guru, (guru) => guru.user, { nullable: true })
  guru: Guru;

  @OneToOne(() => Staff, (staff) => staff.user, { nullable: true })
  staff: Staff;

  @OneToMany(() => LogActivity, (logActivity) => logActivity.user)
  logActivities: LogActivity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Check if password was changed after token was issued
  changedPasswordAfter(JWTTimestamp: number): boolean {
    if (this.passwordChangedAt) {
      const changedTimestamp = parseInt(
        (this.passwordChangedAt.getTime() / 1000).toString(),
        10
      );
      return JWTTimestamp < changedTimestamp;
    }
    return false;
  }

  // Compare password
  async comparePassword(candidatePassword: string, userPassword: string): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, userPassword);
  }
}