import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'Jon', description: 'User Name' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'jon@gmail.com', description: 'User Name' })
  @IsEmail()
  email: string;
}
