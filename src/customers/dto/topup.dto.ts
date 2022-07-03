import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class TopupDto {
  @IsNotEmpty()
  @IsNumber()
  readonly amount: number;

  @IsNotEmpty()
  @IsString()
  readonly typePayment: 'ID_OVO' | 'ID_DANA' | 'ID_LINKAJA' | 'ID_SHOPEEPAY' | 'PH_PAYMAYA';
}
