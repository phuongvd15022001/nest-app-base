import { Injectable } from '@nestjs/common';

@Injectable()
export class HelloService {
  getHello(): string {
    return 'Hello World from hello service';
  }
}
