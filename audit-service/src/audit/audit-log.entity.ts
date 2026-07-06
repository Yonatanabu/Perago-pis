import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('audit_logs')
export class AuditLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Short action identifier, e.g. "position.created" */
  @Column()
  action: string;

  /** Human-readable audit message, e.g. "[CEO] is created at [2026-07-02T14:30:05]" */
  @Column({ type: 'text' })
  message: string;

  /** Timestamp when the event occurred (provided by the publisher) */
  @Column({ type: 'timestamptz', nullable: true })
  eventTime: Date;

  /** Timestamp when this record was persisted */
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
