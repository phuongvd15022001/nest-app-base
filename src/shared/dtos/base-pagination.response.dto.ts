import { Type } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export class BasePaginationResponseDto<T> {
  @ApiProperty({
    description: 'List Items',
    isArray: true,
    type: Object,
  })
  items: T[];

  @ApiProperty({ example: 10, description: 'Total Items' })
  totalItems: number;

  @ApiProperty({ example: 1, description: 'Current Page' })
  currentPage?: number;

  @ApiProperty({
    example: 100,
    description: 'Total All Items',
  })
  allItems?: number;

  constructor(partial: Partial<BasePaginationResponseDto<T>>) {
    Object.assign(this, partial);
  }

  static convertToPaginationResponse(
    data: [any[], number],
    currentPage?: number,
    allItems?: number,
  ) {
    return {
      items: data[0],
      totalItems: data[1],
      currentPage,
      allItems,
    };
  }

  static apiOKResponse<T>(itemType: Type<T>) {
    class PaginationResponse extends BasePaginationResponseDto<T> {
      @ApiProperty({ type: [itemType] })
      declare items: T[];
    }

    return PaginationResponse;
  }
}
