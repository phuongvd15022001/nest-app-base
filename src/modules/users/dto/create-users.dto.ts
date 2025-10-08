import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { Type } from 'class-transformer';

export class CreateUsersDto {
  @ApiProperty({
    description: 'List of users to create',
    type: [CreateUserDto],
    example: [
      { email: 'user1@example.com', password: '123456', name: 'user1' },
      { email: 'user2@example.com', password: 'abcdef', name: 'user2' },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateUserDto)
  users: CreateUserDto[];
}
