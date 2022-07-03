import * as dotenv from 'dotenv';
import * as redisStore from 'cache-manager-redis-store';

export class ConfigServices {
  private readonly envConfig: Record<string, string>;
  constructor() {
    const result = dotenv.config();

    if (result.error) {
      this.envConfig = process.env;
    } else {
      this.envConfig = result.parsed;
    }
  }

  public get(key: string): string {
    return this.envConfig[key];
  }

  public async getPortConfig() {
    return this.get('PORT');
  }
  public async getMongoConfig() {
    return {
      uri:
        'mongodb+srv://' +
        this.get('MONGO_USER') +
        ':' +
        this.get('MONGO_PASSWORD') +
        this.get('MONG0_HOST') +
        '/' +
        this.get('MONGO_DATABASE'),
      useNewUrlParser: true,
      useUnifiedTopology: true
    };
  }

  public async getRedisConfig() {
    return {
      host: this.get('REDIS_HOST'),
      port: this.get('REDIS_PORT')
    };
  }
}
