import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const UpdateVehicleSchema = z.object({
  type: z.enum(['buggy', 'lancha', '4x4'], {
    errorMap: () => ({ message: "O tipo do veículo deve ser 'buggy', 'lancha' ou '4x4'." })
  }).optional(),
  vehicleModel: z.string().min(2, { message: "O modelo do veículo deve ter pelo menos 2 caracteres." }).optional(),
  capacity: z.number().int().positive({ message: "A capacidade deve ser um número inteiro positivo." }).optional(),
});

export class UpdateVehicleDto extends createZodDto(UpdateVehicleSchema) {}