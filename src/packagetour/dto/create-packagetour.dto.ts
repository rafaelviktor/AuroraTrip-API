import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const CreatePackageTourSchema = z.object({
  vehicle: z.string().nonempty("O ID do veículo é obrigatório."),
  origin: z.string().nonempty("O ID do ponto de origem é obrigatório."),
  destination: z.string().nonempty("O ID do ponto de destino é obrigatório."),
  
  departureTime: z.coerce.date({
    errorMap: () => ({ message: "A data e hora de partida devem ser válidas." })
  }),
  
  returnTime: z.coerce.date({
    errorMap: () => ({ message: "A data e hora de retorno devem ser válidas." })
  }),
  
  price: z.number({
    required_error: "O preço é obrigatório."
  }).positive({ message: "O preço deve ser um valor positivo." }),
  
  tourType: z.enum([
    'aventura', 'histórico', 'cultural', 'ecológico', 'gastronômico', 'outro'
  ]),
});

export class CreatePackageTourDto extends createZodDto(CreatePackageTourSchema) {}