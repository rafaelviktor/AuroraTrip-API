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

  @Prop({ required: true })
  platformFee: number; // A taxa retida pela plataforma (ex: R$ 5)

  @Prop({ required: true })
  netAmountForDriver: number; // O valor líquido que o motorista recebe (ex: R$ 95)

  @Prop({ type: Date, default: null })
  actualDepartureTime?: Date; // Data/hora que o motorista iniciou o passeio

  @Prop({ type: Date, default: null })
  actualReturnTime?: Date;  // Data/hora que o motorista finalizou o passeio

  @Prop({ 
    required: true, 
    enum: [
      'pending_payment', // Pendente o pagamento
      'confirmed',       // Pago, aguardando início
      'in_progress',     // Passeio em andamento
      'completed',       // Passeio finalizado, pagamento liberado
      'canceled_by_user', // Cancelado pelo usuário
      'canceled_by_driver' // Cancelado pelo motorista
    ], 
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