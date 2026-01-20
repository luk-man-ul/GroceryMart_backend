import { Controller, Get } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'

@ApiTags('Health')
@Controller()
export class AppController {

  @Get()
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({
    status: 200,
    description: 'Server is running',
  })
  getHealth() {
    return {
      status: 'ok',
      uptime: process.uptime(),
    }
  }
}
