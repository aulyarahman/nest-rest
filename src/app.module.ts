import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';

// MODULE
import { AuthenticationModule } from './auth/auth.module';
import { AtGuard } from './common/guards';
import { CustomersModule } from './customers/customers.module';

import HealthModule from './health/health.module';
import { FileUploadService } from './uploads/upload.service';


//CONFIG
import { ConfigModule as ConfigModuleDb } from './config/config.module';
import { ConfigServices as ConfigServiceDb } from './config/config.service';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 120,
      limit: 5
    }),
    ConfigModuleDb,
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    // SET MONGODB
    MongooseModule.forRootAsync({
      inject: [ConfigServiceDb],
      useFactory: async (configService: ConfigServiceDb) => configService.getMongoConfig()
    }),
    AuthenticationModule,
    CustomersModule,
    HealthModule,

  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AtGuard
    },
    FileUploadService
  ]
})
export class AppModule {}
