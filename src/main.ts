import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LazyModuleLoader, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.enableCors();
  app.setGlobalPrefix(configService.get('ENDPOINT'));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true
    })
  );
  app.get(LazyModuleLoader);
  app.use(helmet());

  app.enableShutdownHooks(['SIGTERM', 'SIGINT']);

  await app.listen(configService.get('PORT'));


}
bootstrap();
