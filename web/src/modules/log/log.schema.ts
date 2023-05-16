import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type LogDocument = HydratedDocument<Log>;

@Schema()
export class Log {
  @Prop()
  domain: string;

  @Prop()
  type: string;

  @Prop()
  date: Date;

  @Prop()
  customer_name: string;

  @Prop()
  product_name: string;

  @Prop()
  link_id: string;

  @Prop()
  qty: string;

  @Prop()
  cart_id: number;
}

export const LogSchema = SchemaFactory.createForClass(Log);
