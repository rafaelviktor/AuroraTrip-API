import { Injectable, NotFoundException, BadRequestException, ForbiddenException, NotImplementedException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Booking } from 'src/schemas/Bookings/Booking.schema';
import { PackageTour } from 'src/schemas/PackageTours/PackageTour.schema';
import { CreateBookingDto } from './dto/create-booking.dto';
import { WalletService } from 'src/wallet/wallet.service';

@Injectable()
export class BookingService {
  constructor(
    @InjectModel(Booking.name) private readonly bookingModel: Model<Booking>,
    @InjectModel(PackageTour.name) private readonly packageTourModel: Model<PackageTour>,
    private readonly walletService: WalletService,
  ) {}

  async create(createDto: CreateBookingDto, userId: string): Promise<Booking> {
    // Validar o pacote de tour
    const packageTour = await this.packageTourModel.findById(createDto.packageTourId);
    if (!packageTour) {
      throw new NotFoundException('Pacote de tour não encontrado.');
    }
    if (packageTour.seatsAvailable < createDto.seats) {
      throw new BadRequestException('Não há assentos suficientes disponíveis.');
    }

    // Calcular o preço total
    const totalPrice = packageTour.price * createDto.seats;

    // Processar o pagamento via WalletService
    await this.walletService.executeBookingPayment(
      userId,
      packageTour.driver.toString(),
      totalPrice,
      { 
        packageTourId: packageTour._id,
        description: `Reserva de ${createDto.seats} assento(s) no tour "${packageTour.tourType}"`
      }
    );

    // Se o pagamento foi bem-sucedido, cria a reserva e atualiza o pacote
    const newBooking = new this.bookingModel({
      packageTour: packageTour._id,
      user: userId,
      driver: packageTour.driver,
      vehicle: packageTour.vehicle,
      seats: createDto.seats,
      totalPrice: totalPrice,
      status: 'confirmed',
      paymentDetails: { paidAt: new Date() }
    });

    // Atualizar os assentos disponíveis no pacote
    packageTour.seatsAvailable -= createDto.seats;
    await packageTour.save();

    return newBooking.save();
  }

  async findForUser(userId: string): Promise<Booking[]> {
    return this.bookingModel
      .find({ user: userId })
      .populate('packageTour', 'tourType departureTime')
      .populate('driver', 'name')
      .sort({ createdAt: -1 })
      .exec();
  }
  
  async cancel(bookingId: string, userId: string): Promise<Booking> {
    // Encontrar a reserva e validar
    const booking = await this.bookingModel.findById(bookingId);
    if (!booking) {
      throw new NotFoundException('Reserva não encontrada.');
    }

    // Verificar permissão: apenas o usuário que fez a reserva pode cancelar
    if (booking.user.toString() !== userId) {
      throw new ForbiddenException('Você não tem permissão para cancelar esta reserva.');
    }

    // Verificar o estado: não se pode cancelar uma reserva já cancelada ou completada
    if (['canceled_by_user', 'canceled_by_driver', 'completed'].includes(booking.status)) {
      throw new ConflictException(`Esta reserva não pode ser cancelada pois seu status é "${booking.status}".`);
    }

    // Processar o reembolso através do WalletService
    await this.walletService.executeRefund(
      booking.user.toString(),
      booking.driver.toString(),
      booking.totalPrice,
      {
        bookingId: booking._id,
        description: `Reembolso referente ao cancelamento da reserva #${booking.id.substring(0, 8)}`
      }
    );

    // Se o reembolso deu certo, atualizar o status da reserva
    booking.status = 'canceled_by_user';
    
    // Devolver os assentos ao pacote de tour
    await this.packageTourModel.updateOne(
      { _id: booking.packageTour },
      { $inc: { seatsAvailable: booking.seats } }
    );
    
    return booking.save();
  }
}