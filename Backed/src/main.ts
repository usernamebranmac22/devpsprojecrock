import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as morgan from 'morgan';
import { CORS } from './constants';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  app.use(morgan('dev'));

  app.enableCors(CORS);

  const configService = app.get(ConfigService);

  app.useGlobalPipes(new ValidationPipe())
  await app.listen(configService.get('PORT'));
}
bootstrap();
