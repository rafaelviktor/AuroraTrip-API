import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema()
export class Vehicle extends Document {
  @Prop({ required: true, enum: ['buggy', 'lancha', '4x4'] })
  type: string;

  @Prop({ required: true })
  vehicleModel: string;

  @Prop({ required: true })
  capacity: number;

  @Prop({ type: Types.ObjectId, ref: 'Driver', required: true })
  driver: Types.ObjectId;
}

export const VehicleSchema = SchemaFactory.createForClass(Vehicle);