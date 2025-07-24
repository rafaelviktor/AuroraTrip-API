import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthPayloadDto } from './dto/auth.dto';
import { UserService } from 'src/users/user.service';
import * as bcrypt from "bcrypt";
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { DriverService } from 'src/driver/driver.service';
import { User } from 'src/schemas/Users/User.schema';
import { Driver } from 'src/schemas/Drivers/Driver.schema';

type Account = User | Driver;

@Injectable()
export class AuthService {
    constructor(
        private configService: ConfigService, 
        private userService: UserService, 
        private driverService: DriverService, 
        private jwtService: JwtService
    ) {}

    async validateUser({ type, username, password }: AuthPayloadDto) {
        let foundAccount: Account | null;
        if (type === 'user') {
            foundAccount = await this.userService.findOneUsername(username) ?? await this.userService.findOneEmail(username);
        } else if (type === 'driver') {
            foundAccount = await this.driverService.findOneUsername(username) ?? await this.driverService.findOneEmail(username);
        } else {
            throw new BadRequestException('Tipo de usuário inválido.');
        }

        if (!foundAccount) {
            throw new UnauthorizedException('Usuário ou senha incorretos.');
        }
        
        const isPasswordValid = await bcrypt.compare(password, foundAccount.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Usuário ou senha incorretos.');
        }

        const payload = { 
            sub: foundAccount.id, 
            username: foundAccount.username, 
            role: foundAccount.role,
            type: type
        };

        const accessToken = this.jwtService.sign(payload);

        const refreshToken = this.jwtService.sign(payload, {
            expiresIn: '1y',
        });

        foundAccount.refreshToken = refreshToken;
        await foundAccount.save();

        return {
            access_token: accessToken,
            refresh_token: refreshToken,
            role: foundAccount.role,
        };
    }

    async refreshToken(refreshToken: string) {
        try {
            const payload = this.jwtService.verify(refreshToken, { secret: this.configService.get<string>('JWT_SECRET') });

            let account: Account;

            if (payload.type === 'user') {
                account = await this.userService.findOneId(payload.sub);
            } else if (payload.type === 'driver') {
                account = await this.driverService.findOneId(payload.sub);
            } else {
                throw new BadRequestException("O refresh token é inválido.");
            }

            if (!account || account.refreshToken !== refreshToken) {
                throw new BadRequestException("O refresh token está expirado ou inválido.");
            }
        
            const newPayload = { 
                sub: account.id, 
                username: account.username, 
                role: account.role,
                type: payload.type
            };
            
            const newRefreshToken = this.jwtService.sign(newPayload, {
                expiresIn: '1y',
            });
    
            const newAccessToken = this.jwtService.sign(newPayload);
    
            account.refreshToken = newRefreshToken;
            await account.save();
    
            return { access_token: newAccessToken, refresh_token: newRefreshToken };
        } catch (error) {
            throw new BadRequestException("O refresh token está expirado ou inválido.");
        }
    }
}