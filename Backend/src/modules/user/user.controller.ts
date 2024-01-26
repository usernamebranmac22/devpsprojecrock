import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { AuthGuard } from "../auth/jwt.strategy";
import { QueryUserDto } from "./dto/query-user.dto";
import { ChangeStateDto } from "./dto/change-state.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll(@Query() query: QueryUserDto) {
    const { type, country, city, state_User, skip, take, searchTerm } = query;

    const parsedType = type
      ? typeof type === "string"
        ? parseInt(type, 10)
        : type
      : undefined;
    const parsedStateUser = state_User
      ? typeof state_User === "string"
        ? parseInt(state_User, 10)
        : state_User
      : undefined;

    const options = {
      searchTerm,
      type: parsedType,
      country,
      city,
      state_User: parsedStateUser,
    };

    const users = await this.userService.findAll(options, {
      take,
      skip,
    });
    return { message: "ok", data: users };
  }

  @Get(":id")
  findOne(@Param("id") id: number) {
    return this.userService.findOne(id);
  }

  @Patch("change-state/:id")
  changeState(@Param("id") id: number, @Body() body: ChangeStateDto) {
    return this.userService.changeState(id, body);
  }

  @Patch(":id")
  async update(@Param("id") id: number, @Body() updateUserDto: UpdateUserDto) {
    return {
      message: "ok",
      data: await this.userService.update(id, updateUserDto),
    };
  }
  @Delete(":id")
  remove(@Param("id") id: number) {
    return this.userService.remove(id);
  }

  @UseGuards(AuthGuard)
  @Delete("/test/auth/:id")
  removed(@Param("id") id: string) {
    return this.userService.remove(+id);
  }
}
