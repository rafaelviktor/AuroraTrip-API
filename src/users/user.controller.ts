import { BadRequestException, Body, ConflictException, Controller, Delete, ForbiddenException, Get, HttpCode, NotFoundException, Param, Patch, Post, Req, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { JwtAuthGuard } from "src/auth/guards/jwt.guard";
import { Request } from "express";
import { JwtPayload } from "src/auth/dto/jwt.interface";
import { RolesGuard } from "src/auth/guards/role.guard";
import { Roles } from "src/auth/decorators/roles.decorator";

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Post()
    async create(@Body() createUserDto: CreateUserDto) {
        return this.userService.create(createUserDto);
    }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'moderator')
    findAll() {
        return this.userService.findAll();
    }

    @Get('my-profile')
    @UseGuards(JwtAuthGuard, RolesGuard)
    async findMyProfile(@Req() req: Request) {
        const user = req.user as JwtPayload;
        return await this.userService.findOneId(user.sub);
    }

    @Get('id/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    async findOne(@Param('id') id: string) {
        return await this.userService.findOneId(id);
    }

    @Get('email/:email')
    async findOneEmail(@Param('email') email: string) {
        const user = await this.userService.findOneEmail(email);
        if (!user) {
            throw new NotFoundException("Usuário não encontrado.");
        }
        return { message: 'Usuário encontrado com sucesso.', username: user.username, name: user.name };
    }

    @Get('username/:username')
    async findOneUsername(@Param('username') username: string) {
        const user = await this.userService.findOneUsername(username);
        if (!user) {
            throw new NotFoundException("Usuário não encontrado.");
        }
        return { message: 'Usuário encontrado com sucesso.', username: user.username, name: user.name };
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Req() req: Request) {
        const user = req.user as JwtPayload;

        if (updateUserDto.password && updateUserDto.password.length < 6)
            throw new BadRequestException('A senha informada deve conter no mínimo 6 caracteres');

        if (id === user.sub) {
            return await this.userService.update(id, updateUserDto);
        } else {
            throw new ForbiddenException('Você não tem permissão para modificar este usuário.');
        }
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    async remove(@Param('id') id: string, @Req() req: Request) {
        const user = req.user as JwtPayload;

        if (id === user.sub) {
            await this.userService.remove(id);
            return { message: 'Usuário excluído com sucesso.' };
        } else {
            throw new ForbiddenException('Você não tem permissão para excluir este usuário.');
        }
    }
}