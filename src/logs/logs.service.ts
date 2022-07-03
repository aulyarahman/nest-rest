import { LogsRepository } from './logs.repository';
import { v4 as uuidv4 } from 'uuid';
import { BadRequestException, Injectable } from '@nestjs/common';
import { LogsByDate, LogsDto } from './dto/logs.dto';

@Injectable()
export class LogsService {
  constructor(private logsRepository: LogsRepository) {}

  async create(it: LogsDto) {
    try {
      return await this.logsRepository.create({
        _id: 'LOGS-' + uuidv4(),
        message: it.message,
        userId: it.userId,
        service: it.service
      });
    } catch (e) {
      console.error(e.message);
    }
  }

  async find(page = 0) {
    try {
      return await this.logsRepository.findWithPaging(page);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async findFromDate(it: LogsByDate) {
    try {
      return await this.logsRepository.findWithDate(it.from, it.to, it.page);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async deleteOne(id: string) {
    try {
      return await this.logsRepository.findOneAndDelete({ _id: id });
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  async deleteFromDate(from: Date, to: Date) {
    try {
      return await this.logsRepository.deleteMany({
        createdAt: {
          $gte: from,
          $lte: to
        }
      });
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
