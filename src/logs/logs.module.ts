import { Global, Module } from '@nestjs/common';
import { LogsService } from './logs.service';
import { LogsRepository } from './logs.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Logs, LogsSchema } from './schemas/logs.schema';
import { LogsController } from './logs.controller';

@Global()
@Module({
  imports: [MongooseModule.forFeature([{ name: Logs.name, schema: LogsSchema }])],
  providers: [LogsService, LogsRepository],
  controllers: [LogsController],
  exports: [LogsService]
})
export class LogsModule {}
