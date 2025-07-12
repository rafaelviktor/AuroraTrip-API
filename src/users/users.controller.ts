import { BadRequestException, Body, ConflictException, Controller, Delete, FileTypeValidator, ForbiddenException, Get, HttpCode, Logger, MaxFileSizeValidator, NotFoundException, Param, ParseFilePipe, Patch, Post, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { JwtAuthGuard } from "src/auth/guards/jwt.guard";
import { Request } from "express";
import { JwtPayload } from "src/auth/dto/jwt.interface";
import { RolesGuard } from "src/auth/guards/role.guard";
import { Roles } from "src/auth/decorators/roles.decorator";
import { EmailService } from "src/mailer/mailer.service";
import { VerifyMailDto } from "./dto/verify-mail.dto";
import { CheckVerificationDto } from "./dto/check-verification.dto";

@Controller('users')
export class UsersController {
    private readonly logger = new Logger(UsersController.name);
    constructor(private usersService: UsersService, private emailService: EmailService) { }

    @Post()
    async create(@Body() createUserDto: CreateUserDto) {
        await this.emailService.findVerificationCodeById(createUserDto.verificationCodeId, createUserDto.email);
        return this.usersService.create(createUserDto);
    }

    @Post('verify/send')
    @HttpCode(200)
    async sendVerificationCode(@Body() verifyMailDto: VerifyMailDto) {
        const user = await this.usersService.findOneEmail(verifyMailDto.email);

        if (user)
            throw new ConflictException('Já existe usuário cadastrado no e-mail informado.')

        await this.emailService.sendVerificationCode(verifyMailDto.email);
        return { message: 'Um código de verificação foi enviado para o seu e-mail.' };
    }

    @Post('verify/check')
    @HttpCode(200)
    async checkVerificationCode(@Body() checkVerificationDto: CheckVerificationDto) {
        const verificationCode = await this.emailService.findVerificationCode(checkVerificationDto)
        return verificationCode;
    }

    @Get()
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'moderator')
    findAll() {
        return this.usersService.findAll();
    }

    @Get('id/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin', 'moderator')
    async findOne(@Param('id') id: string) {
        return await this.usersService.findOneId(id);
    }

    @Get('email/:email')
    async findOneEmail(@Param('email') email: string) {
        const user = await this.usersService.findOneEmail(email);
        if (!user) {
            throw new NotFoundException("O usuário não foi encontrado.");
        }
        return { message: 'O usuário foi encontrado com sucesso.', username: user.username, name: user.name };
    }

    @Get('username/:username')
    async findOneUsername(@Param('username') username: string) {
        const user = await this.usersService.findOneUsername(username);
        if (!user) {
            throw new NotFoundException("Usuário não encontrado.");
        }
        return { message: 'O usuário foi encontrado com sucesso.', username: user.username, name: user.name };
    }

    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto, @Req() req: Request) {
        const user = req.user as JwtPayload;

        if (updateUserDto.password && updateUserDto.password.length < 6)
            throw new BadRequestException('A senha informada deve conter no mínimo 6 caracteres');

        if (id === user.sub) {
            return await this.usersService.update(id, updateUserDto);
        } else {
            throw new ForbiddenException('Você não tem permissão para modificar este usuário.');
        }
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    async remove(@Param('id') id: string, @Req() req: Request) {
        const user = req.user as JwtPayload;

        if (id === user.sub) {
            await this.usersService.remove(id);
            return { message: 'Usuário excluído com sucesso.' };
        } else {
            throw new ForbiddenException('Você não tem permissão para excluir este usuário.');
        }
    }
}