import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TreeRepository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { PositionEntity } from '../entities/position.entity';
import { CreatePositionDto, UpdatePositionDto } from './dto/position.dto';

@Injectable()
export class PositionsService {
  constructor(
    @InjectRepository(PositionEntity)
    private readonly positionRepository: TreeRepository<PositionEntity>,
    @Inject('AUDIT_SERVICE')
    private readonly auditClient: ClientProxy,
  ) {}

  async create(createPositionDto: CreatePositionDto) {
    const position = this.positionRepository.create(createPositionDto);
    if (createPositionDto.parentId) {
      const parent = await this.positionRepository.findOneBy({ id: createPositionDto.parentId });
      if (!parent) {
        throw new NotFoundException('Parent position not found');
      }
      position.parent = parent;
      position.parentId = parent.id;
    }

    const saved = await this.positionRepository.save(position);

    // Publish audit event to RabbitMQ — fire and forget
    this.auditClient.send('position.created', {
      id: saved.id,
      name: saved.name,
      createdAt: new Date().toISOString(),
    }).subscribe();

    return saved;
  }

  async findAll() {
    return this.positionRepository.find();
  }

  async findAllTree() {
    return this.positionRepository.findTrees();
  }

  async findOne(id: string) {
    const position = await this.positionRepository.findOneBy({ id });
    if (!position) {
      throw new NotFoundException(`Position with id ${id} not found`);
    }
    return position;
  }

  async findChildren(id: string) {
    const position = await this.findOne(id);
    return this.positionRepository.findDescendantsTree(position);
  }

  async update(id: string, updatePositionDto: UpdatePositionDto) {
    const position = await this.findOne(id);

    if (updatePositionDto.parentId !== undefined && updatePositionDto.parentId !== null) {
      if (updatePositionDto.parentId === id) {
        throw new BadRequestException('A position cannot be its own parent');
      }
      const descendants = await this.positionRepository.findDescendants(position);
      const descendantIds = descendants.filter(d => d.id !== id).map(d => d.id);
      if (descendantIds.includes(updatePositionDto.parentId)) {
        throw new BadRequestException('A position cannot be a child of its own descendant');
      }
    }

    this.positionRepository.merge(position, updatePositionDto);
    if (updatePositionDto.parentId !== undefined) {
      if (updatePositionDto.parentId === null) {
        position.parent = null;
        position.parentId = null;
      } else {
        const parent = await this.findOne(updatePositionDto.parentId);
        position.parent = parent;
        position.parentId = parent.id;
      }
    }
    const saved = await this.positionRepository.save(position);
    this.auditClient.send('position.updated', {
      id: saved.id,
      name: saved.name,
      createdAt: new Date().toISOString(),
    }).subscribe();
    return saved;
  }

  async remove(id: string) {
    const position = await this.findOne(id);
    const name = position.name;
    const removed = await this.positionRepository.remove(position);
    this.auditClient.send('position.deleted', {
      id,
      name,
      createdAt: new Date().toISOString(),
    }).subscribe();
    return removed;
  }
}
