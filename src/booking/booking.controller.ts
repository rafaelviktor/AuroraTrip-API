import { Controller, Get, Post, Body, UseGuards, Req, ForbiddenException, Patch, Param } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Request } from 'express';
import { JwtPayload } from 'src/auth/dto/jwt.interface';

@UseGuards(JwtAuthGuard)
@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  create(@Body() createBookingDto: CreateBookingDto, @Req() req: Request) {
    const user = req.user as JwtPayload;
    if (user.type !== 'user') {
        throw new ForbiddenException('Ação não permitida para este tipo de conta.');
    }
    return this.bookingService.create(createBookingDto, user.sub);
  }

  @Get()
  findMyBookings(@Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.bookingService.findForUser(user.sub);
  }

  @Patch(':id/cancel')
  cancelMyBooking(@Param('id') bookingId: string, @Req() req: Request) {
    const user = req.user as JwtPayload;
    if (user.type !== 'user') {
        throw new ForbiddenException('Ação não permitida para este tipo de conta.');
    }
    return this.bookingService.cancel(bookingId, user.sub);
  }
}