import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Flashcard } from './Flashcard';

@Entity('flashcard_reviews')
export class FlashcardReview {
  @PrimaryGeneratedColumn()
  id!: number;

  /** Nota SM-2 (0-5) efetivamente aplicada. */
  @Column({ type: 'int' })
  quality!: number;

  /** 'again' | 'hard' | 'good' | 'easy' */
  @Column({ type: 'varchar', length: 50 })
  result!: string;

  @CreateDateColumn({ name: 'reviewed_at' })
  reviewedAt!: Date;

  @Column({ name: 'flashcard_id' })
  flashcardId!: number;

  @ManyToOne(() => Flashcard, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'flashcard_id' })
  flashcard?: Flashcard;
}
