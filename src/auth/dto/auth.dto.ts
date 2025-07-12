import { createZodDto } from "nestjs-zod";
import { z } from "zod";

const AuthSchema = z.object({
    username: z.string(),
    password: z.string()
});

export class AuthPayloadDto extends createZodDto(AuthSchema) {
    username: string;
    
    password: string;
}