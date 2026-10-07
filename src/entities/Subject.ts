import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './User';
import { Topic } from './Topic';

@Entity('subjects')
export class Subject {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', length: 20, default: '#3B82F6' })
  color!: string;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @Column({ name: 'user_id' })
  userId!: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @OneToMany(() => Topic, (t) => t.subject)
  topics?: Topic[];

  /** Preenchido via loadRelationCountAndMap (não é coluna). */
  topicsCount?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
