import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EntityRepository } from '../database/entity.repository';

import { Customers, CustomerDocument } from './schemas/customers.schema';

@Injectable()
export class CustomersRepository extends EntityRepository<CustomerDocument> {
  constructor(@InjectModel(Customers.name) customerModel: Model<CustomerDocument>) {
    super(customerModel);
  }
}
