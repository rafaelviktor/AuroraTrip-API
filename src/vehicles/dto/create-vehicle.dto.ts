import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const CreateVehicleSchema = z.object({
  type: z.enum(['buggy', 'lancha', '4x4'], {
    errorMap: () => ({ message: "O tipo do veículo deve ser 'buggy', 'lancha' ou '4x4'." })
  }),
  vehicleModel: z.string({
    required_error: "O modelo do veículo é obrigatório."
  }).min(2, { message: "O modelo do veículo deve ter pelo menos 2 caracteres." }),
  capacity: z.number({
    required_error: "A capacidade de passageiros é obrigatória."
  }).int().positive({ message: "A capacidade deve ser um número inteiro positivo." }),
});

export class CreateVehicleDto extends createZodDto(CreateVehicleSchema) {}