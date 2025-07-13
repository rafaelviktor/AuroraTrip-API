import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, ConflictException, UseGuards, NotFoundException, BadRequestException, ForbiddenException, Req } from '@nestjs/common';
import { DriverService } from './driver.service';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { JwtPayload } from 'src/auth/dto/jwt.interface';
import { Request } from "express";

@Controller('drivers')
export class DriverController {
    constructor(private readonly driverService: DriverService) { }

    @Post()
    async create(@Body() createDriverDto: CreateDriverDto) {
        return this.driverService.create(createDriverDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'moderator')
    findAll() {
        return this.driverService.findAll();
    }

    @Get('id/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    async findOne(@Param('id') id: string) {
        return await this.driverService.findOneId(id);
    }

    @Get('email/:email')
    async findOneEmail(@Param('email') email: string) {
        const driver = await this.driverService.findOneEmail(email);
        if (!driver) {
            throw new NotFoundException("Motorista não encontrado.");
        }
        return { message: 'Motorista encontrado com sucesso.', username: driver.username, name: driver.name };
    }

    @Get('username/:username')
    async findOneUsername(@Param('username') username: string) {
        const driver = await this.driverService.findOneUsername(username);
        if (!driver) {
            throw new NotFoundException("Motorista não encontrado.");
        }
        return { message: 'Motorista encontrado com sucesso.', username: driver.username, name: driver.name };
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    async update(@Param('id') id: string, @Body() updateDriverDto: UpdateDriverDto, @Req() req: Request) {
        const driver = req.user as JwtPayload;

        if (updateDriverDto.password && updateDriverDto.password.length < 6)
            throw new BadRequestException('A senha informada deve conter no mínimo 6 caracteres');

        if (id === driver.sub) {
            return await this.driverService.update(id, updateDriverDto);
        } else {
            throw new ForbiddenException('Você não tem permissão para modificar este motorista.');
        }
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    async remove(@Param('id') id: string, @Req() req: Request) {
        const driver = req.user as JwtPayload;

        if (id === driver.sub) {
            await this.driverService.remove(id);
            return { message: 'Usuário excluído com sucesso.' };
        } else {
            throw new ForbiddenException('Você não tem permissão para excluir este motorista.');
        }
    }
}
