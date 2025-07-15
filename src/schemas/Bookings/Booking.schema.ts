import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Booking extends Document {
  @Prop({ type: Types.ObjectId, ref: 'PackageTour', required: true, index: true })
  packageTour: Types.ObjectId; // A referência ao pacote de tour que foi reservado

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  user: Types.ObjectId; // O usuário que fez a reserva

  @Prop({ type: Types.ObjectId, ref: 'Driver', required: true })
  driver: Types.ObjectId; // O motorista que oferece o tour

  @Prop({ type: Types.ObjectId, ref: 'Vehicle', required: true })
  vehicle: Types.ObjectId; // O veículo do tour

  @Prop({ required: true, min: 1 })
  seats: number; // Quantidade de assentos solicitados no momento da reserva

  @Prop({ required: true })
  totalPrice: number; // O preço total da reserva

  @Prop({ 
    required: true, 
    enum: ['pending_payment', 'confirmed', 'completed', 'canceled_by_user', 'canceled_by_driver'], 
    default: 'pending_payment' 
  })
  status: string;

  @Prop({ type: Object }) // Detalhes da transação da wallet
  paymentDetails?: {
    transactionId: Types.ObjectId; // ID da transação da coleção 'transactions'
    paidAt: Date;
  };
}

export const BookingSchema = SchemaFactory.createForClass(Booking);