import { Module } from "@nestjs/common";
import { WalletModule } from "src/modules/wallet/wallet.module";
import { TransactionsModule } from "src/modules/transactions/transactions.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/entities/user.entity";
import { Employee } from "src/entities/employee.entity";
import { EmailModule } from "src/modules/email/email.module";
import { RockobitsController } from "./rockobits.controller";
import { RockobitsService } from "./rockobits.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Employee]),
    WalletModule,
    TransactionsModule,
    EmailModule
  ],
  controllers: [RockobitsController],
  providers: [RockobitsService],
})
export class RockobitsModule {}
