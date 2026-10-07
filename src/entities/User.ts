import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 255 })
  name!: string;

  @Column({ length: 255, unique: true })
  email!: string;

  @Column({ name: 'password_hash', length: 255 })
  passwordHash!: string;

  @Column({ name: 'is_verified', default: false })
  isVerified!: boolean;

  @Column({ name: 'verification_token', type: 'varchar', length: 255, nullable: true })
  verificationToken!: string | null;

  @Column({ name: 'verification_token_expires', type: 'datetime', nullable: true })
  verificationTokenExpires!: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
