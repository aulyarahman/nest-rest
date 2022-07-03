import { Injectable } from '@nestjs/common';
import { EntityRepository } from '../database/entity.repository';
import { LogsDocument, Logs } from './schemas/logs.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class LogsRepository extends EntityRepository<LogsDocument> {
  constructor(
    @InjectModel(Logs.name)
    protected readonly logsModel: Model<LogsDocument>
  ) {
    super(logsModel);
  }

  async findWithPaging(page = 0) {
    return await this.logsModel
      .find({})
      .limit(10)
      .skip(10 * page)
      .exec();
  }

  async findWithDate(from: Date, to: Date, page = 0) {
    return await this.logsModel
      .find({
        createdAt: {
          $gte: from,
          $lte: to
        }
      })
      .limit(10)
      .skip(10 * page)
      .exec();
  }
}
