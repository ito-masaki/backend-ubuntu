import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { ConfigModule } from '@nestjs/config';
import { UserService } from './user.service';

describe('UserController', () => {
  // let controller: UserController;
  let service: UserService; // 差し替え用のサービス

  // テストごとに毎回呼ばれる処理
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      // controllers: [UserController],
      imports: [ConfigModule.forRoot()],
      providers: [
        {
          provide: UserService,
          useValue: {
            getUser: jest.fn().mockReturnValue({}), // getUser関数を差し替える
          },
        },
      ],
    }).compile();
    // controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService); // 差し替え用のサービスを作成する
  });

  // テスト本体
  it('should be defined', async () => {
    const controller = new UserController(service); // テスト対象のコントローラ作成
    await controller.getUser(1, 'xxx-xxx-xxx-xxx'); // getUser関数の呼び出し
    expect(service.getUser).toHaveBeenCalledTimes(1); // 呼び出し回数の確認
  });
});

// テスト本体

// it('should be defined', () => {
//   expect(controller).toBeDefined();
// });
