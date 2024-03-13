import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PackageRockobits } from "src/entities/packageRockobits.entity";
import { PackageRockobitsController } from "./package-rockobits.controller";
import { PackageRockobitsService } from "./package-rockobits.service";
import { StripeModule } from "../stripe/stripe.module";

@Module({
  imports: [TypeOrmModule.forFeature([PackageRockobits]), StripeModule],
  controllers: [PackageRockobitsController],
  providers: [PackageRockobitsService],
  exports: [PackageRockobitsService],
})
export class PackageRockobitsModule {}
