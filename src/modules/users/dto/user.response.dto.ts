import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class UserResponseDto {
  @ApiProperty({ example: 1, description: 'User ID' })
  @Expose()
  id: number;

  @ApiProperty({ example: 'Jon', description: 'User Name' })
  @Expose()
  name: string;

  @ApiProperty({ example: 'jon@gmail.com', description: 'User Email' })
  @Expose()
  email: string;
}
