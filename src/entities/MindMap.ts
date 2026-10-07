import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User';
import { Topic } from './Topic';
import { MindMapNode } from './MindMapNode';

@Entity('mind_maps')
export class MindMap {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

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

  @OneToMany(() => MindMapNode, (n) => n.mindMap)
  nodes?: MindMapNode[];

  /** Preenchido via loadRelationCountAndMap (não é coluna). */
  nodesCount?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
