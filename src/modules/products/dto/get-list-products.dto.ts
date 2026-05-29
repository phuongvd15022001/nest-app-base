import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IntField } from 'src/shared/decorators/dto.decorators';
import { BasePaginationDto } from 'src/shared/dtos/base-pagination.dto';

export class GetListProductsDto extends BasePaginationDto {
  @ApiPropertyOptional({ example: 1, description: 'User ID' })
  @IntField({ optional: true })
  @Type(() => Number)
  userId?: number;
}
