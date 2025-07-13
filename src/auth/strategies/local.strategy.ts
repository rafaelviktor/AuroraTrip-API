import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from 'passport-local';
import { AuthService } from "../auth.service";
import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { Request } from 'express';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService) {
        super({
            passReqToCallback: true,
        });
    }

    async validate(req: Request): Promise<any> {
        const { type, username, password } = req.body;

        if (!type || !username || !password) {
            throw new BadRequestException('Requisição inválida. Os campos "type", "username" e "password" são obrigatórios.');
        }

        const user = this.authService.validateUser({ type, username, password });
        if (!user) throw new UnauthorizedException('Usuário ou senha incorretos.');
        return user;
    }
}