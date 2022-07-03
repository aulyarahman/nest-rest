import { IsString, IsNotEmpty, IsDate, IsNumber } from 'class-validator';

export class LogsDto {
  @IsNotEmpty()
  @IsString()
  readonly userId: string;

  @IsNotEmpty()
  @IsString()
  readonly service: string;

  @IsNotEmpty()
  @IsString()
  readonly message: string;
}

export class LogsByDate {
  @IsNotEmpty()
  @IsDate()
  readonly from: Date;

  @IsNotEmpty()
  @IsDate()
  readonly to: Date;

  @IsNotEmpty()
  @IsNumber()
  readonly page: number;
}
