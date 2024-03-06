import { HttpException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Owner } from "src/entities/owner.entity";
import { Repository } from "typeorm";
import { PackageRockobits } from "src/entities/packageRockobits.entity";
import { CreatePackageDto } from "./dto/create-package.dto";
import { StripeService } from "../stripe/stripe.service";

@Injectable()
export class PackageRockobitsService {
  constructor(
    @InjectRepository(PackageRockobits)
    private readonly packageRockobitsRepository: Repository<PackageRockobits>,
    private readonly stripeService: StripeService
  ) {}

  async getAllPackages() {
    const packagesRockobits = await this.packageRockobitsRepository.find();
    return packagesRockobits;
  }

  async createPackage(createPackage: CreatePackageDto) {
    const { name, amount, currency, price } = createPackage;
    let priceStripe;
    try {
      priceStripe = await this.stripeService.createStripePrice(
        name,
        price,
        currency,
        "package-rockobits"
      );
    } catch (stripeError) {
      console.log(stripeError.response);
      throw new HttpException(stripeError.response, 500);
    }

    const packageRockobits = new PackageRockobits();

    packageRockobits.name = name;
    packageRockobits.rockobitsAmount = amount;
    packageRockobits.price = price;
    packageRockobits.currency = currency;
    packageRockobits.priceId = priceStripe.id;
    await this.packageRockobitsRepository.save(packageRockobits);

    return packageRockobits;
  }
}
