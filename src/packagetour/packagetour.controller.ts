import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, HttpCode, Query } from '@nestjs/common';
import { PackageTourService } from './packagetour.service';
import { CreatePackageTourDto } from './dto/create-packagetour.dto';
import { UpdatePackageTourDto } from './dto/update-packagetour.dto';
import { Request } from 'express';
import { JwtPayload } from 'src/auth/dto/jwt.interface';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { FilterPackageTourDto } from './dto/filter-packagetour.dto';

@Controller('package-tours')
export class PackageTourController {
  constructor(private readonly packageTourService: PackageTourService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('driver')
  @Post()
  create(@Body() createPackageTourDto: CreatePackageTourDto, @Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.packageTourService.create(createPackageTourDto, user.sub);
  }

  @Get()
  findAll(@Query() filters: FilterPackageTourDto) {
    return this.packageTourService.findAll(filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.packageTourService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'moderator', 'driver')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePackageTourDto: UpdatePackageTourDto, @Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.packageTourService.update(id, updatePackageTourDto, user.sub);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'moderator', 'driver')
  @Delete(':id')
  @HttpCode(200)
  remove(@Param('id') id: string, @Req() req: Request) {
    const user = req.user as JwtPayload;
    return this.packageTourService.remove(id, user.sub);
  }
}