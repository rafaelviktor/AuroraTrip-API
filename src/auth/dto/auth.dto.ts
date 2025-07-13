import { createZodDto } from "nestjs-zod";
import { z } from "zod";

const AuthSchema = z.object({
    type: z.string(),
    username: z.string(),
    password: z.string()
});

export class AuthPayloadDto extends createZodDto(AuthSchema) {
    type: string;

    username: string;
    
    password: string;
}