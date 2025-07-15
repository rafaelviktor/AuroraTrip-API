import { Controller, Get, Post, Body, UseGuards, Req, Query, ParseIntPipe, DefaultValuePipe, BadRequestException } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { DepositDto } from './dto/deposit.dto';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { JwtPayload } from 'src/auth/dto/jwt.interface';

@UseGuards(JwtAuthGuard) // Protege todas as rotas
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  private getOwnerType(roleOrType: string): 'User' | 'Driver' {
    if (roleOrType === 'user') return 'User';
    if (roleOrType === 'driver') return 'Driver';
    throw new BadRequestException('Tipo de usuário inválido no token.');
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getMyWallet(@Req() req: Request) {
    const user = req.user as JwtPayload;
    const ownerType = this.getOwnerType(user.type || user.role); 
    return this.walletService.findForOwner(user.sub, ownerType);
  }

  @Get('transactions')
  @UseGuards(JwtAuthGuard)
  async getMyTransactions(
    @Req() req: Request,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const user = req.user as JwtPayload;
    const ownerType = this.getOwnerType(user.type || user.role);
    return this.walletService.getTransactionsForOwner(user.sub, ownerType, page, limit);
  }
  
  @Post('deposit')
  @UseGuards(JwtAuthGuard)
  async depositFunds(@Req() req: Request, @Body() depositDto: DepositDto) {
    const user = req.user as JwtPayload;
    const ownerType = this.getOwnerType(user.type || user.role);
    return this.walletService.deposit(user.sub, ownerType, depositDto.amount);
  }
}