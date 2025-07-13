import { MiddlewareConsumer, Module } from '@nestjs/common';
import { DriverService } from './driver.service';
import { DriverController } from './driver.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Driver, DriverSchema } from 'src/schemas/Drivers/Driver.schema';
import { ValidateObjectIdMiddleware } from 'src/middlewares/validate-object-id.middleware';

@Module({
  imports: [
  MongooseModule.forFeature([
      {
          name: Driver.name,
          schema: DriverSchema,
      }
  ])
  ],
  controllers: [DriverController],
  providers: [DriverService],
  exports: [DriverService]
})
export class DriverModule {
  configure(consumer: MiddlewareConsumer) {
      consumer
          .apply(ValidateObjectIdMiddleware)
          .forRoutes('users/id/:id');
  }
}
