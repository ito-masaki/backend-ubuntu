import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { createHash } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Equal, MoreThan } from 'typeorm';
import { User } from '../entities/user';
import { Auth } from '../entities/auth';
import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
import Redis from 'ioredis';
dotenv.config(); // .envファイルを読み込む

enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

@Injectable()
export class UserService {
  private transporter: nodemailer.Transporter;
  private redisClient: Redis;
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Auth)
    private authRepository: Repository<Auth>,
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    this.redisClient = new Redis({
      host: `localhost`,
      port: 6379,
      db: 0,
    });
  }

  // tokenが有効かを確認する関数
  private async verifyAuthToken(token: string) {
    const now = new Date();
    const auth = await this.authRepository.findOne({
      where: {
        token: Equal(token),
        expire_at: MoreThan(now),
      },
    });
    if (!auth) {
      throw new ForbiddenException();
    }
    return auth;
  }

  // User情報を取得する関数
  private async getUserById(id: number) {
    const user = await this.userRepository.findOne({
      where: {
        id: Equal(id),
      },
    });
    if (!user) {
      throw new NotFoundException();
    }
    return user;
  }

  // メール認証のためのプログラム(送信)
  async sendEmail(
    name: string,
    email: string,
    password: string,
  ): Promise<boolean> {
    // 既にDBに同じemailアドレスが存在していればfalse
    const user = await this.userRepository.findOne({
      where: {
        email: Equal(email),
      },
    });
    if (user) {
      return false;
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString(); //6桁のcode
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: '認証コードのお知らせ',
      text: `認証コード：${code}\n\n※有効期間は本メール送信日時から24時間です。\n認証コード入力画面で上記のコードを入力してください。このメールは掲示板アプリでご登録・入力されたメールアドレスにお送りしています。このメールにお心当たりがない場合は、大変お手数ですが、下記のお問い合わせフォームにご連絡ください。\n\n${process.env.EMAIL_USER}`,
    };
    const SetDate = {
      name: name,
      email: email,
      password: password,
      code: code,
    };
    console.log(JSON.stringify(SetDate));
    await this.redisClient.set(
      email,
      JSON.stringify(SetDate),
      'EX',
      60 * 60 * 24,
    );
    try {
      await this.transporter.sendMail(mailOptions);
      console.log('メールが正常に送信されました');
      return true;
    } catch (error) {
      console.error('メール送信エラー:', error);
      return false;
    }
  }

  // 認証コードを受け取ってDBへ保存する。
  async createUser(email: string, code: string) {
    const data = await this.redisClient.get(email);
    if (!data) {
      return false;
    }
    const user_data = JSON.parse(data);
    if (user_data.code !== code) {
      return false; // コード違うならfalse返す
    }
    const hash = createHash('md5').update(user_data.password).digest('hex');
    const record = {
      name: user_data.name,
      email: user_data.email,
      hash: hash,
    };
    await this.userRepository.save(record);
    return true;
  }

  // ユーザ情報を取得する関数
  async getUser(token: string, id: number) {
    const auth = await this.verifyAuthToken(token);
    return await this.getUserById(id);
  }

  // ユーザ情報を編集する関数
  async editUser(
    id: number,
    name: string,
    introduction: string,
    gender: Gender,
    token: string,
  ) {
    const auth = await this.verifyAuthToken(token);
    const user = await this.getUserById(id);
    user.name = name;
    user.introduction = introduction;
    user.Gender = gender;
    await this.userRepository.save(user);
    return user;
  }

  // パスワード再設定のメールを送信する関数
  async resetPass(email: string) {
    const user = await this.userRepository.findOne({
      where: {
        email: Equal(email),
      },
    });
    if (!user) {
      return false; // ユーザーが見つからない場合
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString(); //6桁のcode
    const token = createHash('md5').update(code).digest('hex'); //token
    const url = `http://127.0.0.1:5173/passEnter?token=${token}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'パスワード再設定のお知らせ',
      text: `※有効期間は本メール送信日時から1時間です。\n${url}`,
    };
    // redisDBに保存
    await this.redisClient.set(token, email, 'EX', 60 * 60 * 1);
    // メール送信
    try {
      await this.transporter.sendMail(mailOptions);
      console.log('メールが正常に送信されました');
      return true;
    } catch (error) {
      console.error('メール送信エラー:', error);
      return false;
    }
  }

  // パスワードを再設定する関数
  async PassReset(pass: string, token: string) {
    const email = await this.redisClient.get(token);
    if (!email) {
      return false;
    }
    const user = await this.userRepository.findOne({
      where: {
        email: Equal(email),
      },
    });
    if (!user) {
      return false; // ユーザーが見つからない場合
    }
    user.hash = createHash('md5').update(pass).digest('hex');
    await this.userRepository.save(user);
    return true;
  }
}
