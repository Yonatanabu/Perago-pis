import { Test, TestingModule } from '@nestjs/testing';
import { PositionsController } from './positions.controller';
import { PositionsService } from './positions.service';

describe('PositionsController', () => {
  let controller: PositionsController;

  const mockPositionsService = {
    create: jest.fn(dto => {
      return { id: 'uuid', ...dto };
    }),
    findAllTree: jest.fn(() => []),
    findOne: jest.fn(id => {
      return { id, name: 'CEO' };
    }),
    findChildren: jest.fn(id => {
      return { id, name: 'CEO', children: [] };
    }),
    update: jest.fn((id, dto) => {
      return { id, ...dto };
    }),
    remove: jest.fn(id => {
      return { id };
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PositionsController],
      providers: [{ provide: PositionsService, useValue: mockPositionsService }],
    }).compile();

    controller = module.get<PositionsController>(PositionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a position', () => {
    expect(controller.create({ name: 'CEO' })).toEqual({
      id: expect.any(String),
      name: 'CEO',
    });
  });

  it('should find tree', () => {
    expect(controller.findTree()).toEqual([]);
  });

  it('should find one', () => {
    expect(controller.findOne('uuid')).toEqual({ id: 'uuid', name: 'CEO' });
  });

  it('should update a position', () => {
    expect(controller.update('uuid', { name: 'CTO' })).toEqual({
      id: 'uuid',
      name: 'CTO',
    });
  });

  it('should remove a position', () => {
    expect(controller.remove('uuid')).toEqual({ id: 'uuid' });
  });
});
