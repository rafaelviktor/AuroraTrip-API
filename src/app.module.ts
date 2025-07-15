import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './users/user.module';
import { AuthModule } from './auth/auth.module';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { DriverModule } from './driver/driver.module';
import { VehicleModule } from './vehicles/vehicle.module';
import { TouristPointModule } from './touristpoint/touristpoint.module';
import { PackageTourModule } from './packagetour/packagetour.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { WalletModule } from './wallet/wallet.module';
import { BookingModule } from './booking/booking.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
    }),
    AuthModule,
    UserModule,
    DriverModule,
    VehicleModule,
    TouristPointModule,
    PackageTourModule,
    WalletModule,
    BookingModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
