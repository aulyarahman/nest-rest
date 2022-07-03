import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LogsDocument = Logs & Document;

@Schema()
export class Logs {
  @Prop({ type: String, required: true })
  _id: string;

  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, uppercase: true, required: true })
  service: string;

  @Prop({ type: String, required: true })
  message: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export const LogsSchema = SchemaFactory.createForClass(Logs);
