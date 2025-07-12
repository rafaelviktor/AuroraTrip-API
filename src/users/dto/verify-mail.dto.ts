import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const VerifyMailSchema = z.object({
  email: z.string().email(),
});

export class VerifyMailDto extends createZodDto(VerifyMailSchema) {
    email: string;
}