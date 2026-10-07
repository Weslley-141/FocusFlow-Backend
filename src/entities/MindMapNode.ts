import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { MindMap } from './MindMap';

@Entity('mind_map_nodes')
export class MindMapNode {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 500 })
  content!: string;

  @Column({ type: 'int', default: 0 })
  level!: number;

  /** A aresta é representada pelo pai (parentId) + handles do React Flow. */
  @Column({ name: 'parent_id', type: 'int', nullable: true })
  parentId!: number | null;

  @ManyToOne(() => MindMapNode, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent?: MindMapNode | null;

  @Column({ name: 'position_x', type: 'float', default: 0 })
  positionX!: number;

  @Column({ name: 'position_y', type: 'float', default: 0 })
  positionY!: number;

  @Column({ name: 'background_color', type: 'varchar', length: 20, default: '#ffffff' })
  backgroundColor!: string;

  @Column({ name: 'text_color', type: 'varchar', length: 20, default: '#000000' })
  textColor!: string;

  @Column({ name: 'source_handle', type: 'varchar', length: 50, nullable: true })
  sourceHandle!: string | null;

  @Column({ name: 'target_handle', type: 'varchar', length: 50, nullable: true })
  targetHandle!: string | null;

  @Column({ name: 'mind_map_id' })
  mindMapId!: number;

  @ManyToOne(() => MindMap, (m) => m.nodes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'mind_map_id' })
  mindMap?: MindMap;
}
