import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './filters/all.exceptions.filter';
import { InvalidFormExceptionFilter } from './filters/invalid.form.exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Exception
  app.useGlobalFilters(
    new AllExceptionsFilter(app.get(HttpAdapterHost)),
    new InvalidFormExceptionFilter(),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
