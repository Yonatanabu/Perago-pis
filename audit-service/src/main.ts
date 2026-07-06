import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  // ── HTTP server (REST API for the frontend) ──────────────────────────────
  const app = await NestFactory.create(AppModule);

  // Allow the frontend to access the audit API
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Swagger docs at http://localhost:3001/api-docs
  const config = new DocumentBuilder()
    .setTitle('Audit Service API')
    .setDescription('REST endpoints for retrieving audit log entries')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  // ── RabbitMQ microservice listener ────────────────────────────────────────
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'],
      queue: 'audit_queue',
      queueOptions: {
        durable: true,
      },
      noAck: false,
    },
  });

  await app.startAllMicroservices();
  await app.listen(process.env.PORT || 3001);

  console.log(`🟢 Audit Service HTTP  → http://localhost:${process.env.PORT || 3001}`);
  console.log(`🟢 Audit Service Swagger → http://localhost:${process.env.PORT || 3001}/api-docs`);
  console.log(`🐇 Listening on RabbitMQ queue: audit_queue`);
}

bootstrap();
