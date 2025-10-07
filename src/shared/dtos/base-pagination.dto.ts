import { ApiPropertyOptional } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class BasePaginationDto {
  @ApiPropertyOptional({ example: 10, description: 'Limit' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;

  @ApiPropertyOptional({ example: 1, description: 'Page' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ example: 'name', description: 'SortBy' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ example: 'asc', description: 'Sort Direction' })
  @IsOptional()
  @IsEnum(Prisma.SortOrder)
  direction?: Prisma.SortOrder;

  @ApiPropertyOptional({ example: 'Jon', description: 'Search' })
  @IsOptional()
  @IsString()
  search?: string;
}
