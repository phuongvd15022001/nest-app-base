import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { StringField } from 'src/shared/decorators/dto.decorators';

export class CreateUserDto {
  @ApiProperty({ example: 'Jon', description: 'User Name' })
  @StringField({ optional: false }, { min: 1, max: 50 })
  name: string;

  @ApiProperty({ example: 'jon@gmail.com', description: 'User Email' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456', description: 'Password', minLength: 6 })
  @IsString()
  @MinLength(6)
  password: string;
}
