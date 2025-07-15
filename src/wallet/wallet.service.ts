import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel, InjectConnection } from '@nestjs/mongoose';
import { Connection, Model, Types } from 'mongoose';
import { OnEvent } from '@nestjs/event-emitter';
import { Wallet } from 'src/schemas/Wallets/Wallet.schema';
import { User } from 'src/schemas/Users/User.schema';
import { Driver } from 'src/schemas/Drivers/Driver.schema';
import { Transaction } from 'src/schemas/Transactions/Transaction.schema';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    @InjectModel(Wallet.name) private readonly walletModel: Model<Wallet>,
    @InjectModel(Transaction.name) private readonly transactionModel: Model<Transaction>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  @OnEvent('user.created')
  async handleUserCreated(user: User) {
    this.logger.log(`Evento 'user.created' recebido para o usuário: ${user.email}`);
    try {
      const newWallet = new this.walletModel({
        owner: user._id,
        ownerType: 'User',
        balance: 0, // Saldo inicial
      });
      await newWallet.save();
      this.logger.log(`Wallet criada com sucesso para o usuário ${user._id}`);
    } catch (error) {
      this.logger.error(`Falha ao criar wallet para o usuário ${user._id}`, error.stack);
    }
  }

  @OnEvent('driver.created')
  async handleDriverCreated(driver: Driver) {
    this.logger.log(`Evento 'driver.created' recebido para o motorista: ${driver.email}`);
    try {
      const newWallet = new this.walletModel({
        owner: driver._id,
        ownerType: 'Driver',
        balance: 0, // Saldo inicial
      });
      await newWallet.save();
      this.logger.log(`Wallet criada com sucesso para o motorista ${driver._id}`);
    } catch (error) {
      this.logger.error(`Falha ao criar wallet para o motorista ${driver._id}`, error.stack);
    }
  }

  async findForOwner(ownerId: string, ownerType: 'User' | 'Driver'): Promise<Wallet> {
    const wallet = await this.walletModel.findOne({ owner: new Types.ObjectId(ownerId), ownerType: ownerType });
    if (!wallet) {
      throw new NotFoundException(`Carteira não encontrada para este ${ownerType}.`);
    }
    return wallet;
  }

  async getTransactionsForOwner(ownerId: string, ownerType: 'User' | 'Driver', page: number, limit: number) {
    const wallet = await this.findForOwner(ownerId, ownerType);
    
    const transactions = await this.transactionModel
      .find({ walletId: wallet._id })
      .sort({ createdAt: -1 }) // Ordena das mais recentes para as mais antigas
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    const total = await this.transactionModel.countDocuments({ walletId: wallet._id });

    return {
      data: transactions,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalTransactions: total,
    };
  }

  async deposit(ownerId: string, ownerType: 'User' | 'Driver', amount: number): Promise<Wallet | null> {
    const wallet = await this.findForOwner(ownerId, ownerType);

    // Cria o registro da transação
    await this.transactionModel.create({
      walletId: wallet._id,
      amount: amount,
      type: 'deposit',
      status: 'completed',
      metadata: { description: 'Depósito na plataforma' }
    });

    // Atualiza o saldo da carteira de forma atômica
    return this.walletModel.findByIdAndUpdate(
      wallet._id,
      { $inc: { balance: amount } },
      { new: true }
    );
  }

  async executeBookingPayment(
    userId: string, 
    driverId: string, 
    totalPrice: number,
    metadata: object
  ): Promise<void> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      // Encontrar as carteiras do usuário e do motorista
      const userWallet = await this.walletModel.findOne({ owner: new Types.ObjectId(userId), ownerType: 'User' }).session(session);
      if (!userWallet || userWallet.balance < totalPrice) {
        throw new BadRequestException('Saldo insuficiente.');
      }

      const driverWallet = await this.walletModel.findOne({ owner: new Types.ObjectId(driverId), ownerType: 'Driver' }).session(session);
      if (!driverWallet) {
        throw new NotFoundException('Carteira do motorista não encontrada.');
      }

      // Debitar da carteira do usuário
      await this.walletModel.updateOne(
        { _id: userWallet._id },
        { $inc: { balance: -totalPrice } },
        { session }
      );
      await this.transactionModel.create([{
        walletId: userWallet._id,
        amount: -totalPrice,
        type: 'booking_payment',
        metadata: metadata,
      }], { session });

      // Creditar na carteira do motorista
      await this.walletModel.updateOne(
        { _id: driverWallet._id },
        { $inc: { balance: totalPrice } },
        { session }
      );
      await this.transactionModel.create([{
        walletId: driverWallet._id,
        amount: totalPrice,
        type: 'tour_payout',
        metadata: metadata,
      }], { session });

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async executeRefund(
    userId: string,
    driverId: string,
    refundAmount: number,
    metadata: object
  ): Promise<void> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      // Encontrar as carteiras
      const driverWallet = await this.walletModel.findOne({ owner: new Types.ObjectId(driverId), ownerType: 'Driver' }).session(session);
      if (!driverWallet) {
        throw new NotFoundException('Carteira do motorista não encontrada.');
      }

      const userWallet = await this.walletModel.findOne({ owner: new Types.ObjectId(userId), ownerType: 'User' }).session(session);
      if (!userWallet) {
        throw new NotFoundException('Carteira do usuário não encontrada.');
      }

      // Debitar da carteira do motorista
      await this.walletModel.updateOne(
        { _id: driverWallet._id },
        { $inc: { balance: -refundAmount } },
        { session }
      );
      await this.transactionModel.create([{
        walletId: driverWallet._id,
        amount: -refundAmount,
        type: 'refund',
        metadata: metadata,
      }], { session });

      // Creditar de volta na carteira do usuário
      await this.walletModel.updateOne(
        { _id: userWallet._id },
        { $inc: { balance: refundAmount } },
        { session }
      );
      await this.transactionModel.create([{
        walletId: userWallet._id,
        amount: refundAmount,
        type: 'refund',
        metadata: metadata,
      }], { session });

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}