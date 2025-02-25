import { Controller, Get } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  @Get()
  getAuth() {
    console.log('auth get');
  }
}
