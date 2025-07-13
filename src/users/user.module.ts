import { Module, MiddlewareConsumer } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/Users/User.schema';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { ValidateObjectIdMiddleware } from '../middlewares/validate-object-id.middleware';

@Module({
    imports: [
    MongooseModule.forFeature([
        {
            name: User.name,
            schema: UserSchema,
        }
    ]),
    ],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService]
})
export class UserModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(ValidateObjectIdMiddleware)
            .forRoutes('users/id/:id');
    }
}