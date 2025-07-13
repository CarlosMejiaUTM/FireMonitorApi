import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

function createGoogleCredentialsFile() {
  const base64 = process.env.GCP_CREDENTIALS_BASE64;
  if (!base64) {
    throw new Error('La variable de entorno GCP_CREDENTIALS_BASE64 no está definida');
  }
  const filePath = path.join(process.cwd(), 'gcp-credentials.json');
  const buffer = Buffer.from(base64, 'base64');
  fs.writeFileSync(filePath, buffer);

  process.env.GOOGLE_APPLICATION_CREDENTIALS = filePath;
}

async function bootstrap() {
  // Primero creamos el archivo de credenciales antes de arrancar la app
  createGoogleCredentialsFile();

  const app = await NestFactory.create(AppModule);

  // Habilitamos CORS para que tu frontend pueda hacer peticiones
  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(3000);
  console.log(`🚀 Aplicación corriendo en: http://localhost:3000`);
}
bootstrap();
