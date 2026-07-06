import { Controller, Get } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuditService, PositionCreatedPayload } from './audit.service';

@ApiTags('audit-logs')
@Controller('api/audit-logs')
export class AuditController {
  constructor(private readonly auditService: AuditService) { }

  // ── RabbitMQ event consumer ──────────────────────────────────────────────

  /**
   * Listens for `position.created` events published by the main backend.
   * The event payload: { id, name, createdAt }
   */
  @MessagePattern('position.created')
  async handlePositionCreated(@Payload() payload: PositionCreatedPayload) {
    await this.auditService.handlePositionCreated(payload);
  }

  @MessagePattern('position.updated')
  async handlePositionUpdated(@Payload() payload: PositionCreatedPayload) {
    await this.auditService.handlePositionUpdated(payload);
  }

  @MessagePattern('position.deleted')
  async handlePositionDeleted(@Payload() payload: PositionCreatedPayload) {
    await this.auditService.handlePositionDeleted(payload);
  }

  // ── REST endpoints (consumed by the Next.js frontend) ────────────────────

  @Get()
  @ApiOperation({ summary: 'Retrieve all audit log entries, newest first' })
  findAll() {
    return this.auditService.findAll();
  }
}
