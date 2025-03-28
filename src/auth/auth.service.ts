import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Equal } from 'typeorm';
import { Auth } from 'src/entities/auth';
import { User } from 'src/entities/user';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  //初期設定(他のclassの関数やリポジトリをもってくる)
  //こっちの引数はauth.controllerで入力しない情報全て、基本DB情報
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Auth)
    private authRepository: Repository<Auth>,
  ) {}

  //ここからauth_module(auth_controleer)で使われる関数を書いていく
  //こっちの引数は、auth.controllerから受け取る引数
  async getAuth(name: string, password: string) {
    if (!password) {
      throw new UnauthorizedException('パスワードが指定されていません');
    }
    // crypto.createHash('md5') で MD5アルゴリズムでハッシュオブジェクトを作成
    // update(password) でパスワードをハッシュ対象として追加
    // digest('hex') で最終的な16進数のハッシュ値を生成
    const hash = crypto.createHash('md5').update(password).digest('hex');

    // Repository<User>のクラスはCRUD操作などに対応したメソッドが存在、その1つがfindOne
    const user = await this.userRepository.findOne({
      where: {
        name: Equal(name),
        hash: Equal(hash),
      },
    });
    // 見つからなければ認証失敗
    if (!user) {
      throw new UnauthorizedException('認証に失敗しました');
    }
    //２つのpropertyをもつオブジェクトを定義
    const ret = { token: '', user_id: user.id };

    var expire = new Date();
    console.log(expire);
    expire.setDate(expire.getDate() + 1);

    //authDbからuser.idで一致するものを検索
    const auth = await this.authRepository.findOne({
      where: {
        user_id: Equal(user.id),
      },
    });

    if (auth) {
      // 更新, sign in
      auth.expire_at = expire;
      await this.authRepository.save(auth);
      ret.token = auth.token;
    } else {
      // 挿入,sign up
      const token = crypto.randomUUID();
      const record = {
        user_id: user.id,
        token: token,
        expire_at: expire.toISOString(),
      };
      await this.authRepository.save(record);
      ret.token = token;
    }
    return ret;
  }
}
