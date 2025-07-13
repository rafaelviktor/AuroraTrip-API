import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type TouristPointDocument = TouristPoint & Document;

@Schema()
export class TouristPoint extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  state: string; // UF

  @Prop({ required: false }) // Coordenadas opcionais
  latitude?: number;

  @Prop({ required: false })
  longitude?: number;
}

export const TouristPointSchema = SchemaFactory.createForClass(TouristPoint);