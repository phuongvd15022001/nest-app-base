import { Type } from 'class-transformer';
import { ProductResponseDto } from 'src/modules/products/dto/product.response.dto';
import { UserResponseDto } from 'src/modules/users/dto/user.response.dto';
import { ResField } from 'src/shared/decorators/dto.decorators';

export class ProductWithUserResponseDto extends ProductResponseDto {
  @ResField({
    type: () => UserResponseDto,
    description: 'Product owner',
    required: false,
  })
  @Type(() => UserResponseDto)
  user?: UserResponseDto;
}
