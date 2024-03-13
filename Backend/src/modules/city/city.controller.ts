import { Body, Controller, Delete, Get, Param, Post, Query } from "@nestjs/common";
import { CityService } from "./city.service";
import { CreateCityDto } from "./dto/Create-city.dto";

@Controller("city")
export class CityController {
  constructor(private readonly CityService: CityService) {}

  @Get(":stateId")
  findAllByStateId(
    @Param("stateId") stateId: number,
    @Query("take") take?: number,
    @Query("skip") skip?: number,
    @Query("name") name?: string
  ) {
    return this.CityService.findAllByStateId(stateId, take, skip, name);
  }

  @Get(":stateId/selects")
  findAllSelects(@Param("stateId") stateId: number) {
    return this.CityService.findAllSelects(stateId);
  }

  @Post()
  create(@Body() body: CreateCityDto) {
    const { name, stateId } = body;
    return this.CityService.create(name, stateId);
  }

  @Delete(":stateId")
  delete(@Param("stateId") stateId: number) {
    return this.CityService.delete(stateId);
  }

  @Delete("/deleteallcities/:stateId")
  deleteAllCities(@Param("stateId") stateId: number) {
    return this.CityService.deleteAllCities(stateId);
  }


}
