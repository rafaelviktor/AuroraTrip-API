import { createZodDto } from "nestjs-zod";
import { z } from 'zod';

const UpdateUserSchema = z.object({
  name: z.string().optional(),
  currentPassword: z.string().optional(),
  phone: z.string().optional(),
  password: z.string().optional(),
});

export class UpdateUserDto extends createZodDto(UpdateUserSchema) {
    name?: string;

    currentPassword?: string;

    phone?: string;

    password?: string;
}