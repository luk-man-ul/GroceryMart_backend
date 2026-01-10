import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getHello() { // <--- Add 'async' here
    return await this.appService.getHello(); // <--- Add 'await' here
  }
}