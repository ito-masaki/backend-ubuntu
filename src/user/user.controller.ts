import { Controller, Get, Post, Param, Query, Body } from '@nestjs/common';
import { UserService } from './user.service';

enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
}

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // 入力情報を受け取り、確認コードを送信
  @Post(`application`)
  async Sendmail(
    @Body('name') name: string,
    @Body('sex') sex: string,
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    // dataの確認
    console.log(name, sex, email, password);
    return await this.userService.sendEmail(name, email, password);
  }

  // メール認証
  @Post(`certification`)
  async createuser(@Body('pass') code: string, @Body('email') email: string) {
    return await this.userService.createUser(email, code);
  }

  // ユーザ情報の取得
  @Get(':id')
  async getUser(@Param('id') id: number, @Query('token') token: string) {
    console.log(`idは${id}, tokenは${token}`);
    return await this.userService.getUser(token, id);
  }

  // ユーザ情報の編集
  @Post(`edit`)
  async edit_user(
    @Body('id') id: number,
    @Body('name') name: string,
    @Body('introduction') introduction: string,
    @Body('gender') gender: Gender,
    @Query('token') token: string,
  ) {
    return await this.userService.editUser(
      id,
      name,
      introduction,
      gender,
      token,
    );
  }

  // パスワード再設定のためのメアドを受け取る
  @Post('reset_password')
  async resetPass(@Body(`email`) email: string) {
    return await this.userService.resetPass(email);
  }

  @Post(`enter_password`)
  async enterpass(@Body(`pass`) Pass: string, @Query(`token`) token: string) {
    return await this.userService.PassReset(Pass, token);
  }
}
