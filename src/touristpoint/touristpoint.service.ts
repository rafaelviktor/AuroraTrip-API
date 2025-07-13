import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TouristPoint, TouristPointDocument } from 'src/schemas/TouristPoints/TouristPoint.schema';
import { CreateTouristPointDto } from './dto/create-touristpoint.dto';
import { UpdateTouristPointDto } from './dto/update-touristpoint.dto';

@Injectable()
export class TouristPointService {
  constructor(
    @InjectModel(TouristPoint.name) private readonly touristPointModel: Model<TouristPointDocument>,
  ) {}

  async create(createDto: CreateTouristPointDto): Promise<TouristPoint> {
    const newTouristPoint = new this.touristPointModel(createDto);
    return newTouristPoint.save();
  }

  async findAll(): Promise<TouristPoint[]> {
    return this.touristPointModel.find().exec();
  }

  async findOne(id: string): Promise<TouristPoint> {
    const point = await this.touristPointModel.findById(id).exec();
    if (!point) {
      throw new NotFoundException(`Ponto turístico com ID "${id}" não encontrado.`);
    }
    return point;
  }

  async update(id: string, updateDto: UpdateTouristPointDto): Promise<TouristPoint> {
    const updatedPoint = await this.touristPointModel.findByIdAndUpdate(id, updateDto, { new: true });
    if (!updatedPoint) {
      throw new NotFoundException(`Ponto turístico com ID "${id}" não encontrado.`);
    }
    return updatedPoint;
  }

  async remove(id: string): Promise<{ message: string }> {
    const result = await this.touristPointModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException(`Ponto turístico com ID "${id}" não encontrado.`);
    }
    return { message: 'Ponto turístico deletado com sucesso.' };
  }
}