import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const CheckVerificationSchema = z.object({
  email: z.string().email(),
  code: z.string().length(4)
});

export class CheckVerificationDto extends createZodDto(CheckVerificationSchema) {
    email: string;
    
    code: string;
}