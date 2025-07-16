import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PackageTour, PackageTourDocument } from 'src/schemas/PackageTours/PackageTour.schema';
import { Driver } from 'src/schemas/Drivers/Driver.schema';
import { Vehicle } from 'src/schemas/Vehicles/Vehicle.schema';
import { CreatePackageTourDto } from './dto/create-packagetour.dto';
import { UpdatePackageTourDto } from './dto/update-packagetour.dto';
import { User } from 'src/schemas/Users/User.schema';
import { FilterPackageTourDto } from './dto/filter-packagetour.dto';
import { TouristPoint } from 'src/schemas/TouristPoints/TouristPoint.schema';

@Injectable()
export class PackageTourService {
  constructor(
    @InjectModel(PackageTour.name) private readonly packageTourModel: Model<PackageTourDocument>,
    @InjectModel(Vehicle.name) private readonly vehicleModel: Model<Vehicle>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(TouristPoint.name) private readonly touristPointModel: Model<TouristPoint>,
  ) {}

  async create(createDto: CreatePackageTourDto, driverId: string): Promise<PackageTour> {
    // 1. Valida se o veículo existe e pertence ao motorista
    const vehicle = await this.vehicleModel.findOne({ _id: createDto.vehicle, driver: driverId });
    if (!vehicle) {
      throw new NotFoundException(`Veículo com ID "${createDto.vehicle}" não encontrado ou não pertence a este motorista.`);
    }

    // 2. Define a quantidade de assentos disponíveis com base na capacidade do veículo
    const seatsAvailable = vehicle.capacity;

    // 3. Cria o novo pacote de tour
    const newPackage = new this.packageTourModel({
      ...createDto,
      driver: driverId,
      seatsAvailable: seatsAvailable,
    });

    return newPackage.save();
  }

  async findAll(filters: FilterPackageTourDto): Promise<PackageTour[]> {
    const { origin, destination, transportType } = filters;
    const queryFilter: any = {};

    // Filtros da query
    if (transportType) {
      // 1. Encontra os motoristas que têm o tipo de transporte desejado
      const drivers = await this.vehicleModel.find({ transportType: transportType }).select('_id');
      // 2. Extrai apenas os IDs
      const driverIds = drivers.map(driver => driver._id);
      
      // 3. Adiciona ao filtro principal: busca pacotes cujo motorista esteja na lista de IDs encontrada
      if (driverIds.length > 0) {
        queryFilter.driver = { $in: driverIds };
      } else {
        // Se nenhum motorista for encontrado com esse tipo de transporte, retorna uma lista vazia.
        return [];
      }
    }

    // Encontra os pontos turísticos pelo nome
    if (origin) {
      const originPoint = await this.touristPointModel.findOne({ name: { $regex: new RegExp(`^${origin}$`, 'i') } });
      // Se encontrar, usa o ID dele no filtro
      if (originPoint) {
        queryFilter.origin = originPoint._id;
      } else {
        return [];
      }
    }

    if (destination) {
      const destinationPoint = await this.touristPointModel.findOne({ name: { $regex: new RegExp(`^${destination}$`, 'i') } });
      if (destinationPoint) {
        queryFilter.destination = destinationPoint._id;
      } else {
        return [];
      }
    }

    // Popula os campos para retornar dados úteis em vez de apenas IDs
    return this.packageTourModel
      .find(queryFilter) // Aplica o objeto de filtro dinâmico
      .populate('driver', 'name transportType')
      .populate('vehicle', 'vehicleModel capacity')
      .populate('origin', 'name city state')
      .populate('destination', 'name city state')
      .exec();
  }

  async findOne(id: string): Promise<PackageTour> {
    const tourPackage = await this.packageTourModel
      .findById(id)
      .populate('driver', 'name transportType')
      .populate('vehicle', 'vehicleModel capacity')
      .populate('origin', 'name city state')
      .populate('destination', 'name city state')
      .exec();

    if (!tourPackage) {
      throw new NotFoundException(`Pacote de tour com ID "${id}" não encontrado.`);
    }
    return tourPackage;
  }
  
  async update(id: string, updateDto: UpdatePackageTourDto, requesterId: string): Promise<PackageTour | null> {
    const tourPackage = await this.packageTourModel.findById(id);

    if (!tourPackage) {
      throw new NotFoundException(`Pacote de tour com ID "${id}" não encontrado.`);
    }

    const isOwner = tourPackage.driver.toString() === requesterId;

    if (!isOwner) {
      // Se não for o dono do pacote, verifica se é algum administrador ou moderador tentando alterar
      const adminOrModerator = await this.userModel.findOne({ 
        _id: requesterId, 
        role: { $in: ['admin', 'moderator'] }
      });

      // Se não for o dono e também não for um admin/moderador, bloqueia o acesso
      if (!adminOrModerator) {
        throw new ForbiddenException('Você não tem permissão para editar este pacote.');
      }
    }

    const updatedPackage = await this.packageTourModel.findByIdAndUpdate(id, updateDto, { new: true });
    return updatedPackage;
  }

  async remove(id: string, requesterId: string): Promise<{ message: string }> {
    const tourPackage = await this.packageTourModel.findById(id);

    if (!tourPackage) {
      throw new NotFoundException(`Pacote de tour com ID "${id}" não encontrado.`);
    }

    const isOwner = tourPackage.driver.toString() === requesterId;

    if (!isOwner) {
      // Se não for o dono do pacote, verifica se é algum administrador ou moderador tentando alterar
      const adminOrModerator = await this.userModel.findOne({ 
        _id: requesterId, 
        role: { $in: ['admin', 'moderator'] }
      });

      // Se não for o dono e também não for um admin/moderador, bloqueia o acesso
      if (!adminOrModerator) {
        throw new ForbiddenException('Você não tem permissão para editar este pacote.');
      }
    }

    await this.packageTourModel.findByIdAndDelete(id);
    return { message: 'Pacote de tour deletado com sucesso.' };
  }
}