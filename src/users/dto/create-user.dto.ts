import { createZodDto } from "nestjs-zod";
import { z } from 'zod';

const CreateUserSchema = z.object({
  username: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
  displayName: z.string().optional(),
  verificationCodeId: z.string()
});

export class CreateUserDto extends createZodDto(CreateUserSchema) {
    username: string;

    email: string;

    password: string;

    displayName?: string;

    verificationCodeId: string;
}