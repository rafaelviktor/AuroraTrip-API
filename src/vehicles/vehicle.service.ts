import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Vehicle } from 'src/schemas/Vehicles/Vehicle.schema';
import { Driver } from 'src/schemas/Drivers/Driver.schema';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Injectable()
export class VehicleService {
  constructor(
    @InjectModel(Vehicle.name) private readonly vehicleModel: Model<Vehicle>,
    @InjectModel(Driver.name) private readonly driverModel: Model<Driver>,
  ) {}

  async create(createVehicleDto: CreateVehicleDto, driverId: string): Promise<Vehicle> {
    // Verifica se o motorista que está criando o veículo realmente existe
    const driver = await this.driverModel.findById(driverId);
    if (!driver) {
      throw new NotFoundException(`Motorista com ID "${driverId}" não encontrado.`);
    }

    // Cria a nova instância do veículo associando o ID do motorista
    const newVehicle = new this.vehicleModel({
      ...createVehicleDto,
      driver: new Types.ObjectId(driverId),
    });

    const savedVehicle = await newVehicle.save();

    // Adiciona o ID do novo veículo ao array de veículos do motorista
    await this.driverModel.findByIdAndUpdate(driverId, {
      $push: { vehicles: savedVehicle._id },
    });

    return savedVehicle;
  }

  // Busca todos os veículos de um motorista específico
  async findAllByDriver(driverId: string): Promise<Vehicle[]> {
    return this.vehicleModel.find({ driver: new Types.ObjectId(driverId) }).exec();
  }

  // Busca um veículo específico, garantindo que ele pertença ao motorista logado
  async findOne(id: string, driverId: string): Promise<Vehicle> {
    const vehicle = await this.vehicleModel.findOne({ _id: new Types.ObjectId(id), driver: new Types.ObjectId(driverId) }).exec();
    if (!vehicle) {
      throw new NotFoundException(`Veículo com ID "${id}" não encontrado ou não pertence a este motorista.`);
    }
    return vehicle;
  }

  async update(id: string, updateVehicleDto: UpdateVehicleDto, driverId: string): Promise<Vehicle | null> {
    await this.findOne(id, driverId);

    const updatedVehicle = await this.vehicleModel.findByIdAndUpdate(id, updateVehicleDto, { new: true });
    return updatedVehicle;
  }

  async remove(id: string, driverId: string): Promise<{ message: string }> {
    // Garante que o veículo existe e pertence ao motorista antes de deletar
    const vehicleToDelete = await this.findOne(id, driverId);

    // Remove a referência do veículo do array de veículos do motorista
    await this.driverModel.findByIdAndUpdate(driverId, {
      $pull: { vehicles: vehicleToDelete._id },
    });

    // Deleta o veículo
    await this.vehicleModel.findByIdAndDelete(id);

    return { message: 'Veículo deletado com sucesso.' };
  }
}