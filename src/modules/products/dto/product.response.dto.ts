import { ResField } from 'src/shared/decorators/dto.decorators';

export class ProductResponseDto {
  @ResField({ example: 1, description: 'Product ID' })
  id: number;

  @ResField({ example: 'Chicken', description: 'Product Name' })
  name: string;

  @ResField({
    example: 'Fresh whole chicken',
    description: 'Product Description',
    required: false,
  })
  description?: string;

  @ResField({ example: 9.99, description: 'Product Price' })
  price: number;
}
