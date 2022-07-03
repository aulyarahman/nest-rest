import { IsString, IsEmail, IsOptional } from 'class-validator';
import { ErrorsMessage } from '../../enum';

export class UpdateCustomerDto {
  readonly id?: string;

  @IsOptional()
  @IsString({ message: ErrorsMessage.NAME })
  readonly name: string;

  @IsOptional()
  @IsString({ message: ErrorsMessage.PHONE_NUMBER })
  readonly phoneNumber: string;

  @IsOptional()
  @IsEmail({}, { message: ErrorsMessage.EMAIL })
  readonly email: string;
}
