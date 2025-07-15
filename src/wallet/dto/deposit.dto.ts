import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const DepositSchema = z.object({
  amount: z.number({
    required_error: "O valor do depósito é obrigatório."
  }).positive({ message: "O valor deve ser positivo." }),
});

export class DepositDto extends createZodDto(DepositSchema) {}