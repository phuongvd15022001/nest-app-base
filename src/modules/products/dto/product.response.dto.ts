import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ProductResponseDto {
  @ApiProperty({ example: 1, description: 'Product ID' })
  @Expose()
  id: number;

  @ApiProperty({ example: 'Chicken', description: 'Product Name' })
  @Expose()
  name: string;
}
