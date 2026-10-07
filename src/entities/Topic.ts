import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './User';
import { Subject } from './Subject';

@Entity('topics')
export class Topic {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'subject_id' })
  subjectId!: number;

  /** RN-05: excluir a matéria exclui os tópicos em cascata. */
  @ManyToOne(() => Subject, (s) => s.topics, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'subject_id' })
  subject?: Subject;

  @Column({ name: 'user_id' })
  userId!: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
