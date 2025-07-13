import { Module } from '@nestjs/common';
import { TouristPointService } from './touristpoint.service';
import { TouristPointController } from './touristpoint.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { TouristPoint, TouristPointSchema } from 'src/schemas/TouristPoints/TouristPoint.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TouristPoint.name, schema: TouristPointSchema },
    ]),
  ],
  controllers: [TouristPointController],
  providers: [TouristPointService],
})
export class TouristPointModule {}