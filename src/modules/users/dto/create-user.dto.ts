import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';
import { StringField } from 'src/shared/decorators/dto.decorators';

export class CreateUserDto {
  @ApiProperty({ example: 'Jon', description: 'User Name' })
  @StringField({ optional: false }, { min: 1, max: 10 })
  name: string;

  @ApiProperty({ example: 'jon@gmail.com', description: 'User Email' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456', description: 'Password' })
  @IsString()
  password: string;
}
