import { Injectable, NestMiddleware, HttpException } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

@Injectable()
export class ValidateObjectIdMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const idParams = ['id','listId', 'userId', 'itemId']; // Parâmetros a validar
        for (const param of idParams) {
            const id = req.params[param];
            if (id && !mongoose.Types.ObjectId.isValid(id)) {
                throw new HttpException(`O ID informado é inválido`, 400);
            }
        }
        next();
    }
}