import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

function createGoogleCredentialsFile() {
  const base64 = process.env.GCP_CREDENTIALS_BASE64;
  if (base64) {
    const filePath = path.join(process.cwd(), 'gcp-credentials.json');
    const buffer = Buffer.from(base64, 'base64');
    fs.writeFileSync(filePath, buffer);
    process.env.GOOGLE_APPLICATION_CREDENTIALS = filePath;
  } else {
    console.warn('No se encontró la variable GCP_CREDENTIALS_BASE64, usando configuración local');
  }
}

async function bootstrap() {
  createGoogleCredentialsFile();

  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT || 3000);
  console.log(`🚀 Aplicación corriendo en: http://localhost:${process.env.PORT || 3000}`);
}
bootstrap();
