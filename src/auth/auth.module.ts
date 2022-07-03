import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthenticationService } from './auth.service';
import { AtStrategy, RtStrategy } from './strategies';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { TemporaryOtp, TemporaryOtpSchmea } from './schemas/temp.schema';
import { CustomersModule } from 'src/customers/customers.module';
import { AuthenticationController } from './auth.controller';

@Module({
  imports: [
    forwardRef(() => CustomersModule),
    HttpModule,
    JwtModule.register({}),
    MongooseModule.forFeature([{ name: TemporaryOtp.name, schema: TemporaryOtpSchmea }])
  ],
  providers: [AuthenticationService, AtStrategy, RtStrategy],
  controllers: [AuthenticationController],
  exports: [AuthenticationService]
})
export class AuthenticationModule {}
