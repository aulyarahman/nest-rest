import { Global, Module } from '@nestjs/common';

import { ConfigServices } from './config.service';

@Global()
@Module({
  providers: [
    {
      provide: ConfigServices,
      useValue: new ConfigServices()
    }
  ],
  exports: [ConfigServices]
})
export class ConfigModule {}
