import { ApiPropertyOptional } from '@nestjs/swagger';
import { StringField } from 'src/shared/decorators/dto.decorators';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Jon', description: 'User Name' })
  @StringField({ optional: true }, { min: 1, max: 100 })
  name?: string;

  @ApiPropertyOptional({ example: 'jon@gmail.com', description: 'User Email' })
  @StringField({ optional: true }, { min: 1, max: 100 })
  email?: string;
}
