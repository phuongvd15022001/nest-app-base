import { Type } from 'class-transformer';
import { ProductResponseDto } from 'src/modules/products/dto/product.response.dto';
import { UserResponseDto } from 'src/modules/users/dto/user.response.dto';
import { ResField } from 'src/shared/decorators/dto.decorators';

export class UserWithProductResponseDto extends UserResponseDto {
  @ResField({ type: [ProductResponseDto], description: 'User products' })
  @Type(() => ProductResponseDto)
  Product?: ProductResponseDto[];
}
