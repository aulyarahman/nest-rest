import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { DEFAULT_IMAGE } from 'src/utils/url';

export type CustomerDocument = Customers & Document;

@Schema({ timestamps: true })
export class Customers {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ type: String })
  name: string;

  @Prop({ maxlength: 16 })
  phoneNumber: string;

  @Prop({ type: String })
  email: string;

  @Prop({ type: String, default: DEFAULT_IMAGE })
  imageUrl: string;

  @Prop({ type: String, default: '' })
  imageKey: string;

  @Prop({ type: String, default: '' })
  fcmToken: string;

  @Prop({ type: String, default: '' })
  kodalPay: string;

  @Prop({ type: String, default: null })
  rt: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export const CustomersSchema = SchemaFactory.createForClass(Customers);
