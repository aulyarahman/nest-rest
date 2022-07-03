/* eslint-disable prettier/prettier */
import { IsString,  } from 'class-validator';
import { ErrorsMessage } from 'src/enum';

export class LoginDto {
  @IsString({ message: ErrorsMessage.PHONE_NUMBER })
  readonly phoneNumber: string;
}
