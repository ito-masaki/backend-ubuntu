import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { PostModule } from './post/post.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    UserModule,
    PostModule,
    AuthModule, // NestJSがPostgreSQLと接続、勝手に読み込む
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'myuser',
      password: 'mypassword',
      database: 'my-db',
      autoLoadEntities: true,
      synchronize: false, // 自動同期を無効化
      // entities: ['./src/entities/*.ts'],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
