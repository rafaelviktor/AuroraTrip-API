import { Module } from '@nestjs/common';
import { PackageTourService } from './packagetour.service';
import { PackageTourController } from './packagetour.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PackageTour, PackageTourSchema } from 'src/schemas/PackageTours/PackageTour.schema';
import { Vehicle, VehicleSchema } from 'src/schemas/Vehicles/Vehicle.schema';
import { User, UserSchema } from 'src/schemas/Users/User.schema';
import { TouristPoint, TouristPointSchema } from 'src/schemas/TouristPoints/TouristPoint.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PackageTour.name, schema: PackageTourSchema },
      { name: User.name, schema: UserSchema },
      { name: Vehicle.name, schema: VehicleSchema },
      { name: TouristPoint.name, schema: TouristPointSchema },
    ]),
  ],
  controllers: [PackageTourController],
  providers: [PackageTourService],
})
export class PackageTourModule {}