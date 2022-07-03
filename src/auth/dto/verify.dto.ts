import { IsString } from 'class-validator';
import { ErrorsMessage } from 'src/enum';

export class VerifyDto {
  @IsString({ message: ErrorsMessage.ID })
  readonly id: string;

  @IsString({ message: ErrorsMessage.CODE_OTP })
  readonly otp: string;
}
