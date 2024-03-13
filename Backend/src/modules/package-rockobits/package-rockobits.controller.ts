import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { PackageRockobitsService } from "./package-rockobits.service";
import { CreatePackageDto } from "./dto/create-package.dto";

@Controller("package-rockobits")
export class PackageRockobitsController {
  constructor(private readonly packageRockobitsService: PackageRockobitsService) {}


  @Get()
  async getAllPackages() {
    const packagesRockobits = await this.packageRockobitsService.getAllPackages();
    return { message: "ok", data: packagesRockobits };
  }

  @Post()
  async createMembership(@Body() body: CreatePackageDto) {
   try {
    const packageRockobits = await this.packageRockobitsService.createPackage(body);
    return { message: "ok", data: packageRockobits };
   } catch (error) {
    console.log(error)
   }
  }

}
