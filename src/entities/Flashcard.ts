import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './User';
import { Subject } from './Subject';
import { Topic } from './Topic';

@Entity('flashcards')
export class Flashcard {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text' })
  front!: string;

  @Column({ type: 'text' })
  back!: string;

  @Column({ name: 'ease_factor', type: 'float', default: 2.5 })
  easeFactor!: number;

  @Column({ type: 'int', default: 1 })
  interval!: number;

  @Column({ type: 'int', default: 0 })
  repetitions!: number;

  @Column({ name: 'next_review', type: 'date' })
  nextReview!: string;

  @Column({ name: 'last_reviewed_at', type: 'datetime', nullable: true })
  lastReviewedAt!: Date | null;

  @Column({ name: 'subject_id', type: 'int', nullable: true })
  subjectId!: number | null;

  @ManyToOne(() => Subject, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'subject_id' })
  subject?: Subject | null;

  @Column({ name: 'topic_id', type: 'int', nullable: true })
  topicId!: number | null;

  @ManyToOne(() => Topic, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'topic_id' })
  topic?: Topic | null;

  @Column({ name: 'user_id' })
  userId!: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
