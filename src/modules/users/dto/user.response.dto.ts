import { ResField } from 'src/shared/decorators/dto.decorators';

export class UserResponseDto {
  @ResField({ example: 1, description: 'User ID' })
  id: number;

  @ResField({ example: 'Jon', description: 'User Name' })
  name: string;

  @ResField({ example: 'john@example.com', description: 'User Email' })
  email: string;
}
