import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreatePositionDto {
  @ApiProperty({ description: 'The name of the position/role' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'Description of the position' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'The ID of the parent position' })
  @IsUUID()
  @IsOptional()
  parentId?: string;
}

export class UpdatePositionDto {
  @ApiPropertyOptional({ description: 'The name of the position/role' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ description: 'Description of the position' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'The ID of the parent position' })
  @IsUUID()
  @IsOptional()
  parentId?: string;
}
