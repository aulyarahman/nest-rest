import { IsString, IsEmail, IsNotEmpty } from 'class-validator';
import { ErrorsMessage } from '../../enum';

export class SignUpCustomerDto {
  @IsNotEmpty({ message: ErrorsMessage.NAME_EMPTY })
  @IsString({ message: ErrorsMessage.NAME })
  readonly name: string;

  @IsNotEmpty({ message: ErrorsMessage.EMAIL_EMPTY })
  @IsEmail({}, { message: ErrorsMessage.EMAIL })
  readonly email: string;

  @IsNotEmpty({ message: ErrorsMessage.PHONE_NUMBER_EMPTY })
  @IsString({ message: ErrorsMessage.PHONE_NUMBER })
  readonly phoneNumber: string;
}
