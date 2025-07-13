import { createZodDto } from "nestjs-zod";
import { z } from 'zod';

const UpdateDriverSchema = z.object({
  name: z.string().optional(),
  currentPassword: z.string().optional(),
  phone: z.string().optional(),
  password: z.string().optional(),
  transportType: z.string().optional()
});

export class UpdateDriverDto extends createZodDto(UpdateDriverSchema) {
    name?: string;

    currentPassword?: string;

    phone?: string;

    password?: string;

    transportType?: string;
}