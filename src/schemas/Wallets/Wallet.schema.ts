// Entidade Wallet
import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({ timestamps: true })
export class Wallet extends Document {
  @Prop({ type: Types.ObjectId, required: true, index: true }) // ID do dono da carteira (seja User ou Driver)
  owner: Types.ObjectId;

  @Prop({ required: true, enum: ['User', 'Driver'] }) // Para identificar qual coleção 'owner' está referenciando
  ownerType: string;

  @Prop({ required: true, default: 0 })
  balance: number;

  @Prop({ type: Date, default: null })
  lastSnapshotAt: Date | null;

  @Prop({ type: Number, default: 0 })
  snapshotBalance: number;
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);
// Um índice composto garante que cada User/Driver tenha apenas uma carteira
WalletSchema.index({ owner: 1, ownerType: 1 }, { unique: true });