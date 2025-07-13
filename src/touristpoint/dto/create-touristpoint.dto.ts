import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const CreateTouristPointSchema = z.object({
  name: z.string({
    required_error: "O nome do ponto turístico é obrigatório."
  }).min(3, { message: "O nome deve ter pelo menos 3 caracteres." }),
  
  city: z.string({
    required_error: "A cidade é obrigatória."
  }),
  
  state: z.string({
    required_error: "O estado (UF) é obrigatório."
  }).length(2, { message: "O estado deve ser a sigla de 2 letras (UF)." }),

  latitude: z.number().optional(),
  
  longitude: z.number().optional(),
});

export class CreateTouristPointDto extends createZodDto(CreateTouristPointSchema) {}