import { IsString } from 'class-validator';
import { ErrorsMessage } from '../../enum';

export class UpdateFcmCustomerDto {
  @IsString({ message: ErrorsMessage.ID })
  readonly id: string;

  @IsString({ message: ErrorsMessage.FMC_TOKEN })
  readonly fcmToken: string;
}
