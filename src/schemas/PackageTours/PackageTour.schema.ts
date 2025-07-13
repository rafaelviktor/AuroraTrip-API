import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type PackageTourDocument = PackageTour & Document;

@Schema()
export class PackageTour extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Driver', required: true })
  driver: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Vehicle', required: true })
  vehicle: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'TouristPoint', required: true })
  origin: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'TouristPoint', required: true })
  destination: Types.ObjectId;

  @Prop({ required: true })
  departureTime: Date;

  @Prop({ required: true })
  returnTime: Date;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  seatsAvailable: number;

  @Prop({
    required: true,
    enum: ['aventura', 'histórico', 'cultural', 'ecológico', 'gastronômico', 'outro'],
    default: 'outro',
  })
  tourType: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export const PackageTourSchema = SchemaFactory.createForClass(PackageTour);