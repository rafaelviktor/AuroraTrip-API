import { Body, Controller, Get, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalGuard } from './guards/local.guard';
import { JwtAuthGuard } from './guards/jwt.guard';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('login')
    @HttpCode(200)
    @UseGuards(LocalGuard)
    login(@Req() req: Request) {
        return req.user;
    }

    @Post('refresh')
    @HttpCode(200)
    async refresh(@Body('refreshToken') refreshToken: string) {
        return await this.authService.refreshToken(refreshToken);
    }

    @Get('status')
    @UseGuards(JwtAuthGuard)
    status() {
        return { message: 'Usuário se encontra autenticado com sucesso.' };
    }
}
