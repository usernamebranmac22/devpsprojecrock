import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/entities/user.entity";
import { Membership } from "src/entities/membership.entity";
import { EmailModule } from "../email/email.module";
import { ScreenModule } from "../screen/screen.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Membership]),
    EmailModule,
    ScreenModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
