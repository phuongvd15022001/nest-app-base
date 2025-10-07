import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  getPort(): number {
    return Number(process.env.PORT ?? 3000);
  }
}
