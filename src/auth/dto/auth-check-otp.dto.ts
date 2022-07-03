import { ErrorsMessage } from 'src/enum';
import { IsString, IsNumber } from 'class-validator';

export class TempOtpDto {
  @IsString({ message: ErrorsMessage.ID })
  readonly id: string;

  @IsNumber({}, { message: ErrorsMessage.CODE_OTP })
  readonly otp: number;

  @IsString({ message: ErrorsMessage.PHONE_NUMBER })
  readonly phoneNumber: string;
}
