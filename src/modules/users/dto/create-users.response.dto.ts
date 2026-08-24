import { ResField } from 'src/shared/decorators/dto.decorators';

export class CreateUsersResponseDto {
  @ResField({ example: 5, description: 'Number of users created' })
  count: number;
}
