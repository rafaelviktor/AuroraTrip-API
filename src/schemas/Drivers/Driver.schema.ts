import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema()
export class Driver extends Document {
  @Prop({ unique: true, required: true })
  username: string;
  
  @Prop({ required: true })
  name: string;

  @Prop({ unique: true, required: true })
  email: string;

  @Prop({ required: true })
  phone: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, enum: ['buggy', 'lancha', '4x4'] })
  transportType: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ required: false })
  refreshToken: string;

  @Prop({ required: true, enum: ['driver'], default: 'driver' })
  role: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Vehicle' }], default: [] })
  vehicles: Types.ObjectId[];
}

export const DriverSchema = SchemaFactory.createForClass(Driver);

DriverSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  return obj;
};