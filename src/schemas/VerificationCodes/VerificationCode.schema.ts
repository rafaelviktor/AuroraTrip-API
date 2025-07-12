import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema()
export class VerificationCode extends Document {
    @Prop({required: true})
    email: string;

    @Prop({ required: true })
    code: string;

    @Prop({ type: Date, default: Date.now })
    createdAt: Date;
}

export const VerificationCodeSchema = SchemaFactory.createForClass(VerificationCode);