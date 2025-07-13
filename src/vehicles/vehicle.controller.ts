import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, HttpCode } from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { JwtPayload } from 'src/auth/dto/jwt.interface';

@UseGuards(JwtAuthGuard) // Protege todas as rotas deste controller
@Controller('vehicles')
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Post()
  create(@Body() createVehicleDto: CreateVehicleDto, @Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.vehicleService.create(createVehicleDto, user.sub);
  }

  @Get()
  findAll(@Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.vehicleService.findAllByDriver(user.sub);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.vehicleService.findOne(id, user.sub);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateVehicleDto: UpdateVehicleDto, @Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.vehicleService.update(id, updateVehicleDto, user.sub);
  }

  @Delete(':id')
  @HttpCode(200)
  remove(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.vehicleService.remove(id, user.sub);
  }
}