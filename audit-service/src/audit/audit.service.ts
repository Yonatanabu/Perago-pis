import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLogEntity } from './audit-log.entity';

export interface PositionCreatedPayload {
  id: string;
  name: string;
  createdAt: string; // ISO 8601
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLogEntity)
    private readonly auditLogRepository: Repository<AuditLogEntity>,
  ) { }

  /**
   * Called by the message handler when a position.created event arrives.
   * Persists: "[CEO] is created at [2026-07-02T14:30:05.000Z]"
   */
  async handlePositionCreated(payload: PositionCreatedPayload): Promise<AuditLogEntity> {
    const message = `${payload.name} is created at [${payload.createdAt}]`;

    console.log(`📋 Audit: ${message}`);

    const log = this.auditLogRepository.create({
      action: 'position.created',
      message,
      eventTime: new Date(payload.createdAt),
    });

    return this.auditLogRepository.save(log);
  }

  async handlePositionUpdated(payload: PositionCreatedPayload): Promise<AuditLogEntity> {
    const message = `${payload.name} is updated at [${payload.createdAt}]`;

    console.log(`📋 Audit: ${message}`);

    const log = this.auditLogRepository.create({
      action: 'position.updated',
      message,
      eventTime: new Date(payload.createdAt),
    });

    return this.auditLogRepository.save(log);
  }

  async handlePositionDeleted(payload: PositionCreatedPayload): Promise<AuditLogEntity> {
    const message = `${payload.name} is deleted at [${payload.createdAt}]`;

    console.log(`📋 Audit: ${message}`);

    const log = this.auditLogRepository.create({
      action: 'position.deleted',
      message,
      eventTime: new Date(payload.createdAt),
    });

    return this.auditLogRepository.save(log);
  }

  /** Returns all audit logs ordered newest-first */
  async findAll(): Promise<AuditLogEntity[]> {
    return this.auditLogRepository.find({
      order: { createdAt: 'DESC' },
    });
  }
}
