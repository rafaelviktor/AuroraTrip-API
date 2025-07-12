import { Module, MiddlewareConsumer } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/Users/User.schema';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { ValidateObjectIdMiddleware } from '../middlewares/validate-object-id.middleware';
import { EmailService } from 'src/mailer/mailer.service';
import { VerificationCode, VerificationCodeSchema } from 'src/schemas/VerificationCodes/VerificationCode.schema';

@Module({
    imports: [
    MongooseModule.forFeature([
        {
            name: User.name,
            schema: UserSchema,
        },
        {
            name: VerificationCode.name,
            schema: VerificationCodeSchema,
        }
    ]),
    ],
    controllers: [UsersController],
    providers: [UsersService, EmailService],
    exports: [UsersService, EmailService]
})
export class UsersModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(ValidateObjectIdMiddleware)
            .forRoutes('users/id/:id');
    }
}