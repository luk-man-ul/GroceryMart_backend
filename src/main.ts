import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import cookieParser from 'cookie-parser';
import { v4 as uuid } from 'uuid';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  //  ENABLE CORS
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  });

  //  ENABLE VALIDATION
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  //  SERVE LOCAL UPLOADS
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads',
  });

  app.use(cookieParser());
app.use((req, res, next) => {
  if (!req.cookies.guestId) {
    res.cookie('guestId', uuid(), {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }
  next();
});

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
