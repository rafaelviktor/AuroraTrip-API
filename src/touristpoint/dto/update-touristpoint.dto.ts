import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const UpdateTouristPointSchema = z.object({
  name: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres." }).optional(),
  city: z.string().optional(),
  state: z.string().length(2, { message: "O estado deve ser a sigla de 2 letras (UF)." }).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export class UpdateTouristPointDto extends createZodDto(UpdateTouristPointSchema) {}