import { Module, forwardRef } from "@nestjs/common";
import { StripeController } from "./stripe.controller";
import { StripeService } from "./stripe.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Membership } from "src/entities/membership.entity";
import { UserModule } from "../user/user.module";
import { ScreenModule } from "../screen/screen.module";
import { PackageRockobits } from "src/entities/packageRockobits.entity";
import { WalletModule } from "../wallet/wallet.module";
import { TransactionsModule } from "../transactions/transactions.module";

@Module({
  imports: [TypeOrmModule.forFeature([Membership, PackageRockobits]), UserModule, ScreenModule, WalletModule, TransactionsModule],
  controllers: [StripeController],
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule {}
