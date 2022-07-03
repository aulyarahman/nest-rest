import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { KodalPayModule } from '../kodal-pay/kodal-pay.module';
import { CustomersController } from './customers.controller';
import { CustomersService } from './customers.service';
import { Customers, CustomersSchema } from './schemas/customers.schema';
import { CustomersRepository } from './customers.repository';
import { FileUploadService } from '../uploads/upload.service';
import { AuthenticationModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Customers.name, schema: CustomersSchema }]),
    KodalPayModule,
    forwardRef(() => AuthenticationModule)
  ],
  controllers: [CustomersController],
  providers: [CustomersService, CustomersRepository, FileUploadService],
  exports: [CustomersService]
})
export class CustomersModule {}
