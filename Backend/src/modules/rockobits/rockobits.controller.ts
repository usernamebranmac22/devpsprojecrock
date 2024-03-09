import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { RockobitsService } from "./rockobits.service";

@Controller("rockobits")
export class RockobitsController {
  constructor(private readonly rockobitsService: RockobitsService) {}

  @Post("transferCompanyToEmployee")
  transferCompanyToEmployee(@Body() body: any) {
    return this.rockobitsService.transferCompanyToEmployee(body);
  }
}
