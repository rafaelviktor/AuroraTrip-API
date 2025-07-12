import { createZodDto } from "nestjs-zod";
import { z } from 'zod';

const UpdateUserSchema = z.object({
  displayName: z.string().optional(),
  currentPassword: z.string().optional(),
  password: z.string().optional(),
});

export class UpdateUserDto extends createZodDto(UpdateUserSchema) {
    displayName?: string;

    currentPassword?: string;

    password?: string;
}