import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  Tree,
  TreeChildren,
  TreeParent,
} from 'typeorm';

@Entity('positions')
@Tree('closure-table')
export class PositionEntity {

  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;
  @Column({ nullable: true, default: 1000 })
  salary?: number;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  parentId?: string;

  @TreeParent({ onDelete: 'CASCADE' })
  parent?: PositionEntity;

  @TreeChildren({ cascade: true })
  children?: PositionEntity[];
}