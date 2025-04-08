import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Equal, MoreThan } from 'typeorm';
import { MicroPost } from '../entities/microposts';
import { Auth } from '../entities/auth';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(MicroPost)
    private microPostRepository: Repository<MicroPost>,
    @InjectRepository(Auth)
    private authRepository: Repository<Auth>,
  ) {}

  async createpost(message: string, token: string) {
    const now = new Date();
    console.log(`Postされた時刻${now} ,${message}, ${token}`); //デバック
    const auth = await this.authRepository.findOne({
      where: {
        token: Equal(token),
        expire_at: MoreThan(now),
      },
    });
    // 認証されていなければエラーを返す。
    if (!auth) {
      throw new ForbiddenException();
    }

    // 短文投稿DBへdataを格納
    const record = {
      user_id: auth.user_id,
      content: message,
    };
    await this.microPostRepository.save(record);
    console.log(`登録されたPost${record}`);
    return record;
  }

  //投稿を取得する関数, 存在しない場合の初期値を置いている！！
  async getList(token: string, start: number = 0, nr_records: number = 1) {
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

    const qb = await this.microPostRepository
      .createQueryBuilder('micro_post')
      .leftJoinAndSelect('user', 'user', 'user.id=micro_post.user_id')
      .select([
        'micro_post.id as id',
        'user.name as user_name',
        'micro_post.content as content',
        'micro_post.created_at as created_at',
      ])
      .orderBy('micro_post.created_at', 'DESC')
      .offset(start)
      .limit(nr_records);

    // 送信するための型を指定
    type ResultType = {
      id: number;
      content: string;
      user_name: string;
      created_at: Date;
    };

    const records = await qb.getRawMany<ResultType>();
    console.log(records);
    return records;
  }
}
