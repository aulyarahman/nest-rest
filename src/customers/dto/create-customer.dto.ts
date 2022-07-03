import { IsString, IsNotEmpty, IsEmail, IsOptional } from 'class-validator';
import { ErrorsMessage } from '../../enum';

export class CreateCustomerDto {
  readonly id?: string;

  @IsNotEmpty({ message: ErrorsMessage.NAME_EMPTY })
  @IsString({ message: ErrorsMessage.NAME })
  readonly name: string;

  @IsNotEmpty({ message: ErrorsMessage.PHONE_NUMBER_EMPTY })
  @IsString({ message: ErrorsMessage.PHONE_NUMBER })
  readonly phoneNumber: string;

  @IsNotEmpty({ message: ErrorsMessage.EMAIL_EMPTY })
  @IsEmail({}, { message: ErrorsMessage.EMAIL })
  readonly email: string;

  @IsOptional()
  @IsString()
  readonly imageUrl: string;

  @IsOptional()
  @IsString()
  readonly imageKey: string;

  @IsOptional()
  @IsString()
  readonly rt: string;

  @IsOptional()
  @IsString({ message: ErrorsMessage.FMC_TOKEN })
  readonly fcmToken: string;
}
