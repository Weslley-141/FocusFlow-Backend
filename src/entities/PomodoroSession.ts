import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './User';
import { Topic } from './Topic';

@Entity('pomodoro_sessions')
export class PomodoroSession {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'start_time', type: 'datetime' })
  startTime!: Date;

  /** Preenchido ao concluir a sessão. */
  @Column({ name: 'end_time', type: 'datetime', nullable: true })
  endTime!: Date | null;

  /** Duração do foco em MINUTOS (o front envia minutos). */
  @Column({ type: 'int' })
  duration!: number;

  /** Pausa em minutos. */
  @Column({ name: 'break_time', type: 'int', default: 5 })
  breakTime!: number;

  @Column({ default: false })
  completed!: boolean;

  @Column({ name: 'session_type', type: 'varchar', length: 50, default: 'focus' })
  sessionType!: string;

  @Column({ name: 'topic_id', type: 'int', nullable: true })
  topicId!: number | null;

  @ManyToOne(() => Topic, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'topic_id' })
  topic?: Topic | null;

  @Column({ name: 'user_id' })
  userId!: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: User;
}
