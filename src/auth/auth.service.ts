import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthPayloadDto } from './dto/auth.dto';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from "bcrypt";
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(private configService: ConfigService, private usersService: UsersService, private jwtService: JwtService) {}

    async validateUser({ username, password }: AuthPayloadDto) {
        let foundUser = await this.usersService.getUserByUsername(username);
        if (!foundUser) {
            foundUser =  await this.usersService.getUserByEmail(username);
            if (!foundUser)
                throw new UnauthorizedException('Usuário ou senha incorretos.');
        }

        const isPasswordValid = await bcrypt.compare(password, foundUser.password);
        if (!isPasswordValid) throw new UnauthorizedException('Usuário ou senha incorretos.');

        const payload = { sub: foundUser.id, username: foundUser.username, role: foundUser.role };

        const accessToken = this.jwtService.sign(payload);

        const refreshToken = this.jwtService.sign(payload, {
            expiresIn: '1y',
        });

        foundUser.refreshToken = refreshToken;
        await foundUser.save();

        return {
            access_token: accessToken,
            refresh_token: refreshToken,
        };
    }

    async refreshToken(refreshToken: string) {
        try {
            const payload = this.jwtService.verify(refreshToken, { secret: this.configService.get<string>('JWT_SECRET') });
            const user = await this.usersService.getUserById(payload.sub);
          
            if (!user || user.refreshToken !== refreshToken) {
              throw new BadRequestException("O refresh token está expirado ou inválido.");
            }
    
            const newPayload = { sub: user.id, username: user.username, role: user.role };
          
            // Gerar novo refresh token
            const newRefreshToken = this.jwtService.sign(newPayload, {
                expiresIn: '1y',
            });
    
            // Gerar novo access token
            const newAccessToken = this.jwtService.sign(newPayload);
    
            user.refreshToken = newRefreshToken;
            await user.save();
    
            return { access_token: newAccessToken, refresh_token: newRefreshToken };
        } catch (error) {
            throw new BadRequestException("O refresh token está expirado ou inválido.");
        }
      }
}
