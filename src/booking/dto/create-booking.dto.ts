import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const CreateBookingSchema = z.object({
  packageTourId: z.string().nonempty("O ID do pacote de tour é obrigatório."),
  seats: z.number({
    required_error: "A quantidade de assentos é obrigatória."
  }).int().positive({ message: "Você deve reservar pelo menos 1 assento." }),
});

export class CreateBookingDto extends createZodDto(CreateBookingSchema) {}