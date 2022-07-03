import { LogsService } from './logs.service';
import { Controller, Get, HttpCode, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { LogsByDate } from './dto/logs.dto';
import { RoleGuard } from '../common/guards';
import { Roles } from '../enum';

@UseGuards(RoleGuard(Roles.Admin))
@Controller('logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @HttpCode(HttpStatus.OK)
  @Get()
  find(@Query('page') page: number) {
    return this.logsService.find(page);
  }

  @HttpCode(HttpStatus.OK)
  @Get('date')
  findByDate(@Query() item: LogsByDate) {
    return this.logsService.findFromDate(item);
  }
}
