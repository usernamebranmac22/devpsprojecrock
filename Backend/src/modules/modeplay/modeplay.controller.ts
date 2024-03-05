import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from "@nestjs/common";
import { ModeplayService } from "./modeplay.service";
import { CreateModeplayDto } from "./dto/create-modeplay.dto";
import { UpdateModeplayDto } from "./dto/update-modeplay.dto";

@Controller("modeplay")
export class ModeplayController {
  constructor(private readonly modeplayService: ModeplayService) {}

  @Post()
  create(@Body() createModeplayDto: CreateModeplayDto) {
    return this.modeplayService.create(createModeplayDto);
  }

  @Get()
  findAll() {
    return this.modeplayService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.modeplayService.findOne(Number(id));
  }

  @Patch(":id")
  update(
    @Param("id") id: number,
    @Body() updateModeplayDto: { value: number }
  ) {
    return this.modeplayService.update(Number(id), updateModeplayDto);
  }
}
