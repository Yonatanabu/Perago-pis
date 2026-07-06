import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditModule } from './audit/audit.module';
import { AuditLogEntity } from './audit/audit-log.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ssl: false,
      extra: {
        ssl: {
          rejectUnauthorized: false,
        },
      },
      entities: [AuditLogEntity],
      // Creates the audit_logs table automatically on first run
      synchronize: true,
    }),
    AuditModule,
  ],
})
export class AppModule {}
