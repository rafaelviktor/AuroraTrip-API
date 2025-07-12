import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import mongoose, { Model } from 'mongoose';
import { MailerService } from '@nestjs-modules/mailer';
import { randomInt } from 'crypto';
import { InjectModel } from '@nestjs/mongoose';
import { VerificationCode } from 'src/schemas/VerificationCodes/VerificationCode.schema';
import { CheckVerificationDto } from 'src/users/dto/check-verification.dto';

@Injectable()
export class EmailService {
  constructor(@InjectModel(VerificationCode.name) private verificationCode: Model<VerificationCode>, private readonly mailerService: MailerService) {}

  private calculateMinutesDiff(date: Date): number {
    const now = new Date().getTime();
    return (now - date.getTime()) / (1000 * 60);
  }

  async sendVerificationCode(email: string) {
    const existingCode = await this.verificationCode
    .findOne({ email })
    .sort({ createdAt: -1 });

    if (existingCode && this.calculateMinutesDiff(existingCode.createdAt) < 2) {
      throw new BadRequestException('Aguarde um pouco antes de solicitar um novo código.');
    }

    const code = randomInt(1000, 9999).toString();

    const newVerificationCode = new this.verificationCode({
      email,
      code
    })
    newVerificationCode.save()

    await this.mailerService.sendMail({
      to: email,
      subject: 'Código de Verificação',
      template: 'verification-code',
      context: {
        code,
      },
    });
  }

  async findVerificationCode(checkVerificationDto: CheckVerificationDto) {
    const verificationCode = await this.verificationCode.findOne({ ...checkVerificationDto });

    if (!verificationCode)
      throw new NotFoundException('Código de verificação inválido.')
  
    if (this.calculateMinutesDiff(verificationCode.createdAt) > 10) { // Maior que 10 minutos
      throw new BadRequestException('O código de verificação já expirou, solicite um novo.');
    }

    return verificationCode;
  }

  async findVerificationCodeById(id: string, email: string) {
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new BadRequestException('O identificador do código de validação é inválido')

    const verificationCode = await this.verificationCode.findById(id);
    if (!verificationCode)
      throw new NotFoundException('Código de verificação de e-mail inválido')

    if (verificationCode.email != email)
      throw new BadRequestException('O e-mail informado na validação é diferente do e-mail a ser cadastrado')

    await verificationCode.deleteOne()
  }
}