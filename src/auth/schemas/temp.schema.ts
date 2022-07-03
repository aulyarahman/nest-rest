import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TemporaryOtpDocument = TemporaryOtp & Document;

@Schema({ collection: 'temporary-otp' })
export class TemporaryOtp {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ maxlength: 4, required: true })
  otp: string;

  @Prop({ maxlength: 15, required: true })
  phoneNumber: string;

  @Prop({ type: Date, expires: 120, default: Date.now, required: true })
  createdAt: Date;
}

export const TemporaryOtpSchmea = SchemaFactory.createForClass(TemporaryOtp);

TemporaryOtpSchmea.index({ createdAt: 1 }, { expireAfterSeconds: 120 });
