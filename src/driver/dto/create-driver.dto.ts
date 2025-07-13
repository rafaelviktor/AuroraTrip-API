import { createZodDto } from "nestjs-zod";
import { z } from 'zod';

const CreateDriverSchema = z.object({
  username: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  password: z.string().min(6),
  transportType: z.string()
});

export class CreateDriverDto extends createZodDto(CreateDriverSchema) {
    username: string;

    name: string;
    
    email: string;

    phone: string;
    
    password: string;

    transportType: string;
}