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
import { parse } from "path";

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  // En el controlador
  @Get()
  async findAll(@Query() query: QueryUserDto) {
    const { type, country, city, state_User } = query;

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
      type: parsedType,
      country,
      city,
      state_User: parsedStateUser,
    };

    const users = await this.userService.findAll(options);
    return { message: "ok", data: users };
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.userService.findOne(+id);
  }

  @UseGuards(AuthGuard)
  @Patch(":id")
  update(@Param("id") id: string, @Body() updateUserDto: any) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.userService.remove(+id);
  }
}
