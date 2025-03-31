import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS を有効化
  app.enableCors({
    origin: 'http://127.0.0.1:5173', // 許可するオリジン
    credentials: true, // クッキーや認証情報を許可するか
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // 許可する HTTP メソッド
    allowedHeaders: 'Content-Type, Authorization', // 許可する HTTP ヘッダー
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log('🚀 Server is running on http://localhost:3000');
}
bootstrap();
