import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ProductResponseDto {
  @ApiProperty({ example: 1, description: 'Product ID' })
  @Expose()
  id: number;

  @ApiProperty({ example: 'Chicken', description: 'Product Name' })
  @Expose()
  name: string;

  @ApiPropertyOptional({ example: 'Fresh whole chicken', description: 'Product Description' })
  @Expose()
  description?: string;

  @ApiProperty({ example: 9.99, description: 'Product Price' })
  @Expose()
  price: number;
}
