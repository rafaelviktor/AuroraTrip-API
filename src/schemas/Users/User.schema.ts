import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

@Schema()
export class User extends Document {
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
    @Prop({ type: Date, default: Date.now })
    createdAt: Date;
    @Prop({ required: false})
    refreshToken: string;
    @Prop({ required: true, enum: ['admin', 'moderator', 'user'], default: 'user' })
    role: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    delete obj.refreshToken;
    return obj;
};