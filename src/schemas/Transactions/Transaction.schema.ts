// Entidade Transaction
import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types, Mixed } from "mongoose";

@Schema({ timestamps: { createdAt: true, updatedAt: false } }) // Apenas createdAt
export class Transaction extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Wallet', required: true, index: true })
  walletId: Types.ObjectId;

  @Prop({ required: true })
  amount: number; // Positivo para créditos (depósito, recebimento), negativo para débitos (saque, pagamento)

  @Prop({ 
    required: true, 
    enum: ['deposit', 'withdraw', 'booking_payment', 'tour_payout', 'refund'] 
  })
  type: string;

  @Prop({ required: true, enum: ['pending', 'completed', 'failed', 'canceled'], default: 'completed' })
  status: string;

  // Um campo de metadados para guardar detalhes da transação
  @Prop({ type: Object })
  metadata?: {
    bookingId?: Types.ObjectId;
    packageTourId?: Types.ObjectId;
    paymentGatewayId?: string;
    description?: string;
  };
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);