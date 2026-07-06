import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe } from '@nestjs/common';
import { PositionsService } from './positions.service';
import { CreatePositionDto, UpdatePositionDto } from './dto/position.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('positions')
@Controller('api/positions')
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new employee position/role' })
  @ApiResponse({ status: 201, description: 'The position has been successfully created.' })
  create(@Body() createPositionDto: CreatePositionDto) {
    return this.positionsService.create(createPositionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all positions' })
  findAll() {
    return this.positionsService.findAll();
  }

  @Get('tree')
  @ApiOperation({ summary: 'Get all position/role structure according to hierarchy in a tree mode' })
  findTree() {
    return this.positionsService.findAllTree();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single position/role detail' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.positionsService.findOne(id);
  }

  @Get(':id/children')
  @ApiOperation({ summary: 'Get all children of a specific position/role' })
  findChildren(@Param('id', ParseUUIDPipe) id: string) {
    return this.positionsService.findChildren(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update previously saved position/role at any time' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updatePositionDto: UpdatePositionDto) {
    return this.positionsService.update(id, updatePositionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove position/role at any time based on the hierarchy' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.positionsService.remove(id);
  }
}
