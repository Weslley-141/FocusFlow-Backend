import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './User';

export type GoalType = 'daily' | 'weekly' | 'monthly';
export type GoalStatus = 'active' | 'completed' | 'failed';

@Entity('study_goals')
export class StudyGoal {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', length: 50 })
  type!: GoalType;

  @Column({ name: 'target_minutes', type: 'int' })
  targetMinutes!: number;

  @Column({ name: 'current_minutes', type: 'int', default: 0 })
  currentMinutes!: number;

  @Column({ name: 'start_date', type: 'date' })
  startDate!: string;

  @Column({ name: 'end_date', type: 'date' })
  endDate!: string;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status!: GoalStatus;

  @Column({ name: 'user_id' })
  userId!: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
