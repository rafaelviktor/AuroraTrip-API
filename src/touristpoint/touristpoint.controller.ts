import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, UseGuards } from '@nestjs/common';
import { TouristPointService } from './touristpoint.service';
import { CreateTouristPointDto } from './dto/create-touristpoint.dto';
import { UpdateTouristPointDto } from './dto/update-touristpoint.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';

@Controller('tourist-points')
export class TouristPointController {
  constructor(private readonly touristPointService: TouristPointService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'moderator')
  create(@Body() createTouristPointDto: CreateTouristPointDto) {
    return this.touristPointService.create(createTouristPointDto);
  }

  @Get()
  findAll() {
    return this.touristPointService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.touristPointService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'moderator')
  update(@Param('id') id: string, @Body() updateTouristPointDto: UpdateTouristPointDto) {
    return this.touristPointService.update(id, updateTouristPointDto);
  }

  @Delete(':id')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'moderator')
  remove(@Param('id') id: string) {
    return this.touristPointService.remove(id);
  }
}