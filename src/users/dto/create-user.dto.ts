import { createZodDto } from "nestjs-zod";
import { z } from 'zod';

const CreateUserSchema = z.object({
  username: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  password: z.string().min(6)
});

export class CreateUserDto extends createZodDto(CreateUserSchema) {
    username: string;

    name: string;
    
    email: string;

    phone: string;
    
    password: string;
}