import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User } from "src/schemas/Users/User.schema";
import { CreateUserDto } from "./dto/create-user.dto";
import * as bcrypt from "bcrypt";
import { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<User>) {}

    async create(createUserDto: CreateUserDto): Promise<User> {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);

        const newUser = new this.userModel({
            ...createUserDto,
            password: hashedPassword,
        });
        return newUser.save();
    }

    findAll(): Promise<User[]> {
        return this.userModel.find();
    }

    async findOneUsername(username: string): Promise<User | null> {
        return await this.userModel.findOne({ username });
    }

    async findOneEmail(email: string): Promise<User | null> {
        return await this.userModel.findOne({ email });
    }      
    
    async findOneId(id: string): Promise<User> {
        const user = await this.userModel.findById(id);
        if (!user) {
            throw new NotFoundException("Usuário não encontrado.");
        }
        return user;
    }

    async update(id: string, updateUserDto: UpdateUserDto): Promise<User | null> {
        const user = await this.userModel.findById(id);
        if (!user) {
            throw new NotFoundException('Usuário não encontrado.');
        }

        // Se a atualização envolver a senha
        if (updateUserDto.currentPassword && updateUserDto.password) {
            // Verifica se a senha anterior está correta
            const isPasswordValid = await bcrypt.compare(updateUserDto.currentPassword, user.password);
            if (!isPasswordValid) {
                throw new BadRequestException('Senha anterior inválida.');
            }

            // Criptografa a nova senha
            const saltRounds = 10;
            const hashedNewPassword = await bcrypt.hash(updateUserDto.password, saltRounds);

            // Adiciona a nova senha criptografada aos dados a serem atualizados
            updateUserDto.password = hashedNewPassword;
        }

        // Atualiza apenas os dados permitidos (displayName, avatarUrl, password)
        const updateData = {
            ...(updateUserDto.displayName && { displayName: updateUserDto.displayName }),
            ...(updateUserDto.password && { password: updateUserDto.password }) // Atualiza a senha se ela for modificada
        };

        // Realiza a atualização
        const updatedUser = await this.userModel.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
        
        return updatedUser;
    }

    async remove (id: string): Promise<void> {
        const user = await this.userModel.findByIdAndDelete(id);
        if (!user) {
            throw new NotFoundException("Usuário não encontrado.");
          }
    }
}