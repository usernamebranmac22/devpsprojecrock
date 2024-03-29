import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CryptoModule } from "../crypto/crypto.module";
import { Employee } from "src/entities/employee.entity";
import { EmployeeController } from "./employee.controller";
import { EmployeeService } from "./employee.service";
import { User } from "src/entities/user.entity";
import { WalletModule } from "../wallet/wallet.module";

@Module({
  imports: [TypeOrmModule.forFeature([Employee, User]), WalletModule],
  controllers: [EmployeeController],
  providers: [EmployeeService],
  exports: [EmployeeService],
})
export class EmployeeModule {}
