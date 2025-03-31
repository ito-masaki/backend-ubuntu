import { Controller, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  async getAuth(
    @Query('user_id') name: string,
    @Query('password') password: string,
  ) {
    const response = await this.authService.getAuth(name, password);
    console.log(response);
    return response;
  }
}
