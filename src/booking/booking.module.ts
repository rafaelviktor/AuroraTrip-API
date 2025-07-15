import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { Booking, BookingSchema } from 'src/schemas/Bookings/Booking.schema';
import { PackageTour, PackageTourSchema } from 'src/schemas/PackageTours/PackageTour.schema';
import { WalletModule } from 'src/wallet/wallet.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Booking.name, schema: BookingSchema },
      { name: PackageTour.name, schema: PackageTourSchema },
    ]),
    WalletModule,
  ],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}