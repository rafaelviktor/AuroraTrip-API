import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateDriverDto } from './dto/create-driver.dto';
import { UpdateDriverDto } from './dto/update-driver.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from "mongoose";
import { Driver } from 'src/schemas/Drivers/Driver.schema';
import * as bcrypt from "bcrypt";

@Injectable()
export class DriverService {
  constructor(@InjectModel(Driver.name) private driverModel: Model<Driver>) {}

  async create(createDriverDto: CreateDriverDto): Promise<Driver> {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(createDriverDto.password, saltRounds);

      const newDriver = new this.driverModel({
          ...createDriverDto,
          password: hashedPassword,
      });
      return newDriver.save();
  }

  findAll(): Promise<Driver[]> {
      return this.driverModel.find();
  }

  async findOneUsername(username: string): Promise<Driver | null> {
      return await this.driverModel.findOne({ username });
  }

  async findOneEmail(email: string): Promise<Driver | null> {
      return await this.driverModel.findOne({ email });
  }      
  
  async findOneId(id: string): Promise<Driver> {
      const user = await this.driverModel.findById(id).populate('vehicles');;
      if (!user) {
          throw new NotFoundException("Motorista não encontrado.");
      }
      return user;
  }

  async update(id: string, updateDriverDto: UpdateDriverDto): Promise<Driver | null> {
      const user = await this.driverModel.findById(id);
      if (!user) {
          throw new NotFoundException('Motorista não encontrado.');
      }

      // Se a atualização envolver a senha
      if (updateDriverDto.currentPassword && updateDriverDto.password) {
          // Verifica se a senha anterior está correta
          const isPasswordValid = await bcrypt.compare(updateDriverDto.currentPassword, user.password);
          if (!isPasswordValid) {
              throw new BadRequestException('Senha anterior inválida.');
          }

          // Criptografa a nova senha
          const saltRounds = 10;
          const hashedNewPassword = await bcrypt.hash(updateDriverDto.password, saltRounds);

          // Adiciona a nova senha criptografada aos dados a serem atualizados
          updateDriverDto.password = hashedNewPassword;
      }

      // Atualiza apenas os dados permitidos (name, phone, password, transportType)
      const updateData = {
          ...(updateDriverDto.name && { name: updateDriverDto.name }),
          ...(updateDriverDto.phone && { phone: updateDriverDto.phone }),
          ...(updateDriverDto.password && { password: updateDriverDto.password }),
          ...(updateDriverDto.transportType && { transportType: updateDriverDto.transportType }),
      };

      // Realiza a atualização
      const updatedDriver = await this.driverModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
      
      return updatedDriver;
  }

  async remove (id: string): Promise<void> {
      const user = await this.driverModel.findByIdAndDelete(id);
      if (!user) {
          throw new NotFoundException("Motorista não encontrado.");
        }
  }
}
