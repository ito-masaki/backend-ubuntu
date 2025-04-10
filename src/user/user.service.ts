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
import * as jwt from 'jsonwebtoken';
dotenv.config(); // .envファイルを読み込む

@Injectable()
export class UserService {
  private transporter: nodemailer.Transporter;

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
  }

  async sendEmail(email: string): Promise<boolean> {
    // 既にDBに同じemailアドレスが存在していればfalse
    const user = await this.userRepository.findOne({
      where: {
        email: Equal(email),
      },
    });
    if (user) {
      return false;
    }
    // jwtトークンの作成
    const secretKey = process.env.SECRET_KEY;
    if (!secretKey) {
      throw new Error('SECRET_KEY is not defined');
    }
    const token = jwt.sign({ enail: email }, secretKey, {
      expiresIn: '1h',
    });

    // jwtトークンを含んだurlの作成
    const verificationUrl = `http://localhost:3000/verify/${token}`;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: '認証コードをご確認ください',
      text: `Please verify your email by clicking the following link: ${verificationUrl}`,
    };

    console.log(mailOptions);
    try {
      await this.transporter.sendMail(mailOptions);
      console.log('メールが正常に送信されました');
      return true;
    } catch (error) {
      console.error('メール送信エラー:', error);
    }
    return true;
  }

  async createUser(name: string, email: string, password: string) {
    const hash = createHash('md5').update(password).digest('hex');
    const record = {
      name: name,
      email: email,
      hash: hash,
    };
    await this.userRepository.save(record);
  }

  async getUser(token: string, id: number) {
    const now = new Date();
    const auth = await this.authRepository.find({
      where: {
        token: Equal(token),
        expire_at: MoreThan(now),
      },
    });
    if (!auth) {
      throw new ForbiddenException();
    }
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
}
