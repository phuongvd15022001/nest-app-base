import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { Expose } from 'class-transformer';

export class AuthResponseDto {
  @ApiProperty()
  @Expose()
  user: Partial<User>;

  @ApiProperty()
  @Expose()
  accessToken: string;
}
