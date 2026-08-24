import { ApiProperty } from '@nestjs/swagger';
import { EmailField, StringField } from 'src/shared/decorators/dto.decorators';

export class LoginDto {
  @ApiProperty({ example: 'admin@example.com', description: 'User Email' })
  @EmailField()
  email: string;

  @ApiProperty({ example: 'password123', description: 'Password' })
  @StringField()
  password: string;
}
